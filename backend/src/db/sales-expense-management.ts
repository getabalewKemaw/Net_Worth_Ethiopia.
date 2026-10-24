import { relations } from "drizzle-orm";
import { index, integer, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { branch, business } from "./business-branch-management";
import { user } from "./schema";
import {
  PAYMENT_METHOD_VALUES,
  SALE_STATUS_VALUES,
  SALE_TYPE_VALUES,
} from "../types/sales";

export const saleTypeEnum = pgEnum("sale_type", SALE_TYPE_VALUES);
export const paymentMethodEnum = pgEnum("payment_method", PAYMENT_METHOD_VALUES);
export const saleStatusEnum = pgEnum("sale_status", SALE_STATUS_VALUES);

export const sale = pgTable(
  "sale",
  {
    id: text("id").primaryKey(),
    businessId: text("business_id")
      .notNull()
      .references(() => business.id, { onDelete: "cascade" }),
    branchId: text("branch_id")
      .notNull()
      .references(() => branch.id, { onDelete: "cascade" }),
    saleType: saleTypeEnum("sale_type").notNull(),
    paymentMethod: paymentMethodEnum("payment_method").notNull(),
    description: text("description").notNull(),
    amount: integer("amount").notNull(),
    customerName: text("customer_name"),
    customerPhone: text("customer_phone"),
    dueDate: timestamp("due_date"),
    notes: text("notes"),
    status: saleStatusEnum("status").notNull(),
    paidAt: timestamp("paid_at"),
    recordedById: text("recorded_by_id").references(() => user.id, { onDelete: "set null" }),
    recordedByName: text("recorded_by_name"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("sale_businessId_idx").on(table.businessId),
    index("sale_branchId_idx").on(table.branchId),
    index("sale_status_idx").on(table.status),
    index("sale_createdAt_idx").on(table.createdAt),
    index("sale_business_updated_idx").on(table.businessId, table.updatedAt),
    index("sale_recorded_by_idx").on(table.recordedById),
  ],
);

export const expense = pgTable(
  "expense",
  {
    id: text("id").primaryKey(),
    businessId: text("business_id")
      .notNull()
      .references(() => business.id, { onDelete: "cascade" }),
    branchId: text("branch_id")
      .notNull()
      .references(() => branch.id, { onDelete: "cascade" }),
    description: text("description").notNull(),
    amount: integer("amount").notNull(),
    category: text("category").notNull(),
    notes: text("notes"),
    recordedById: text("recorded_by_id").references(() => user.id, { onDelete: "set null" }),
    recordedByName: text("recorded_by_name"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("expense_businessId_idx").on(table.businessId),
    index("expense_branchId_idx").on(table.branchId),
    index("expense_category_idx").on(table.category),
    index("expense_createdAt_idx").on(table.createdAt),
    index("expense_business_updated_idx").on(table.businessId, table.updatedAt),
    index("expense_recorded_by_idx").on(table.recordedById),
  ],
);

export const saleRelations = relations(sale, ({ one }) => ({
  business: one(business, {
    fields: [sale.businessId],
    references: [business.id],
  }),
  branch: one(branch, {
    fields: [sale.branchId],
    references: [branch.id],
  }),
}));

export const expenseRelations = relations(expense, ({ one }) => ({
  business: one(business, {
    fields: [expense.businessId],
    references: [business.id],
  }),
  branch: one(branch, {
    fields: [expense.branchId],
    references: [branch.id],
  }),
}));
