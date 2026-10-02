import { create } from 'zustand';
import { localBidrRepo } from '@/repositories/local-bidr.repo';
import { syncEngine } from '@/service/sync-engine';
import type {
  DebtItem,
  DebtSummaryData,
  DebtFilterStatus,
  DebtSortOption,
  CreateDebtPayload,
  SettleDebtPayload,
  UpdateDebtPayload,
} from '@/types/bidr';

interface BidrState {
  debts: DebtItem[];
  summary: DebtSummaryData | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;

  // Filter & Sort state
  filterStatus: DebtFilterStatus;
  searchQuery: string;
  sortBy: DebtSortOption;

  // Mutation states
  isCreating: boolean;
  isSettling: boolean;
  isUpdating: boolean;

  // Setters
  setFilterStatus: (status: DebtFilterStatus) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sortBy: DebtSortOption) => void;
  setError: (error: string | null) => void;

  // Actions
  fetchData: (businessId: string, branchId?: string) => Promise<void>;
  refresh: (businessId: string, branchId?: string) => Promise<void>;
  create: (payload: CreateDebtPayload) => Promise<DebtItem>;
  settle: (
    id: string,
    payload?: SettleDebtPayload,
    businessId?: string,
    branchId?: string
  ) => Promise<DebtItem>;
  update: (
    id: string,
    payload: UpdateDebtPayload,
    businessId?: string,
    branchId?: string
  ) => Promise<DebtItem>;
}

