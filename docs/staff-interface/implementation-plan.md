# Sales Staff Interface — Step-by-Step Implementation Plan

This document details the phase-by-phase execution plan for the **Sales Staff Interface & Branch Assignment** engine in **NetWorth Ethiopia**.

---

## 1. Phase Breakdown Matrix

| Phase | Title | Primary Deliverables | Target Files |
| :--- | :--- | :--- | :--- |
| **Phase 1** | **Database Schema & Migrations** <br>*(Completed)* | Dedicated `staff_assignment` table in PostgreSQL & local SQLite, plus attribution columns on `sale` & `expense`. | `backend/src/db/staff-management.ts`<br>`backend/src/db/schema.ts`<br>`backend/src/db/sales-expense-management.ts`<br>`mobile/src/db/schema.ts`<br>`mobile/src/db/migrations.ts` |
| **Phase 2** | **Backend Staff APIs & Scoped Middlewares** <br>*(Completed)* | Staff assignment endpoints, auto-claim logic on login, daily digest endpoint, and branch-isolation middleware. | `backend/src/routes/staff.routes.ts`<br>`backend/src/controllers/staff.controller.ts`<br>`backend/src/service/staff.service.ts`<br>`backend/src/repositories/staff.repository.ts`<br>`backend/src/middleware/staff-guard.ts` |
| **Phase 3** | **Mobile Data Layer & Repositories** <br>*(Completed)* | Local SQLite staff repository, auto-tagging injection in sales/expenses/debts, and Zustand `useStaffStore`. | `mobile/src/types/staff.ts`<br>`mobile/src/repositories/local-staff.repo.ts`<br>`mobile/src/store/staff-store.ts` |
| **Phase 4** | **Unified Auth & Smart Role Navigation** <br>*(Completed)* | Session role detection, auto-claim invocation, and route guard routing staff to POS workspace vs. owner tabs. | `mobile/src/app/_layout.tsx`<br>`mobile/src/hooks/use-auth-role.ts`<br>`mobile/src/app/staff/index.tsx` |
| **Phase 5** | **Staff Counter Interface (Option B)** <br>*(Completed)* | Locked branch POS interface with Shift Drawer Summary and 3 tabs: Counter Sales, Branch Dube, and Petty Expenses. | `mobile/src/app/staff/_layout.tsx`<br>`mobile/src/app/staff/index.tsx`<br>`mobile/src/app/staff/dube.tsx`<br>`mobile/src/app/staff/expenses.tsx`<br>`mobile/src/components/staff/*` |
| **Phase 6** | **Branch Staff Assignment UI (Owner Side)** <br>*(Completed)* | Assigned staff list and "Add Staff by Email" modal inside the existing Branch Management screen. | `mobile/src/features/business/edit-branch-ui.tsx`<br>`mobile/src/components/business/assign-staff-modal.tsx` |
| **Phase 7** | **Owner Daily Branch Digest Screen (Idea C)** <br>*(Completed)* | Dedicated screen in Hamburger Menu showing multi-branch daily performance, cash drawer counts, and settled debt logs. | `mobile/src/app/daily-digest.tsx`<br>`mobile/src/components/navigation/hamburger-drawer.tsx` |
| **Phase 8** | **Automated Verification & Unit Tests** <br>*(Completed)* | Backend API test suite (auto-claim, isolation guards) and mobile calculation test suite (shift drawer, local mapping). | `backend/src/tests/staff-management.test.ts`<br>`mobile/src/tests/staff-management.test.ts` |

---

## 2. Detailed Phase Specifications

### Phase 1: Database Schema & Migrations — [COMPLETED]

#### Objectives
1. [x] Create `staff_assignment` table in PostgreSQL (Drizzle ORM) with foreign keys to `business.id`, `branch.id`, and `user.id`.
2. [x] Add `recorded_by_id` and `recorded_by_name` columns to `sale` and `expense` tables.
3. [x] Generate and verify Drizzle migration `0004_magenta_wendigo.sql` (applied and verified in PostgreSQL).
4. [x] Mirror schema in SQLite (`local_staff_assignment`) and bump `CURRENT_SCHEMA_VERSION = 4` in `mobile/src/db/migrations.ts`.
5. [x] Validated TypeScript compilation across both `backend` and `mobile` projects (0 errors).

---

### Phase 2: Backend Staff APIs & Security Middlewares — [COMPLETED]

