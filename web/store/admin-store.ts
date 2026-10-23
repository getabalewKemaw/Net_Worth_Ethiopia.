import { create } from "zustand";
import { adminService } from "@/services/admin.service";
import type { UserRecord, PlatformStats } from "@/types/admin";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "admin";
}

interface AdminState {
  currentUser: AdminUser | null;
  isAuthenticated: boolean;
  users: UserRecord[];
  stats: PlatformStats | null;
  isLoading: boolean;
  error: string | null;

  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  fetchUsers: () => Promise<void>;
  fetchStats: () => Promise<void>;
  toggleUserStatus: (id: string) => void;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  currentUser: null,
  isAuthenticated: false,
  users: [],
  stats: null,
  isLoading: false,
  error: null,

  login: async (email: string, pass: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await adminService.login(email, pass);
      set({
        currentUser: res.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (err: any) {
      set({
        error: err.message || "Invalid admin credentials",
        isLoading: false,
      });
      return false;
    }
  },

  logout: () => {
    set({ currentUser: null, isAuthenticated: false, users: [], stats: null });
  },

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await adminService.getBusinessOwners();
      set({ users: data, isLoading: false, error: null });
    } catch (err: any) {
      set({
        users: [],
        error: err.message || "Failed to load registered business owners",
        isLoading: false,
      });
    }
  },

  fetchStats: async () => {
    try {
      const data = await adminService.getPlatformStats();
      set({ stats: data });
    } catch {
      set({ stats: null });
    }
  },

  toggleUserStatus: (id: string) => {
    const { users } = get();
    set({
      users: users.map((u) =>
        u.id === id
          ? { ...u, status: u.status === "active" ? "suspended" : "active" }
          : u
      ),
    });
  },
}));
