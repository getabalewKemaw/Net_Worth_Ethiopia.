import { create } from 'zustand';
import { isNativeSmsAvailable } from '@/lib/sms-reader';
import {
  textFetchingService,
  computeSummariesFromTransactions,
  type ScanResult,
} from '@/service/text-fetching';
import { createDefaultProviderSummaries } from '@/constants/text-fetching';
import type {
  BankProvider,
  ParsedBankTransaction,
  ProviderSummary,
  SmsImportStatus,
} from '@/types/text-fetching';

export interface ScanSummary {
  scanned: number;
  parsed: number;
  inserted: number;
}

export interface TextFetchingState {
  // State variables
  transactions: ParsedBankTransaction[];
  providerSummaries: Record<BankProvider, ProviderSummary>;
  selectedProvider: BankProvider | 'all';
  selectedStatus: SmsImportStatus | 'all';
  isScanning: boolean;
  isLoading: boolean;
  lastScanTime: string | null;
  error: string | null;

  // Filter and mode setters
  setProviderFilter: (provider: BankProvider | 'all') => void;
  setStatusFilter: (status: SmsImportStatus | 'all') => void;
  setError: (error: string | null) => void;

  // Core Actions
  scanInbox: (options?: {
    businessId?: string;
    branchId?: string;
    limit?: number;
  }) => Promise<ScanSummary>;
  loadSavedTransactions: (businessId?: string) => Promise<void>;
  markTransactionConverted: (
    id: string,
    status: SmsImportStatus,
    convertedEntityId?: string | null
  ) => Promise<void>;
  dismissTransaction: (id: string) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  clearAllTransactions: (businessId?: string) => Promise<void>;

  // Selectors / Helpers
  getFilteredTransactions: () => ParsedBankTransaction[];
  getPendingCount: () => number;
}

/**
 * Safely resolves active business and branch context, defaulting or dynamically
 * reading from business store if available without hard top-level module coupling.
 */
function getActiveContext(explicitBizId?: string, explicitBranchId?: string): {
  businessId: string;
  branchId: string;
} {
  let businessId = explicitBizId;
  let branchId = explicitBranchId;

  if (!businessId || !branchId) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { useBusinessStore } = require('./business-store');
      const state = useBusinessStore?.getState?.();
      if (!businessId && state?.activeBusiness?.id) {
        businessId = state.activeBusiness.id;
      }
      if (!branchId && state?.activeBranch?.id) {
        branchId = state.activeBranch.id;
      }
    } catch {
      // Store not mounted or executing in test runner
    }
  }

  return {
    businessId: businessId || 'default_business',
    branchId: branchId || 'default_branch',
  };
}

