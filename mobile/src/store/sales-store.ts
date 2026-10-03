import { create } from "zustand";
import type { ExpenseEntry, ExpenseInput, SaleEntry, SaleInput } from "@/types/sales";
import { localSalesRepo } from "@/repositories/local-sales.repo";
import { localExpensesRepo } from "@/repositories/local-expenses.repo";
import { syncEngine } from "@/service/sync-engine";
import { isSQLiteAvailable } from "@/db/client";
import { fetchSales, createSale } from "@/service/sales";
import { fetchExpenses, createExpense } from "@/service/expenses";

function formatDisplayTime(dateStr?: string | null): string {
  if (!dateStr) return new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "Just now";
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function formatDisplayDate(dateStr?: string | null): string | undefined {
  if (!dateStr) return undefined;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function mapBackendSaleToEntry(item: any): SaleEntry {
  return {
    id: item.id,
    businessId: item.businessId,
    branchId: item.branchId,
    description: item.description,
    amount: Number(item.amount),
    customer: item.customerName || undefined,
    phone: item.customerPhone || undefined,
    paymentMethod: item.paymentMethod,
    saleType: item.saleType,
    dueDate: formatDisplayDate(item.dueDate),
    status: item.status,
    paidAt: item.paidAt,
    time: formatDisplayTime(item.createdAt),
    createdAt: item.createdAt,
  };
}

export function mapBackendExpenseToEntry(item: any): ExpenseEntry {
  return {
    id: item.id,
    businessId: item.businessId,
    branchId: item.branchId,
    description: item.description,
    amount: Number(item.amount),
    category: item.category,
    notes: item.notes,
    time: formatDisplayTime(item.createdAt),
    createdAt: item.createdAt,
  };
}

export interface SalesState {
  sales: SaleEntry[];
  expenses: ExpenseEntry[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  activeTab: "sales" | "expenses";

  // Setters
  setActiveTab: (tab: "sales" | "expenses") => void;
  setError: (error: string | null) => void;
  setSales: (sales: SaleEntry[] | ((prev: SaleEntry[]) => SaleEntry[])) => void;
  setExpenses: (expenses: ExpenseEntry[] | ((prev: ExpenseEntry[]) => ExpenseEntry[])) => void;

  // Actions
  fetchData: (businessId: string, branchId?: string, showLoading?: boolean) => Promise<void>;
  refresh: (businessId: string, branchId?: string) => Promise<void>;
  addSale: (businessId: string, branchId: string, entry: SaleInput) => Promise<SaleEntry>;
  addExpense: (businessId: string, branchId: string, entry: ExpenseInput) => Promise<ExpenseEntry>;
  clearData: () => void;
}

export const useSalesStore = create<SalesState>((set, get) => ({
  sales: [],
  expenses: [],
  isLoading: false,
  isRefreshing: false,
  error: null,
  activeTab: "sales",

  setActiveTab: (activeTab) => set({ activeTab }),
  setError: (error) => set({ error }),
  setSales: (salesOrUpdater) =>
    set((state) => ({
      sales: typeof salesOrUpdater === "function" ? salesOrUpdater(state.sales) : salesOrUpdater,
    })),
  setExpenses: (expensesOrUpdater) =>
    set((state) => ({
      expenses: typeof expensesOrUpdater === "function" ? expensesOrUpdater(state.expenses) : expensesOrUpdater,
    })),

  clearData: () =>
    set({
      sales: [],
      expenses: [],
      error: null,
      isLoading: false,
      isRefreshing: false,
    }),

  /**
   * Reads sales & expenses: from local SQLite if available (0ms latency),
   * or falls back to online API endpoints if native SQLite is not in the APK.
   */
  fetchData: async (businessId: string, branchId?: string, showLoading = true) => {
    if (!businessId) {
      set({ sales: [], expenses: [] });
      return;
    }

    if (showLoading) set({ isLoading: true, error: null });

    try {
      if (!isSQLiteAvailable()) {
        // Online fallback mode
        const [salesRes, expRes] = await Promise.all([
          fetchSales({ businessId, branchId, limit: 100 }),
          fetchExpenses({ businessId, branchId, limit: 100 }),
        ]);

        const mappedSales = (Array.isArray(salesRes) ? salesRes : []).map(mapBackendSaleToEntry);
        const mappedExpenses = (Array.isArray(expRes) ? expRes : []).map(mapBackendExpenseToEntry);

        set({
          sales: mappedSales,
          expenses: mappedExpenses,
          isLoading: false,
          error: null,
        });
        return;
      }

      // 1. Instant local read from SQLite
      const [localSales, localExpenses] = await Promise.all([
        localSalesRepo.getSales(businessId, branchId),
        localExpensesRepo.getExpenses(businessId, branchId),
      ]);

      set({
        sales: localSales,
        expenses: localExpenses,
        isLoading: false,
        error: null,
      });

      // 2. Non-blocking background sync
      syncEngine
        .sync(businessId)
        .then(async (result) => {
          if (result.pulledCount > 0) {
            const [updatedSales, updatedExpenses] = await Promise.all([
              localSalesRepo.getSales(businessId, branchId),
              localExpensesRepo.getExpenses(businessId, branchId),
            ]);
            set({ sales: updatedSales, expenses: updatedExpenses });
          }
        })
        .catch((err) => {
          console.log('[Sales Store] Background sync notice:', err?.message);
        });
    } catch (err: any) {
      console.warn('[Sales Store] Failed to read sales/expenses:', err.message);
      set({
        error: err.message || 'Failed to load sales/expenses',
        isLoading: false,
      });
    }
  },

  /**
   * Pull-to-refresh: triggers full sync cycle and reloads local repositories,
   * or directly fetches remote data in online mode.
   */
  refresh: async (businessId: string, branchId?: string) => {
    if (!businessId) return;
    set({ isRefreshing: true });

    try {
      if (!isSQLiteAvailable()) {
        const [salesRes, expRes] = await Promise.all([
          fetchSales({ businessId, branchId, limit: 100 }),
          fetchExpenses({ businessId, branchId, limit: 100 }),
        ]);

        const mappedSales = (Array.isArray(salesRes) ? salesRes : []).map(mapBackendSaleToEntry);
        const mappedExpenses = (Array.isArray(expRes) ? expRes : []).map(mapBackendExpenseToEntry);

        set({ sales: mappedSales, expenses: mappedExpenses, isRefreshing: false });
        return;
      }

      await syncEngine.sync(businessId);
    } catch (err) {
      console.log('[Sales Store] Refresh sync notice:', err);
    } finally {
      if (isSQLiteAvailable()) {
        const [updatedSales, updatedExpenses] = await Promise.all([
          localSalesRepo.getSales(businessId, branchId),
          localExpensesRepo.getExpenses(businessId, branchId),
        ]);
        set({ sales: updatedSales, expenses: updatedExpenses, isRefreshing: false });
      } else {
        set({ isRefreshing: false });
      }
    }
  },

  /**
   * Records a sale locally with permanent UUID and outbox enqueueing (or posts directly if online fallback).
   */
  addSale: async (businessId: string, branchId: string, entry: SaleInput) => {
    try {
      if (!isSQLiteAvailable()) {
        const remoteSale = await createSale({
          businessId,
          branchId,
          saleType: entry.saleType,
          paymentMethod: entry.paymentMethod,
          description: entry.description,
          amount: Number(entry.amount),
          customerName: entry.customer,
          customerPhone: entry.phone,
          dueDate: entry.dueDate,
          notes: (entry as any).notes ?? null,
        });

        const newEntry = mapBackendSaleToEntry(remoteSale);
        set((state) => ({ sales: [newEntry, ...state.sales] }));
        return newEntry;
      }

      const savedSale = await localSalesRepo.createSaleAtomic(entry, businessId, branchId);

      // Prepend to store state immediately
      set((state) => ({
        sales: [savedSale, ...state.sales],
      }));

      // Non-blocking background sync attempt
      syncEngine.sync(businessId).catch(() => {});

      return savedSale;
    } catch (err: any) {
      console.error('[Sales Store] Failed to record sale:', err);
      set({ error: err.message || 'Failed to record sale' });
      throw err;
    }
  },

  /**
   * Records an operational expense locally with outbox enqueueing (or posts directly if online fallback).
   */
  addExpense: async (businessId: string, branchId: string, entry: ExpenseInput) => {
    try {
      if (!isSQLiteAvailable()) {
        const remoteExpense = await createExpense({
          businessId,
          branchId,
          description: entry.description,
          amount: Number(entry.amount),
          category: entry.category,
          notes: entry.notes,
        });

        const newEntry = mapBackendExpenseToEntry(remoteExpense);
        set((state) => ({ expenses: [newEntry, ...state.expenses] }));
        return newEntry;
      }

      const savedExpense = await localExpensesRepo.createExpenseAtomic(
        entry,
        businessId,
        branchId
      );

      // Prepend to store state immediately
      set((state) => ({
        expenses: [savedExpense, ...state.expenses],
      }));

      // Non-blocking background sync attempt
      syncEngine.sync(businessId).catch(() => {});

      return savedExpense;
    } catch (err: any) {
      console.error('[Sales Store] Failed to record expense:', err);
      set({ error: err.message || 'Failed to record expense' });
      throw err;
    }
  },
}));

// Reactively reload local sales and expenses when background sync pulls updates
syncEngine.subscribe((event) => {
  if (event.type === 'sync_success' && isSQLiteAvailable()) {
    const state = useSalesStore.getState();
    const lastBusinessId = state.sales[0]?.businessId || state.expenses[0]?.businessId;
    if (lastBusinessId) {
      Promise.all([
        localSalesRepo.getSales(lastBusinessId),
        localExpensesRepo.getExpenses(lastBusinessId),
      ])
        .then(([sales, expenses]) => {
          useSalesStore.setState({ sales, expenses });
        })
        .catch(() => {});
    }
  }
});


