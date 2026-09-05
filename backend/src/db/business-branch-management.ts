import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, index, pgEnum } from "drizzle-orm/pg-core";
import { user } from "./schema";
export const businessTypeEnum = pgEnum("business_type", [
  "Retail",
  "Wholesale",
  "Restaurant",
  "Service",
  "Manufacturing",
  "Other"
]);

export const business = pgTable("business", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: businessTypeEnum("type").notNull(),
  phoneNumber: text("phone_number").notNull(),
  email: text("email"),
  address: text("address").notNull(),
  city: text("city").notNull(),
  subCityWoreda: text("sub_city_woreda"),
  description: text("description"),
  tin: text("tin"),
  commercialRegistrationNo: text("commercial_registration_no"),
  tradeLicenseNo: text("trade_license_no"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}, (table) => [
  index("business_userId_idx").on(table.userId),
]);

export const branch = pgTable("branch", {
  id: text("id").primaryKey(),
  businessId: text("business_id")
    .notNull()
    .references(() => business.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  branchCode: text("branch_code"),
  phoneNumber: text("phone_number"),
  address: text("address").notNull(),
  city: text("city").notNull(),
  subCityWoreda: text("sub_city_woreda"),
  telebirrMerchantId: text("telebirr_merchant_id"),
  cbeBirrMerchantId: text("cbe_birr_merchant_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}, (table) => [
  index("branch_businessId_idx").on(table.businessId),
]);

export const businessRelations = relations(business, ({ one, many }) => ({
  user: one(user, {
    fields: [business.userId],
    references: [user.id],
  }),
  branches: many(branch),
}));

export const branchRelations = relations(branch, ({ one }) => ({
  business: one(business, {
    fields: [branch.businessId],
    references: [business.id],
  }),
}));
