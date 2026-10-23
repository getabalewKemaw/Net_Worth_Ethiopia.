import type { PlatformStats, SystemSetting } from "@/types/admin";
import type { MfoOrganization } from "@/types/mfo";

export const MOCK_PLATFORM_STATS: PlatformStats = {
  totalMerchants: 1420,
  totalBranches: 1895,
  totalGtvEtb: 48920500,
  digitalTrailShare: 78.4,
  activeDubeEtb: 6240000,
  recoveredDubeEtb: 19850000,
  monthlyPulls: 342,
  activeMfoPartners: 6,
};

export const MOCK_MFO_ORGS: MfoOrganization[] = [
  {
    id: "mfo_org_01",
    name: "Wasasa Microfinance S.C.",
    licenseNo: "NBE/MFI/004/2000",
    contactEmail: "info@wasasa.et",
    contactPhone: "+251 11 439 1234",
    subscriptionPlan: "pro_monthly",
    queryCreditsRemaining: 68,
    totalPulls: 142,
    status: "active",
  },
  {
    id: "mfo_org_02",
    name: "Commercial Bank of Ethiopia - MSME Unit",
    licenseNo: "NBE/BNK/001/1963",
    contactEmail: "msme.lending@cbe.com.et",
    contactPhone: "+251 11 551 5004",
    subscriptionPlan: "enterprise",
    queryCreditsRemaining: 9999,
    totalPulls: 489,
    status: "active",
  },
  {
    id: "mfo_org_03",
    name: "Nisir Microfinance Institution",
    licenseNo: "NBE/MFI/018/2014",
    contactEmail: "contact@nisir.et",
    contactPhone: "+251 11 667 3400",
    subscriptionPlan: "pay_per_check",
    queryCreditsRemaining: 14,
    totalPulls: 38,
    status: "active",
  },
];

export const MOCK_SYSTEM_SETTINGS: SystemSetting[] = [
  {
    key: "maintenance_mode",
    label: "Platform Maintenance Mode",
    value: false,
    description: "Temporarily pause mobile text-fetching and merchant write syncs",
    category: "general",
  },
  {
    key: "health_score_grade_a",
    label: "Grade A Health Score Minimum",
    value: 80,
    description: "Minimum aggregate score required for prime MFO loan tier eligibility",
    category: "health_scoring",
  },
  {
    key: "telebirr_cbe_digital_weight",
    label: "Digital Transaction Multiplier",
    value: 1.25,
    description: "Credit boost multiplier for verified Telebirr & CBE digital inflows",
    category: "health_scoring",
  },
];
