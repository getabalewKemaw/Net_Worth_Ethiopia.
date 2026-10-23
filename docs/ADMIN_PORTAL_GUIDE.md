# NetWorth Ethiopia — Admin Portal & Platform Telemetry Architecture

This document provides a comprehensive operational and technical guide to the **NetWorth Ethiopia Central Admin Portal**, the authentication mechanics, platform telemetry metrics, underlying database models, and the end-to-end loan dossier verification workflow.

---

## 1. System Architecture & Portal Separation

NetWorth Ethiopia is architected around two distinct web access tiers and a mobile merchant client:

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                NETWORTH ETHIOPIA ECOSYSTEM                              │
├──────────────────────────┬───────────────────────────────┬──────────────────────────────┤
│ 1. Mobile Client         │ 2. Central Admin Portal       │ 3. Public Loan Dossier       │
│ (Expo SDK 57 / Android)  │ (Next.js 16 / Port 3001)      │ (Next.js 16 / Port 3001)     │
├──────────────────────────┼───────────────────────────────┼──────────────────────────────┤
│ • Daily Sales Recording  │ • Platform Health Telemetry   │ • Read-Only Bank Dossier     │
│ • Expense & Dube Ledger  │ • Registered Business Owners  │ • Anonymous URL Token Access │
│ • SMS Payment Sync       │ • Branch Ecosystem Audit      │ • Credit Readiness Scoring   │
│ • Token Generation       │ • System Scoring Rules        │ • CBE / Awash Underwriting   │
│ Target: localhost:3000   │ Target: localhost:3001/admin  │ Target: localhost:3001/dossier│
└──────────────────────────┴───────────────────────────────┴──────────────────────────────┘
                                          │
                                          ▼
                      ┌───────────────────────────────────────┐
                      │    Express Backend API (Port 3000)    │
                      │ • Better Auth & Admin Security        │
                      │ • Dynamic Ledger Aggregation Engine   │
                      │ • PostgreSQL (Drizzle ORM)            │
                      └───────────────────────────────────────┘
```

### Port Allocation & Proxy Architecture
- **Backend API (`backend/`)**: Runs on `http://localhost:3000`. This port is reserved for the Express API because physical Android devices communicate via USB over `adb reverse tcp:3000 tcp:3000`.
- **Web Portal (`web/`)**: Runs on `http://localhost:3001` (`npm run dev -p 3001`). Next.js transparently rewrites `/api/:path*` to `http://localhost:3000/api/:path*` via `next.config.ts`, ensuring zero CORS issues during browser operations.

---

## 2. Superadmin Authentication Guide

The Admin Console is strictly reserved for platform administrators. Commercial banks and microfinance institutions (MFOs) do **not** have login accounts; they review merchant applications anonymously via tokenized dossiers.

### Admin Credentials
| Parameter | Default Value | Environment Variable Override |
|---|---|---|
| **Email** | `admin1g@gmail.com` | `ADMIN_EMAIL` in `backend/.env` |
| **Password** | `admin1234` | `ADMIN_PASSWORD` in `backend/.env` |
| **Console URL** | `http://localhost:3001/admin` | `WEB_URL` in `backend/.env` |

### How to Seed the Superadmin Account
The database contains a dedicated seeding script that verifies and creates the Superadmin record while strictly enforcing the **Zero Mock Data Policy** (no fake merchants or synthetic snapshots are inserted):

```bash
cd backend
npm run db:seed
```

This ensures the user with ID `usr_admin_1g` exists in the PostgreSQL `user` table with `emailVerified = true`.

