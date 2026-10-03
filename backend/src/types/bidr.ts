import type { PaymentMethod, SaleStatus } from "./sales";

export interface SettleBidrInput {
  paymentMethod?: PaymentMethod | undefined;
  notes?: string | null | undefined;
}

export interface UpdateBidrInput {
  dueDate?: Date | null | undefined;
  customerName?: string | null | undefined;
  customerPhone?: string | null | undefined;
  notes?: string | null | undefined;
  status?: SaleStatus | undefined;
}

export interface BidrFilters {
  branchId?: string | undefined;
  status?: SaleStatus | undefined;
  isOverdue?: boolean | undefined;
  startDate?: Date | undefined;
  endDate?: Date | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
}

export interface CreateBidrInput {
  businessId: string;
  branchId: string;
  description: string;
  amount: number;
  paymentMethod?: PaymentMethod | undefined;
  customerName: string;
  customerPhone?: string | null | undefined;
  dueDate?: Date | null | undefined;
  notes?: string | null | undefined;
}

export interface DebtSummary {
  totalCreditAmount: number;
  pendingAmount: number;
  totalPendingAmount: number;
  settledAmount: number;
  totalSettledAmount: number;
  overdueAmount: number;
  totalOverdueAmount: number;
  dueSoonAmount: number;
  totalDebts: number;
  pendingCount: number;
  settledCount: number;
  overdueCount: number;
  dueSoonCount: number;
}
