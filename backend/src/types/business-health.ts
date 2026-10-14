import { businessFinancialSnapshot, financialShareToken } from "../db/business-health";

export type BusinessFinancialSnapshot = typeof businessFinancialSnapshot.$inferSelect;
export type NewBusinessFinancialSnapshot = typeof businessFinancialSnapshot.$inferInsert;

export type FinancialShareToken = typeof financialShareToken.$inferSelect;
export type NewFinancialShareToken = typeof financialShareToken.$inferInsert;

export interface BranchMetricSummary {
  branchId: string;
  branchName: string;
  city?: string | undefined;
  inflow: number;
  outflow: number;
  profit: number;
  sharePct: number;
}

export interface SnapshotQueryParams {
  businessId: string;
  branchId?: string | undefined;
  periodType?: "monthly" | "yearly" | undefined;
  limit?: number | undefined;
}

export interface RecomputeSnapshotPayload {
  businessId: string;
  branchId?: string | undefined;
  periodYear?: string | undefined;
  periodMonth?: string | undefined;
}

export interface CreateShareTokenPayload {
  businessId: string;
  purpose: "bank_loan" | "working_capital" | "grant" | "investor_audit";
  funderName?: string | undefined;
  funderNote?: string | undefined;
  validityDays?: number | undefined;
}

export interface VerifiedDossierResult {
  status: "verified";
  token: string;
  funderName?: string | null;
  purpose: string;
  expiresAt?: string | null;
  business: {
    id: string;
    name: string;
    type: string;
    city: string;
    address: string;
    operatingSince: string;
  };
  summary: {
    totalRevenue: number;
    totalExpense: number;
    netProfit: number;
    avgProfitMarginPct: number;
    verifiableDigitalRatio: string;
    debtRecoveryRate: string;
    consecutiveProfitableMonths: number;
  };
  snapshots: Array<{
    periodLabel: string;
    periodYear: string;
    periodMonth?: string | null;
    grossInflow: number;
    grossOutflow: number;
    netProfit: number;
    profitMarginPct: number;
    growthMoMPct?: number | null;
    growthYoYPct?: number | null;
    digitalPaymentRatio: number;
    telebirrVolume: number;
    cbeVolume: number;
    cashVolume: number;
    transactionCount: number;
    branchMetrics: BranchMetricSummary[];
  }>;
}
