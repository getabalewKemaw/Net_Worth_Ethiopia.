import { create } from 'zustand';
import { localBidrRepo } from '@/repositories/local-bidr.repo';
import { syncEngine } from '@/service/sync-engine';
import { isSQLiteAvailable } from '@/db/client';
import {
  fetchDebts,
  fetchDebtSummary,
  createDebt,
  settleDebt,
  updateDebt,
} from '@/service/bidr';
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
   * Reads debts & debt summary: from local SQLite if available (0ms delay),
   * or falls back to online API endpoints if native SQLite is not in the APK.
   */
  fetchData: async (businessId: string, branchId?: string) => {
    if (!businessId) {
      set({ debts: [], summary: null });
      return;
    }

    set({ loading: true, error: null });

    try {
      if (!isSQLiteAvailable()) {
        // Online fallback mode
        const [onlineDebts, onlineSummary] = await Promise.all([
          fetchDebts({ businessId, branchId }),
          fetchDebtSummary(businessId, branchId),
        ]);

        set({
          debts: Array.isArray(onlineDebts) ? onlineDebts : [],
          summary: onlineSummary ?? null,
          loading: false,
          error: null,
        });
        return;
      }

      // 1. Instant local read from SQLite
      const [localDebts, localSummary] = await Promise.all([
        localBidrRepo.getDebts(businessId, branchId),
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
            const [updatedDebts, updatedSummary] = await Promise.all([
              localBidrRepo.getDebts(businessId, branchId),
              localBidrRepo.getDebtSummaryMetric(businessId, branchId),
            ]);
            set({ debts: updatedDebts, summary: updatedSummary });
          }
        })
        .catch((err) => {
          console.log('[Bidr Store] Background sync notice:', err?.message);
        });
    } catch (err: any) {
      console.warn('[Bidr Store] Failed to load debts:', err);
      set({
        error: err?.message || 'Failed to load debt records',
        loading: false,
      });
    }
  },

  /**
   * Pull-to-refresh: runs full sync cycle and re-queries local repositories,
   * or directly fetches remote data in online mode.
   */
  refresh: async (businessId: string, branchId?: string) => {
    if (!businessId) return;
    set({ refreshing: true, error: null });

    try {
      if (!isSQLiteAvailable()) {
        const [onlineDebts, onlineSummary] = await Promise.all([
          fetchDebts({ businessId, branchId }),
          fetchDebtSummary(businessId, branchId),
        ]);

        set({
          debts: Array.isArray(onlineDebts) ? onlineDebts : [],
          summary: onlineSummary ?? null,
          refreshing: false,
        });
        return;
      }

      await syncEngine.sync(businessId);
    } catch (err: any) {
      console.log('[Bidr Store] Refresh sync notice:', err?.message);
    } finally {
      if (isSQLiteAvailable()) {
        const [updatedDebts, updatedSummary] = await Promise.all([
          localBidrRepo.getDebts(businessId, branchId),
          localBidrRepo.getDebtSummaryMetric(businessId, branchId),
        ]);
        set({ debts: updatedDebts, summary: updatedSummary, refreshing: false });
      } else {
        set({ refreshing: false });
      }
    }
  },

  /**
   * Records a customer credit (Dube) debt locally (or posts directly if online fallback).
   */
  create: async (payload: CreateDebtPayload) => {
    set({ isCreating: true, error: null });

    try {
      if (!isSQLiteAvailable()) {
        const remoteDebt = await createDebt(payload);
        set((state) => ({ debts: [remoteDebt, ...state.debts] }));
        if (payload.businessId) {
          fetchDebtSummary(payload.businessId, payload.branchId)
            .then((summary) => set({ summary }))
            .catch(() => {});
        }
        return remoteDebt;
      }

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
      console.error('[Bidr Store] Failed to create debt:', err);
      set({ error: err?.message || 'Failed to create debt record' });
      throw err;
    } finally {
      set({ isCreating: false });
    }
  },

  /**
   * Settles a customer credit (Dube) debt (or posts directly if online fallback).
   */
  settle: async (
    id: string,
    payload?: SettleDebtPayload,
    businessId?: string,
    branchId?: string
  ) => {
    set({ isSettling: true, error: null });

    try {
      if (!isSQLiteAvailable()) {
        const remoteSettled = await settleDebt(id, payload);
        set((state) => ({
          debts: state.debts.map((item) =>
            item.id === id ? { ...item, ...remoteSettled } : item
          ),
        }));
        if (businessId) {
          fetchDebtSummary(businessId, branchId)
            .then((summary) => set({ summary }))
            .catch(() => {});
        }
        return remoteSettled;
      }

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
      console.error('[Bidr Store] Failed to settle debt:', err);
      set({ error: err?.message || 'Failed to settle debt record' });
      throw err;
    } finally {
      set({ isSettling: false });
    }
  },

  /**
   * Updates an existing customer credit (Dube) debt (or posts directly if online fallback).
   */
  update: async (
    id: string,
    payload: UpdateDebtPayload,
    businessId?: string,
    branchId?: string
  ) => {
    set({ isUpdating: true, error: null });

    try {
      if (!isSQLiteAvailable()) {
        const remoteUpdated = await updateDebt(id, payload);
        set((state) => ({
          debts: state.debts.map((item) =>
            item.id === id ? { ...item, ...remoteUpdated } : item
          ),
        }));
        if (businessId) {
          fetchDebtSummary(businessId, branchId)
            .then((summary) => set({ summary }))
            .catch(() => {});
        }
        return remoteUpdated;
      }

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
      console.error('[Bidr Store] Failed to update debt:', err);
      set({ error: err?.message || 'Failed to update debt record' });
      throw err;
    } finally {
      set({ isUpdating: false });
    }
  },
}));

// Reactively reload local debts and summary when background sync pulls updates
syncEngine.subscribe((event) => {
  if (event.type === 'sync_success' && isSQLiteAvailable()) {
    const state = useBidrStore.getState();
    const lastBusinessId = state.debts[0]?.businessId;
    if (lastBusinessId) {
      Promise.all([
        localBidrRepo.getDebts(lastBusinessId),
        localBidrRepo.getDebtSummaryMetric(lastBusinessId),
      ])
        .then(([debts, summary]) => {
          useBidrStore.setState({ debts, summary });
        })
        .catch(() => {});
    }
  }
});


