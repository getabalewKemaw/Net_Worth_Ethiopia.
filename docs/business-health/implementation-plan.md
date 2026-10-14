# Business Health & Loan Readiness — Step-by-Step Implementation Plan

This document details the phase-by-phase execution plan for the **Business Health & Loan Readiness** feature in **NetWorth Ethiopia**.

### Related Documentation Suite
- 📖 [**README.md**](file:///home/eaglex/Documents/insa-ctc/FinalProject/docs/business-health/README.md) — Executive summary, Ethiopian MSME credit problem, and core value proposition.
- 🗄️ [**schema-and-data-model.md**](file:///home/eaglex/Documents/insa-ctc/FinalProject/docs/business-health/schema-and-data-model.md) — PostgreSQL Drizzle, SQLite schemas, mathematical formulas, and indexing.
- 🌐 [**architecture-and-api.md**](file:///home/eaglex/Documents/insa-ctc/FinalProject/docs/business-health/architecture-and-api.md) — System data flow, aggregation pipeline, API endpoints, and funder verification security.
- 🎨 [**ui-and-ux-design.md**](file:///home/eaglex/Documents/insa-ctc/FinalProject/docs/business-health/ui-and-ux-design.md) — Screen anatomy, dual-bar inflow/outflow charts, growth trend curves, and sharing flows.

---

## 1. System Architecture & High-Level Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                        RAW TRANSACTION DATA                            │
│  • Sales (Instant + Settled Dube)   • Expenses (All categories)        │
│  • Debts (Bidr pending/settled)     • Bank Inflows (Telebirr/CBE SMS)  │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│               HISTORICAL FINANCIAL AGGREGATION ENGINE                   │
│  1. Pre-aggregates monthly/yearly totals (0ms query latency)            │
│  2. Computes MoM / YoY growth percentages & margins                    │
│  3. Compiles multi-branch performance & share contribution             │
│  4. Evaluates bankability metrics (Digital footprint, Debt recovery)   │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
                    ▼                                ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│       BACKEND POSTGRESQL DB          │  │     MOBILE SQLITE REPO       │
│  • business_financial_snapshot       │  │  • local_financial_snapshot  │
│  • financial_share_token             │  │  (Full offline availability) │
└───────────────────┬──────────────────┘  └──────────────┬───────────────┘
                    │                                    │
                    ▼                                    ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│     READ-ONLY FUNDING WEB API        │  │     MOBILE APP HEALTH UI     │
│  • GET /api/health/verify/:token     │  │  • Currency flow breakdown   │
│  • For Bank Officers & Funders       │  │  • Interactive MoM/YoY graphs│
│  • Cryptographic audit verification  │  │  • Branch comparison cards   │
└──────────────────────────────────────┘  └──────────────────────────────┘
```

---

## 2. Phase Breakdown Matrix

| Phase | Title | Primary Deliverables | Target Files | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Phase 1** | **Database Schema & Migrations** | Dedicated `business_financial_snapshot` & `financial_share_token` tables in Drizzle and local SQLite schema. | `backend/src/db/business-health.ts`<br>`backend/src/db/schema.ts`<br>`mobile/src/db/schema.ts`<br>`mobile/src/db/migrations.ts` | **Completed** |
| **Phase 2** | **Backend Aggregation Engine & API** | Monthly/Yearly historical computation service, snapshot query endpoints, and share token generator. | `backend/src/service/business-health.service.ts`<br>`backend/src/repositories/business-health.repository.ts`<br>`backend/src/controllers/business-health.controller.ts`<br>`backend/src/routes/business-health.routes.ts` | **Completed** |
| **Phase 3** | **Mobile Data Layer & Repositories** | Local SQLite snapshot repository, offline-first fallback, and Zustand `useBusinessHealthStore`. | `mobile/src/repositories/local-health.repo.ts`<br>`mobile/src/service/business-health.ts`<br>`mobile/src/store/business-health-store.ts` | **Completed** |
| **Phase 4** | **Financial Chart Components** | Interactive Dual-Bar Inflow vs Outflow Chart, MoM/YoY Profit Velocity Trend Line, and Digital Settlement Dial. | `mobile/src/components/charts/health-charts.tsx`<br>`mobile/src/types/health.ts` | **Completed** |
| **Phase 5** | **Business Health Screen Implementation** | Full UI in `mobile/src/app/health.tsx` with Time Filters (1M, 3M, 6M, 1Y, All) and Branch Selector. | `mobile/src/app/health.tsx`<br>`mobile/src/components/health/*` | **Completed** |
| **Phase 6** | **Bank & Funding Shareable Dossier** | Token generator modal, read-only public web view endpoint for funding organizations, and QR/URL sharing. | `backend/src/controllers/business-health.controller.ts`<br>`mobile/src/components/health/share-dossier-modal.tsx` | **Completed** |
| **Phase 7** | **Verification & Unit Tests** | Metric formula unit tests (MoM, YoY, Margins, Digital Ratio), SQLite migration test, and regression verification. | `mobile/src/tests/business-health.test.ts`<br>`backend/src/tests/business-health.test.ts` | **Completed** |

---

## 3. Detailed Phase Specifications

### Phase 1: Database Schema & Migrations

#### Objectives
Design and apply dedicated historical snapshot and share-token tables in both PostgreSQL (backend) and SQLite (mobile), avoiding performance hits on transactional tables (`sale`, `expense`).

#### 1. Backend PostgreSQL Drizzle Schema (`backend/src/db/business-health.ts`)
```typescript
export const businessFinancialSnapshot = pgTable(
  "business_financial_snapshot",
  {
    id: text("id").primaryKey(), // UUID
    businessId: text("business_id")
      .notNull()
      .references(() => business.id, { onDelete: "cascade" }),
    branchId: text("branch_id")
      .references(() => branch.id, { onDelete: "cascade" }), // NULL = consolidated business total
    periodType: text("period_type").notNull(), // 'monthly' | 'yearly'
    periodYear: text("period_year").notNull(), // e.g. '2026'
    periodMonth: text("period_month"),         // '01' to '12' (NULL for yearly)
    periodLabel: text("period_label").notNull(), // e.g. 'Oct 2026' or '2026'
    
    // Currency Flow Metrics (ETB)
    grossInflow: text("gross_inflow").notNull().default("0"),   // Total Sales + Collected Dube
    grossOutflow: text("gross_outflow").notNull().default("0"), // Total Expenses
    netProfit: text("net_profit").notNull().default("0"),       // grossInflow - grossOutflow
    profitMarginPct: text("profit_margin_pct").notNull().default("0"), // (netProfit / grossInflow) * 100
    
    // Growth Velocity Metrics
    growthMoMPct: text("growth_mom_pct"), // Month-over-Month % change
    growthYoYPct: text("growth_yoy_pct"), // Year-over-Year % change
    transactionCount: text("transaction_count").notNull().default("0"),
    averageTicketSize: text("avg_ticket_size").notNull().default("0"),

    // Bankability & Trust Footprint
    digitalPaymentRatio: text("digital_payment_ratio").notNull().default("0"), // Telebirr + CBE % share
    telebirrVolume: text("telebirr_volume").notNull().default("0"),
    cbeVolume: text("cbe_volume").notNull().default("0"),
    cashVolume: text("cash_volume").notNull().default("0"),
    dubeCollectedVolume: text("dube_collected_volume").notNull().default("0"),
    dubeOutstandingVolume: text("dube_outstanding_volume").notNull().default("0"),
    debtRecoveryRatePct: text("debt_recovery_rate_pct").notNull().default("0"),

    // Branch Breakdown JSON Cache
    branchMetricsJson: text("branch_metrics_json"), // JSON string of [{branchId, name, inflow, outflow, profit, share}]

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("snapshot_biz_period_idx").on(table.businessId, table.periodType, table.periodYear),
    index("snapshot_biz_branch_idx").on(table.businessId, table.branchId),
  ]
);

export const financialShareToken = pgTable(
  "financial_share_token",
  {
    token: text("token").primaryKey(), // Cryptographically secure random token (e.g. 32 bytes hex)
    businessId: text("business_id")
      .notNull()
      .references(() => business.id, { onDelete: "cascade" }),
    createdById: text("created_by_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    purpose: text("purpose").notNull(), // 'loan_application' | 'grant' | 'investor_review'
    funderName: text("funder_name"),    // e.g. 'Commercial Bank of Ethiopia', 'Telebirr Sanduq'
    expiresAt: timestamp("expires_at"), // Optional expiry
    isActive: boolean("is_active").default(true).notNull(),
    accessCount: text("access_count").default("0").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("share_token_biz_idx").on(table.businessId),
  ]
);
```

#### 2. Mobile SQLite Schema (`mobile/src/db/schema.ts`)
Mirrors the aggregated fields in `local_financial_snapshot` for instant offline render and 0ms query speed without blocking on slow network connections.

---

### Phase 2: Backend Aggregation Engine & API

#### Objectives
Implement the logic that computes monthly and yearly snapshots, handles on-demand rebuilds, and serves endpoints for mobile and third-party funder verification.

#### API Endpoints
1. `GET /api/health/snapshots?businessId=...&branchId=...&periodType=monthly&limit=12`
   - Returns chronological snapshots for trend charts.
2. `POST /api/health/snapshots/recompute`
   - Recalculates current and previous month snapshots from live `sale`, `expense`, and `sync_idempotency` records.
3. `POST /api/health/share-token`
   - Generates a shareable token for banks/funding orgs.
4. `GET /api/health/verify/:token` (Public / Read-Only)
   - Read-only financial dossier rendered for loan officers without requiring merchant app login.

---

### Phase 3: Mobile Data Layer & State Management

#### Objectives
Ensure the mobile app can view all Business Health metrics completely offline, synchronizing snapshots whenever online.

#### Key Modules
- **`mobile/src/repositories/local-health.repo.ts`**:
  - `saveSnapshotsAtomic(snapshots: FinancialSnapshot[])`
  - `getSnapshots(businessId: string, branchId?: string, periodType?: 'monthly' | 'yearly')`
  - `computeLiveCurrentMonth(businessId, branchId)`: Calculates in-flight metrics for the current calendar month directly from SQLite `local_sale` and `local_expense`.
- **`mobile/src/store/business-health-store.ts`**:
  - Zustand store managing:
    - `selectedTimeRange`: `'1M' | '3M' | '6M' | 'YTD' | '1Y' | 'ALL'`
    - `selectedBranchId`: `string | null` (null = All branches)
    - `snapshots`: List of historical periods
    - `currentPeriodMetrics`: Aggregated active view
    - `isLoading`: boolean
    - `refresh(businessId, branchId)`

---

### Phase 4: Dynamic Financial Charts & Visualizations

#### Objectives
Design reusable, high-performance SVG/React Native charts adhering to the Ethiopian Forest Emerald (`#064E3B`), Warm Amber (`#D97706`), and Sky Blue (`#0284C7`) palette.

#### Components (`mobile/src/components/charts/health-charts.tsx`)
1. **Dual Inflow vs Outflow Bar Chart (`InflowOutflowBarChart`)**:
   - Compares gross inflow (Green) and gross outflow (Orange) month-by-month.
   - Shows net margin delta above each monthly pair.
2. **Growth Trajectory Line Chart (`ProfitVelocityTrendChart`)**:
   - Visualizes net profit movement across months with interactive point badges.
   - Percentage change callout (e.g. `+18.4% MoM`).
3. **Digital Trail Integrity Gauge (`DigitalFootprintDial`)**:
   - Circular or segmented gauge showing verifiable digital inflows (Telebirr + CBE Birr) vs cash.
   - Highlights bankability trust score: **"84% Verifiable Digital Footprint"**.

---

### Phase 5: Complete Business Health UI Screen

#### Objectives
Transform `mobile/src/app/health.tsx` into a world-class financial intelligence dashboard.

#### UI Sections Layout:
1. **Header & Navigation**:
   - Back button (`← Back`), title "Business Health & Bankability", and branch selector dropdown.
2. **Interactive Timeframe Bar**:
   - Pills: `[ 1M ]  [ 3M (Quarter) ]  [ 6M ]  [ YTD ]  [ 1 Year ]  [ All ]`
3. **Executive Currency Flow Card (Hero)**:
   - Total Gross Inflow, Total Gross Outflow, Net Generated Cash.
   - Net Profit Margin (%) with status tag (`Healthy Margin`, `Break-Even Alert`).
4. **Historical Growth Velocity (MoM / YoY)**:
   - Growth indicators with positive/negative pill badges.
   - `InflowOutflowBarChart` and `ProfitVelocityTrendChart`.
5. **Operating Branches Breakdown Table**:
   - Per-branch table listing: Branch Name, Revenue, Expenses, Net Profit, Contribution Share %.
6. **Bankability & Loan Readiness Card**:
   - Digital settlement ratio (Telebirr, CBE, Cash).
   - Customer credit (Dube) recovery rate %.
   - **"Share with Bank / Funding Agency"** action button.

---

### Phase 6: Shareable Funding Link & Verification Endpoint

#### Objectives
Allow merchants to generate a secure, read-only link or QR code to present to loan officers at commercial banks or funding organizations.

#### Implementation:
- Modal in mobile app:
  - Input: Funding Organization / Bank Name (e.g. "CBE SME Loan Department").
  - Purpose: Loan Application, Working Capital Line, Grant.
  - Option: 30-day expiry.
  - Generates URL: `https://networth.et/verify-health/[token]`
- Web API:
  - Validates `token` from `financial_share_token`.
  - Increments `accessCount`.
  - Returns sanitized snapshot audit JSON (excludes sensitive individual customer phone numbers, focuses strictly on aggregates and audited monthly volumes).

---

### Phase 7: Verification, Automated Testing & Documentation

#### Test Suites:
1. **Financial Formula Tests (`mobile/src/tests/business-health.test.ts`)**:
   - Net margin calculation edge cases (zero revenue, higher expenses than revenue).
   - MoM and YoY percentage change formulas.
   - Branch contribution share calculation (sums to exactly 100%).
   - Digital payment ratio calculation.
2. **Offline-First SQLite Cache Tests**:
   - Ensures local snapshots persist and load without network access.
3. **Backend API Tests**:
   - Snapshot recompute idempotency.
   - Token creation and expiration validation.
4. **Documentation**:
   - Final walkthrough guide in `docs/business-health/README.md`.

---

## 4. Execution Sequence

```
Phase 1: DB Schemas (PostgreSQL & SQLite)
  └── Phase 2: Backend Aggregation Engine & Endpoints
        └── Phase 3: Mobile Repository & Zustand Store
              └── Phase 4: Financial Charts (Inflow/Outflow & Growth)
                    └── Phase 5: Mobile Screen UI (health.tsx)
                          └── Phase 6: Shareable Token & Web Verification
                                └── Phase 7: Full Verification & Unit Testing
```
