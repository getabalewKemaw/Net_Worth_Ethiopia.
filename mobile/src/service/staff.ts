import { authClient, baseURL } from "@/lib/auth-client";
import type {
  StaffAssignment,
  StaffProfile,
  DailyDigestResponse,
} from "../types/staff";

export const fetchStaffProfile = async (): Promise<StaffProfile> => {
  const { data, error } = await authClient.$fetch(`${baseURL}/api/staff/me`);

  if (error) {
    throw new Error(error.message || "Failed to fetch staff profile");
  }

  const json = data as any;
  if (json.status === "error") {
    throw new Error(json.message);
  }

  return json.data as StaffProfile;
};

export const fetchBranchStaff = async (
  branchId: string
): Promise<StaffAssignment[]> => {
  const { data, error } = await authClient.$fetch(
    `${baseURL}/api/branches/${branchId}/staff`
  );

  if (error) {
    throw new Error(error.message || "Failed to fetch branch staff list");
  }

  const json = data as any;
  if (json.status === "error") {
    throw new Error(json.message);
  }

  return (json.data || []) as StaffAssignment[];
};

export const assignStaff = async (
  branchId: string,
  input: { email: string; name?: string; role?: string }
): Promise<StaffAssignment> => {
  const { data, error } = await authClient.$fetch(
    `${baseURL}/api/branches/${branchId}/staff`,
    {
      method: "POST",
      body: JSON.stringify(input),
      headers: { "Content-Type": "application/json" },
    }
  );

  if (error) {
    throw new Error(error.message || "Failed to assign staff member");
  }

  const json = data as any;
  if (json.status === "error") {
    throw new Error(json.message);
  }

  return json.data as StaffAssignment;
};

export const revokeStaff = async (
  branchId: string,
  assignmentId: string
): Promise<{ revoked: boolean; message: string }> => {
  const { data, error } = await authClient.$fetch(
    `${baseURL}/api/branches/${branchId}/staff/${assignmentId}`,
    {
      method: "DELETE",
    }
  );

  if (error) {
    throw new Error(error.message || "Failed to revoke staff assignment");
  }

  const json = data as any;
  if (json.status === "error") {
    throw new Error(json.message);
  }

  return json.data;
};

export const fetchDailyDigest = async (
  businessId: string,
  date?: string
): Promise<DailyDigestResponse> => {
  const queryParam = date ? `&date=${encodeURIComponent(date)}` : "";
  const { data, error } = await authClient.$fetch(
    `${baseURL}/api/branches/daily-digest?businessId=${encodeURIComponent(
      businessId
    )}${queryParam}`
  );

  if (error) {
    throw new Error(error.message || "Failed to fetch daily branch digest");
  }

  const json = data as any;
  if (json.status === "error") {
    throw new Error(json.message);
  }

  return json.data as DailyDigestResponse;
};
