import { create } from 'zustand';
import {
  fetchBusinessHealthData,
  createShareToken,
  revokeShareToken,
  calculateFinancialSummary,
} from '@/service/business-health';
import type {
  FinancialSnapshot,
  FinancialSummary,
  TimeRangeFilter,
  CreateShareTokenParams,
  ShareTokenResult,
} from '@/types/health';

interface BusinessHealthState {
  snapshots: FinancialSnapshot[];
  filteredSnapshots: FinancialSnapshot[];
  summary: FinancialSummary | null;
  timeframe: TimeRangeFilter;
  selectedBranchId: string | null;
  isPending: boolean;
  isRefreshing: boolean;
  error: string | null;

  // Share dossier modal state
  shareModalVisible: boolean;
  activeShareResult: ShareTokenResult | null;
  isSharingPending: boolean;
  shareError: string | null;

  // Actions
  setTimeframe: (tf: TimeRangeFilter) => void;
  setSelectedBranchId: (branchId: string | null) => void;
  loadHealthData: (
    businessId: string,
    branchId?: string | null,
    branches?: any[]
  ) => Promise<void>;
  refreshHealthData: (
    businessId: string,
    branchId?: string | null,
    branches?: any[]
  ) => Promise<void>;
  openShareModal: () => void;
  closeShareModal: () => void;
  generateShareLink: (params: CreateShareTokenParams) => Promise<ShareTokenResult>;
  revokeActiveToken: () => Promise<void>;
}

function filterSnapshotsByTimeframe(
  snapshots: FinancialSnapshot[],
  timeframe: TimeRangeFilter
): FinancialSnapshot[] {
  if (!snapshots.length) return [];
  const count = snapshots.length;
  const currentYear = String(new Date().getFullYear());

  switch (timeframe) {
    case '1M':
      return snapshots.slice(Math.max(0, count - 1));
    case '3M':
      return snapshots.slice(Math.max(0, count - 3));
    case '6M':
      return snapshots.slice(Math.max(0, count - 6));
    case '1Y':
      return snapshots.slice(Math.max(0, count - 12));
    case 'YTD': {
      const ytd = snapshots.filter((s) => s.periodYear === currentYear);
      return ytd.length > 0 ? ytd : snapshots.slice(Math.max(0, count - 6));
    }
    case 'ALL':
    default:
      return snapshots;
  }
}

export const useBusinessHealthStore = create<BusinessHealthState>((set, get) => ({
  snapshots: [],
  filteredSnapshots: [],
  summary: null,
  timeframe: '6M',
  selectedBranchId: null,
  isPending: false,
  isRefreshing: false,
  error: null,

  shareModalVisible: false,
  activeShareResult: null,
  isSharingPending: false,
  shareError: null,

  setTimeframe: (timeframe: TimeRangeFilter) => {
    const { snapshots } = get();
    const filtered = filterSnapshotsByTimeframe(snapshots, timeframe);
    const summary = calculateFinancialSummary(filtered);
    set({ timeframe, filteredSnapshots: filtered, summary });
  },

  setSelectedBranchId: (selectedBranchId: string | null) => {
    set({ selectedBranchId });
  },

  loadHealthData: async (
    businessId: string,
    branchId?: string | null,
    branches: any[] = []
  ) => {
    set({ isPending: true, error: null });
    try {
      const activeBranch = branchId !== undefined ? branchId : get().selectedBranchId;
      const { snapshots } = await fetchBusinessHealthData({
        businessId,
        branchId: activeBranch,
        periodType: 'monthly',
        limit: 12,
        branches,
      });

      const currentTf = get().timeframe;
      const filtered = filterSnapshotsByTimeframe(snapshots, currentTf);
      const summary = calculateFinancialSummary(filtered);

      set({
        snapshots,
        filteredSnapshots: filtered,
        summary,
        selectedBranchId: activeBranch ?? null,
      });
    } catch (err: any) {
      set({ error: err.message || 'Failed to load business health metrics' });
    } finally {
      set({ isPending: false });
    }
  },

  refreshHealthData: async (
    businessId: string,
    branchId?: string | null,
    branches: any[] = []
  ) => {
    set({ isRefreshing: true, error: null });
    try {
      const activeBranch = branchId !== undefined ? branchId : get().selectedBranchId;
      const { snapshots } = await fetchBusinessHealthData({
        businessId,
        branchId: activeBranch,
        periodType: 'monthly',
        limit: 12,
        branches,
      });

      const currentTf = get().timeframe;
      const filtered = filterSnapshotsByTimeframe(snapshots, currentTf);
      const summary = calculateFinancialSummary(filtered);

      set({
        snapshots,
        filteredSnapshots: filtered,
        summary,
      });
    } catch (err: any) {
      set({ error: err.message || 'Failed to refresh business health metrics' });
    } finally {
      set({ isRefreshing: false });
    }
  },

  openShareModal: () => {
    set({ shareModalVisible: true, shareError: null });
  },

  closeShareModal: () => {
    set({ shareModalVisible: false, shareError: null });
  },

  generateShareLink: async (params: CreateShareTokenParams) => {
    set({ isSharingPending: true, shareError: null });
    try {
      const result = await createShareToken(params);
      set({ activeShareResult: result, isSharingPending: false });
      return result;
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to generate financial share token';
      set({ shareError: errorMsg, isSharingPending: false });
      throw err;
    }
  },

  revokeActiveToken: async () => {
    const { activeShareResult } = get();
    if (!activeShareResult) return;
    try {
      await revokeShareToken(activeShareResult.token);
      set({ activeShareResult: null });
    } catch (err: any) {
      set({ shareError: err.message || 'Failed to revoke token' });
    }
  },
}));
