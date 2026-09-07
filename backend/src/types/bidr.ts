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

export interface DebtSummary {
  totalPendingAmount: number;
  pendingCount: number;
  totalOverdueAmount: number;
  overdueCount: number;
  totalSettledAmount: number;
  settledCount: number;
}