export const useBidrStore = create<BidrState>((set, get) => ({
  debts: [],
  summary: null,
  loading: false,
  refreshing: false,
  error: null,

  filterStatus: 'all',
  searchQuery: '',
  sortBy: 'due_asc',

  isCreating: false,
  isSettling: false,
  isUpdating: false,

  setFilterStatus: (filterStatus) => set({ filterStatus }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSortBy: (sortBy) => set({ sortBy }),
  setError: (error) => set({ error }),

  /**
   * Reads debts & debt summary from local SQLite immediately (0ms delay),
   * then triggers non-blocking background sync if connected.
   */
  fetchData: async (businessId: string, branchId?: string) => {
    if (!businessId) {
      set({ debts: [], summary: null });
      return;
    }

    set({ loading: true, error: null });

    try {
      const state = get();
      // 1. Instant local read from SQLite
      const [localDebts, localSummary] = await Promise.all([
        localBidrRepo.getDebts(businessId, branchId, {
          searchQuery: state.searchQuery,
          filterStatus: state.filterStatus,
          sortBy: state.sortBy,
        }),
        localBidrRepo.getDebtSummaryMetric(businessId, branchId),
      ]);

      set({
        debts: localDebts,
        summary: localSummary,
        loading: false,
        error: null,
      });

      // 2. Non-blocking background sync
      syncEngine
        .sync(businessId)
        .then(async (result) => {
          if (result.pulledCount > 0) {
            const currentState = get();
            const [updatedDebts, updatedSummary] = await Promise.all([
              localBidrRepo.getDebts(businessId, branchId, {
                searchQuery: currentState.searchQuery,
                filterStatus: currentState.filterStatus,
                sortBy: currentState.sortBy,
              }),
              localBidrRepo.getDebtSummaryMetric(businessId, branchId),
            ]);
            set({ debts: updatedDebts, summary: updatedSummary });
          }
        })
        .catch((err) => {
          console.log('[Bidr Store] Background sync notice:', err?.message);
        });
    } catch (err: any) {
      console.warn('[Bidr Store] Failed to load local debts:', err);
      set({
        error: err?.message || 'Failed to load debt records',
        loading: false,
      });
    }
  },

  /**
   * Pull-to-refresh: runs full sync cycle and re-queries local repositories.
   */
  refresh: async (businessId: string, branchId?: string) => {
    if (!businessId) return;
    set({ refreshing: true, error: null });

    try {
      await syncEngine.sync(businessId);
    } catch (err: any) {
      console.log('[Bidr Store] Refresh sync notice:', err?.message);
    } finally {
      const state = get();
      const [updatedDebts, updatedSummary] = await Promise.all([
        localBidrRepo.getDebts(businessId, branchId, {
          searchQuery: state.searchQuery,
          filterStatus: state.filterStatus,
          sortBy: state.sortBy,
        }),
        localBidrRepo.getDebtSummaryMetric(businessId, branchId),
      ]);
      set({ debts: updatedDebts, summary: updatedSummary, refreshing: false });
    }
  },

  /**
   * Records a customer credit (Dube) debt locally with permanent UUID and outbox enqueueing.
   * Works 100% offline.
   */
  create: async (payload: CreateDebtPayload) => {
    set({ isCreating: true, error: null });

    try {
      const savedDebt = await localBidrRepo.createDebtAtomic(payload);

      // Prepend to store state immediately
      set((state) => ({
        debts: [savedDebt, ...state.debts],
      }));

      // Refresh local summary metric offline
      if (payload.businessId) {
        localBidrRepo
          .getDebtSummaryMetric(payload.businessId, payload.branchId)
          .then((summary) => set({ summary }))
          .catch(() => {});
      }

      // Non-blocking background sync attempt
      if (payload.businessId) {
        syncEngine.sync(payload.businessId).catch(() => {});
      }

      return savedDebt;
    } catch (err: any) {
      console.error('[Bidr Store] Failed to create debt locally:', err);
      set({ error: err?.message || 'Failed to create debt record' });
      throw err;
    } finally {
      set({ isCreating: false });
    }
  },

  /**
   * Settles a customer credit (Dube) debt locally and marks outbox sync action.
   * Works 100% offline.
   */
  settle: async (
    id: string,
    payload?: SettleDebtPayload,
    businessId?: string,
    branchId?: string
  ) => {
    set({ isSettling: true, error: null });

    try {
      const settled = await localBidrRepo.settleDebtAtomic(id, payload);

      // Update debt item in state immediately
      set((state) => ({
        debts: state.debts.map((item) =>
          item.id === id ? { ...item, ...settled } : item
        ),
      }));

      // Refresh local summary metric offline
      if (businessId) {
        localBidrRepo
          .getDebtSummaryMetric(businessId, branchId)
          .then((summary) => set({ summary }))
          .catch(() => {});
      }

      // Non-blocking background sync attempt
      if (businessId) {
        syncEngine.sync(businessId).catch(() => {});
      }

      return settled;
    } catch (err: any) {
      console.error('[Bidr Store] Failed to settle debt locally:', err);
      set({ error: err?.message || 'Failed to settle debt record' });
      throw err;
    } finally {
      set({ isSettling: false });
    }
  },

  /**
   * Updates an existing customer credit (Dube) debt offline.
   */
  update: async (
    id: string,
    payload: UpdateDebtPayload,
    businessId?: string,
    branchId?: string
  ) => {
    set({ isUpdating: true, error: null });

    try {
      const updated = await localBidrRepo.updateDebtAtomic(id, payload);

      // Update debt item in state immediately
      set((state) => ({
        debts: state.debts.map((item) =>
          item.id === id ? { ...item, ...updated } : item
        ),
      }));

      // Refresh local summary metric offline
      if (businessId) {
        localBidrRepo
          .getDebtSummaryMetric(businessId, branchId)
          .then((summary) => set({ summary }))
          .catch(() => {});
      }

      // Non-blocking background sync attempt
      if (businessId) {
        syncEngine.sync(businessId).catch(() => {});
      }

      return updated;
    } catch (err: any) {
      console.error('[Bidr Store] Failed to update debt locally:', err);
      set({ error: err?.message || 'Failed to update debt record' });
      throw err;
    } finally {
      set({ isUpdating: false });
    }
  },
}));
