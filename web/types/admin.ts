import type { UserRole, UserStatus } from "./auth";

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  businessCount?: number;
  primaryBusiness?: string;
  businessName?: string;
  city?: string;
  totalBranches?: number;
  branchCount?: number;
  joinedAt?: string;
  createdAt?: string;
  lastActive?: string;
}

export interface MonthlyVolumeTrend {
  month: string;
  gtv: number;
  digital: number;
}

export interface SettlementBreakdown {
  telebirrShare: number;
  cbeShare: number;
  cashShare: number;
  telebirrVolumeEtb: number;
  cbeVolumeEtb: number;
  cashVolumeEtb: number;
}

export interface PlatformStats {
  totalMerchants: number;
  totalBusinesses?: number;
  totalBranches: number;
  totalPlatformVolumeEtb?: number;
  totalGtvEtb?: number;
  digitalTrailShare?: number;
  activeDossiers?: number;
  activeDubeEtb?: number;
  recoveredDubeEtb?: number;
  monthlyPulls?: number;
  trends?: MonthlyVolumeTrend[];
  settlementBreakdown?: SettlementBreakdown;
}

export interface SystemSetting {
  key: string;
  label: string;
  value: string | boolean | number;
  description: string;
  category: "general" | "health_scoring" | "payments";
}
