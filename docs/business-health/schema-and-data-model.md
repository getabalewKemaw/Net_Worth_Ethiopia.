# Business Health — Schema & Data Model Plan

This document details the database schema design, storage strategy, table specifications, and mathematical aggregation formulas powering the **Business Health & Loan Readiness** feature.

---

## 1. Architectural Strategy: Dedicated Snapshot Tables

### Why Not Calculate On-the-Fly Every Time?
Running real-time `SUM()`, `AVG()`, and grouping across thousands of `sale`, `expense`, and `sync_idempotency` rows on every screen render introduces:
- **Severe Latency**: Multi-second page load times as transaction volume scales over months and years.
- **Battery & CPU Drain**: Excessive mobile overhead when rendering interactive charts and filters.
- **Third-Party Bottlenecks**: Exposing real-time aggregation queries to bank loan officers on the web portal would degrade backend API performance.

### The Solution: Pre-Aggregated Snapshots (Option 1)
- **Closed Historical Periods (Past Months & Years)**: Once a calendar month ends, its totals are immutable and stored as a permanent snapshot record. Queries take **< 5ms**.
- **Current Active Period (In-Flight Month)**: Updated incrementally during offline sync or on-demand when the user views the screen.
- **Dual-Layer Storage**: Stored in PostgreSQL on the server and cached in local SQLite on mobile for 100% offline availability.

---

## 2. PostgreSQL Drizzle Schema (`backend/src/db/business-health.ts`)

```typescript
import { pgTable, text, timestamp, boolean, index } from "drizzle-orm/pg-core";
import { business, branch, user } from "./schema";

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
      .references(() => branch.id, { onDelete: "cascade" }), // NULL represents consolidated multi-branch business totals
    
    // Period Identifiers
    periodType: text("period_type").notNull(),     // 'monthly' | 'yearly'
    periodYear: text("period_year").notNull(),     // e.g. '2026'
    periodMonth: text("period_month"),             // '01' through '12' (NULL for yearly periods)
    periodLabel: text("period_label").notNull(),   // e.g. 'Oct 2026' or '2026 Full Year'
    startDate: timestamp("start_date").notNull(),  // Start timestamp of the period
    endDate: timestamp("end_date").notNull(),      // End timestamp of the period

    // Currency Flow Metrics (stored as high-precision decimals in text to prevent float inaccuracies)
    grossInflow: text("gross_inflow").notNull().default("0"),   // Total Instant Sales + Settled Customer Debts (ETB)
    grossOutflow: text("gross_outflow").notNull().default("0"), // Total Operational & Inventory Expenses (ETB)
    netProfit: text("net_profit").notNull().default("0"),       // grossInflow - grossOutflow (ETB)
    profitMarginPct: text("profit_margin_pct").notNull().default("0"), // (netProfit / grossInflow) * 100

    // Growth & Change Velocity
    growthMoMPct: text("growth_mom_pct"), // Month-over-Month % change (e.g. "+14.2" or "-3.5")
    growthYoYPct: text("growth_yoy_pct"), // Year-over-Year % change
    transactionCount: text("transaction_count").notNull().default("0"), // Total transactions in period
    avgTicketSize: text("avg_ticket_size").notNull().default("0"),       // grossInflow / transactionCount

    // Bankability & Trust Footprint (Critical for Ethiopian Loan Underwriting)
    digitalPaymentRatio: text("digital_payment_ratio").notNull().default("0"), // (Telebirr + CBE) / grossInflow * 100
    telebirrVolume: text("telebirr_volume").notNull().default("0"),             // ETB settled via Telebirr
    cbeVolume: text("cbe_volume").notNull().default("0"),                       // ETB settled via CBE / CBE Birr
    cashVolume: text("cash_volume").notNull().default("0"),                     // ETB settled via physical cash
    dubeCollectedVolume: text("dube_collected_volume").notNull().default("0"), // Credit recovered during period
    dubeIssuedVolume: text("dube_issued_volume").notNull().default("0"),       // New credit granted during period
    debtRecoveryRatePct: text("debt_recovery_rate_pct").notNull().default("0"), // dubeCollected / (dubeCollected + pending)

    // Cached Multi-Branch Breakdown (JSON string array)
    // Structure: Array<{ branchId: string, branchName: string, inflow: number, outflow: number, profit: number, sharePct: number }>
    branchMetricsJson: text("branch_metrics_json"),

    // Metadata & Audit
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
    token: text("token").primaryKey(), // Secure random URL-safe token (32 bytes hex)
    businessId: text("business_id")
      .notNull()
      .references(() => business.id, { onDelete: "cascade" }),
    createdById: text("created_by_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    
    // Metadata for the Loan / Grant Application
    purpose: text("purpose").notNull(), // 'bank_loan' | 'working_capital' | 'grant' | 'investor_audit'
    funderName: text("funder_name"),    // e.g. 'Commercial Bank of Ethiopia - Bole Branch'
    funderNote: text("funder_note"),    // Application reference number or internal memo
    
    // Access Controls
    expiresAt: timestamp("expires_at"), // Optional expiration date (e.g. 30 days)
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
```

