import type { PaymentMethod, SaleEntry } from "@/types/sales";

export const INITIAL_SALES: SaleEntry[] = [
  { id: "s1", description: "Injera (10 plates)", amount: 350, customer: "Abebe M.", paymentMethod: "cash", saleType: "instant", time: "09:15 AM" },
  { id: "s2", description: "Wholesale flour 50kg", amount: 1200, customer: "Tigist Shop", phone: "0912345678", paymentMethod: "cash", saleType: "dube", dueDate: "Sep 13, 2026", time: "10:42 AM" },
  { id: "s3", description: "Mixed groceries", amount: 480, paymentMethod: "cbe", saleType: "instant", time: "11:30 AM" },
];

export const INITIAL_EXPENSES = [
  { id: "e1", description: "Electricity bill", amount: 750, category: "Utilities", time: "08:00 AM" },
  { id: "e2", description: "Teff flour stock", amount: 2400, category: "Inventory", time: "09:30 AM" },
  { id: "e3", description: "Driver salary", amount: 1800, category: "Salary", time: "11:00 AM" },
];

export const EXPENSE_CATEGORIES = ["Inventory", "Utilities", "Salary", "Rent", "Transport", "Maintenance", "Other"];

export const PAYMENT_METHODS: { key: PaymentMethod; label: string; name: string; icon: string; color: string }[] = [
  { key: "cash", label: "💵 Cash", name: "Cash", icon: "💵", color: "#10B981" },
  { key: "telebirr", label: "📱 Telebirr", name: "Telebirr", icon: "📱", color: "#7C3AED" },
  { key: "cbe", label: "🏦 CBE Birr", name: "CBE Birr", icon: "🏦", color: "#3B82F6" },
];

export const DUE_PRESETS = [
  { label: "3 Days", days: 3 },
  { label: "1 Week", days: 7 },
  { label: "2 Weeks", days: 14 },
  { label: "1 Month", days: 30 },
];
