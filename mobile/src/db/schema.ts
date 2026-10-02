/**
 * DDL Schema and TypeScript definitions for the local SQLite database.
 * Matches backend PostgreSQL models while incorporating offline sync tracking columns.
 */

export interface LocalSaleRow {
  id: string;
  business_id: string;
  branch_id: string;
  sale_type: 'instant' | 'dube';
  payment_method: string;
  description: string;
  amount: number;
  customer_name: string | null;
  customer_phone: string | null;
  due_date: string | null;
  status: 'pending' | 'settled' | 'overdue' | 'voided';
  notes: string | null;
  paid_at: string | null;
  sync_status: 'synced' | 'pending_create' | 'pending_update' | 'pending_delete';
  created_at: string;
  updated_at: string;
}

export interface LocalExpenseRow {
  id: string;
  business_id: string;
  branch_id: string;
  description: string;
  amount: number;
  category: string;
  notes: string | null;
  sync_status: 'synced' | 'pending_create' | 'pending_update' | 'pending_delete';
  created_at: string;
  updated_at: string;
}

export interface LocalBranchRow {
  id: string;
  business_id: string;
  name: string;
  location: string | null;
  is_active: number; // 1 = true, 0 = false
  updated_at: string;
}

export interface SyncQueueRow {
  id: number;
  mutation_id: string;
  entity_type: 'sale' | 'expense' | 'debt' | 'branch';
  entity_id: string;
  action: 'CREATE' | 'UPDATE' | 'SETTLE' | 'DELETE';
  payload: string; // JSON string
  retry_count: number;
  last_error: string | null;
  status: 'pending' | 'processing' | 'failed';
  created_at: string;
}

export interface SyncMetadataRow {
  key: string;
  value: string;
  updated_at: string;
}

export const CREATE_TABLES_SQL = `
-- 1. Local Sales & Dube Table
CREATE TABLE IF NOT EXISTS local_sale (
  id TEXT PRIMARY KEY NOT NULL,
  business_id TEXT NOT NULL,
  branch_id TEXT NOT NULL,
  sale_type TEXT CHECK(sale_type IN ('instant', 'dube')) NOT NULL,
  payment_method TEXT NOT NULL,
  description TEXT NOT NULL,
  amount INTEGER NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,
  due_date TEXT,
  status TEXT CHECK(status IN ('pending', 'settled', 'overdue', 'voided')) NOT NULL,
  notes TEXT,
  paid_at TEXT,
  sync_status TEXT DEFAULT 'pending_create' NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_local_sale_biz ON local_sale(business_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_local_sale_branch ON local_sale(branch_id);
CREATE INDEX IF NOT EXISTS idx_local_sale_status ON local_sale(status);
CREATE INDEX IF NOT EXISTS idx_local_sale_type ON local_sale(sale_type);

-- 2. Local Expenses Table
CREATE TABLE IF NOT EXISTS local_expense (
  id TEXT PRIMARY KEY NOT NULL,
  business_id TEXT NOT NULL,
  branch_id TEXT NOT NULL,
  description TEXT NOT NULL,
  amount INTEGER NOT NULL,
  category TEXT NOT NULL,
  notes TEXT,
  sync_status TEXT DEFAULT 'pending_create' NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_local_expense_biz ON local_expense(business_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_local_expense_branch ON local_expense(branch_id);

-- 3. Local Branches Table
CREATE TABLE IF NOT EXISTS local_branch (
  id TEXT PRIMARY KEY NOT NULL,
  business_id TEXT NOT NULL,
  name TEXT NOT NULL,
  location TEXT,
  is_active INTEGER DEFAULT 1 NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_local_branch_biz ON local_branch(business_id);

-- 4. Sync Outbox Queue (FIFO Mutation Log)
CREATE TABLE IF NOT EXISTS sync_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mutation_id TEXT UNIQUE NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  payload TEXT NOT NULL,
  retry_count INTEGER DEFAULT 0 NOT NULL,
  last_error TEXT,
  status TEXT DEFAULT 'pending' NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sync_queue_pending ON sync_queue(status, id ASC);
CREATE INDEX IF NOT EXISTS idx_sync_queue_mutation ON sync_queue(mutation_id);

-- 5. Sync Metadata Store (Timestamps & Cursors)
CREATE TABLE IF NOT EXISTS sync_metadata (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
`;
