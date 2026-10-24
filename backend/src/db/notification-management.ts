import { boolean, index, integer, jsonb, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { user } from "./schema";

export const notification = pgTable(
  "notification",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    data: jsonb("data"),
    dedupeKey: text("dedupe_key"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    readAt: timestamp("read_at"),
    deliveryStatus: text("delivery_status").notNull().default("pending"),
    deliveryAttempts: integer("delivery_attempts").notNull().default(0),
    lastAttemptAt: timestamp("last_attempt_at"),
  },
  (t) => ({
    idxUserCreated: index("notification_user_created_idx").on(t.userId, t.createdAt),
    idxUserUnread: index("notification_user_unread_idx").on(t.userId, t.readAt),
    idxUserDedupe: uniqueIndex("notification_user_dedupe_idx").on(t.userId, t.dedupeKey),
  }),
);

export const deviceToken = pgTable(
  "device_token",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    token: text("token").notNull(),
    platform: text("platform").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    idxTokenUnique: uniqueIndex("device_token_token_unique_idx").on(t.token),
    idxUser: index("device_token_user_idx").on(t.userId),
  }),
);

