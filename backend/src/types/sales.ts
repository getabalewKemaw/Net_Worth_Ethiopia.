export const SALE_TYPE_VALUES = ["instant", "dube"] as const;
export type SaleType = (typeof SALE_TYPE_VALUES)[number];

export const PAYMENT_METHOD_VALUES = ["cash", "telebirr", "cbe"] as const;
export type PaymentMethod = (typeof PAYMENT_METHOD_VALUES)[number];

export const SALE_STATUS_VALUES = ["pending", "settled", "voided"] as const;
export type SaleStatus = (typeof SALE_STATUS_VALUES)[number];

export interface CreateSaleInput {
  businessId: string;
  branchId: string;
  saleType: SaleType;
  paymentMethod: PaymentMethod;
  description: string;
  amount: number;
  customerName?: string | null | undefined;
  customerPhone?: string | null | undefined;
  dueDate?: Date | null | undefined;
  notes?: string | null | undefined;
  status?: SaleStatus | undefined;
}

export interface UpdateSaleInput {
  businessId?: string | undefined;
  branchId?: string | undefined;
  saleType?: SaleType | undefined;
  paymentMethod?: PaymentMethod | undefined;
  description?: string | undefined;
  amount?: number | undefined;
  customerName?: string | null | undefined;
  customerPhone?: string | null | undefined;
  dueDate?: Date | null | undefined;
  notes?: string | null | undefined;
  status?: SaleStatus | undefined;
}

export interface CreateExpenseInput {
  businessId: string;
  branchId: string;
  description: string;
  amount: number;
  category: string;
  notes?: string | null | undefined;
}

export interface UpdateExpenseInput {
  businessId?: string | undefined;
  branchId?: string | undefined;
  description?: string | undefined;
  amount?: number | undefined;
  category?: string | undefined;
  notes?: string | null | undefined;
}

export interface SaleFilters {
  branchId?: string | undefined;
  saleType?: SaleType | undefined;
  paymentMethod?: PaymentMethod | undefined;
  status?: SaleStatus | undefined;
  startDate?: Date | undefined;
  endDate?: Date | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
}

export interface ExpenseFilters {
  branchId?: string | undefined;
  category?: string | undefined;
  startDate?: Date | undefined;
  endDate?: Date | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
}