### Authentication Flow Step-by-Step
1. Navigate to `http://localhost:3001/admin` in your web browser.
2. If unauthenticated, the portal displays the secure **Superadmin Authentication Console**.
3. Enter `admin1g@gmail.com` and `admin1234`.
4. The client dispatches a `POST /api/admin/login` request.
5. `adminController.login` validates the credentials against `adminService.authenticateAdmin`.
6. Upon success, a JWT session payload is returned:
   ```json
   {
     "status": "success",
     "data": {
       "token": "admin_session_token_...",
       "user": {
         "id": "usr_admin_1g",
         "email": "admin1g@gmail.com",
         "name": "Super Administrator",
         "role": "admin"
       }
     }
   }
   ```
7. The client Zustand store (`useAdminStore`) sets `isAuthenticated: true` and automatically mounts the platform operations dashboard.

---

## 3. Platform Telemetry Data Dictionary

Every metric, card, and chart rendered in the Admin Dashboard is computed in real-time from active records in PostgreSQL. If the database contains zero transactions, the interface displays `0` or intuitive `"No data recorded"` empty states—never falling back to static mock constants.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             ADMIN OPERATIONS METRICS                             │
├─────────────────────────┬──────────────────────┬─────────────────────────────────┤
│ Metric Card / Chart     │ Source Table         │ Mathematical / Logic Formula    │
├─────────────────────────┼──────────────────────┼─────────────────────────────────┤
│ Total Merchants         │ "user"               │ COUNT(*) WHERE role != 'admin'  │
│ Operating Branches      │ "branch"             │ COUNT(*)                        │
│ Gross Platform GTV      │ "sale" / "snapshot"  │ SUM(amount) where settled       │
│ Digital Trail Ratio     │ "sale" / "snapshot"  │ (Telebirr + CBE) / Total * 100  │
│ Active Loan Dossiers    │ "financial_share_token"│ COUNT(*) WHERE is_active = true│
│ Settlement Donut        │ "sale" / "snapshot"  │ Telebirr% vs CBE Birr% vs Cash% │
│ Cash Flow Velocity Area │ "sale" / "snapshot"  │ Monthly Inflow vs Digital Trend │
│ Merchant Roster Table   │ "user" + "business"  │ Owner details + branch counts   │
└─────────────────────────┴──────────────────────┴─────────────────────────────────┘
```

### Detailed Metric Definitions

#### 1. Total Merchants
- **Definition**: The total number of unique MSME business owners registered on NetWorth Ethiopia.
- **Database Query**: `SELECT COUNT(*) FROM "user" WHERE email != 'admin1g@gmail.com'`.
- **Sub-label**: Displays the total count of active operating branches associated with these merchants.

#### 2. Gross Ecosystem GTV (ETB)
- **Definition**: Cumulative Gross Transaction Volume processed across all merchant ledgers.
- **Calculation**: Aggregated from settled transactions in `sale` (instant sales + paid customer debts) and finalized periods in `business_financial_snapshot`.
- **Formatting**:
  - Less than 1,000 ETB: Exact value (e.g. `850 ETB`).
  - 1,000 to 999,999 ETB: Rounded thousands with `k` suffix (e.g. `2.1k ETB`).
  - 1,000,000+ ETB: Millions with 1 decimal place and `M` suffix (e.g. `2.5M ETB`).
  - Zero transactions: Displays `0 ETB` with the sub-label *"No transaction volume recorded"*.

#### 3. Digital Trail Ratio (%)
- **Definition**: The proportion of business revenue verified through traceable digital channels (Telebirr and CBE Birr) versus unverified physical cash.
- **Formula**:
  $$\text{Digital Trail Ratio} = \left( \frac{\text{Telebirr Volume (ETB)} + \text{CBE Birr Volume (ETB)}}{\text{Total Settled Volume (ETB)}} \right) \times 100$$
- **Significance**: Commercial banks in Ethiopia (CBE, Awash, Dashen, Nisir) prioritize digital inflows for collateral-free credit underwriting because digital receipts cannot be backdated or falsified.
- **Zero State**: If no transactions exist, displays `0%` with the sub-label *"No digital inflows recorded"*.

#### 4. Active Loan Dossiers
- **Definition**: The number of currently valid, merchant-generated shared links actively accessible by loan underwriters.
- **Database Query**: `SELECT COUNT(*) FROM "financial_share_token" WHERE is_active = true AND (expires_at IS NULL OR expires_at > NOW())`.
- **Zero State**: Displays `0 tokens` with sub-label *"No active shared links"*.

#### 5. Settlement Method Composition (D3 Donut Chart)
- **Segments**:
  - **Telebirr** (Emerald Green `#047857`): Digital transactions processed via Ethio Telecom Telebirr.
  - **CBE Birr** (Bank Blue `#2563eb`): Commercial Bank of Ethiopia digital account transfers and CBE Birr payments.
  - **Cash** (Amber Orange `#d97706`): Traditional over-the-counter physical cash sales.
