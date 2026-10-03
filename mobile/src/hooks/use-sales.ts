import { useState, useEffect, useCallback, useMemo } from "react";
import { Alert } from "react-native";
import type { ExpenseInput, SaleInput } from "@/types/sales";
import { useBusinessStore } from "@/store/business-store";
import { useSalesStore } from "@/store/sales-store";

export { mapBackendSaleToEntry, mapBackendExpenseToEntry } from "@/store/sales-store";

export function useSales() {
  const [showAddSale, setShowAddSale] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);

  const activeBusiness = useBusinessStore((state) => state.activeBusiness);
  const activeBranch = useBusinessStore((state) => state.activeBranch);

  const sales = useSalesStore((state) => state.sales);
  const expenses = useSalesStore((state) => state.expenses);
  const isLoading = useSalesStore((state) => state.isLoading);
  const isRefreshing = useSalesStore((state) => state.isRefreshing);
  const activeTab = useSalesStore((state) => state.activeTab);
  const setActiveTab = useSalesStore((state) => state.setActiveTab);
  const fetchData = useSalesStore((state) => state.fetchData);
  const refresh = useSalesStore((state) => state.refresh);
  const addSale = useSalesStore((state) => state.addSale);
  const addExpense = useSalesStore((state) => state.addExpense);
  const clearData = useSalesStore((state) => state.clearData);

  useEffect(() => {
    if (activeBusiness?.id) {
      fetchData(activeBusiness.id, activeBranch?.id, true);
    } else {
      clearData();
    }
  }, [activeBusiness?.id, activeBranch?.id, fetchData, clearData]);

  const refreshSales = useCallback(async () => {
    if (activeBusiness?.id) {
      await refresh(activeBusiness.id, activeBranch?.id);
    }
  }, [activeBusiness?.id, activeBranch?.id, refresh]);

  const totalSales = useMemo(
    () => sales.reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0),
    [sales]
  );
  const totalExpenses = useMemo(
    () => expenses.reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0),
    [expenses]
  );

  const handleAddSale = useCallback(
    async (entry: SaleInput) => {
      if (!activeBusiness?.id || !activeBranch?.id) {
        Alert.alert(
          "Branch Required",
          "Please select or register an active business branch first before recording transactions.",
          [{ text: "OK" }]
        );
        return;
      }

      try {
        await addSale(activeBusiness.id, activeBranch.id, entry);
      } catch (err: any) {
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
    },
    [activeBusiness?.id, activeBranch?.id, addSale]
  );

  const handleAddExpense = useCallback(
    async (entry: ExpenseInput) => {
      if (!activeBusiness?.id || !activeBranch?.id) {
        Alert.alert(
          "Branch Required",
          "Please select or register an active business branch first before recording expenses.",
          [{ text: "OK" }]
        );
        return;
      }

      try {
        await addExpense(activeBusiness.id, activeBranch.id, entry);
      } catch (err: any) {
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
    },
    [activeBusiness?.id, activeBranch?.id, addExpense]
  );

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
