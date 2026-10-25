# Sales Staff Interface — Architecture & API Contracts

This document specifies the unified authentication lifecycle, smart role routing, automatic branch context injection, and REST API contracts for the **Sales Staff Interface**.

---

## 1. Unified Auth Lifecycle & Smart Role Routing

To prevent confusing separate login pages, all users authenticate via the single standard login screen (`mobile/src/app/(auth)/login.tsx`).

```
                              [USER LOGS IN]
                                     │
                        Validate Better Auth Session
                                     │
                                     ▼
                Does an active `staff_assignment` exist?
                 ├── YES ──► Auto-claim invite if pending
                 │           Set Zustand: `role = 'sales'`, `branchId = assignedId`
                 │           Navigate: Staff Counter Workspace (`/staff-dashboard`)
                 │
                 └── NO ───► Does user own any businesses?
                              ├── YES ──► Set Zustand: `role = 'owner'`
                              │           Navigate: Owner Dashboard (`/(tabs)`)
                              │
                              └── NO ───► Brand New User
                                          Navigate: Business Wizard (`/(business)/create-business`)
```

### Auto-Claim Algorithm (First-Time Staff Login)
1. Owner types `chala@gmail.com` under Bole Branch.
2. An invite is recorded: `{ email: 'chala@gmail.com', branchId: 'br-bole', status: 'pending', userId: null }`.
3. Chala downloads the app and signs in with Google or Email using `chala@gmail.com`.
4. In the authentication callback:
   ```sql
   UPDATE staff_assignment
   SET user_id = $1, status = 'active', accepted_at = NOW()
   WHERE email = lower(trim($2)) AND status = 'pending'
   RETURNING *;
   ```
5. Chala is immediately bound to Bole Branch and redirected to the Staff POS interface.

---

## 2. Zero-Latency Automatic Branch Tagging Architecture

To ensure sales counter operations never suffer from network lag or human selection error:

### 2.1 The Context Rule
* **Sales Staff**: The `activeBranchId` is permanently frozen in local state from their `staff_assignment.branchId`.
* **Business Owner**: The `activeBranchId` dynamically follows `useBusinessStore.getState().activeBranch?.id`.

### 2.2 Transparent Injection (0ms Latency)
When staff taps "Complete Sale", "Register Debt", or "Record Expense", the repository automatically pulls the branch ID and staff name from local memory:
```typescript
// Example: Creating sale in mobile repository
const currentUser = useAuthStore.getState().user;
const activeBranchId = useAuthStore.getState().assignedBranchId;

const payload = {
  ...inputData,
  branchId: activeBranchId,               // Injected automatically
  recordedById: currentUser.id,          // Injected automatically
  recordedByName: currentUser.name,      // Injected automatically
};

await localSalesRepo.createSaleAtomic(payload);
```
**Result**: Counter staff never sees a branch selector dropdown, and zero manual input is required.

---

## 3. Backend REST API Contracts

### 3.1 Staff Assignment Management (Owner Only)

#### `POST /api/branches/:branchId/staff`
Assigns a new staff member to a branch by email.
* **Headers**: `Authorization: Bearer <session_cookie>`
* **Params**: `branchId` (string)
* **Body**:
  ```json
  {
    "email": "chala.sales@gmail.com",
    "name": "Chala Tadesse",
    "role": "sales"
  }
  ```
* **Response (`201 Created`)**:
  ```json
  {
    "status": "success",
    "data": {
      "id": "asgn-uuid-123",
      "branchId": "br-bole-01",
      "email": "chala.sales@gmail.com",
      "name": "Chala Tadesse",
      "role": "sales",
      "status": "pending",
      "invitedAt": "2026-10-24T18:00:00.000Z"
    }
  }
  ```

#### `GET /api/branches/:branchId/staff`
Lists all staff assigned to a specific branch.
* **Headers**: `Authorization: Bearer <session_cookie>`
* **Params**: `branchId` (string)
* **Response (`200 OK`)**:
  ```json
  {
    "status": "success",
    "data": [
      {
        "id": "asgn-uuid-123",
        "email": "chala.sales@gmail.com",
        "name": "Chala Tadesse",
        "role": "sales",
        "status": "active",
        "acceptedAt": "2026-10-24T18:15:00.000Z"
      }
    ]
  }
  ```

#### `DELETE /api/branches/:branchId/staff/:assignmentId`
Revokes a staff member's assignment.
* **Headers**: `Authorization: Bearer <session_cookie>`
* **Response (`200 OK`)**:
  ```json
  {
    "status": "success",
    "data": { "revoked": true, "message": "Staff assignment removed" }
  }
  ```

---

### 3.2 Owner's Daily Multi-Branch Digest Endpoint

#### `GET /api/branches/daily-digest`
Aggregates daily performance, cash drawer counts, and debt recovery logs across all branches.
* **Headers**: `Authorization: Bearer <session_cookie>`
* **Query Parameters**:
  * `businessId`: string (required)
  * `date`: string (optional, defaults to today `YYYY-MM-DD`)
* **Response (`200 OK`)**:
  ```json
  {
    "status": "success",
    "data": {
      "date": "2026-10-24",
      "businessId": "biz-123",
      "totalInflow": 28400.00,
      "totalCashInDrawer": 11200.00,
      "totalDigitalInflow": 17200.00,
      "totalDubeSettled": 6800.00,
      "branches": [
        {
          "branchId": "br-bole-01",
          "branchName": "Bole Outlet",
          "cashierName": "Chala Tadesse",
          "metrics": {
            "grossInflow": 16400.00,
            "cashVolume": 6200.00,
            "telebirrVolume": 7800.00,
            "cbeVolume": 2400.00,
            "expenseVolume": 1200.00,
            "netShiftCash": 15200.00
          },
          "settledDebtsToday": [
            {
              "saleId": "sale-101",
              "customerName": "Almaz Kebede",
              "amount": 3200.00,
              "paymentMethod": "telebirr",
              "recordedByName": "Chala Tadesse",
              "time": "14:25:00"
            }
          ]
        }
      ]
    }
  }
  ```

---

### 3.3 Staff Self-Profile Endpoint

#### `GET /api/staff/me`
Called on mobile client boot by sales staff to verify their active branch context.
* **Headers**: `Authorization: Bearer <session_cookie>`
* **Response (`200 OK`)**:
  ```json
  {
    "status": "success",
    "data": {
      "isStaff": true,
      "businessId": "biz-123",
      "businessName": "Addis Premium Store",
      "branchId": "br-bole-01",
      "branchName": "Bole Outlet",
      "role": "sales",
      "status": "active"
    }
  }
  ```

---

## 4. Security & Branch Isolation Middleware

### `requireStaffBranchMatch` Middleware
To prevent unauthorized cross-branch data access:
1. If the authenticated session belongs to a **Staff Member**:
   * The middleware extracts `staffAssignment.branchId`.
   * Any incoming request containing `branchId` in `req.params`, `req.query`, or `req.body` is validated:
     * If `req.branchId !== staffAssignment.branchId`, immediately abort with `403 Forbidden`.
   * Sales and Debt queries automatically apply `WHERE branch_id = staffAssignment.branchId`.
2. Any staff access to `/api/health/*` or `/api/branches/:id/staff` is rejected with `403 Forbidden`.
