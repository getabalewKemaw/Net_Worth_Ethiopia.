import { z } from "zod";

export const registerDeviceTokenSchema = z.object({
  token: z.string().min(1),
  platform: z.enum(["ios", "android", "web"]),
});

export const listNotificationsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  unreadOnly: z.preprocess(
    (v) => v === "true" || v === true,
    z.boolean().default(false),
  ),
});
