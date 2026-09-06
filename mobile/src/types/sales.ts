export type SaleType = "instant" | "dube";

export type PaymentMethod = "cash" | "telebirr" | "cbe";

export type SaleEntry = {
  id: string;
  description: string;
  amount: number;
  customer?: string;
  phone?: string;
  paymentMethod: PaymentMethod;
  saleType: SaleType;
  dueDate?: string;
  time: string;
};

export type ExpenseEntry = {
  id: string;
  description: string;
  amount: number;
  category: string;
  time: string;
};

export type SaleInput = Omit<SaleEntry, "id" | "time">;
export type ExpenseInput = Omit<ExpenseEntry, "id" | "time">;
