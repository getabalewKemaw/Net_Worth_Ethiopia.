import { authClient, baseURL } from "@/lib/auth-client";
import type { z } from "zod";
import type { branchSchema } from "../validations/branch";

export type BranchInput = z.infer<typeof branchSchema>;

export const createBranch = async (businessId: string, input: BranchInput) => {
  const { data, error } = await authClient.$fetch(`${baseURL}/api/businesses/${businessId}/branches`, {
    method: "POST",
    body: JSON.stringify(input),
    headers: { "Content-Type": "application/json" },
  });
  
  if (error) throw new Error(error.message || "Failed to create branch");
  
  const json = data as any;
  if (json.status === "error") throw new Error(json.message);
  return json.data;
};

export const fetchBranchesByBusinessId = async (businessId: string) => {
  const { data, error } = await authClient.$fetch(`${baseURL}/api/businesses/${businessId}/branches`);
  
  if (error) throw new Error(error.message || "Failed to fetch branches");
  
  const json = data as any;
  if (json.status === "error") throw new Error(json.message);
  return json.data;
};

export const updateBranch = async (id: string, input: Partial<BranchInput>) => {
  const { data, error } = await authClient.$fetch(`${baseURL}/api/branches/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
    headers: { "Content-Type": "application/json" },
  });
  
  if (error) throw new Error(error.message || "Failed to update branch");
  
  const json = data as any;
  if (json.status === "error") throw new Error(json.message);
  return json.data;
};
