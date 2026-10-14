# Business Health — System Architecture & API Specifications

This document describes the end-to-end technical architecture, data pipeline, and API endpoints connecting **NetWorth Mobile**, the **Express / PostgreSQL Backend**, and the **Third-Party Funder Verification Portal**.

---

## 1. High-Level Architecture Diagram

```
                                  MOBILE CLIENT (Expo / React Native)
                     ┌────────────────────────────────────────────────────────┐
                     │  • UI: mobile/src/app/health.tsx                       │
                     │  • State: useBusinessHealthStore (Zustand)             │
                     │  • Charts: Dual-Bar Inflows, Profit Curves, Gauges     │
                     └───────────────┬────────────────────────┬───────────────┘
                                     │                        │
                        Offline Read │                        │ Online Sync
                                     ▼                        ▼
                     ┌───────────────────────┐        ┌───────────────────────┐
                     │     LOCAL SQLITE      │        │  EXPRESS BACKEND API  │
                     │  local_financial_     │        │  /api/health/*        │
                     │  snapshot             │        └───────────┬───────────┘
                     └───────────────────────┘                    │
                                                                  ▼
                                                      ┌───────────────────────┐
                                                      │  POSTGRESQL DATABASE  │
                                                      │  • business_financial_│
                                                      │    snapshot           │
                                                      │  • financial_share_   │
                                                      │    token              │
                                                      └───────────┬───────────┘
                                                                  │
                                                                  ▼
                                                      ┌───────────────────────┐
                                                      │ THIRD-PARTY FUNDER UI │
                                                      │ /api/health/verify/   │
                                                      │ :token                │
                                                      │ (Banks, Microfinance) │
                                                      └───────────────────────┘
```

---

## 2. Aggregation Pipeline

```
[Raw Transactions: Sales, Expenses, Debts]
                    │
                    ▼
     [Aggregation Service: computePeriodSnapshot]
                    │
      ┌─────────────┴─────────────┐
      ▼                           ▼
[Closed Historical Months]  [Current Active Month]
  - Flagged isFinalized=true  - Dynamic update
  - Cached permanently       - Recalculates on sync
```

1. **Trigger Points**:
   - **Sync Push**: When the mobile app pushes a batch of offline sales/expenses via `/api/sync/push`, the backend triggers an asynchronous update to the current month's snapshot.
   - **First Launch of New Month**: When a transaction is recorded in a new calendar month (e.g., Nov 1), the previous month's snapshot (October) is marked `isFinalized = true` and locked.
   - **Manual Refresh**: Pull-to-refresh on `mobile/src/app/health.tsx` calls `/api/health/snapshots/recompute` for instant synchronization.

---

## 3. Backend API Endpoints

### 1. `GET /api/health/snapshots`
Retrieves chronological financial snapshots for the requested business and branch.

* **Headers**: `Authorization: Bearer <session_cookie>`
* **Query Parameters**:
  - `businessId` (required, string): Target business UUID.
  - `branchId` (optional, string): Filter by branch. Omit for consolidated business view.
  - `periodType` (optional, string): `'monthly'` | `'yearly'`. Defaults to `'monthly'`.
  - `limit` (optional, number): Number of periods to return (default: `12`).

