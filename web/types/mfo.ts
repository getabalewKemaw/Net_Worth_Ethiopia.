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
