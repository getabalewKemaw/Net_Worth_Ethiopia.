# Sales Staff Interface — Schema & Data Model Specification

This document details the PostgreSQL Drizzle schema, SQLite local tables, index configurations, and database migrations required for the **Sales Staff Interface & Branch Assignment** engine.

---

## 1. Relational Entity Relationship Diagram (ERD)

```
┌─────────────────────────────────────────────────────────────┐
│                          user                               │
│  • id (PK)   • email (Unique)   • name                      │
└──────────────┬───────────────────────────────┬──────────────┘
               │ 1:N                           │ 1:N
               ▼                               ▼
┌──────────────────────────────┐ ┌──────────────────────────────┐
│          business            │ │       staff_assignment       │
│  • id (PK)                   │ │  • id (PK)                   │
│  • user_id (Owner FK)        │ │  • business_id (FK)          │
│  • name                      │ │  • branch_id (FK - Branch)   │
└──────────────┬───────────────┘ │  • user_id (FK - Staff User) │
               │ 1:N             │  • email (Normalized lookup) │
               ▼                 │  • role ('sales')            │
┌──────────────────────────────┐ │  • status ('pending'/'active')│
│           branch             │ └──────────────┬───────────────┘
│  • id (PK)                   │                │
│  • business_id (FK)          │                │
│  • name, address             │                │
└──────────────┬───────────────┘                │
               │ 1:N                            │
               ▼                                │
┌──────────────────────────────┐                │
│             sale             │◄───────────────┘
│  • id (PK)                   │ (recorded_by_id / name)
│  • business_id (FK)          │
│  • branch_id (FK - Auto)     │
│  • sale_type ('instant'/'dube')
│  • recorded_by_id (User FK)  │
│  • recorded_by_name (String) │
└──────────────────────────────┘
```

---

## 2. Backend PostgreSQL Drizzle Schema (`backend/src/db/staff-management.ts`)

```typescript
import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, index, uniqueIndex } from "drizzle-orm/pg-core";
import { user } from "./schema";
import { business, branch } from "./business-branch-management";

export const staffAssignment = pgTable(
  "staff_assignment",
  {
    id: text("id").primaryKey(), // UUID
    businessId: text("business_id")
      .notNull()
      .references(() => business.id, { onDelete: "cascade" }),
    branchId: text("branch_id")
      .notNull()
      .references(() => branch.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .references(() => user.id, { onDelete: "set null" }), // NULL until user registers/claims invite
    email: text("email").notNull(), // Normalized lowercase email
    name: text("name"), // Staff member's display name or nickname assigned by owner
    role: text("role").default("sales").notNull(), // 'sales' | 'manager'
    status: text("status").default("pending").notNull(), // 'pending' | 'active' | 'suspended'
    invitedAt: timestamp("invited_at").defaultNow().notNull(),
    acceptedAt: timestamp("accepted_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("staff_assignment_business_idx").on(table.businessId),
    index("staff_assignment_branch_idx").on(table.branchId),
    index("staff_assignment_email_idx").on(table.email),
    index("staff_assignment_user_idx").on(table.userId),
    uniqueIndex("staff_biz_email_unique_idx").on(table.businessId, table.email),
  ]
);

export const staffAssignmentRelations = relations(staffAssignment, ({ one }) => ({
  business: one(business, {
    fields: [staffAssignment.businessId],
    references: [business.id],
  }),
  branch: one(branch, {
    fields: [staffAssignment.branchId],
    references: [branch.id],
  }),
  user: one(user, {
    fields: [staffAssignment.userId],
    references: [user.id],
  }),
}));
```

---

## 3. Transaction Attribution Extensions (`sale` & `expense`)

To ensure the owner's daily settlement log and shift reports identify which staff member processed each transaction with **0ms runtime latency**, we extend `sale` and `expense` tables:

### Changes to `sale` (`backend/src/db/sales-expense-management.ts`)
```typescript
// Added to sale table:
recordedById: text("recorded_by_id").references(() => user.id, { onDelete: "set null" }),
recordedByName: text("recorded_by_name"), // Denormalized for instant UI render without JOINs
```

### Changes to `expense` (`backend/src/db/sales-expense-management.ts`)
```typescript
// Added to expense table:
recordedById: text("recorded_by_id").references(() => user.id, { onDelete: "set null" }),
recordedByName: text("recorded_by_name"),
```

---

## 4. Mobile SQLite Local Schema (`mobile/src/db/schema.ts`)

To support offline counter operations, SQLite mirrors these tables:

### 4.1 `local_staff_assignment` DDL
```sql
CREATE TABLE IF NOT EXISTS local_staff_assignment (
  id TEXT PRIMARY KEY NOT NULL,
  business_id TEXT NOT NULL,
  branch_id TEXT NOT NULL,
  user_id TEXT,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'sales',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_local_staff_biz ON local_staff_assignment (business_id);
CREATE INDEX IF NOT EXISTS idx_local_staff_branch ON local_staff_assignment (branch_id);
CREATE INDEX IF NOT EXISTS idx_local_staff_email ON local_staff_assignment (email);
```

### 4.2 SQLite Migration Version 4 (`mobile/src/db/migrations.ts`)
```typescript
export const CURRENT_SCHEMA_VERSION = 4;

// Migration version 3 -> 4:
{
  version: 4,
  description: 'Add local_staff_assignment and transaction attribution columns',
  up: async (db) => {
    // 1. Create staff assignment table
    await db.execAsync(`...local_staff_assignment DDL...`);

    // 2. Add attribution columns to local_sale
    await db.execAsync(`ALTER TABLE local_sale ADD COLUMN recorded_by_id TEXT;`);
    await db.execAsync(`ALTER TABLE local_sale ADD COLUMN recorded_by_name TEXT;`);

    // 3. Add attribution columns to local_expense
    await db.execAsync(`ALTER TABLE local_expense ADD COLUMN recorded_by_id TEXT;`);
    await db.execAsync(`ALTER TABLE local_expense ADD COLUMN recorded_by_name TEXT;`);
  }
}
```

---

## 5. High-Performance Shift Aggregation Queries

### Daily Shift Drawer Query (Staff Counter POS)
Computes cash in drawer and digital collections directly from local SQLite for the current shift:
```sql
SELECT 
  payment_method,
  COUNT(id) AS tx_count,
  SUM(amount) AS total_volume
FROM local_sale
WHERE branch_id = ? 
  AND sale_type != 'dube'
  AND (date(created_at, 'localtime') = date('now', 'localtime') OR created_at LIKE ?)
GROUP BY payment_method;
```

### Daily Branch Debt Settlement Query (Owner Digest)
Aggregates debts recovered today grouped by branch and staff member:
```sql
SELECT 
  s.id,
  s.branch_id,
  s.amount,
  s.payment_method,
  s.customer_name,
  s.customer_phone,
  s.recorded_by_name,
  s.created_at
FROM local_sale s
WHERE s.business_id = ?
  AND s.sale_type = 'dube'
  AND s.status = 'settled'
  AND (date(s.updated_at, 'localtime') = date('now', 'localtime') OR s.updated_at LIKE ?)
ORDER BY s.updated_at DESC;
```
