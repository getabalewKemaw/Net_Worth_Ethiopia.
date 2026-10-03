# Detailed Offline Sync Implementation Plan

**Status**: All 6 Phases Fully Implemented, Hardened & Verified  
**Inspection & Quality Report**: [Offline Sync Implementation & System Quality Report](file:///home/eaglex/Documents/insa-ctc/FinalProject/docs/offline-sync/report/offline-sync-implementation-report.md)

## 1. Plan Overview & Principles

This document defines the complete, step-by-step engineering implementation plan for offline synchronization in NetWorth Ethiopia. 

### Core Design Rules
1. **Local-First Reads & Writes**: The mobile app reads and writes exclusively to the local SQLite database. The UI never waits for network requests to record sales, expenses, or debt transactions.
2. **Transactional Outbox**: All mutations (create, update, settle) are written to the entity table and the `sync_queue` table inside a single SQLite transaction (`BEGIN TRANSACTION ... COMMIT`).
3. **Client-Generated UUIDs**: All primary keys are RFC 4122 v4 UUIDs generated on the device at creation time (`crypto.randomUUID()`).
4. **Idempotent Synchronization**: Mutations pushed to the server carry unique `mutation_id` keys to ensure duplicate network packets cannot duplicate financial ledger entries.
5. **Zero UI Disruption**: Background sync workers run asynchronously without blocking the JavaScript thread or freezing the UI.

---

## 2. File Implementation Matrix

The following table summarizes every file that will be created or modified across the phases:

| Phase | Action | File Path | Primary Responsibility |
| :--- | :--- | :--- | :--- |
| **Phase 1** | Modify | [mobile/package.json](file:///home/eaglex/Documents/insa-ctc/FinalProject/mobile/package.json) | Add `expo-sqlite` dependency. |
| **Phase 1** | Create | [mobile/src/db/client.ts](file:///home/eaglex/Documents/insa-ctc/FinalProject/mobile/src/db/client.ts) | Async SQLite connection factory, WAL mode, foreign keys. |
| **Phase 1** | Create | [mobile/src/db/schema.ts](file:///home/eaglex/Documents/insa-ctc/FinalProject/mobile/src/db/schema.ts) | SQL table definitions (DDL) and database indexes. |
| **Phase 1** | Create | [mobile/src/db/migrations.ts](file:///home/eaglex/Documents/insa-ctc/FinalProject/mobile/src/db/migrations.ts) | User version tracking and automated schema migration runner. |
| **Phase 2** | Create | [mobile/src/repositories/sync-queue.repo.ts](file:///home/eaglex/Documents/insa-ctc/FinalProject/mobile/src/repositories/sync-queue.repo.ts) | Outbox queue CRUD, batch fetch, retry count increment. |
| **Phase 2** | Create | [mobile/src/repositories/local-sales.repo.ts](file:///home/eaglex/Documents/insa-ctc/FinalProject/mobile/src/repositories/local-sales.repo.ts) | Local sale writes, branch filtering, offline daily revenue query. |
| **Phase 2** | Create | [mobile/src/repositories/local-expenses.repo.ts](file:///home/eaglex/Documents/insa-ctc/FinalProject/mobile/src/repositories/local-expenses.repo.ts) | Local expense writes, category queries, branch expense query. |
| **Phase 2** | Create | [mobile/src/repositories/local-bidr.repo.ts](file:///home/eaglex/Documents/insa-ctc/FinalProject/mobile/src/repositories/local-bidr.repo.ts) | Local debt creation, offline settlement, offline debt summary query. |
| **Phase 2** | Create | [mobile/src/repositories/local-business.repo.ts](file:///home/eaglex/Documents/insa-ctc/FinalProject/mobile/src/repositories/local-business.repo.ts) | Local cache for business profile and branch metadata. |
| **Phase 3** | Modify | [backend/src/db/schema.ts](file:///home/eaglex/Documents/insa-ctc/FinalProject/backend/src/db/schema.ts) | Add `sync_idempotency` table and `updated_at` indexes. |
| **Phase 3** | Create | [backend/src/types/sync.ts](file:///home/eaglex/Documents/insa-ctc/FinalProject/backend/src/types/sync.ts) | Zod validation schemas and TypeScript types for sync push/pull. |
| **Phase 3** | Create | [backend/src/repositories/sync.repository.ts](file:///home/eaglex/Documents/insa-ctc/FinalProject/backend/src/repositories/sync.repository.ts) | Batch database transactions, idempotency checks, delta queries. |
| **Phase 3** | Create | [backend/src/service/sync.service.ts](file:///home/eaglex/Documents/insa-ctc/FinalProject/backend/src/service/sync.service.ts) | Business logic for batch ingestion, conflict resolution, delta pull. |
| **Phase 3** | Create | [backend/src/controllers/sync.controller.ts](file:///home/eaglex/Documents/insa-ctc/FinalProject/backend/src/controllers/sync.controller.ts) | HTTP request handlers for push and pull endpoints. |
| **Phase 3** | Create | [backend/src/routes/sync.routes.ts](file:///home/eaglex/Documents/insa-ctc/FinalProject/backend/src/routes/sync.routes.ts) | Express route declarations with authentication middleware. |
| **Phase 3** | Modify | [backend/src/index.ts](file:///home/eaglex/Documents/insa-ctc/FinalProject/backend/src/index.ts) | Mount `/api/sync` routes on Express app. |
| **Phase 4** | Create | [mobile/src/service/sync-engine.ts](file:///home/eaglex/Documents/insa-ctc/FinalProject/mobile/src/service/sync-engine.ts) | Two-way sync engine worker with lock control and backoff logic. |
| **Phase 4** | Create | [mobile/src/hooks/use-network-sync.ts](file:///home/eaglex/Documents/insa-ctc/FinalProject/mobile/src/hooks/use-network-sync.ts) | Hook monitoring `expo-network` and `AppState` for auto-sync. |
| **Phase 5** | Modify | [mobile/src/store/sales-store.ts](file:///home/eaglex/Documents/insa-ctc/FinalProject/mobile/src/store/sales-store.ts) | Refactor actions to write to local SQLite first. |
| **Phase 5** | Modify | [mobile/src/store/bidr-store.ts](file:///home/eaglex/Documents/insa-ctc/FinalProject/mobile/src/store/bidr-store.ts) | Refactor actions to write to local SQLite first. |
| **Phase 5** | Modify | [mobile/src/app/(tabs)/index.tsx](file:///home/eaglex/Documents/insa-ctc/FinalProject/mobile/src/app/(tabs)/index.tsx) | Integrate offline metric hydration for Dashboard. |
| **Phase 5** | Create | [mobile/src/components/common/sync-status-badge.tsx](file:///home/eaglex/Documents/insa-ctc/FinalProject/mobile/src/components/common/sync-status-badge.tsx) | Header status pill showing online/offline and pending sync count. |

---

## 3. Phase 1: Local SQLite Foundation & Database Architecture (Mobile)

### Objective
Install `expo-sqlite`, establish an async database client configured for high concurrency on Android, define complete DDL tables with indexing, and provide an automated migration runner.

---

### Step 1.1: Install `expo-sqlite`
- **Target File**: [mobile/package.json](file:///home/eaglex/Documents/insa-ctc/FinalProject/mobile/package.json)
- **Action**: Run terminal installation in `mobile/`:
  ```bash
  cd mobile && npx expo install expo-sqlite
  ```
- **Acceptance Criteria**: `expo-sqlite` appears under `"dependencies"` in `mobile/package.json`, compatible with Expo SDK 57.

---

### Step 1.2: Database Connection Client & WAL Configuration
- **Target File**: [mobile/src/db/client.ts](file:///home/eaglex/Documents/insa-ctc/FinalProject/mobile/src/db/client.ts) (NEW)
- **Action**: Create the SQLite connection singleton factory.
- **Detailed Specifications**:
  1. Export function `getDatabase(): Promise<SQLiteDatabase>`
  2. Use `SQLite.openDatabaseAsync('networth.db')`
  3. Execute required PRAGMA optimizations:
     - `PRAGMA journal_mode = WAL;` (Enables Write-Ahead Logging: reads do not block writes, writes do not block reads)
     - `PRAGMA foreign_keys = ON;` (Enforces referential integrity across branches/sales)
     - `PRAGMA synchronous = NORMAL;` (Reduces disk I/O latency while retaining crash durability)
  4. Cache the open database instance to prevent multiple connection overhead.

---

### Step 1.3: DDL Schemas & Local Indexing
- **Target File**: [mobile/src/db/schema.ts](file:///home/eaglex/Documents/insa-ctc/FinalProject/mobile/src/db/schema.ts) (NEW)
- **Action**: Define SQL schema creation scripts for local storage.
- **Detailed Specifications**:
  1. Define table `local_sale`:
     - `id TEXT PRIMARY KEY NOT NULL` (UUID v4)
     - `business_id TEXT NOT NULL`
     - `branch_id TEXT NOT NULL`
     - `sale_type TEXT CHECK(sale_type IN ('instant', 'dube')) NOT NULL`
     - `payment_method TEXT NOT NULL`
     - `description TEXT NOT NULL`
     - `amount INTEGER NOT NULL`
     - `customer_name TEXT`
     - `customer_phone TEXT`
     - `due_date TEXT`
     - `status TEXT CHECK(status IN ('pending', 'settled', 'overdue', 'voided')) NOT NULL`
     - `notes TEXT`
     - `paid_at TEXT`
     - `sync_status TEXT DEFAULT 'pending_create' NOT NULL` (`'synced'`, `'pending_create'`, `'pending_update'`)
     - `created_at TEXT NOT NULL`
     - `updated_at TEXT NOT NULL`
  2. Define table `local_expense`:
     - `id TEXT PRIMARY KEY NOT NULL`
     - `business_id TEXT NOT NULL`
     - `branch_id TEXT NOT NULL`
     - `description TEXT NOT NULL`
     - `amount INTEGER NOT NULL`
     - `category TEXT NOT NULL`
     - `notes TEXT`
     - `sync_status TEXT DEFAULT 'pending_create' NOT NULL`
     - `created_at TEXT NOT NULL`
     - `updated_at TEXT NOT NULL`
  3. Define table `local_branch`:
     - `id TEXT PRIMARY KEY NOT NULL`
     - `business_id TEXT NOT NULL`
     - `name TEXT NOT NULL`
     - `location TEXT`
     - `is_active INTEGER DEFAULT 1 NOT NULL`
     - `updated_at TEXT NOT NULL`
  4. Define table `sync_queue` (The Transactional Outbox):
     - `id INTEGER PRIMARY KEY AUTOINCREMENT`
     - `mutation_id TEXT UNIQUE NOT NULL` (UUID v4 Idempotency Key)
     - `entity_type TEXT NOT NULL` (`'sale'`, `'expense'`, `'debt'`, `'branch'`)
     - `entity_id TEXT NOT NULL`
     - `action TEXT NOT NULL` (`'CREATE'`, `'UPDATE'`, `'SETTLE'`, `'DELETE'`)
     - `payload TEXT NOT NULL` (JSON-serialized payload)
     - `retry_count INTEGER DEFAULT 0 NOT NULL`
     - `last_error TEXT`
     - `status TEXT DEFAULT 'pending' NOT NULL` (`'pending'`, `'processing'`, `'failed'`)
     - `created_at TEXT NOT NULL`
  5. Define table `sync_metadata`:
     - `key TEXT PRIMARY KEY NOT NULL` (`'last_pulled_at'`, `'device_id'`)
     - `value TEXT NOT NULL`
     - `updated_at TEXT NOT NULL`
  6. Define performance indexes:
     - `CREATE INDEX idx_sale_biz ON local_sale(business_id, created_at DESC);`
     - `CREATE INDEX idx_sale_branch ON local_sale(branch_id);`
     - `CREATE INDEX idx_sale_status ON local_sale(status);`
     - `CREATE INDEX idx_sale_type ON local_sale(sale_type);`
     - `CREATE INDEX idx_expense_biz ON local_expense(business_id, created_at DESC);`
     - `CREATE INDEX idx_queue_pending ON sync_queue(status, id ASC);`

---

### Step 1.4: Schema Migrations & Version Tracking
- **Target File**: [mobile/src/db/migrations.ts](file:///home/eaglex/Documents/insa-ctc/FinalProject/mobile/src/db/migrations.ts) (NEW)
- **Action**: Create an automated migration runner.
- **Detailed Specifications**:
  1. Query `PRAGMA user_version;` to inspect current migration level.
  2. If version < 1, execute complete DDL from `mobile/src/db/schema.ts`, then set `PRAGMA user_version = 1;`.
  3. Export `initLocalDatabase(): Promise<void>` to be invoked on app startup in [mobile/src/app/_layout.tsx](file:///home/eaglex/Documents/insa-ctc/FinalProject/mobile/src/app/_layout.tsx).

---

## 4. Phase 2: Local Repositories & Data Access Layer (Mobile)

### Objective
Create typed repository classes that encapsulate all SQL operations. Enforce that every write operation to the business entity also enqueues an outbox entry in the same atomic database transaction.

---

### Step 2.1: Sync Queue (Outbox) Repository
- **Target File**: [mobile/src/repositories/sync-queue.repo.ts](file:///home/eaglex/Documents/insa-ctc/FinalProject/mobile/src/repositories/sync-queue.repo.ts) (NEW)
- **Action**: Create repository for managing pending mutation records.
- **Detailed Specifications**:
  1. `enqueueMutation(db: SQLiteDatabase, mutation: EnqueueMutationInput): Promise<void>`
     - Inserts into `sync_queue` using provided open database transaction.
  2. `getPendingMutations(limit = 50): Promise<SyncQueueItem[]>`
     - `SELECT * FROM sync_queue WHERE status = 'pending' ORDER BY id ASC LIMIT ?`
  3. `markMutationsProcessed(mutationIds: string[]): Promise<void>`
     - `DELETE FROM sync_queue WHERE mutation_id IN (...)`
  4. `incrementRetry(mutationId: string, error: string): Promise<void>`
     - Updates `retry_count = retry_count + 1`, `last_error = error`, and sets `status = 'failed'` if `retry_count >= 5`.
  5. `getPendingCount(): Promise<number>`
     - `SELECT COUNT(*) AS count FROM sync_queue WHERE status = 'pending'`

---

### Step 2.2: Local Sales & Expenses Repository
- **Target File**: [mobile/src/repositories/local-sales.repo.ts](file:///home/eaglex/Documents/insa-ctc/FinalProject/mobile/src/repositories/local-sales.repo.ts) (NEW)
- **Target File**: [mobile/src/repositories/local-expenses.repo.ts](file:///home/eaglex/Documents/insa-ctc/FinalProject/mobile/src/repositories/local-expenses.repo.ts) (NEW)
- **Action**: Create repositories for sales and expense persistence.
- **Detailed Specifications for Sales**:
  1. `createSaleAtomic(saleData: CreateSaleInput): Promise<SaleEntry>`:
     - Generates UUID v4 (`id = crypto.randomUUID()`)
     - Generates `mutation_id = crypto.randomUUID()`
     - In an SQLite transaction:
       - `INSERT INTO local_sale (id, business_id, branch_id, sale_type, payment_method, description, amount, status, sync_status, created_at, updated_at) VALUES (...)`
       - Inserts into `sync_queue` with `action = 'CREATE'`, `entity_type = 'sale'`, payload JSON.
     - Returns mapped `SaleEntry` immediately.
  2. `getSales(businessId: string, branchId?: string, limit = 100): Promise<SaleEntry[]>`:
     - Queries `local_sale` ordered by `created_at DESC`.
  3. `getTodayRevenueMetric(businessId: string, branchId?: string): Promise<{ revenue: number; saleCount: number }>`:
     - Executes SQL aggregation:
       ```sql
       SELECT COALESCE(SUM(amount), 0) AS revenue, COUNT(*) AS count
       FROM local_sale
       WHERE business_id = ? AND sale_type = 'instant' AND date(created_at) = date('now')
       ```
- **Detailed Specifications for Expenses**:
  1. `createExpenseAtomic(expenseData: CreateExpenseInput): Promise<ExpenseEntry>`:
     - Generates UUID v4, inserts into `local_expense`, and enqueues in `sync_queue`.
  2. `getExpenses(businessId: string, branchId?: string, limit = 100): Promise<ExpenseEntry[]>`:
     - Queries `local_expense` ordered by `created_at DESC`.

---

### Step 2.3: Local Bidr (Customer Debt) Repository
- **Target File**: [mobile/src/repositories/local-bidr.repo.ts](file:///home/eaglex/Documents/insa-ctc/FinalProject/mobile/src/repositories/local-bidr.repo.ts) (NEW)
- **Action**: Create repository for customer credit/dube notebook.
- **Detailed Specifications**:
  1. `createDebtAtomic(debtData: CreateDebtInput): Promise<DebtItem>`:
     - Inserts into `local_sale` with `sale_type = 'dube'`, `status = 'pending'`, and enqueues to `sync_queue`.
  2. `settleDebtAtomic(debtId: string, paymentData: SettleDebtInput): Promise<DebtItem>`:
     - In an SQLite transaction:
       - `UPDATE local_sale SET status = 'settled', paid_at = datetime('now'), sync_status = 'pending_update', updated_at = datetime('now') WHERE id = ?`
       - Enqueues mutation to `sync_queue` with `action = 'SETTLE'`, `entity_id = debtId`.
  3. `updateDebtAtomic(debtId: string, updateData: UpdateDebtInput): Promise<DebtItem>`:
     - Updates debt notes, due date, customer info, and enqueues mutation with `action = 'UPDATE'`.
  4. `getDebts(businessId: string, branchId?: string, filters?: BidrFilters): Promise<DebtItem[]>`:
     - Dynamic SQL query supporting search by `customer_name LIKE ?`, status filter (`all`, `pending`, `settled`, `overdue`), and sorting.
  5. `getDebtSummaryMetric(businessId: string, branchId?: string): Promise<DebtSummaryData>`:
     - Offline aggregation SQL:
       ```sql
       SELECT 
         COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) AS total_debt,
         COALESCE(SUM(CASE WHEN status = 'settled' THEN amount ELSE 0 END), 0) AS total_settled,
         COALESCE(SUM(CASE WHEN status = 'pending' AND due_date < date('now') THEN amount ELSE 0 END), 0) AS total_overdue,
         COUNT(CASE WHEN status = 'pending' THEN 1 END) AS active_debt_count
       FROM local_sale
       WHERE business_id = ? AND sale_type = 'dube'
       ```

---

### Step 2.4: Local Business & Branch Repository
- **Target File**: [mobile/src/repositories/local-business.repo.ts](file:///home/eaglex/Documents/insa-ctc/FinalProject/mobile/src/repositories/local-business.repo.ts) (NEW)
- **Action**: Create caching repository for business settings and branch lists.
- **Detailed Specifications**:
  1. `cacheBranches(branches: Branch[]): Promise<void>`:
     - `INSERT OR REPLACE INTO local_branch (...)`
  2. `getCachedBranches(businessId: string): Promise<Branch[]>`:
     - `SELECT * FROM local_branch WHERE business_id = ? AND is_active = 1`

---

## 5. Phase 3: Backend Sync Engine & API Endpoints (Backend)

### Objective
Create high-performance, atomic batch synchronization endpoints (`POST /api/sync/push` and `GET /api/sync/pull`) on the Express backend, with duplicate prevention through idempotency tracking.

---

### Step 3.1: Database Schema Update & Migration
- **Target File**: [backend/src/db/schema.ts](file:///home/eaglex/Documents/insa-ctc/FinalProject/backend/src/db/schema.ts)
- **Action**: Add `sync_idempotency` table and indexing for delta queries.
- **Detailed Specifications**:
  1. Add table definition `syncIdempotency`:
     ```typescript
     export const syncIdempotency = pgTable("sync_idempotency", {
       mutationId: text("mutation_id").primaryKey(),
       userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
       businessId: text("business_id").notNull().references(() => business.id, { onDelete: "cascade" }),
       entityType: text("entity_type").notNull(),
       entityId: text("entity_id").notNull(),
       action: text("action").notNull(),
       status: text("status").notNull(),
       createdAt: timestamp("created_at").defaultNow().notNull(),
     }, (table) => [
       index("sync_idempotency_biz_idx").on(table.businessId),
     ]);
     ```
  2. Add compound index on `sale` table:
     - `index("sale_business_updated_idx").on(table.businessId, table.updatedAt)`
  3. Add compound index on `expense` table:
     - `index("expense_business_updated_idx").on(table.businessId, table.updatedAt)`
  4. Run `npm run db:generate` and `npm run db:migrate` in `backend/`.

---

### Step 3.2: Sync Types & Zod Validation
- **Target File**: [backend/src/types/sync.ts](file:///home/eaglex/Documents/insa-ctc/FinalProject/backend/src/types/sync.ts) (NEW)
- **Action**: Define request and response schemas.
- **Detailed Specifications**:
  1. `MutationItemSchema`:
     - `mutationId: z.string().uuid()`
     - `entityType: z.enum(["sale", "expense", "debt", "branch"])`
     - `action: z.enum(["CREATE", "UPDATE", "SETTLE", "DELETE"])`
     - `entityId: z.string()`
     - `timestamp: z.string().datetime()`
     - `payload: z.record(z.string(), z.any())`
  2. `SyncPushRequestSchema`:
     - `businessId: z.string()`
     - `deviceId: z.string().optional()`
     - `mutations: z.array(MutationItemSchema)`
  3. `SyncPullQuerySchema`:
     - `businessId: z.string()`
     - `since: z.string().datetime().optional()`

---

### Step 3.3: Sync Repository & Service
- **Target File**: [backend/src/repositories/sync.repository.ts](file:///home/eaglex/Documents/insa-ctc/FinalProject/backend/src/repositories/sync.repository.ts) (NEW)
- **Target File**: [backend/src/service/sync.service.ts](file:///home/eaglex/Documents/insa-ctc/FinalProject/backend/src/service/sync.service.ts) (NEW)
- **Action**: Implement batch transaction processing and delta query logic.
- **Detailed Specifications for `processPushBatch`**:
  1. Wrap all incoming mutations inside `db.transaction(async (tx) => ...)`
  2. For each mutation:
     - Check `sync_idempotency` for `mutation_id`. If exists, record as already processed and skip re-execution.
     - If `entityType === "sale"` and `action === "CREATE"`:
       - Insert into `sale` table with client-provided `id`. If primary key collision exists, ignore or update.
     - If `entityType === "debt"` and `action === "SETTLE"`:
       - Update `sale` set `status = 'settled'`, `paidAt = payload.paidAt || now()`.
     - If `entityType === "expense"` and `action === "CREATE"`:
       - Insert into `expense` table with client-provided `id`.
     - Insert `mutation_id` into `sync_idempotency`.
  3. Return `{ success: true, processedMutationIds: string[], rejectedMutations: any[] }`.
- **Detailed Specifications for `pullDeltaChanges`**:
  1. If `since` is provided:
     - Query `sale` where `businessId = ? AND updatedAt > since`
     - Query `expense` where `businessId = ? AND updatedAt > since`
     - Query `branch` where `businessId = ? AND updatedAt > since`
  2. If `since` is omitted (initial sync):
     - Query all records for `businessId`.
  3. Return `{ serverTimestamp: new Date().toISOString(), changes: { sales, expenses, branches } }`.

---

### Step 3.4: Controller, Route & Server Integration
- **Target File**: [backend/src/controllers/sync.controller.ts](file:///home/eaglex/Documents/insa-ctc/FinalProject/backend/src/controllers/sync.controller.ts) (NEW)
- **Target File**: [backend/src/routes/sync.routes.ts](file:///home/eaglex/Documents/insa-ctc/FinalProject/backend/src/routes/sync.routes.ts) (NEW)
- **Target File**: [backend/src/index.ts](file:///home/eaglex/Documents/insa-ctc/FinalProject/backend/src/index.ts)
- **Action**: Expose `/api/sync/push` and `/api/sync/pull` protected by `requireAuth`.
- **Detailed Specifications**:
  1. In `sync.routes.ts`:
     - `router.post("/push", requireAuth, syncController.pushMutations);`
     - `router.get("/pull", requireAuth, syncController.pullChanges);`
  2. In `backend/src/index.ts`:
     - `import syncRoutes from "./routes/sync.routes";`
     - `app.use("/api/sync", syncRoutes);`

---

## 6. Phase 4: Mobile Sync Worker & Network Automation (Mobile)

### Objective
Build the client-side background sync engine that pushes queued mutations to the backend, pulls remote deltas, updates local SQLite, and coordinates with network connectivity listeners.

---

### Step 4.1: Sync Engine Core Service
- **Target File**: [mobile/src/service/sync-engine.ts](file:///home/eaglex/Documents/insa-ctc/FinalProject/mobile/src/service/sync-engine.ts) (NEW)
- **Action**: Implement the sync orchestration worker.
- **Detailed Specifications**:
  1. **Locking Mechanism**: Maintain `private isSyncing = false` boolean flag to prevent simultaneous overlapping sync executions.
  2. **Step 1 - Push Pending**:
     - Fetch up to 50 items from `sync_queue` with status `'pending'`.
     - If queue is not empty:
       - Make HTTP `POST /api/sync/push` with active businessId and mutation array.
       - On success: delete processed mutations from `sync_queue` via `markMutationsProcessed()`.
       - Update matching records in `local_sale` and `local_expense` to `sync_status = 'synced'`.
       - On network error: increment retry count and trigger exponential backoff.
  3. **Step 2 - Pull Delta**:
     - Query `sync_metadata` for key `'last_pulled_at'`.
     - Make HTTP `GET /api/sync/pull?businessId=...&since=...`.
     - In an SQLite transaction:
       - Upsert received sales into `local_sale` (only overwrite if local record is in `'synced'` state; do not overwrite if local has `'pending_update'`).
       - Upsert received expenses into `local_expense`.
       - Upsert received branches into `local_branch`.
       - Update `sync_metadata` key `'last_pulled_at'` with `serverTimestamp`.
  4. **Step 3 - Store Notification**:
     - Dispatch event or callback to notify active Zustand stores (`useSalesStore`, `useBidrStore`) to refresh display lists.

---

### Step 4.2: Network State Listener & Lifecycle Automation
- **Target File**: [mobile/src/hooks/use-network-sync.ts](file:///home/eaglex/Documents/insa-ctc/FinalProject/mobile/src/hooks/use-network-sync.ts) (NEW)
- **Action**: Create hook to auto-trigger sync on connectivity events.
- **Detailed Specifications**:
  1. Monitor network via `expo-network`:
     - Register `Network.addNetworkStateListener(state => ...)`.
     - When `state.isConnected && state.isInternetReachable`:
       - Trigger `syncEngine.sync(activeBusinessId)`.
  2. Monitor app state via React Native `AppState`:
     - Register `AppState.addEventListener('change', nextAppState => ...)`
     - When transitioning to `'active'`:
       - Trigger `syncEngine.sync(activeBusinessId)`.
  3. Periodic Heartbeat:
     - Run `setInterval` every 3 minutes while app is in foreground and online.
  4. Export `useNetworkSync()` and mount in root layout [mobile/src/app/_layout.tsx](file:///home/eaglex/Documents/insa-ctc/FinalProject/mobile/src/app/_layout.tsx).

---

## 7. Phase 5: Zustand Store Adaptation & UI Integration (Mobile)

### Objective
Update existing Zustand stores so that reads and writes interact directly with local repositories. The UI operates with 0ms latency, and background sync happens transparently.

---

### Step 5.1: Refactor `useSalesStore`
- **Target File**: [mobile/src/store/sales-store.ts](file:///home/eaglex/Documents/insa-ctc/FinalProject/mobile/src/store/sales-store.ts)
- **Action**: Modify actions to use local SQLite repositories.
- **Detailed Specifications**:
  1. `fetchData(businessId, branchId)`:
     - Read immediately from `localSalesRepo.getSales(businessId, branchId)` and `localExpensesRepo.getExpenses(...)`.
     - Call `set({ sales, expenses, isLoading: false })`.
     - If online, trigger background `syncEngine.sync(businessId)`.
  2. `addSale(businessId, branchId, entry)`:
     - Call `localSalesRepo.createSaleAtomic(...)`.
     - Instantly append new sale to state: `set(state => ({ sales: [newSale, ...state.sales] }))`.
     - Trigger non-blocking background sync: `syncEngine.sync(businessId).catch(() => {})`.
     - Returns `newSale` immediately (no loading spinner required).
  3. `addExpense(businessId, branchId, entry)`:
     - Call `localExpensesRepo.createExpenseAtomic(...)`.
     - Instantly append to state: `set(state => ({ expenses: [newExpense, ...state.expenses] }))`.
     - Trigger non-blocking background sync.

---

### Step 5.2: Refactor `useBidrStore`
- **Target File**: [mobile/src/store/bidr-store.ts](file:///home/eaglex/Documents/insa-ctc/FinalProject/mobile/src/store/bidr-store.ts)
- **Action**: Modify actions to use local Bidr repository.
- **Detailed Specifications**:
  1. `fetchData(businessId, branchId)`:
     - Read debts from `localBidrRepo.getDebts(businessId, branchId, filters)`.
     - Read summary from `localBidrRepo.getDebtSummaryMetric(businessId, branchId)`.
     - Set state immediately.
  2. `create(payload)`:
     - Call `localBidrRepo.createDebtAtomic(payload)`.
     - Update state immediately: prepend to `debts`, recalculate local summary.
     - Trigger background sync.
  3. `settle(id, payload, businessId, branchId)`:
     - Call `localBidrRepo.settleDebtAtomic(id, payload)`.
     - Update debt status in state to `'settled'`.
     - Trigger background sync.
  4. `update(id, payload, businessId, branchId)`:
     - Call `localBidrRepo.updateDebtAtomic(id, payload)`.
     - Update item in state.
     - Trigger background sync.

---

### Step 5.3: Offline Dashboard Metric Hydration
- **Target File**: [mobile/src/app/(tabs)/index.tsx](file:///home/eaglex/Documents/insa-ctc/FinalProject/mobile/src/app/(tabs)/index.tsx)
- **Action**: Calculate dashboard hero numbers from local SQLite.
- **Detailed Specifications**:
  1. In `HomeScreen`, call `localSalesRepo.getTodayRevenueMetric(businessId)` and `localBidrRepo.getDebtSummaryMetric(businessId)`.
  2. Display "Today's Total Revenue", "Estimated Profit", and "Registered Dube(debt)" directly from local database queries.
  3. Dashboard renders immediately upon opening, even in Airplane mode.

---

### Step 5.4: Sync Status UI Indicator
- **Target File**: [mobile/src/components/common/sync-status-badge.tsx](file:///home/eaglex/Documents/insa-ctc/FinalProject/mobile/src/components/common/sync-status-badge.tsx) (NEW)
- **Target File**: [mobile/src/components/navigation/hamburger-drawer.tsx](file:///home/eaglex/Documents/insa-ctc/FinalProject/mobile/src/components/navigation/hamburger-drawer.tsx)
- **Action**: Provide clear, subtle visual feedback to the merchant.
- **Detailed Specifications**:
  1. When offline (`!isConnected`):
     - Display a compact amber badge: `"Offline Mode (Changes saved locally)"`.
  2. When pending mutations exist (`pendingCount > 0`):
     - Display: `"Syncing (3 pending)..."`.
  3. When fully synced:
     - Display green check icon or hide to keep header minimalist and clean.

---

## 8. Phase 6: Edge Case Hardening, Testing & Verification

### Objective
Systematically test and verify resilience against packet drops, device reboots, and network disconnects.

---

### Step 6.1: Airplane Mode Offline Point-of-Sale Test
1. Turn on Android **Airplane Mode** (no Wi-Fi, no mobile data).
2. Open NetWorth Ethiopia mobile app.
3. Record 3 instant sales with cash and Telebirr.
4. Record 1 customer Dube debt for 750 ETB.
5. Settle an existing Dube debt.
6. Verify UI:
   - Sales tab shows all new sales immediately.
   - Bidr tab shows debt as settled and new debt listed.
   - Dashboard reflects updated Today's Revenue and Registered Dube instantly.
   - Status badge shows `"Offline Mode (5 pending)"`.

---

### Step 6.2: App Force-Kill & Crash Durability Test
1. While still in Airplane Mode, swipe away and force-close the app from Android recent apps.
2. Relaunch the app.
3. Verify:
   - All newly recorded sales, expenses, and debts are still present in local SQLite.
   - `sync_queue` still contains the 5 pending mutations.
   - Zero data loss occurred during process termination.

---

### Step 6.3: Auto-Replication & Idempotency Verification
1. Turn off Airplane Mode (reconnect to Wi-Fi / ADB host).
2. Observe sync indicator: changes to `"Syncing..."` then `"All synced"`.
3. Inspect backend PostgreSQL:
   - Verify the 3 sales, 1 Dube debt, and 1 settlement appear with matching client UUIDs.
   - Verify `sync_idempotency` contains entries for each mutation.
4. Trigger manual pull-to-refresh to verify no duplicate records are generated.
