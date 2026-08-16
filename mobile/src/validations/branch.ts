import { z } from "zod";

const ethiopianPhoneRegex = /^(\+251|251|0)?[1-9]\d{8}$/;

export const branchSchema = z.object({
  name: z.string().trim().min(1, "Branch name is required"),
  phoneNumber: z.string().trim().regex(ethiopianPhoneRegex, "Invalid Ethiopian phone number").nullable().optional().or(z.literal("")).transform(val => val === "" ? null : val),
  address: z.string().trim().min(1, "Address is required"),
  city: z.string().trim().min(1, "City is required"),
  subCityWoreda: z.string().trim().nullable().optional().or(z.literal("")).transform(val => val === "" ? null : val),
  telebirrMerchantId: z.string().trim().regex(/^[A-Z0-9]{3,20}$/i, "Invalid Telebirr Merchant ID").nullable().optional().or(z.literal("")).transform(val => val === "" ? null : val),
  cbeBirrMerchantId: z.string().trim().regex(/^[A-Z0-9]{3,20}$/i, "Invalid CBE Birr Merchant ID").nullable().optional().or(z.literal("")).transform(val => val === "" ? null : val),
});