* **Response (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "snapshots": [
      {
        "id": "snp-9812",
        "businessId": "biz-123",
        "branchId": null,
        "periodType": "monthly",
        "periodYear": "2026",
        "periodMonth": "09",
        "periodLabel": "Sep 2026",
        "startDate": "2026-09-01T00:00:00.000Z",
        "endDate": "2026-09-30T23:59:59.999Z",
        "grossInflow": 284500.00,
        "grossOutflow": 165200.00,
        "netProfit": 119300.00,
        "profitMarginPct": 41.9,
        "growthMoMPct": 15.3,
        "growthYoYPct": 28.4,
        "transactionCount": 420,
        "avgTicketSize": 677.38,
        "digitalPaymentRatio": 72.5,
        "telebirrVolume": 145000.00,
        "cbeVolume": 61250.00,
        "cashVolume": 78250.00,
        "debtRecoveryRatePct": 91.2,
        "branchMetrics": [
          { "branchId": "br-1", "branchName": "Piassa Main", "inflow": 180000, "outflow": 95000, "profit": 85000, "sharePct": 63 },
          { "branchId": "br-2", "branchName": "Bole Outlet", "inflow": 104500, "outflow": 70200, "profit": 34300, "sharePct": 37 }
        ],
        "isFinalized": true
      }
    ],
    "summary": {
      "totalInflow": 284500.00,
      "totalOutflow": 165200.00,
      "netProfit": 119300.00,
      "avgProfitMarginPct": 41.9,
      "averageDigitalRatio": 72.5
    }
  }
}
```

---

### 2. `POST /api/health/snapshots/recompute`
Forces an immediate recalculation of the current active period from primary transaction tables.

* **Headers**: `Authorization: Bearer <session_cookie>`
* **Body**:
```json
{
  "businessId": "biz-123",
  "branchId": "br-1"
}
```
* **Response (200 OK)**:
```json
{
  "status": "success",
  "message": "Snapshot recomputed successfully",
  "data": { "periodLabel": "Oct 2026", "grossInflow": 142000.00, "netProfit": 68000.00 }
}
```

---

### 3. `POST /api/health/share-token`
Generates a cryptographic read-only sharing token for banks and loan officers.

* **Headers**: `Authorization: Bearer <session_cookie>`
* **Body**:
```json
{
  "businessId": "biz-123",
  "purpose": "bank_loan",
  "funderName": "Commercial Bank of Ethiopia (CBE)",
  "funderNote": "Loan application ref: CBE-SME-2026-881",
  "validityDays": 30
}
```
* **Response (201 Created)**:
```json
{
  "status": "success",
  "data": {
    "token": "7f8b91a2e4c34d588a09f87c1234567890abcdef1234567890abcdef12345678",
    "shareUrl": "https://networth.et/verify-health/7f8b91a2e4c34d588a09f87c1234567890abcdef1234567890abcdef12345678",
    "funderName": "Commercial Bank of Ethiopia (CBE)",
    "expiresAt": "2026-11-13T09:30:00.000Z"
  }
}
```

---

### 4. `GET /api/health/verify/:token` (Public / Read-Only Funder Endpoint)
Accessible without login by credit officers at banks and funding organizations to verify business legitimacy.

* **Security Controls**:
  - Validates `token` in `financial_share_token`.
  - Rejects if `isActive === false` or `expiresAt < NOW()`.
  - Increments `accessCount` and updates `lastAccessedAt`.
  - Rate-limited (maximum 60 requests/minute per IP).
  - Sanitized: **Zero customer personal phone numbers or names exposed**; presents only certified multi-period aggregates, branch distributions, and digital payment ratios.

* **Response (200 OK)**:
```json
{
  "status": "verified",
  "funder": "Commercial Bank of Ethiopia (CBE)",
  "business": {
    "name": "Addis Premium Coffee & Spices",
    "sector": "Retail & Wholesale",
    "city": "Addis Ababa, Ethiopia",
    "activeBranches": 2,
    "operatingSince": "2024-03-15"
  },
  "verifiedMetrics": {
    "last12MonthsRevenue": 3410500.00,
    "last12MonthsExpense": 1980000.00,
    "last12MonthsNetProfit": 1430500.00,
    "avgMonthlyNetProfit": 119208.33,
    "verifiableDigitalRatio": "74.8% (Telebirr & CBE)",
    "debtRecoveryRate": "92.4%",
    "consecutiveProfitableMonths": 11
  },
  "monthlyPerformance": [ /* Past 12 snapshots */ ]
}
```

---

## 4. Mobile Service & State Architecture

### Service Interface (`mobile/src/service/business-health.ts`)
```typescript
export interface FetchHealthParams {
  businessId: string;
  branchId?: string;
  periodType?: 'monthly' | 'yearly';
  limit?: number;
}

export async function getBusinessHealthMetrics(params: FetchHealthParams): Promise<HealthMetricsResult>;
export async function createShareToken(payload: CreateTokenPayload): Promise<ShareTokenResult>;
```

### Store State (`mobile/src/store/business-health-store.ts`)
```typescript
interface BusinessHealthState {
  // Filters
  selectedTimeRange: '1M' | '3M' | '6M' | 'YTD' | '1Y' | 'ALL';
  selectedBranchId: string | null;

  // Data
  snapshots: FinancialSnapshot[];
  activePeriod: FinancialSnapshot | null;
  summary: FinancialSummary | null;
  
  // Status
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;

  // Actions
  setTimeRange: (range: '1M' | '3M' | '6M' | 'YTD' | '1Y' | 'ALL') => void;
  setBranchId: (branchId: string | null) => void;
  loadHealthData: (businessId: string) => Promise<void>;
  refresh: (businessId: string) => Promise<void>;
}
```
