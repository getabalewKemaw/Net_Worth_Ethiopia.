import { z } from "zod";

const ethiopianPhoneRegex = /^(\+251|251|0)?[1-9]\d{8}$/;
const ethiopianTINRegex = /^\d{10}$/;
const ethiopianLicenseRegex = /^[A-Z0-9\-\/]{5,50}$/i;

const businessTypes = ["Retail", "Wholesale", "Restaurant", "Service", "Manufacturing", "Other"] as const;

export const createBusinessSchema = z.object({
  name: z.string().trim().min(1, "Business name is required"),
  type: z.enum(businessTypes),
  phoneNumber: z.string().trim().regex(ethiopianPhoneRegex, "Invalid Ethiopian phone number"),
  email: z.string().trim().email("Invalid email address").nullable().optional().or(z.literal("")).transform(val => val === "" ? null : val),
  address: z.string().trim().min(1, "Address is required"),
  city: z.string().trim().min(1, "City is required"),
  subCityWoreda: z.string().trim().nullable().optional().or(z.literal("")).transform(val => val === "" ? null : val),
  description: z.string().trim().nullable().optional().or(z.literal("")).transform(val => val === "" ? null : val),
  tin: z.string().trim().regex(ethiopianTINRegex, "TIN must be exactly 10 digits").nullable().optional().or(z.literal("")).transform(val => val === "" ? null : val),
  commercialRegistrationNo: z.string().trim().regex(ethiopianLicenseRegex, "Invalid Commercial Registration number format").nullable().optional().or(z.literal("")).transform(val => val === "" ? null : val),
  tradeLicenseNo: z.string().trim().regex(ethiopianLicenseRegex, "Invalid Trade License number format").nullable().optional().or(z.literal("")).transform(val => val === "" ? null : val),
});

export const updateBusinessSchema = createBusinessSchema.partial();
