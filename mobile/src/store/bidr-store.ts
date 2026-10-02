import { create } from 'zustand';
import {
  fetchDebts,
  fetchDebtSummary,
  settleDebt,
  updateDebt,
  createDebt,
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

  fetchData: async (businessId: string, branchId?: string) => {
    if (!businessId) return;
    set({ loading: true, error: null });
    try {
      const [debts, summary] = await Promise.all([
        fetchDebts({ businessId, branchId }),
        fetchDebtSummary(businessId, branchId),
      ]);
      set({ debts, summary, loading: false });
    } catch (err: any) {
      console.error('Failed to load bidr data:', err);
      set({
        error: err?.message || 'Failed to load debt records',
        loading: false,
      });
    }
  },

  refresh: async (businessId: string, branchId?: string) => {
    if (!businessId) return;
    set({ refreshing: true, error: null });
    try {
      const [debts, summary] = await Promise.all([
        fetchDebts({ businessId, branchId }),
        fetchDebtSummary(businessId, branchId),
      ]);
      set({ debts, summary, refreshing: false });
    } catch (err: any) {
      console.error('Failed to refresh bidr data:', err);
      set({
        error: err?.message || 'Failed to refresh debt records',
        refreshing: false,
      });
    }
  },

  create: async (payload: CreateDebtPayload) => {
    set({ isCreating: true, error: null });
    try {
      const created = await createDebt(payload);

      // Optimistically add to top of debts
      set((state) => ({
        debts: [created, ...state.debts],
      }));

      // Refresh aggregate metrics
      if (payload.businessId) {
        fetchDebtSummary(payload.businessId, payload.branchId)
          .then((summary) => set({ summary }))
          .catch(() => {});
      }

      return created;
    } catch (err: any) {
      console.error('Failed to create debt in store:', err);
      set({ error: err?.message || 'Failed to create debt record' });
      throw err;
    } finally {
      set({ isCreating: false });
    }
  },

  settle: async (
    id: string,
    payload?: SettleDebtPayload,
    businessId?: string,
    branchId?: string
  ) => {
    set({ isSettling: true, error: null });
    try {
      const settled = await settleDebt(id, payload);

      // Optimistically update debt item in state
      set((state) => ({
        debts: state.debts.map((item) =>
          item.id === id ? { ...item, ...settled } : item
        ),
      }));

      // Refresh aggregate metrics
      if (businessId) {
        fetchDebtSummary(businessId, branchId)
          .then((summary) => set({ summary }))
          .catch(() => {});
      }

      return settled;
    } catch (err: any) {
      console.error('Failed to settle debt in store:', err);
      set({ error: err?.message || 'Failed to settle debt record' });
      throw err;
    } finally {
      set({ isSettling: false });
    }
  },

  update: async (
    id: string,
    payload: UpdateDebtPayload,
    businessId?: string,
    branchId?: string
  ) => {
    set({ isUpdating: true, error: null });
    try {
      const updated = await updateDebt(id, payload);

      // Update debt item in state
      set((state) => ({
        debts: state.debts.map((item) =>
          item.id === id ? { ...item, ...updated } : item
        ),
      }));

      // Refresh aggregate metrics
      if (businessId) {
        fetchDebtSummary(businessId, branchId)
          .then((summary) => set({ summary }))
          .catch(() => {});
      }

      return updated;
    } catch (err: any) {
      console.error('Failed to update debt in store:', err);
      set({ error: err?.message || 'Failed to update debt record' });
      throw err;
    } finally {
      set({ isUpdating: false });
    }
  },
}));
