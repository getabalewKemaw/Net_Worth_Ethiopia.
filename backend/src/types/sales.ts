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
  customerName?: string | null;
  customerPhone?: string | null;
  dueDate?: Date | null;
  notes?: string | null;
  status?: SaleStatus;
}

export interface UpdateSaleInput {
  saleType?: SaleType;
  paymentMethod?: PaymentMethod;
  description?: string;
  amount?: number;
  customerName?: string | null;
  customerPhone?: string | null;
  dueDate?: Date | null;
  notes?: string | null;
  status?: SaleStatus;
}

export interface CreateExpenseInput {
  businessId: string;
  branchId: string;
  description: string;
  amount: number;
  category: string;
  notes?: string | null;
}

export interface UpdateExpenseInput {
  description?: string;
  amount?: number;
  category?: string;
  notes?: string | null;
}
