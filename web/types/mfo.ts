export interface MfoOrganization {
  id: string;
  name: string;
  licenseNo: string;
  contactEmail: string;
  contactPhone: string;
  subscriptionPlan: "pay_per_check" | "pro_monthly" | "enterprise";
  queryCreditsRemaining: number;
  totalPulls: number;
  status: "active" | "delinquent";
}

export interface FinancialPillar {
  title: string;
  score: number;
  weight: number;
  description: string;
  status: "strong" | "moderate" | "weak";
}

export interface MonthlySnapshotMetric {
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
  branchMetrics?: Array<{
    branchId: string;
    branchName: string;
    city?: string;
    inflow: number;
    outflow: number;
    profit: number;
    sharePct: number;
  }>;
}

export interface VerifiedDossierData {
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
    tin?: string | null;
    tradeLicenseNo?: string | null;
    branchCount?: number;
    operatingSince: string;
  };
  healthScore: number;
  ratingGrade: "Grade A" | "Grade B" | "Grade C" | "Grade D";
  recommendedLoanEtb: number;
  monthlyRevenueEtb: number;
  digitalRatioPercent: number;
  dubeRepaymentRatePercent: number;
  avgDubeDays: number;
  pillars: FinancialPillar[];
  summary: {
    totalRevenue: number;
    totalExpense: number;
    netProfit: number;
    avgProfitMarginPct: number;
    verifiableDigitalRatio: string;
    debtRecoveryRate: string;
    consecutiveProfitableMonths: number;
  };
  snapshots: MonthlySnapshotMetric[];
}

// Compatibility helper interface for existing components
export interface BusinessDossier {
  shareCode: string;
  businessName: string;
  tin: string;
  city: string;
  category: string;
  tradeLicenseNo: string;
  branchCount: number;
  ownerName: string;
  healthScore: number;
  ratingGrade: "Grade A" | "Grade B" | "Grade C" | "Grade D";
  recommendedLoanEtb: number;
  monthlyRevenueEtb: number;
  digitalRatioPercent: number;
  dubeRepaymentRatePercent: number;
  avgDubeDays: number;
  pillars: FinancialPillar[];
  expiresAt: string;
}
