import { create } from "zustand";
import type { ExpenseEntry, ExpenseInput, SaleEntry, SaleInput } from "@/types/sales";
import { createSale, fetchSales } from "@/service/sales";
import { createExpense, fetchExpenses } from "@/service/expenses";

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

  fetchData: async (businessId: string, branchId?: string, showLoading = true) => {
    if (!businessId) {
      set({ sales: [], expenses: [] });
      return;
    }

    if (showLoading) set({ isLoading: true, error: null });
    try {
      const [salesData, expensesData] = await Promise.all([
        fetchSales({
          businessId,
          branchId,
        }),
        fetchExpenses({
          businessId,
          branchId,
        }),
      ]);

      set({
        sales: salesData.map(mapBackendSaleToEntry),
        expenses: expensesData.map(mapBackendExpenseToEntry),
        error: null,
      });
    } catch (err: any) {
      console.warn("Failed to fetch sales/expenses from backend:", err.message);
      set({ error: err.message || "Failed to fetch sales/expenses" });
    } finally {
      set({ isLoading: false, isRefreshing: false });
    }
  },

  refresh: async (businessId: string, branchId?: string) => {
    set({ isRefreshing: true });
    await get().fetchData(businessId, branchId, false);
  },

  addSale: async (businessId: string, branchId: string, entry: SaleInput) => {
    const tempId = `temp-sale-${Date.now()}`;
    const now = new Date();
    const time = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    const optimisticSale: SaleEntry = {
      id: tempId,
      time,
      ...entry,
      businessId,
      branchId,
    };

    // Optimistic Update
    set((state) => ({ sales: [optimisticSale, ...state.sales] }));

    try {
      let formattedDueDate: string | null = null;
      if (entry.dueDate) {
        const parsed = new Date(entry.dueDate);
        formattedDueDate = !isNaN(parsed.getTime()) ? parsed.toISOString() : entry.dueDate;
      }

      const created = await createSale({
        businessId,
        branchId,
        saleType: entry.saleType,
        paymentMethod: entry.paymentMethod,
        description: entry.description,
        amount: Math.round(entry.amount),
        customerName: entry.customer || null,
        customerPhone: entry.phone || null,
        dueDate: formattedDueDate,
      });

      const serverSale = mapBackendSaleToEntry(created);
      // Replace optimistic placeholder with confirmed server entity
      set((state) => ({
        sales: state.sales.map((s) => (s.id === tempId ? serverSale : s)),
      }));

      return serverSale;
    } catch (err: any) {
      // Rollback optimistic state
      set((state) => ({
        sales: state.sales.filter((s) => s.id !== tempId),
      }));
      throw err;
    }
  },

  addExpense: async (businessId: string, branchId: string, entry: ExpenseInput) => {
    const tempId = `temp-exp-${Date.now()}`;
    const now = new Date();
    const time = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    const optimisticExpense: ExpenseEntry = {
      id: tempId,
      time,
      ...entry,
      businessId,
      branchId,
    };

    // Optimistic Update
    set((state) => ({ expenses: [optimisticExpense, ...state.expenses] }));

    try {
      const created = await createExpense({
        businessId,
        branchId,
        description: entry.description,
        amount: Math.round(entry.amount),
        category: entry.category,
        notes: entry.notes || null,
      });

      const serverExpense = mapBackendExpenseToEntry(created);
      // Replace optimistic placeholder with confirmed server entity
      set((state) => ({
        expenses: state.expenses.map((e) => (e.id === tempId ? serverExpense : e)),
      }));

      return serverExpense;
    } catch (err: any) {
      // Rollback optimistic state
      set((state) => ({
        expenses: state.expenses.filter((e) => e.id !== tempId),
      }));
      throw err;
    }
  },
}));
