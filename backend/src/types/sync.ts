import { z } from "zod";

export const MutationItemSchema = z.object({
  mutationId: z.string().min(1, "mutationId is required"),
  entityType: z.enum(["sale", "expense", "debt", "branch"]),
  action: z.enum(["CREATE", "UPDATE", "SETTLE", "DELETE"]),
  entityId: z.string().min(1, "entityId is required"),
  timestamp: z.string().optional(),
  payload: z.record(z.string(), z.any()),
});

export const SyncPushRequestSchema = z.object({
  businessId: z.string().min(1, "businessId is required"),
  deviceId: z.string().optional(),
  mutations: z.array(MutationItemSchema),
});

export const SyncPullQuerySchema = z.object({
  businessId: z.string().min(1, "businessId is required"),
  since: z.string().optional(),
});

export type MutationItem = z.infer<typeof MutationItemSchema>;
export type SyncPushRequest = z.infer<typeof SyncPushRequestSchema>;
export type SyncPullQuery = z.infer<typeof SyncPullQuerySchema>;

export interface SyncPushResponse {
  status: "success" | "partial" | "error";
  processedMutationIds: string[];
  rejectedMutations: Array<{ mutationId: string; reason: string }>;
}

export interface SyncPullResponse {
  serverTimestamp: string;
  changes: {
    sales: any[];
    expenses: any[];
    branches: any[];
  };
}
