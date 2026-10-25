import { staffAssignment } from "../db/staff-management";

export type StaffAssignment = typeof staffAssignment.$inferSelect;
export type NewStaffAssignment = typeof staffAssignment.$inferInsert;

export type StaffRole = "sales" | "manager";
export type StaffStatus = "pending" | "active" | "suspended";

export interface AssignStaffInput {
  email: string;
  name?: string | null | undefined;
  role?: StaffRole | undefined;
}

export interface StaffProfileResponse {
  isStaff: boolean;
  assignmentId?: string;
  businessId?: string;
  businessName?: string;
  branchId?: string;
  branchName?: string;
  role?: string;
  status?: string;
  name?: string | null;
  email?: string;
}

export interface SettledDebtDigestItem {
  saleId: string;
  customerName: string | null;
  amount: number;
  paymentMethod: string;
  recordedByName: string | null;
  time: string;
}

export interface BranchDailyDigest {
  branchId: string;
  branchName: string;
  cashierName: string | null;
  metrics: {
    grossInflow: number;
    cashVolume: number;
    telebirrVolume: number;
    cbeVolume: number;
    expenseVolume: number;
    netShiftCash: number;
  };
  settledDebtsToday: SettledDebtDigestItem[];
}

export interface DailyDigestResponse {
  date: string;
  businessId: string;
  totalInflow: number;
  totalCashInDrawer: number;
  totalDigitalInflow: number;
  totalDubeSettled: number;
  branches: BranchDailyDigest[];
}
