import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";
import { user } from "./schema";
import { business } from "./business-branch-management";

export const syncIdempotency = pgTable(
  "sync_idempotency",
  {
    mutationId: text("mutation_id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    businessId: text("business_id")
      .notNull()
      .references(() => business.id, { onDelete: "cascade" }),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    action: text("action").notNull(),
    status: text("status").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("sync_idempotency_biz_idx").on(table.businessId),
    index("sync_idempotency_created_idx").on(table.createdAt),
  ]
);

export const syncIdempotencyRelations = relations(syncIdempotency, ({ one }) => ({
  user: one(user, {
    fields: [syncIdempotency.userId],
    references: [user.id],
  }),
  business: one(business, {
    fields: [syncIdempotency.businessId],
    references: [business.id],
  }),
}));