export const useTextFetchingStore = create<TextFetchingState>((set, get) => ({
  transactions: [],
  providerSummaries: createDefaultProviderSummaries(),
  selectedProvider: 'all',
  selectedStatus: 'all',
  isScanning: false,
  isLoading: false,
  lastScanTime: null,
  error: null,

  setProviderFilter: (provider) => set({ selectedProvider: provider }),
  setStatusFilter: (status) => set({ selectedStatus: status }),
  setError: (error) => set({ error }),

  /**
   * Scans bank SMS inbox from native SIM card, parses with regex registry,
   * persists to local SQLite with deduplication, and updates reactive store.
   */
  scanInbox: async (options) => {
    set({ isScanning: true, error: null });
    try {
      const { businessId, branchId } = getActiveContext(options?.businessId, options?.branchId);
      const limit = options?.limit ?? 200;

      const result: ScanResult = await textFetchingService.scanAndProcessInbox(
        businessId,
        branchId,
        { limit }
      );

      // Hydrate provider summaries from SQLite, with in-memory fallback
      let summaries = await textFetchingService.getProviderSummaries(businessId);
      const hasAnyMetrics = Object.values(summaries).some(
        (s) => s.depositCount > 0 || s.expenseCount > 0
      );
      if (!hasAnyMetrics && result.transactions.length > 0) {
        summaries = computeSummariesFromTransactions(result.transactions);
      }

      set({
        transactions: result.transactions,
        providerSummaries: summaries,
        lastScanTime: new Date().toISOString(),
        isScanning: false,
        error: null,
      });

      return {
        scanned: result.scanned,
        parsed: result.parsed,
        inserted: result.inserted,
      };
    } catch (err: any) {
      const errorMsg = err?.message || 'Failed to scan bank SMS';
      set({ isScanning: false, error: errorMsg });
      throw err;
    }
  },

  /**
   * Loads previously persisted bank transactions and summaries from local SQLite.
   */
  loadSavedTransactions: async (businessId) => {
    set({ isLoading: true, error: null });
    try {
      const { businessId: bId } = getActiveContext(businessId);

      const [transactions, summaries] = await Promise.all([
        textFetchingService.getTransactions(bId),
        textFetchingService.getProviderSummaries(bId),
      ]);

      const hasAnyMetrics = Object.values(summaries).some(
        (s) => s.depositCount > 0 || s.expenseCount > 0
      );

      set({
        transactions,
        providerSummaries:
          !hasAnyMetrics && transactions.length > 0
            ? computeSummariesFromTransactions(transactions)
            : summaries,
        isLoading: false,
        error: null,
      });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err?.message || 'Failed to load saved bank SMS',
      });
    }
  },

  /**
   * Updates an SMS transaction status (e.g. converted_sale, converted_expense, settled_debt).
   */
  markTransactionConverted: async (id, status, convertedEntityId = null) => {
    try {
      await textFetchingService.updateStatus(id, status, convertedEntityId);

      set((state) => {
        const updatedTransactions = state.transactions.map((txn) =>
          txn.id === id
            ? {
                ...txn,
                importStatus: status,
                convertedEntityId:
                  convertedEntityId !== undefined ? convertedEntityId : txn.convertedEntityId,
              }
            : txn
        );

        return {
          transactions: updatedTransactions,
        };
      });
    } catch (err: any) {
      set({ error: err?.message || 'Failed to update transaction status' });
    }
  },

  /**
   * Dismisses an SMS transaction, marking its import status as 'ignored'.
   */
  dismissTransaction: async (id) => {
    await get().markTransactionConverted(id, 'ignored');
  },

  /**
   * Permanently deletes a single SMS record from storage and store.
   */
  deleteTransaction: async (id) => {
    try {
      await textFetchingService.deleteTransaction(id);
      set((state) => {
        const updated = state.transactions.filter((t) => t.id !== id);
        return {
          transactions: updated,
          providerSummaries: computeSummariesFromTransactions(updated),
        };
      });
    } catch (err: any) {
      set({ error: err?.message || 'Failed to delete transaction' });
    }
  },

  /**
   * Clears all bank transactions for the current business.
   */
  clearAllTransactions: async (businessId) => {
    try {
      const { businessId: bId } = getActiveContext(businessId);
      await textFetchingService.clearAll(bId);
      set({
        transactions: [],
        providerSummaries: createDefaultProviderSummaries(),
      });
    } catch (err: any) {
      set({ error: err?.message || 'Failed to clear transactions' });
    }
  },

  /**
   * Helper selector returning transactions filtered by active provider and status filters.
   */
  getFilteredTransactions: () => {
    const { transactions, selectedProvider, selectedStatus } = get();
    return transactions.filter((txn) => {
      if (selectedProvider !== 'all' && txn.provider !== selectedProvider) {
        return false;
      }
      if (selectedStatus !== 'all' && txn.importStatus !== selectedStatus) {
        return false;
      }
      return true;
    });
  },

  /**
   * Helper selector returning the count of transactions pending merchant action.
   */
  getPendingCount: () => {
    const { transactions } = get();
    return transactions.filter((txn) => txn.importStatus === 'pending').length;
  },
}));
