import { authClient, baseURL } from "@/lib/auth-client";
import type { z } from "zod";
import type { businessSchema } from "../validations/business";

export type BusinessInput = z.infer<typeof businessSchema>;

export const createBusiness = async (input: BusinessInput) => {
  const { data, error } = await authClient.$fetch(`${baseURL}/api/businesses`, {
    method: "POST",
    body: JSON.stringify(input),
    headers: { "Content-Type": "application/json" },
  });
  
  if (error) throw new Error(error.message || "Failed to create business");
  
  const json = data as any;
  if (json.status === "error") throw new Error(json.message);
  return json.data;
};

export const fetchBusinesses = async () => {
  const { data, error } = await authClient.$fetch(`${baseURL}/api/businesses`);
  
  if (error) throw new Error(error.message || "Failed to fetch businesses");
  
  const json = data as any;
  if (json.status === "error") throw new Error(json.message);
  return json.data;
};

export const updateBusiness = async (id: string, input: Partial<BusinessInput>) => {
  const { data, error } = await authClient.$fetch(`${baseURL}/api/businesses/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
    headers: { "Content-Type": "application/json" },
  });
  
  if (error) throw new Error(error.message || "Failed to update business");
  
  const json = data as any;
  if (json.status === "error") throw new Error(json.message);
  return json.data;
};
