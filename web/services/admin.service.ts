import { apiClient } from "./api";
import type { UserRecord, PlatformStats } from "@/types/admin";

export const adminService = {
  /**
   * Authenticates the Superadmin.
   */
  async login(email: string, password: string): Promise<{ user: any; token: string }> {
    return apiClient<{ user: any; token: string }>("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  /**
   * Fetches all registered business owners (merchants) from the backend.
   */
  async getBusinessOwners(): Promise<UserRecord[]> {
    return apiClient<UserRecord[]>("/api/admin/users");
  },

  /**
   * Fetches ecosystem platform statistics.
   */
  async getPlatformStats(): Promise<PlatformStats> {
    return apiClient<PlatformStats>("/api/admin/stats");
  },
};
