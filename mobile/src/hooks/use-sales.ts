import { useState, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import type { ExpenseEntry, ExpenseInput, SaleEntry, SaleInput } from "@/types/sales";
import { useBusinessStore } from "@/store/business-store";
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

function mapBackendSaleToEntry(item: any): SaleEntry {
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

function mapBackendExpenseToEntry(item: any): ExpenseEntry {
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

export function useSales() {
  const [activeTab, setActiveTab] = useState<"sales" | "expenses">("sales");
  const [sales, setSales] = useState<SaleEntry[]>([]);
  const [expenses, setExpenses] = useState<ExpenseEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [showAddSale, setShowAddSale] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);

  const activeBusiness = useBusinessStore((state) => state.activeBusiness);
  const activeBranch = useBusinessStore((state) => state.activeBranch);

  const loadData = useCallback(async (showLoading = true) => {
    if (!activeBusiness?.id) {
      setSales([]);
      setExpenses([]);
      return;
    }

    if (showLoading) setIsLoading(true);
    try {
      const [salesData, expensesData] = await Promise.all([
        fetchSales({
          businessId: activeBusiness.id,
          branchId: activeBranch?.id,
        }),
        fetchExpenses({
          businessId: activeBusiness.id,
          branchId: activeBranch?.id,
        }),
      ]);

      setSales(salesData.map(mapBackendSaleToEntry));
      setExpenses(expensesData.map(mapBackendExpenseToEntry));
    } catch (err: any) {
      console.warn("Failed to fetch sales/expenses from backend:", err.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [activeBusiness?.id, activeBranch?.id]);

  useEffect(() => {
    loadData(true);
  }, [loadData]);

  const refreshSales = useCallback(async () => {
    setIsRefreshing(true);
    await loadData(false);
  }, [loadData]);

  const totalSales = sales.reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0);
  const totalExpenses = expenses.reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0);

  const handleAddSale = async (entry: SaleInput) => {
    if (!activeBusiness?.id || !activeBranch?.id) {
      Alert.alert(
        "Branch Required",
        "Please select or register an active business branch first before recording transactions.",
        [{ text: "OK" }]
      );
      return;
    }

    const tempId = `temp-sale-${Date.now()}`;
    const now = new Date();
    const time = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    const optimisticSale: SaleEntry = {
      id: tempId,
      time,
      ...entry,
      businessId: activeBusiness.id,
      branchId: activeBranch.id,
    };

    // Optimistic Update
    setSales((prev) => [optimisticSale, ...prev]);

    try {
      let formattedDueDate: string | null = null;
      if (entry.dueDate) {
        const parsed = new Date(entry.dueDate);
        formattedDueDate = !isNaN(parsed.getTime()) ? parsed.toISOString() : entry.dueDate;
      }

      const created = await createSale({
        businessId: activeBusiness.id,
        branchId: activeBranch.id,
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
      setSales((prev) => prev.map((s) => (s.id === tempId ? serverSale : s)));
    } catch (err: any) {
      // Rollback optimistic state
      setSales((prev) => prev.filter((s) => s.id !== tempId));

      // Descriptive and interactive message on rollback
      Alert.alert(
        "Transaction Sync Failed",
        `Could not save "${entry.description}" (${entry.amount.toLocaleString()} ETB) to the database.\n\nError: ${err.message || "Network request failed"}.\n\nYour transaction list has been restored. Would you like to retry saving?`,
        [
          {
            text: "Dismiss",
            style: "cancel",
          },
          {
            text: "Retry",
            style: "default",
            onPress: () => {
              handleAddSale(entry);
            },
          },
        ]
      );
    }
  };

  const handleAddExpense = async (entry: ExpenseInput) => {
    if (!activeBusiness?.id || !activeBranch?.id) {
      Alert.alert(
        "Branch Required",
        "Please select or register an active business branch first before recording expenses.",
        [{ text: "OK" }]
      );
      return;
    }

    const tempId = `temp-exp-${Date.now()}`;
    const now = new Date();
    const time = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    const optimisticExpense: ExpenseEntry = {
      id: tempId,
      time,
      ...entry,
      businessId: activeBusiness.id,
      branchId: activeBranch.id,
    };

    // Optimistic Update
    setExpenses((prev) => [optimisticExpense, ...prev]);

    try {
      const created = await createExpense({
        businessId: activeBusiness.id,
        branchId: activeBranch.id,
        description: entry.description,
        amount: Math.round(entry.amount),
        category: entry.category,
        notes: entry.notes || null,
      });

      const serverExpense = mapBackendExpenseToEntry(created);
      // Replace optimistic placeholder with confirmed server entity
      setExpenses((prev) => prev.map((e) => (e.id === tempId ? serverExpense : e)));
    } catch (err: any) {
      // Rollback optimistic state
      setExpenses((prev) => prev.filter((e) => e.id !== tempId));

      // Descriptive and interactive message on rollback
      Alert.alert(
        "Expense Sync Failed",
        `Could not save expense "${entry.description}" (${entry.amount.toLocaleString()} ETB) to the database.\n\nError: ${err.message || "Network request failed"}.\n\nYour expense list has been restored. Would you like to retry saving?`,
        [
          {
            text: "Dismiss",
            style: "cancel",
          },
          {
            text: "Retry",
            style: "default",
            onPress: () => {
              handleAddExpense(entry);
            },
          },
        ]
      );
    }
  };

  return {
    activeTab,
    setActiveTab,
    sales,
    expenses,
    isLoading,
    isRefreshing,
    refreshSales,
    showAddSale,
    setShowAddSale,
    showAddExpense,
    setShowAddExpense,
    totalSales,
    totalExpenses,
    handleAddSale,
    handleAddExpense,
  };
}
