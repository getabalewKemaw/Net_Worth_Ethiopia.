import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core";
import { user } from "./schema";
import { business, branch } from "./business-branch-management";

export const staffAssignment = pgTable(
  "staff_assignment",
  {
    id: text("id").primaryKey(), // UUID
    businessId: text("business_id")
      .notNull()
      .references(() => business.id, { onDelete: "cascade" }),
    branchId: text("branch_id")
      .notNull()
      .references(() => branch.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .references(() => user.id, { onDelete: "set null" }), // NULL until user registers/claims invite
    email: text("email").notNull(), // Normalized lowercase email
    name: text("name"), // Display name or nickname assigned by owner
    role: text("role").default("sales").notNull(), // 'sales' | 'manager'
    status: text("status").default("pending").notNull(), // 'pending' | 'active' | 'suspended'
    invitedAt: timestamp("invited_at").defaultNow().notNull(),
    acceptedAt: timestamp("accepted_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("staff_assignment_business_idx").on(table.businessId),
    index("staff_assignment_branch_idx").on(table.branchId),
    index("staff_assignment_email_idx").on(table.email),
    index("staff_assignment_user_idx").on(table.userId),
    uniqueIndex("staff_biz_email_unique_idx").on(table.businessId, table.email),
  ]
);

export const staffAssignmentRelations = relations(staffAssignment, ({ one }) => ({
  business: one(business, {
    fields: [staffAssignment.businessId],
    references: [business.id],
  }),
  branch: one(branch, {
    fields: [staffAssignment.branchId],
    references: [branch.id],
  }),
  user: one(user, {
    fields: [staffAssignment.userId],
    references: [user.id],
  }),
}));
