# Business Health & Loan Readiness — NetWorth Ethiopia

## 1. Executive Summary

In Ethiopia, millions of micro, small, and medium enterprises (MSMEs)—from retail kiosks, mini-markets, cafes, and wholesale distributors to service providers—operate profitably on a daily basis. However, when seeking **commercial bank loans** (from CBE, Awash Bank, Dashen Bank, Enat Bank), **digital merchant working capital** (such as Telebirr Sanduq), or **grant funding from NGOs and development institutions**, they are almost universally rejected or burdened with prohibitive collateral demands.

The primary cause is the **complete absence of structured, verifiable financial bookkeeping**:
1. **Unverifiable Income**: Cash ledgers and unorganized transaction notebooks are dismissed by loan officers as unprovable or easily falsified.
2. **Hidden Working Capital Traps**: High sales volumes often mask dangerous accumulation of uncollected customer credit (*Dube*), leading to sudden insolvency.
3. **Multi-Location Blindspots**: Business owners with multiple branches or shops struggle to prove which branch is profitable and which is draining capital.
4. **No Historical Growth Metrics**: Merchants lack month-over-month (MoM) and year-over-year (YoY) percentage analytics required by credit underwriting algorithms.

The **Business Health & Loan Readiness Module** bridges this divide. It synthesizes raw sales, expenses, customer debt (*Bidr*), and bank SMS transactions into an **authoritative, real-time financial health dossier**. It tracks currency flows, multi-year growth velocity, multi-branch performance, and generates **verifiable, bank-ready proof** that can be shared with financial institutions via secure, read-only web links.

---

## 2. Core Value Pillars

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                    BUSINESS HEALTH & BANKABILITY PILLARS                     │
├───────────────────────────────┬──────────────────────────────────────────────┤
│ 1. CURRENCY FLOW ENGINE       │ • Complete Gross Inflow vs Gross Outflow     │
│                               │ • True Net Generated Cash Flow (ETB)         │
│                               │ • Operational Margin Health                  │
├───────────────────────────────┼──────────────────────────────────────────────┤
│ 2. GROWTH & VELOCITY METRICS  │ • Month-over-Month (MoM) Growth (%)          │
│                               │ • Year-over-Year (YoY) Expansion Trajectory  │
│                               │ • Transaction Count & Average Ticket Size    │
├───────────────────────────────┼──────────────────────────────────────────────┤
│ 3. BRANCH FINANCIAL AUDIT     │ • Per-branch Revenue, Costs, & Net Profit    │
│                               │ • Location Contribution Share (%)            │
│                               │ • Cross-Branch Profitability Ranking         │
├───────────────────────────────┼──────────────────────────────────────────────┤
│ 4. BANKABILITY & TRUST DIAL   │ • Digital Trail Ratio (Telebirr + CBE share) │
│                               │ • Credit (Dube) Recovery Discipline Rate     │
│                               │ • Working Capital Stability Score            │
├───────────────────────────────┼──────────────────────────────────────────────┤
│ 5. SHAREABLE LOAN DOSSIER     │ • Secure Tokenized Read-Only Web Link        │
│                               │ • Direct Access for Bank Loan Officers       │
│                               │ • Cryptographic Verification & Audit Trail   │
└───────────────────────────────┴──────────────────────────────────────────────┘
```

---

## 3. Real-World Commercial Context in Ethiopia

### A. Digital Verifiability Over Physical Cash
Commercial banks in Ethiopia are transitioning toward **cash-flow-based digital underwriting**. While merchants can manually record inflated cash figures, **transactions settled via Telebirr and CBE Birr carry immutable digital bank timestamps and reference numbers**. This module measures the merchant's **Digital Settlement Ratio**, giving banks verifiable confidence in the revenue stream.

### B. Credit Risk Discipline (Dube Exposure)
Customer credit (*Dube*) is the traditional lifeblood of Ethiopian commerce, but uncollected Dube kills businesses. This module monitors **Credit Recovery Rates** (percentage of debts paid back within 30 days) and flags credit risk before it threatens working capital.

### C. Multi-Branch Proof of Diversification
Lenders favor diversified businesses. By presenting consolidated metrics alongside individual branch contributions, merchants demonstrate that their revenue does not rely solely on one vulnerable storefront.

---

## 4. Documentation Map

To facilitate a complete and structured review, the Business Health documentation is organized into dedicated technical documents:

| Document | Purpose |
| :--- | :--- |
| [**README.md**](file:///home/eaglex/Documents/insa-ctc/FinalProject/docs/business-health/README.md) | High-level executive overview, business motivation, and Ethiopian market context (this document). |
| [**schema-and-data-model.md**](file:///home/eaglex/Documents/insa-ctc/FinalProject/docs/business-health/schema-and-data-model.md) | Complete database schema specifications, PostgreSQL Drizzle definitions, SQLite mobile tables, indexes, and aggregation formulas. |
| [**architecture-and-api.md**](file:///home/eaglex/Documents/insa-ctc/FinalProject/docs/business-health/architecture-and-api.md) | Technical system architecture, aggregation pipeline, API endpoints, and third-party bank verification protocols. |
| [**ui-and-ux-design.md**](file:///home/eaglex/Documents/insa-ctc/FinalProject/docs/business-health/ui-and-ux-design.md) | User interface layouts, interactive timeframe filters, visual charts, branch cards, and share modal flows. |
| [**implementation-plan.md**](file:///home/eaglex/Documents/insa-ctc/FinalProject/docs/business-health/implementation-plan.md) | Step-by-step phased execution matrix, task breakdown, target files, and testing strategy. |
