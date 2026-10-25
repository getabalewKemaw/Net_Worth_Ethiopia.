import type { PaymentMethod, SaleStatus } from './sales';

export interface DebtItem {
  id: string;
  businessId: string;
  branchId: string;
  saleType: 'dube';
  paymentMethod: PaymentMethod;
  description: string;
  amount: number;
  customerName?: string | null;
  customerPhone?: string | null;
  dueDate?: string | null;
  notes?: string | null;
  status: SaleStatus;
  paidAt?: string | null;
  recordedById?: string | null;
  recordedByName?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDebtPayload {
  businessId: string;
  branchId: string;
  description: string;
  amount: number;
  paymentMethod?: PaymentMethod;
  customerName: string;
  customerPhone?: string | null;
  dueDate?: string | null;
  notes?: string | null;
  recordedById?: string | null;
  recordedByName?: string | null;
}

export interface DebtSummaryData {
  totalCreditAmount?: number;
  pendingAmount?: number;
  totalPendingAmount: number;
  settledAmount?: number;
  totalSettledAmount: number;
  overdueAmount?: number;
  totalOverdueAmount: number;
  dueSoonAmount?: number;
  totalDebts?: number;
  pendingCount: number;
  settledCount: number;
  overdueCount: number;
  dueSoonCount?: number;
}

export interface FetchDebtsParams {
  businessId?: string;
  branchId?: string;
  status?: SaleStatus;
  isOverdue?: boolean;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface SettleDebtPayload {
  paymentMethod?: PaymentMethod;
  notes?: string | null;
  recordedById?: string | null;
  recordedByName?: string | null;
}

export interface UpdateDebtPayload {
  dueDate?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  notes?: string | null;
  status?: SaleStatus;
}

export type DebtSortOption =
  | 'due_asc'        // Due date: Earliest / Urgent first
  | 'due_desc'       // Due date: Latest first
  | 'created_desc'   // Created: Newest first
  | 'created_asc'    // Created: Oldest first
  | 'amount_desc'    // Amount: High to Low
  | 'amount_asc';    // Amount: Low to High

export type DebtFilterStatus = 'all' | 'pending' | 'overdue' | 'due_soon' | 'settled';