#### Objectives
1. [x] Implement `POST /api/branches/:branchId/staff` to assign a staff member by email (with auto-linking to existing user).
2. [x] Implement `GET /api/branches/:branchId/staff` to list assigned staff per branch.
3. [x] Implement `DELETE /api/branches/:branchId/staff/:assignmentId` to revoke staff access.
4. [x] Implement `GET /api/staff/me` for staff client startup context and automated pending invite claiming.
5. [x] Implement `GET /api/branches/daily-digest` for owner's multi-branch end-of-day reconciliation and debt recovery logs.
6. [x] Implement `requireStaffBranchMatch` middleware to reject cross-branch data tampering with `403 Forbidden` and auto-inject assigned context.
7. [x] Implement `forbidStaff` middleware protecting owner-only administrative endpoints (`/api/health/*`, staff management, daily digest).
8. [x] Created and verified automated backend unit test suite (`backend/src/tests/staff-management.test.ts`) with 100% pass rate.

---

### Phase 3: Mobile Data Layer & Repositories — [COMPLETED]

#### Objectives
1. [x] Define TypeScript types in `mobile/src/types/staff.ts` (`StaffAssignment`, `StaffProfile`, `ShiftDrawerMetrics`, `DailyDigestResponse`).
2. [x] Implement `localStaffRepo` in `mobile/src/repositories/local-staff.repo.ts` (`saveStaffAtomic`, `saveStaffBatch`, `getStaffAssignmentsByBranch`, `computeShiftDrawerMetrics`).
3. [x] Created mobile API client service in `mobile/src/service/staff.ts` (`fetchStaffProfile`, `fetchBranchStaff`, `assignStaff`, `revokeStaff`, `fetchDailyDigest`).
4. [x] Updated `localSalesRepo`, `localExpensesRepo`, and `localBidrRepo` to automatically inject `branchId`, `recordedById`, and `recordedByName` from local session state with **0ms latency**.
5. [x] Created `useStaffStore` in `mobile/src/store/staff-store.ts` managing staff session context, offline SQLite fallback, drawer metrics, and staff assignments.
6. [x] Created and verified automated mobile unit test suite (`mobile/src/tests/staff-management.test.ts`) with 100% pass rate.

---

### Phase 4: Unified Auth & Smart Role Navigation Router — [COMPLETED]

#### Objectives
1. [x] Implemented reactive unified hook `useAuthRole` (`mobile/src/hooks/use-auth-role.ts`) resolving session role (`'sales' | 'owner' | 'new_user' | 'unauthenticated'`) with auto-claim of pending staff invites upon sign-in.
2. [x] Created `/staff/index.tsx` as dedicated root destination for staff counter interface with locked branch header and sign-out action.
3. [x] Integrated state machine navigation router in `mobile/src/app/_layout.tsx`:
   - Sales staff strictly redirected to `/staff`, intercepting unauthorized access to `/(tabs)`, `/(business)`, or `/health`.
   - Business owners routed to `/(tabs)` root, preventing access to staff counter, onboarding wizard, or auth screens.
   - Brand new users routed to `/(business)/create-business`.
   - Unauthenticated users routed to `/(auth)/login`.
4. [x] Verified zero TypeScript compilation errors (`mobile` and `backend`).

---

### Phase 5: Sales Staff Counter Workspace (Option B) — [COMPLETED]

#### Objectives
1. [x] Built shared top header (`StaffHeader` in `mobile/src/components/staff/staff-header.tsx`) with locked branch badge (`Bole Outlet 🔒`), cashier attribution chip, manual refresh trigger, and shift sign-out confirmation modal.
2. [x] Built Hero Shift Drawer Card (`ShiftDrawerCard` in `mobile/src/components/staff/shift-drawer-card.tsx`) reconciling physical cash in drawer, Telebirr, CBE Birr, settled debts, and total shift volume.
3. [x] Created 3-tab custom staff navigator (`StaffTabBar` and `mobile/src/app/staff/_layout.tsx`):
   - **Tab 1: Counter Sales (`mobile/src/app/staff/index.tsx`)**: Fast POS workspace, `QuickSaleModal` for instant counter checkouts with payment method selection, today's sales feed with cashier stamps, and pull-to-refresh.
   - **Tab 2: Customer Dube (`mobile/src/app/staff/dube.tsx`)**: Branch credit notebook ledger, credit filters (`All`, `Active Credit`, `Settled History`), customer search, `IssueDubeModal` for new credit, and `SettleDubeModal` for receiving debt payments directly into shift drawer.
   - **Tab 3: Operating Expenses (`mobile/src/app/staff/expenses.tsx`)**: Petty shop expenses paid out of counter drawer cash, expense feed, and `AddStaffExpenseModal` with category selection.
