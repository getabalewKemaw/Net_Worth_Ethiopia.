import { create } from "zustand";
import * as staffService from "../service/staff";
import { localStaffRepo } from "../repositories/local-staff.repo";
import type {
  StaffAssignment,
  StaffProfile,
  StaffRole,
  ShiftDrawerMetrics,
} from "../types/staff";

interface StaffState {
  isStaff: boolean;
  role: StaffRole | null;
  assignedBusinessId: string | null;
  assignedBusinessName: string | null;
  assignedBranchId: string | null;
  assignedBranchName: string | null;
  staffProfile: StaffProfile | null;
  shiftMetrics: ShiftDrawerMetrics | null;
  branchStaffList: StaffAssignment[];
  isLoading: boolean;
  error: string | null;

  initStaffSession: (user?: {
    id: string;
    email: string;
    name?: string;
  }) => Promise<boolean>;
  refreshShiftMetrics: () => Promise<void>;
  setAssignedContext: (context: Partial<StaffProfile>) => void;
  clearStaffSession: () => void;

  // Owner management actions
  loadBranchStaff: (branchId: string) => Promise<StaffAssignment[]>;
  assignStaff: (
    branchId: string,
    email: string,
    name?: string,
    role?: StaffRole
  ) => Promise<void>;
  revokeStaff: (branchId: string, assignmentId: string) => Promise<void>;
}

export const useStaffStore = create<StaffState>((set, get) => ({
  isStaff: false,
  role: null,
  assignedBusinessId: null,
  assignedBusinessName: null,
  assignedBranchId: null,
  assignedBranchName: null,
  staffProfile: null,
  shiftMetrics: null,
  branchStaffList: [],
  isLoading: false,
  error: null,

  initStaffSession: async (user) => {
    set({ isLoading: true, error: null });
    try {
      // 1. Try remote fetch from backend (/api/staff/me)
      const profile = await staffService.fetchStaffProfile();

      if (profile.isStaff && profile.branchId) {
        set({
          isStaff: true,
          role: profile.role || "sales",
          assignedBusinessId: profile.businessId || null,
          assignedBusinessName: profile.businessName || null,
          assignedBranchId: profile.branchId,
          assignedBranchName: profile.branchName || null,
          staffProfile: profile,
          isLoading: false,
        });

        // Cache in SQLite for offline startup
        if (profile.assignmentId && profile.businessId) {
          await localStaffRepo.saveStaffAtomic({
            id: profile.assignmentId,
            business_id: profile.businessId,
            branch_id: profile.branchId,
            user_id: profile.userId || user?.id || null,
            email: profile.email || user?.email || "",
            name: profile.name || user?.name || null,
            role: profile.role || "sales",
            status: profile.status || "active",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }

        // Compute today's shift drawer totals
        await get().refreshShiftMetrics();
        return true;
      }

      // Not a staff user
      set({
        isStaff: false,
        role: null,
        assignedBusinessId: null,
        assignedBusinessName: null,
        assignedBranchId: null,
        assignedBranchName: null,
        staffProfile: null,
        shiftMetrics: null,
        isLoading: false,
      });
      return false;
    } catch {
      // 2. Offline fallback: Check SQLite cache if user ID is known
      if (user?.id) {
        const localAssignment = await localStaffRepo.getStaffAssignmentByUserId(
          user.id
        );
        if (localAssignment && localAssignment.branch_id) {
          const profile: StaffProfile = {
            isStaff: true,
            assignmentId: localAssignment.id,
            businessId: localAssignment.business_id,
            branchId: localAssignment.branch_id,
            role: localAssignment.role,
            status: localAssignment.status,
            name: localAssignment.name || user.name || null,
            email: localAssignment.email || user.email,
            userId: user.id,
          };

          set({
            isStaff: true,
            role: localAssignment.role,
            assignedBusinessId: localAssignment.business_id,
            assignedBranchId: localAssignment.branch_id,
            staffProfile: profile,
            isLoading: false,
          });

          await get().refreshShiftMetrics();
          return true;
        }
      }

      set({
        isStaff: false,
        isLoading: false,
      });
      return false;
    }
  },

  refreshShiftMetrics: async () => {
    const branchId = get().assignedBranchId;
    if (!branchId) return;

    try {
      const metrics = await localStaffRepo.computeShiftDrawerMetrics(branchId);
      set({ shiftMetrics: metrics });
    } catch (err: any) {
      console.warn(
        "[useStaffStore] Failed to compute shift drawer metrics:",
        err?.message
      );
    }
  },

  setAssignedContext: (context) => {
    set((state) => ({
      ...state,
      isStaff: context.isStaff ?? state.isStaff,
      role: context.role ?? state.role,
      assignedBusinessId: context.businessId ?? state.assignedBusinessId,
      assignedBusinessName: context.businessName ?? state.assignedBusinessName,
      assignedBranchId: context.branchId ?? state.assignedBranchId,
      assignedBranchName: context.branchName ?? state.assignedBranchName,
      staffProfile: {
        ...(state.staffProfile || { isStaff: true }),
        ...context,
      },
    }));
  },

  clearStaffSession: () => {
    set({
      isStaff: false,
      role: null,
      assignedBusinessId: null,
      assignedBusinessName: null,
      assignedBranchId: null,
      assignedBranchName: null,
      staffProfile: null,
      shiftMetrics: null,
      branchStaffList: [],
      isLoading: false,
      error: null,
    });
  },

  loadBranchStaff: async (branchId: string) => {
    set({ isLoading: true, error: null });
    try {
      const staffList = await staffService.fetchBranchStaff(branchId);
      set({ branchStaffList: staffList, isLoading: false });

      // Cache locally
      await localStaffRepo.saveStaffBatch(
        staffList.map((s) => ({
          id: s.id,
          business_id: s.businessId,
          branch_id: s.branchId,
          user_id: s.userId || null,
          email: s.email,
          name: s.name || null,
          role: s.role,
          status: s.status,
          created_at: s.createdAt,
          updated_at: s.updatedAt,
        }))
      );

      return staffList;
    } catch (err: any) {
      // Fallback to SQLite
      const cached = await localStaffRepo.getStaffAssignmentsByBranch(branchId);
      const mappedList: StaffAssignment[] = cached.map((c) => ({
        id: c.id,
        businessId: c.business_id,
        branchId: c.branch_id,
        userId: c.user_id,
        email: c.email,
        name: c.name,
        role: c.role,
        status: c.status,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
      }));
      set({ branchStaffList: mappedList, isLoading: false });
      return mappedList;
    }
  },

  assignStaff: async (branchId, email, name, role) => {
    set({ isLoading: true, error: null });
    try {
      await staffService.assignStaff(branchId, {
        email,
        name,
        role: role || "sales",
      });
      await get().loadBranchStaff(branchId);
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  revokeStaff: async (branchId, assignmentId) => {
    set({ isLoading: true, error: null });
    try {
      await staffService.revokeStaff(branchId, assignmentId);
      await localStaffRepo.deleteStaffAssignment(assignmentId);
      await get().loadBranchStaff(branchId);
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },
}));
