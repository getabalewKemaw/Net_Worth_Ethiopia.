# Business Health — UI & UX Design Blueprint

This document details the interface layout, color tokens, interactive controls, visual charts, and user experience flows for the **Business Health & Loan Readiness** screen.

---

## 1. Visual Hierarchy & Design System

The design adheres strictly to NetWorth Ethiopia’s established visual guidelines:
- **Primary Brand Color**: **Ethiopian Forest Emerald** (`#064E3B` / `#065F46`) — represents solvency, healthy cash flow, and financial strength.
- **Outflow & Expense Accent**: **Warm Amber** (`#D97706` / `#B45309`) — represents costs, cash outflows, and customer credit (*Dube*).
- **Digital Infrastructure Accent**: **Sky Blue** (`#0284C7`) — represents verifiable Telebirr and CBE mobile money transactions.
- **Neutrals**: Crisp white `#FFFFFF`, Slate backgrounds `#F8FAFC`, and deep charcoal `#0F172A` for high-contrast legible financial figures.
- **Navigation Rule**: Accessible strictly via the **Hamburger Drawer** under *Financial Intelligence* (`route: '/health'`). **Zero bottom tab bar pollution**.

---

## 2. Screen Layout Anatomy (`mobile/src/app/health.tsx`)

```
┌─────────────────────────────────────────────────────────────┐
│ ← Back      Addis Premium Store ▾        [ 🏦 Share Dossier]│ <-- Top Navigation Header
├─────────────────────────────────────────────────────────────┤
│   [ 1M ]   [ 3M (Qtr) ]   [ 6M ]   [ YTD ]   [ 1Y ]   [ All]│ <-- Timeframe Filter Bar
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ● FINANCIAL PULSE                 Score: 88/100 · Strong│ │
│ │ Net Generated Cash (Inflow - Outflow)                   │ │
│ │ 119,300.00 ETB                                          │ │
│ │ ┌───────────────────────────┬─────────────────────────┐ │ │
│ │ │ Gross Inflow: 284.5k ETB  │ Gross Outflow: 165.2k   │ │ │ <-- Hero Executive Card
│ │ │ Inflow MoM: +15.3% ↑      │ Net Margin: 41.9%       │ │ │
│ │ └───────────────────────────┴─────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ MONTHLY CURRENCY FLOW COMPARISON                        │ │
│ │  ■ Gross Inflows (Green)    ■ Outflows (Orange)         │ │
│ │                                                         │ │
│ │   [█][░]    [█][░]    [█][░]    [█][░]    [█][░]        │ │ <-- Inflow vs Outflow Dual Bar Chart
│ │    May       Jun       Jul       Aug       Sep          │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ OPERATING BRANCHES PROFITABILITY AUDIT (2 Branches)     │ │
│ │                                                         │ │
│ │ 1. Piassa Main Store                    Share: 63%      │ │
│ │    Revenue: 180,000 ETB  ·  Profit: 85,000 ETB (47%)    │ │ <-- Branch Breakdown Cards
│ │                                                         │ │
│ │ 2. Bole Outlet                          Share: 37%      │ │
│ │    Revenue: 104,500 ETB  ·  Profit: 34,300 ETB (33%)    │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ BANKABILITY & TRUST FOOTPRINT (For Loan Officers)       │ │
│ │                                                         │ │
│ │  [ 74.8% ]  Verifiable Digital Trail (Telebirr & CBE)   │ │ <-- Bank Trust Footprint Dial
│ │  [ 92.4% ]  Customer Credit (Dube) Recovery Rate        │ │
│ │                                                         │ │
│ │  [ 📋 Generate Bank-Certified Dossier Link / QR ]       │ │ <-- Primary Share Action
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Interactive Components Detail

### A. Timeframe Filter Pill Bar
A smooth, horizontally scrollable pill selector at the top of the screen:
- **`1M` (This Month)**: Focuses on current month's pacing and daily velocity.
- **`3M (Quarter)`**: Evaluates quarterly cash sustainability.
- **`6M`**: Standard credit review window for commercial banks.
- **`YTD` (Year-to-Date)**: Tracks progress from January to current date.
- **`1 Year`**: Complete rolling 12-month bank audit statement.
- **`All Time`**: Multi-year cumulative business expansion view.

### B. Dual-Bar Inflow vs Outflow Chart (`InflowOutflowBarChart`)
- For each month in the selected window, renders two adjacent rounded bars:
  - **Left Bar (Emerald `#065F46`)**: Gross Inflow (Sales + Collected Debts).
  - **Right Bar (Amber `#D97706`)**: Gross Outflow (All Expenses).