4. [x] Zero latency offline operation: all 3 tabs interact with local SQLite repositories (`localSalesRepo`, `localBidrRepo`, `localExpensesRepo`) with auto-sync and zero profit metrics exposed to cashiers.
5. [x] Verified TypeScript compilation (0 errors across mobile and backend).

---

### Phase 6: Branch Staff Assignment UI (Owner Side) — [COMPLETED]

#### Objectives
1. [x] In `mobile/src/features/business/edit-branch-ui.tsx`, added dedicated **"Assigned Counter Staff"** card section with real-time staff list for the operating branch.
2. [x] Displayed active and pending staff with status chips (`[✓ Active]` and `[⏳ Pending Registration]`), email, and assigned counter role.
3. [x] Built `AssignStaffModal` (`mobile/src/components/business/assign-staff-modal.tsx`):
   - Staff Email input with format and duplicate assignment validation.
   - Staff Name / Nickname input.
   - Sales Cashier role selection.
   - Auto-claim notification explaining that pending invitations activate immediately upon staff registration/login.
4. [x] Implemented staff revocation flow with native confirmation dialog and automatic local/backend sync.
5. [x] Verified zero TypeScript compilation errors (`mobile` and `backend`).

---

### Phase 7: Owner Daily Branch Digest Screen (Idea C) — [COMPLETED]

#### Objectives
1. [x] Created `mobile/src/app/daily-digest.tsx` accessible to business owners.
2. [x] Added menu item in `mobile/src/components/navigation/hamburger-drawer.tsx` under *Financial Intelligence*:
   ```typescript
   { id: 'daily-digest', label: 'Daily Branch Digest', icon: '📊', route: '/daily-digest' }
   ```
3. [x] Implemented date switcher (Today, Yesterday, previous/next day stepping) preventing future date selection.
4. [x] Built Company-Wide Reconciliation Summary:
   - Total Gross Revenue Collected.
   - 2-Column Physical Cash vs Digital Trails (cash to collect from drawers vs. digital mobile money in bank).
   - Settled customer debts recovered volume.
5. [x] Built Branch Counter Audits List:
   - Per-branch cards showing cashier attribution (`Cashier: Chala T.`), gross revenue, drawer cash, Telebirr, CBE Birr, and petty expenses deducted.
   - Detailed "Debts Settled Today" feed displaying customer name, amount, payment channel, and cashier audit trail (`Logged by [Cashier] at [Time]`).
6. [x] Offline resilience: seamless SQLite fallback aggregation if device is offline when viewing the digest.
7. [x] Verified zero TypeScript errors across `mobile` and `backend`.

---

### Phase 8: Verification & Automated Test Suites — [COMPLETED]

#### Objectives
1. [x] **Backend Tests (`backend/src/tests/staff-management.test.ts`)**:
   - Tested staff assignment input validation (email normalization, default role assignment, rejection of invalid email).
   - Tested daily digest query parameter validation (`businessId` enforcement, `YYYY-MM-DD` date parsing).
   - Tested branch isolation middleware logic (blocking cross-branch tampering with 403 Forbidden, transparent branchId context injection).
   - Tested multi-branch daily digest mathematical aggregation formulas (gross inflow, drawer cash, Telebirr, CBE Birr, settled dube reconciliation).
   - Tested user invite auto-claim algorithm on first-time login.
2. [x] **Mobile Tests (`mobile/src/tests/staff-management.test.ts`)**:
   - Tested shift drawer calculation formula (reconciling cash, Telebirr, CBE Birr, settled debts, expenses, and net cash).
   - Tested zero-latency attribution auto-injection (`recordedById`, `recordedByName`, `branchId`).
   - Tested customer debt recovery attribution preservation.
   - Tested SQLite Version 4 migration contract and schema column integrity (`local_staff_assignment`, `local_sale`, `local_expense`, `CURRENT_SCHEMA_VERSION === 4`).
3. [x] **Full Build & TypeScript Compilation**:
   - Zero compilation errors across `mobile` (`npx tsc --noEmit`).
   - Zero compilation errors across `backend` (`npm run build` with `tsc`).
   - Clean execution of all automated tests (`npm test` in backend, `tsx` in mobile).

---

## 3. Execution Sequence

```
Phase 1: DB Schemas (PostgreSQL & SQLite)
  └── Phase 2: Backend Staff APIs & Isolation Middleware
        └── Phase 3: Mobile Data Layer & Repositories
              └── Phase 4: Unified Auth & Smart Role Navigation
                    └── Phase 5: Staff Counter POS Interface (Option B)
                          └── Phase 6: Branch Staff Assignment UI (Owner Side)
                                └── Phase 7: Owner Daily Branch Digest (Idea C)
                                      └── Phase 8: Automated Verification & Tests
```
