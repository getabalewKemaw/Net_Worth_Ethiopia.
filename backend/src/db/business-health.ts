import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, index } from "drizzle-orm/pg-core";
import { user } from "./schema";
import { business, branch } from "./business-branch-management";

/**
 * Historical financial aggregation table storing pre-computed monthly and yearly summaries.
 */
export const businessFinancialSnapshot = pgTable(
  "business_financial_snapshot",
  {
    id: text("id").primaryKey(), // RFC4122 v4 UUID
    businessId: text("business_id")
      .notNull()
      .references(() => business.id, { onDelete: "cascade" }),
    branchId: text("branch_id")
      .references(() => branch.id, { onDelete: "cascade" }), // NULL = consolidated business total

    // Period Identifiers
    periodType: text("period_type").notNull(),     // 'monthly' | 'yearly'
    periodYear: text("period_year").notNull(),     // e.g. '2026'
    periodMonth: text("period_month"),             // '01' through '12' (NULL for yearly periods)
    periodLabel: text("period_label").notNull(),   // e.g. 'Oct 2026' or '2026'
    startDate: timestamp("start_date").notNull(),  // Start timestamp of period
    endDate: timestamp("end_date").notNull(),      // End timestamp of period

    // Currency Flow Metrics (stored as high-precision text decimals)
    grossInflow: text("gross_inflow").notNull().default("0"),   // Total Instant Sales + Settled Dube (ETB)
    grossOutflow: text("gross_outflow").notNull().default("0"), // Total Operational & Restock Expenses (ETB)
    netProfit: text("net_profit").notNull().default("0"),       // grossInflow - grossOutflow (ETB)
    profitMarginPct: text("profit_margin_pct").notNull().default("0"), // (netProfit / grossInflow) * 100

    // Growth & Change Velocity
    growthMoMPct: text("growth_mom_pct"), // Month-over-Month % change (e.g. "+14.2" or "-3.5")
    growthYoYPct: text("growth_yoy_pct"), // Year-over-Year % change
    transactionCount: text("transaction_count").notNull().default("0"),
    avgTicketSize: text("avg_ticket_size").notNull().default("0"),

    // Bankability & Trust Footprint (For Loan Underwriting)
    digitalPaymentRatio: text("digital_payment_ratio").notNull().default("0"), // (Telebirr + CBE) / grossInflow * 100
    telebirrVolume: text("telebirr_volume").notNull().default("0"),
    cbeVolume: text("cbe_volume").notNull().default("0"),
    cashVolume: text("cash_volume").notNull().default("0"),
    dubeCollectedVolume: text("dube_collected_volume").notNull().default("0"),
    dubeIssuedVolume: text("dube_issued_volume").notNull().default("0"),
    debtRecoveryRatePct: text("debt_recovery_rate_pct").notNull().default("0"),

    // Cached Multi-Branch Breakdown JSON string
    branchMetricsJson: text("branch_metrics_json"),

    // Metadata & Lock Status
    isFinalized: boolean("is_finalized").default(false).notNull(), // TRUE if period is past and locked
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("snapshot_biz_period_idx").on(table.businessId, table.periodType, table.periodYear, table.periodMonth),
    index("snapshot_biz_branch_idx").on(table.businessId, table.branchId),
    index("snapshot_date_range_idx").on(table.startDate, table.endDate),
  ]
);

/**
 * Secure token table for external, read-only verification by commercial banks and funding agencies.
 */
export const financialShareToken = pgTable(
  "financial_share_token",
  {
    token: text("token").primaryKey(), // Cryptographically random URL-safe token
    businessId: text("business_id")
      .notNull()
      .references(() => business.id, { onDelete: "cascade" }),
    createdById: text("created_by_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    // Metadata for Loan / Grant Application
    purpose: text("purpose").notNull(), // 'bank_loan' | 'working_capital' | 'grant' | 'investor_audit'
    funderName: text("funder_name"),    // e.g. 'Commercial Bank of Ethiopia'
    funderNote: text("funder_note"),    // Loan ref number or memo

    // Access Controls
    expiresAt: timestamp("expires_at"), // Optional expiry
    isActive: boolean("is_active").default(true).notNull(),
    accessCount: text("access_count").default("0").notNull(),
    lastAccessedAt: timestamp("last_accessed_at"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("share_token_biz_idx").on(table.businessId),
    index("share_token_created_by_idx").on(table.createdById),
  ]
);

// Drizzle ORM Relations
export const businessFinancialSnapshotRelations = relations(businessFinancialSnapshot, ({ one }) => ({
  business: one(business, {
    fields: [businessFinancialSnapshot.businessId],
    references: [business.id],
  }),
  branch: one(branch, {
    fields: [businessFinancialSnapshot.branchId],
    references: [branch.id],
  }),
}));

export const financialShareTokenRelations = relations(financialShareToken, ({ one }) => ({
  business: one(business, {
    fields: [financialShareToken.businessId],
    references: [business.id],
  }),
  user: one(user, {
    fields: [financialShareToken.createdById],
    references: [user.id],
  }),
}));