- Hover/touch on any month displays an overlay tooltip showing:
  - Exact Net Profit in ETB.
  - Net Margin percentage.

### C. Profit Velocity Trend Curve (`ProfitVelocityTrendChart`)
- A continuous smoothed path showing net profit trajectory over time.
- Emphasizes upward or downward trends with green/red directional indicators.
- Callout badges for historical peaks and milestone records.

### D. Multi-Branch Financial Audit Table
Displays every branch registered under the business with four vital indicators:
1. **Branch Revenue Volume (ETB)**.
2. **Branch Operational Overhead (ETB)**.
3. **Net Profit & Profit Margin (%)**.
4. **Volume Contribution Share (%)**: Proportional bar visualizing how much this location supports the company.

### E. Bankability & Loan Readiness Scorecard
Specifically designed for presentation to loan committees at banks:
1. **Verifiable Digital Ratio Dial**:
   - Compares digital mobile money payments (Telebirr + CBE Birr) against cash at counter.
   - Highlights that digital payments have unalterable bank SMS transaction logs.
2. **Credit (Dube) Health Indicator**:
   - Total uncollected Dube vs. Monthly Revenue.
   - Debt Recovery Rate (percentage recovered on schedule).
3. **Consecutive Profitable Months Counter**:
   - e.g., *"11 consecutive profitable months recorded."*

---

## 4. Loan Dossier Sharing Flow (Modal UX)

```
[Tap: "Generate Bank-Certified Dossier"]
               │
               ▼
┌────────────────────────────────────────────────────────┐
│  Share Financial Dossier with Funder                   │
├────────────────────────────────────────────────────────┤
│  Funder / Bank Name:                                   │
│  [ Commercial Bank of Ethiopia (CBE) ▾ ]               │
│                                                        │
│  Application Purpose:                                  │
│  (●) Working Capital Loan   ( ) Grant Funding          │
│                                                        │
│  Link Validity:                                        │
│  [ 30 Days (Recommended) ▾ ]                           │
│                                                        │
│  [ Create Secure Verification Link ]                   │
└──────────────────────┬─────────────────────────────────┘
                       │
                       ▼
┌────────────────────────────────────────────────────────┐
│  ✓ Verified Link Ready!                                │
│  https://networth.et/verify-health/7f8b91a2...         │
│                                                        │
│  [ ⎘ Copy Link ]       [ 📤 Share to WhatsApp/Telegram]│
│                                                        │
│  [ 🔳 Show QR Code for Loan Officer Scanner ]          │
└────────────────────────────────────────────────────────┘
```

1. **Merchant Initiates**: Taps **"Share with Bank / Funding Agency"**.
2. **Selects Recipient**: Chooses the target institution (CBE, Awash, Dashen, NGO Grant).
3. **Generates Encrypted URL**: Backend creates a unique, cryptographically random share token with optional 30-day expiry.
4. **Instant Presentation**:
   - Merchant can copy the link, send it via WhatsApp/Telegram to their loan officer, or present the on-screen QR code for the banker to scan directly at their desk.
   - When opened, the loan officer views a clean, audited web dossier formatted specifically for commercial credit review.
