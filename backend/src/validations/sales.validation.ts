import { z } from "zod";

import {
  PAYMENT_METHOD_VALUES,
  SALE_STATUS_VALUES,
  SALE_TYPE_VALUES,
} from "../types/sales";

const optionalText = z
  .string()
  .trim()
  .min(1)
  .optional()
  .nullable()
  .or(z.literal(""))
  .transform((value) => (value === "" ? null : value ?? null));

const optionalDate = z
  .preprocess((value) => {
    if (value === "" || value === null || value === undefined) {
      return undefined;
    }
    return value;
  }, z.coerce.date().optional().nullable())
  .transform((value) => value ?? null);

const saleBaseSchema = z.object({
  businessId: z.string().trim().min(1, "Business id is required"),
  branchId: z.string().trim().min(1, "Branch id is required"),
  saleType: z.enum(SALE_TYPE_VALUES),
  paymentMethod: z.enum(PAYMENT_METHOD_VALUES),
  description: z.string().trim().min(1, "Description is required"),
  amount: z.coerce.number().int().nonnegative("Amount must be a positive integer"),
  customerName: optionalText,
  customerPhone: optionalText,
  dueDate: optionalDate,
  notes: optionalText,
  status: z.enum(SALE_STATUS_VALUES).optional(),
});

export const createSaleSchema = saleBaseSchema.superRefine((data, ctx) => {
  if (data.saleType === "dube") {
    if (!data.customerName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["customerName"],
        message: "Customer name is required for Dube sales",
      });
    }

    if (!data.customerPhone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["customerPhone"],
        message: "Customer phone is required for Dube sales",
      });
    }

    if (!data.dueDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["dueDate"],
        message: "Due date is required for Dube sales",
      });
    }
  }
});

export const updateSaleSchema = saleBaseSchema.partial().superRefine((data, ctx) => {
  if (data.saleType === "dube") {
    if (data.customerName === null || data.customerName === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["customerName"],
        message: "Customer name is required for Dube sales",
      });
    }

    if (data.customerPhone === null || data.customerPhone === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["customerPhone"],
        message: "Customer phone is required for Dube sales",
      });
    }

    if (data.dueDate === null || data.dueDate === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["dueDate"],
        message: "Due date is required for Dube sales",
      });
    }
  }
});

export const createExpenseSchema = z.object({
  businessId: z.string().trim().min(1, "Business id is required"),
  branchId: z.string().trim().min(1, "Branch id is required"),
  description: z.string().trim().min(1, "Description is required"),
  amount: z.coerce.number().int().nonnegative("Amount must be a positive integer"),
  category: z.string().trim().min(1, "Category is required"),
  notes: optionalText,
});

export const updateExpenseSchema = createExpenseSchema.partial();
