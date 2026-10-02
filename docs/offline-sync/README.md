# Offline-First Architecture & Sync Plan — NetWorth Ethiopia

## 1. Executive Summary

NetWorth Ethiopia is a mission-critical financial management and bookkeeping application tailored for Ethiopian micro, small, and medium businesses (MSMEs). A core operational reality in Ethiopia is intermittent connectivity: cellular network fluctuations, power outages affecting Wi-Fi routers, and travel between regional trading centers.

Currently, NetWorth requires an active network connection for all mutations (creating sales, recording expenses, issuing customer credit/dube, settling debts) and queries. If connectivity is lost, the application fails, blocking shopkeepers from recording transactions at the point of sale.

This document outlines the **Offline-First Synchronization Architecture**. Under this architecture:
1. **100% Offline Capability**: All reads, writes, searches, and dashboard metrics work instantly without any active network connection.
2. **Local Relational Database (SQLite via `expo-sqlite`)**: High-performance, ACID-compliant local storage on the Android device.
3. **Outbox Mutation Queue (`sync_queue`)**: Offline actions are queued locally in transactional order with client-generated UUIDs.
4. **Bidirectional Delta Synchronization**: When connectivity resumes, queued mutations are pushed upstream with idempotency guarantees, and remote updates are pulled downstream.
5. **Zero UI Blocking**: The user interface is decoupled from network latency, eliminating loading spinners for everyday point-of-sale actions.

---

## 2. System Flow Overview (Textual Architecture)

The system operates across three coordinated tiers:

### Tier 1: UI & State Layer (Client)
- UI screens ([HomeScreen](file:///home/eaglex/Documents/insa-ctc/FinalProject/mobile/src/app/(tabs)/index.tsx), [SalesScreen](file:///home/eaglex/Documents/insa-ctc/FinalProject/mobile/src/app/(tabs)/sales.tsx), [BidrScreen](file:///home/eaglex/Documents/insa-ctc/FinalProject/mobile/src/app/(tabs)/bidr.tsx)) bind directly to Zustand stores (`useSalesStore`, `useBidrStore`, `useBusinessStore`).
- User actions (e.g. "+ New Sale", "Log Expense", "Settle Dube") trigger asynchronous store actions that return immediately (0ms user wait time).

### Tier 2: Local Database & Outbox Layer (Client SQLite)
- Handled by `expo-sqlite` in Write-Ahead Logging (WAL) mode.
- When an entity is created or modified:
  1. An RFC 4122 v4 UUID is generated on device (`crypto.randomUUID()`).
  2. Inside a single SQLite ACID transaction, the entity is inserted/updated in the local table (`local_sale`, `local_expense`), and an action record is added to `sync_queue`.
  3. The local database is immediately queryable for aggregated metrics (Today's Total Revenue, Registered Dube, Estimated Profit) without contacting the backend.

### Tier 3: Asynchronous Replication Layer (Sync Engine & Express Backend)
- A background worker (`sync-engine.ts`) listens to network connectivity (`expo-network`) and application lifecycle events (`AppState`).
- When connectivity is detected:
  1. **Push Phase**: Batches up to 50 pending items from `sync_queue` to `POST /api/sync/push`. The backend processes mutations inside a PostgreSQL database transaction with idempotency checks.
  2. **Acknowledge Phase**: Client receives confirmation of processed mutation IDs, deletes them from `sync_queue`, and updates entity status to `synced`.
  3. **Pull Phase**: Client requests changed records since the last sync timestamp via `GET /api/sync/pull?since=...`.
  4. **Merge Phase**: Client upserts incoming changes into local SQLite and refreshes active Zustand state.

---

## 3. Directory Navigation

The offline sync documentation is structured into the following specialized modules:

| Document | Focus & Content |
| :--- | :--- |
| **[1. Detailed Implementation Plan](file:///home/eaglex/Documents/insa-ctc/FinalProject/docs/offline-sync/implementation-roadmap.md)** | Step-by-step 6-phase engineering plan, complete file implementation matrix, exact function specifications, and verification tests. |
| **[2. SQLite Evaluation](file:///home/eaglex/Documents/insa-ctc/FinalProject/docs/offline-sync/sqlite-evaluation.md)** | Comprehensive comparison of `expo-sqlite` vs MMKV, AsyncStorage, WatermelonDB, and Realm across feasibility, performance, memory, code quality, and Android compatibility. |
| **[3. Sync Architecture & Protocol](file:///home/eaglex/Documents/insa-ctc/FinalProject/docs/offline-sync/sync-architecture-and-protocol.md)** | Local DDL schema, transactional outbox design, API payloads (`push`/`pull`), and conflict resolution rules. |

---

## 4. Key Architectural Decisions at a Glance

1. **Local Database Engine**: **`expo-sqlite`**
   - *Rationale*: Native C performance, zero third-party native compilation friction in Expo SDK 57, direct support for SQL aggregations (revenue, dube totals offline), and direct architectural alignment with backend relational models.
2. **Identifier Generation**: **Client-side UUIDv4 (`crypto.randomUUID()`)**
   - *Rationale*: Eliminates temporary IDs and complex foreign key remapping. Every sale, expense, and debt has its permanent production UUID at the moment of creation offline.
3. **Queue Strategy**: **Persistent Transactional Outbox**
   - *Rationale*: Mutations are saved in SQLite within the same ACID transaction as the business entity. Even if the phone battery dies or the OS terminates the app, zero data is lost.
4. **Sync Triggering**: **Multi-trigger Hybrid**
   - *Rationale*: Network reconnect listener (`expo-network`), application foregrounding (`AppState`), periodic timer (every 3 minutes when online), and manual pull-to-refresh.
5. **Conflict Resolution**:
   - **Sales & Expenses**: Immutable append-only ledger entries. Duplicate prevention through idempotency keys.
   - **Dube (Debt) Status**: Terminal state wins for settlements; Last-Write-Wins with timestamp verification for profile/note updates.
