import type { UserRole, UserStatus } from "./auth";

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  businessName?: string;
  branchCount?: number;
  joinedAt: string;
}

export interface PlatformStats {
  totalMerchants: number;
  totalBranches: number;
  totalGtvEtb: number;
  digitalTrailShare: number;
  activeDubeEtb: number;
  recoveredDubeEtb: number;
  monthlyPulls: number;
  activeMfoPartners: number;
}

export interface SystemSetting {
  key: string;
  label: string;
  value: string | boolean | number;
  description: string;
  category: "general" | "health_scoring" | "payments";
}
