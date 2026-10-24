# Sales Staff Interface — Step-by-Step Implementation Plan

This document details the phase-by-phase execution plan for the **Sales Staff Interface & Branch Assignment** engine in **NetWorth Ethiopia**.

---

## 1. Phase Breakdown Matrix

| Phase | Title | Primary Deliverables | Target Files |
| :--- | :--- | :--- | :--- |
| **Phase 1** | **Database Schema & Migrations** <br>*(Completed)* | Dedicated `staff_assignment` table in PostgreSQL & local SQLite, plus attribution columns on `sale` & `expense`. | `backend/src/db/staff-management.ts`<br>`backend/src/db/schema.ts`<br>`backend/src/db/sales-expense-management.ts`<br>`mobile/src/db/schema.ts`<br>`mobile/src/db/migrations.ts` |
| **Phase 2** | **Backend Staff APIs & Scoped Middlewares** <br>*(Completed)* | Staff assignment endpoints, auto-claim logic on login, daily digest endpoint, and branch-isolation middleware. | `backend/src/routes/staff.routes.ts`<br>`backend/src/controllers/staff.controller.ts`<br>`backend/src/service/staff.service.ts`<br>`backend/src/repositories/staff.repository.ts`<br>`backend/src/middleware/staff-guard.ts` |
| **Phase 3** | **Mobile Data Layer & Repositories** <br>*(Completed)* | Local SQLite staff repository, auto-tagging injection in sales/expenses/debts, and Zustand `useStaffStore`. | `mobile/src/types/staff.ts`<br>`mobile/src/repositories/local-staff.repo.ts`<br>`mobile/src/store/staff-store.ts` |
| **Phase 4** | **Unified Auth & Smart Role Navigation** | Session role detection, auto-claim invocation, and route guard routing staff to POS workspace vs. owner tabs. | `mobile/src/app/_layout.tsx`<br>`mobile/src/hooks/use-auth-role.ts` |
| **Phase 5** | **Staff Counter Interface (Option B)** | Locked branch POS interface with Shift Drawer Summary and 3 tabs: Counter Sales, Branch Dube, and Petty Expenses. | `mobile/src/app/staff/_layout.tsx`<br>`mobile/src/app/staff/index.tsx`<br>`mobile/src/app/staff/dube.tsx`<br>`mobile/src/app/staff/expenses.tsx` |
| **Phase 6** | **Branch Staff Assignment UI (Owner Side)** | Assigned staff list and "Add Staff by Email" modal inside the existing Branch Management screen. | `mobile/src/features/business/edit-branch-ui.tsx`<br>`mobile/src/components/business/assign-staff-modal.tsx` |
| **Phase 7** | **Owner Daily Branch Digest Screen (Idea C)** | Dedicated screen in Hamburger Menu showing multi-branch daily performance, cash drawer counts, and settled debt logs. | `mobile/src/app/daily-digest.tsx`<br>`mobile/src/components/navigation/hamburger-drawer.tsx` |
| **Phase 8** | **Automated Verification & Unit Tests** | Backend API test suite (auto-claim, isolation guards) and mobile calculation test suite (shift drawer, local mapping). | `backend/src/tests/staff-management.test.ts`<br>`mobile/src/tests/staff-management.test.ts` |

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

### Phase 4: Unified Auth & Smart Role Navigation Router

#### Objectives
1. In `mobile/src/app/_layout.tsx`, intercept post-login state:
   - Check if current user email or ID has an active `staff_assignment`.
   - If Staff: route to `/staff/` (Staff Interface).
   - If Owner: route to `/(tabs)` (Owner Experience).
   - If New User: route to `/(business)/create-business`.
2. Prevent staff from navigating to `/health` or owner administrative tabs.

---

### Phase 5: Sales Staff Counter Workspace (Option B)

#### Objectives
Build the distraction-free counter checkout app for sales staff:
1. **Top Header**: Locked branch pill (`Bole Outlet 🔒`) + Staff Profile.
2. **Hero Shift Drawer Card**: Real-time counter shift metrics:
   - Total Cash in Drawer.
   - Total Telebirr collected.
   - Total CBE Birr collected.
   - Total Dube settled.
3. **Bottom 3-Tab Navigator**:
   - `Sales`: Quick numeric POS + Shift sales feed.
   - `Customer Dube`: Branch credit balance list + Debt settlement form.
   - `Expenses`: Branch petty operating expense entry.

---

### Phase 6: Branch Staff Assignment UI (Owner Side)

#### Objectives
Integrate staff assignment directly into the existing **Branch Management** flow:
1. In `edit-branch-ui.tsx`, add an **"Assigned Counter Staff"** card section.
2. Displays active and pending staff with status chips (`[✓ Active]`, `[⏳ Pending]`).
3. "+ Assign Staff Member" opens a modal:
   - Inputs: Staff Email, Name/Nickname, Role.
   - Sends assignment to backend.

---

### Phase 7: Owner Daily Branch Digest Screen (Idea C)

#### Objectives
1. Create `mobile/src/app/daily-digest.tsx`.
2. Add menu link in `mobile/src/components/navigation/hamburger-drawer.tsx` under *Financial Intelligence*:
   ```typescript
   { id: 'daily-digest', label: 'Daily Branch Digest', icon: '📊', route: '/daily-digest' }
   ```
3. UI Sections:
   - Date selector (defaults to Today).
   - Overall reconciliation card (Physical cash across all branches vs. digital bank inflows).
   - Per-branch card list: Cash in drawer, Telebirr, CBE, expenses, and detailed list of settled debts with staff attribution.

---

### Phase 8: Verification & Automated Test Suites

#### Objectives
1. **Backend Tests (`backend/src/tests/staff-management.test.ts`)**:
   - Test assignment creation and auto-claim on user login.
   - Test branch isolation middleware (verifies staff cannot post to another branch).
   - Test daily digest aggregation logic.
2. **Mobile Tests (`mobile/src/tests/staff-management.test.ts`)**:
   - Test shift drawer calculation formula.
   - Test automatic branch ID and staff name attribution injection.
   - Test SQLite version 4 migration.
3. **TypeScript Compilation**:
   - Zero compilation errors across `mobile` and `backend`.

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