- **Behavior**:
  - Slices with 0% contribution are dynamically excluded from the chart legend so empty categories do not clutter the visualization.
  - Center label dynamically reflects the overall **Digital Trail Ratio** (e.g., `100% DIGITAL`).
  - If zero transactions exist, renders an empty-state container: *"No payment data recorded yet — Payment breakdown appears after recording sales"*.

#### 6. Gross Ecosystem Cash Flow Velocity (D3 Area Chart)
- **Definition**: Chronological monthly curve of ecosystem transaction volume and digital inflows.
- **Axis Mechanics**: Uses dynamic `d3.scalePoint` with centered padding (`0.5`) and dynamic linear height bounds (`y` scale) so single-month or low-volume periods render centered without clipping.
- **Zero State**: When empty, displays a dashed card: *"No transaction volume recorded yet — Historical ledger curve will appear when merchants record sales"*.

#### 7. Merchant Roster Table
- **Location**: Navigable at `/admin/users` or via the dashboard link.
- **Fields**:
  - **Business Owner**: Merchant's full name and registered email address.
  - **Primary Enterprise**: Name of the primary trade business registered in PostgreSQL `business`. Displays `"No business registered"` if the user has not completed onboarding.
  - **Branches**: Real count of branches registered under that business. Displays `"0 Branches"` if none are registered (never defaulting to 1).
  - **Status**: Live badge (`Active` / `Suspended`).
  - **Registered Date**: ISO date of merchant account creation.

---

## 4. End-to-End Loan Dossier Sharing Workflow

The public loan dossier system allows Ethiopian merchants to obtain credit without exposing administrative privileges to banks.

```
   [MSME Merchant Mobile App]
                │
                │ 1. Tap "Share Financial Dossier"
                │ 2. Select Purpose (e.g. Commercial Bank Loan)
                │ 3. Select Bank (e.g. Commercial Bank of Ethiopia)
                │ 4. Choose Validity (e.g. 30 Days)
                ▼
   [Express Backend API: Port 3000]
                │
                │ 5. Executes POST /api/health/share-token
                │ 6. Generates 64-character cryptographic token
                │ 7. Inserts into "financial_share_token" table
                │ 8. Constructs URL targeting Web Portal Port 3001:
                │    http://localhost:3001/dossier/<token>
                ▼
   [Underwriter / Loan Officer Browser]
                │
                │ 9. Opens http://localhost:3001/dossier/<token>
                │ 10. Next.js wraps route in <Suspense>
                │ 11. Fetches GET /api/health/dossier/<token>
                ▼
   [Sanitized Bank Readiness Audit]
                • Financial Health Score (0 - 100 Gauge)
                • Recommended Safe Loan Ceiling (ETB)
                • Digital Settlement Audit Trail (Telebirr & CBE)
                • 12-Month Inflow vs Outflow Cashflow Curve
                • Dube Credit Recovery Discipline Rate
```

