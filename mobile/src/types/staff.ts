export type StaffRole = "sales" | "manager";
export type StaffStatus = "pending" | "active" | "suspended";

export interface StaffAssignment {
  id: string;
  businessId: string;
  branchId: string;
  userId?: string | null;
  email: string;
  name?: string | null;
  role: StaffRole;
  status: StaffStatus;
  invitedAt?: string;
  acceptedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StaffProfile {
  isStaff: boolean;
  assignmentId?: string;
  businessId?: string;
  businessName?: string;
  branchId?: string;
  branchName?: string;
  role?: StaffRole;
  status?: StaffStatus;
  name?: string | null;
  email?: string;
  userId?: string | null;
}

export interface ShiftDrawerMetrics {
  totalShiftVolume: number;
  cashInDrawer: number;
  telebirrCollected: number;
  cbeBirrCollected: number;
  dubeRecovered: number;
  expenseVolume: number;
  netCashInDrawer: number;
  transactionCount: number;
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
