export type TimeRangeFilter = '1M' | '3M' | '6M' | 'YTD' | '1Y' | 'ALL';

export interface BranchFinancialMetric {
  branchId: string;
  branchName: string;
  city?: string;
  inflow: number;
  outflow: number;
  profit: number;
  sharePct: number;
}

export interface FinancialSnapshot {
  id: string;
  businessId: string;
  branchId: string | null;
  periodType: 'monthly' | 'yearly';
  periodYear: string;
  periodMonth: string | null;
  periodLabel: string;
  startDate: string;
  endDate: string;
  grossInflow: number;
  grossOutflow: number;
  netProfit: number;
  profitMarginPct: number;
  growthMoMPct: number | null;
  growthYoYPct: number | null;
  transactionCount: number;
  avgTicketSize: number;
  digitalPaymentRatio: number;
  telebirrVolume: number;
  cbeVolume: number;
  cashVolume: number;
  dubeCollectedVolume: number;
  dubeIssuedVolume: number;
  debtRecoveryRatePct: number;
  branchMetrics: BranchFinancialMetric[];
  isFinalized: boolean;
}

export interface FinancialSummary {
  totalInflow: number;
  totalOutflow: number;
  netProfit: number;
  avgProfitMarginPct: number;
  averageDigitalRatio: number;
}

export interface CreateShareTokenParams {
  businessId: string;
  purpose: 'bank_loan' | 'working_capital' | 'grant' | 'investor_audit';
  funderName?: string;
  funderNote?: string;
  validityDays?: number;
}

export interface ShareTokenResult {
  token: string;
  shareUrl: string;
  funderName?: string | null;
  purpose: string;
  expiresAt?: string | null;
}
