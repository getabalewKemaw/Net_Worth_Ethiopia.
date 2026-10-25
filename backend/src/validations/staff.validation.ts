import { z } from "zod";

export const assignStaffSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Invalid email address"),
  name: z.string().trim().nullable().optional(),
  role: z.enum(["sales", "manager"]).default("sales"),
});

export const dailyDigestQuerySchema = z.object({
  businessId: z.string().trim().min(1, "businessId query parameter is required"),
  date: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "date must follow YYYY-MM-DD format")
    .optional(),
});