---

## 3. Mobile SQLite Schema (`mobile/src/db/schema.ts`)

To provide 100% offline access when merchants visit bank branches or rural locations without reliable cellular connections, SQLite mirrors the aggregated snapshot model:

```sql
CREATE TABLE IF NOT EXISTS local_financial_snapshot (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  branch_id TEXT,
  period_type TEXT NOT NULL,
  period_year TEXT NOT NULL,
  period_month TEXT,
  period_label TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  gross_inflow REAL NOT NULL DEFAULT 0,
  gross_outflow REAL NOT NULL DEFAULT 0,
  net_profit REAL NOT NULL DEFAULT 0,
  profit_margin_pct REAL NOT NULL DEFAULT 0,
  growth_mom_pct REAL,
  growth_yoy_pct REAL,
  transaction_count INTEGER NOT NULL DEFAULT 0,
  avg_ticket_size REAL NOT NULL DEFAULT 0,
  digital_payment_ratio REAL NOT NULL DEFAULT 0,
  telebirr_volume REAL NOT NULL DEFAULT 0,
  cbe_volume REAL NOT NULL DEFAULT 0,
  cash_volume REAL NOT NULL DEFAULT 0,
  dube_collected_volume REAL NOT NULL DEFAULT 0,
  dube_issued_volume REAL NOT NULL DEFAULT 0,
  debt_recovery_rate_pct REAL NOT NULL DEFAULT 0,
  branch_metrics_json TEXT,
  is_finalized INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_local_snapshot_biz_period 
ON local_financial_snapshot(business_id, period_type, period_year, period_month);

CREATE INDEX IF NOT EXISTS idx_local_snapshot_branch 
ON local_financial_snapshot(business_id, branch_id);
```

---

## 4. Mathematical Aggregation Formulas

The engine applies strict, deterministic financial rules:

### 1. Gross Currency Inflow
$$\text{Gross Inflow} = \sum \text{Instant Sales} + \sum \text{Settled Dube Payments}$$

### 2. Gross Currency Outflow
$$\text{Gross Outflow} = \sum \text{Recorded Expenses (Operations, Inventory, Wages, Utilities)}$$

### 3. Net Operational Profit & Margin
$$\text{Net Profit} = \text{Gross Inflow} - \text{Gross Outflow}$$
$$\text{Profit Margin (\%)} = \begin{cases} \left( \frac{\text{Net Profit}}{\text{Gross Inflow}} \right) \times 100 & \text{if Gross Inflow} > 0 \\ 0 & \text{if Gross Inflow} = 0 \end{cases}$$

### 4. Month-over-Month (MoM) Revenue Growth
$$\text{Growth}_{\text{MoM}} (\%) = \begin{cases} \left( \frac{\text{Inflow}_{\text{current}} - \text{Inflow}_{\text{prev\_month}}}{\text{Inflow}_{\text{prev\_month}}} \right) \times 100 & \text{if Inflow}_{\text{prev\_month}} > 0 \\ +100\% & \text{if Inflow}_{\text{prev\_month}} = 0 \text{ and Inflow}_{\text{current}} > 0 \\ 0\% & \text{otherwise} \end{cases}$$

### 5. Year-over-Year (YoY) Revenue Growth
$$\text{Growth}_{\text{YoY}} (\%) = \left( \frac{\text{Inflow}_{\text{current\_month\_this\_year}} - \text{Inflow}_{\text{same\_month\_last\_year}}}{\text{Inflow}_{\text{same\_month\_last\_year}}} \right) \times 100$$

### 6. Verifiable Digital Settlement Ratio (Bankability Score)
$$\text{Digital Ratio (\%)} = \left( \frac{\text{Volume}_{\text{Telebirr}} + \text{Volume}_{\text{CBE}}}{\text{Gross Inflow}} \right) \times 100$$
*High digital ratios (>60%) trigger positive creditworthiness indicators for loan officers.*

### 7. Branch Contribution Share
$$\text{Branch Share (\%)} = \left( \frac{\text{Gross Inflow}_{\text{branch}}}{\text{Gross Inflow}_{\text{total\_business}}} \right) \times 100$$

---

## 5. Data Flow & Lifecycle Matrix

| Event | Invalidation / Trigger Action | Resulting State |
| :--- | :--- | :--- |
| **New Sale or Expense Recorded** | Offline Sync Engine pushes transaction | Recomputes in-flight snapshot for the current month. |
| **Month Boundary Passes (e.g. Oct 31 -> Nov 1)** | Aggregation cron / first sync of new month | Locks `isFinalized = true` on previous month; creates new open snapshot. |
| **Merchant requests Loan Dossier** | Generates entry in `financial_share_token` | Produces secure cryptographic URL for bank viewing. |
| **Funder accesses URL** | Reads `business_financial_snapshot` via token | Returns audited multi-month JSON/HTML in < 50ms. |
