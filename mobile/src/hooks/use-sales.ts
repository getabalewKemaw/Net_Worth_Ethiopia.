import { useState } from "react";
import type { ExpenseEntry, ExpenseInput, SaleEntry, SaleInput } from "@/types/sales";
import { INITIAL_EXPENSES, INITIAL_SALES } from "@/constants/sales";

export function useSales() {
  const [activeTab, setActiveTab] = useState<"sales" | "expenses">("sales");
  const [sales, setSales] = useState<SaleEntry[]>(INITIAL_SALES);
  const [expenses, setExpenses] = useState<ExpenseEntry[]>(INITIAL_EXPENSES);
  const [showAddSale, setShowAddSale] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);

  const totalSales = sales.reduce((sum, entry) => sum + entry.amount, 0);
  const totalExpenses = expenses.reduce((sum, entry) => sum + entry.amount, 0);

  const handleAddSale = (entry: SaleInput) => {
    const now = new Date();
    const time = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    setSales((prev) => [{ id: `s${Date.now()}`, time, ...entry }, ...prev]);
  };

  const handleAddExpense = (entry: ExpenseInput) => {
    const now = new Date();
    const time = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    setExpenses((prev) => [{ id: `e${Date.now()}`, time, ...entry }, ...prev]);
  };

  return {
    activeTab,
    setActiveTab,
    sales,
    expenses,
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
