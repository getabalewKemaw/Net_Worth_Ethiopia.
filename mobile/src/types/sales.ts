export type SaleType = "instant" | "dube";

export type PaymentMethod = "cash" | "telebirr" | "cbe";

export type SaleStatus = "pending" | "settled" | "voided";

export type SaleEntry = {
  id: string;
  businessId?: string;
  branchId?: string;
  description: string;
  amount: number;
  customer?: string;
  phone?: string;
  paymentMethod: PaymentMethod;
  saleType: SaleType;
  dueDate?: string;
  status?: SaleStatus;
  paidAt?: string | null;
  time: string;
  createdAt?: string;
  recordedById?: string | null;
  recordedByName?: string | null;
};

export type ExpenseEntry = {
  id: string;
  businessId?: string;
  branchId?: string;
  description: string;
  amount: number;
  category: string;
  notes?: string | null;
  time: string;
  createdAt?: string;
  recordedById?: string | null;
  recordedByName?: string | null;
};

export type SaleInput = Omit<SaleEntry, "id" | "time">;
export type ExpenseInput = Omit<ExpenseEntry, "id" | "time">;
