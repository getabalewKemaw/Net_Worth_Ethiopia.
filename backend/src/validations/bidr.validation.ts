import { z } from "zod";
import { PAYMENT_METHOD_VALUES, SALE_STATUS_VALUES } from "../types/sales";

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

export const settleBidrSchema = z.object({
  paymentMethod: z.enum(PAYMENT_METHOD_VALUES).optional(),
  notes: optionalText,
});

export const updateBidrSchema = z.object({
  dueDate: optionalDate,
  customerName: optionalText,
  customerPhone: optionalText,
  notes: optionalText,
  status: z.enum(SALE_STATUS_VALUES).optional(),
});