### Key Technical Details
1. **URL Target Port**: The backend dynamically builds the share link using `process.env.WEB_URL` or defaults to `http://localhost:3001`. This ensures loan officers clicking shared links land on the Next.js frontend rather than the Express API.
2. **Next.js Prerendering Fix (`<Suspense>`)**: Route parameters in `app/dossier/[token]/page.tsx` are unwrapped inside a `<Suspense fallback={<DossierLoadingFallback />}>` wrapper. This eliminates Next.js blocking dynamic prerender warnings and ensures instant loading shells.
3. **Print Dossier Feature**: Per project requirements, browser print buttons have been removed from the header to preserve an uninterrupted, interactive institutional audit view.

---

## 5. Operational Troubleshooting & Checklist

### Issue 1: `UnauthorizedError: Authentication required` on Admin Endpoints
- **Cause**: Route mounting order trap. If a router with `router.use(requireAuth)` is mounted before `/api/admin`, all requests are intercepted.
- **Solution**: In `backend/src/index.ts`, ensure `app.use("/api/admin", adminRoutes)` is registered **before** any customer or branch routes.

### Issue 2: Physical Android Device Cannot Connect (`ConnectException`)
- **Cause**: Physical USB devices resolve `localhost` to the phone itself.
- **Solution**: Execute the ADB reverse proxy command:
  ```bash
  adb reverse tcp:3000 tcp:3000
  ```
  Or run `npm run android` in `mobile/`, which runs the persistent reverse monitor `mobile/scripts/run-android.js`.

### Issue 3: Mobile `wa-sqlite.wasm` Error on Web
- **Cause**: Metro bundler does not bundle `.wasm` assets by default.
- **Solution**: Verify `mobile/metro.config.js` includes `config.resolver.assetExts.push("wasm")` and restart Expo Web with cache cleared:
  ```bash
  cd mobile
  npx expo start --web -c
  ```

---

## 6. Directory Map

| Path | Purpose |
|---|---|
| [`backend/src/routes/admin.routes.ts`](file:///c:/Users/Hp/Desktop/NetworthET/Net_Worth_Ethiopia/backend/src/routes/admin.routes.ts) | Express route definitions for admin login, telemetry, and merchant roster |
| [`backend/src/controllers/admin.controller.ts`](file:///c:/Users/Hp/Desktop/NetworthET/Net_Worth_Ethiopia/backend/src/controllers/admin.controller.ts) | Request validation and response formatting for admin operations |
| [`backend/src/service/admin.service.ts`](file:///c:/Users/Hp/Desktop/NetworthET/Net_Worth_Ethiopia/backend/src/service/admin.service.ts) | Real-time PostgreSQL aggregation engine for ecosystem statistics |
| [`backend/src/repositories/admin.repository.ts`](file:///c:/Users/Hp/Desktop/NetworthET/Net_Worth_Ethiopia/backend/src/repositories/admin.repository.ts) | Direct Drizzle ORM database queries for users, branches, sales, and tokens |
| [`backend/src/db/seed.ts`](file:///c:/Users/Hp/Desktop/NetworthET/Net_Worth_Ethiopia/backend/src/db/seed.ts) | Superadmin account initialization script (enforcing zero mock data) |
| [`web/app/admin/page.tsx`](file:///c:/Users/Hp/Desktop/NetworthET/Net_Worth_Ethiopia/web/app/admin/page.tsx) | Central Admin Operations Dashboard |
| [`web/app/admin/users/page.tsx`](file:///c:/Users/Hp/Desktop/NetworthET/Net_Worth_Ethiopia/web/app/admin/users/page.tsx) | Business owner roster management |
| [`web/app/dossier/[token]/page.tsx`](file:///c:/Users/Hp/Desktop/NetworthET/Net_Worth_Ethiopia/web/app/dossier/[token]/page.tsx) | Public read-only loan underwriting dossier for commercial banks |
| [`web/store/admin-store.ts`](file:///c:/Users/Hp/Desktop/NetworthET/Net_Worth_Ethiopia/web/store/admin-store.ts) | Zustand client-side store for admin session and real-time statistics |
