# Text & SMS Bank Fetching — Step-by-Step Implementation Plan

This document details the complete, phase-by-phase implementation plan for integrating automated Ethiopian banking SMS transaction fetching, parsing, grouping, and bookkeeping conversion into NetWorth Ethiopia.

---

## Phase Breakdown Matrix

| Phase | Title | Primary Deliverables | Target Files |
| :--- | :--- | :--- | :--- |
| **Phase 1** | **Native Access & Module Setup** | Android permissions, Local Expo Module (Kotlin), safe runtime module loader, and mock data engine. | `modules/expo-sms-inbox/*`<br>`app.json`<br>`src/lib/sms-reader.ts` |
| **Phase 2** | **Bank Parser Registry & Regex Engine** | Deterministic extractors for telebirr, CBE, Awash, BOA, Dashen with unit tests. | `src/features/text-fetching/parsers/*`<br>`src/tests/sms-parsers.test.ts` |
| **Phase 3** | **Local SQLite Storage & Deduplication** | `local_bank_sms` table, unique index on Txn Ref, CRUD repository, and migrations. | `src/db/schema.ts`<br>`src/db/migrations.ts`<br>`src/repositories/local-sms.repo.ts` |
| **Phase 4** | **State Management & Service Layer** | Fetch orchestrator service, Zustand store, provider grouping, and balance aggregation. | `src/service/text-fetching.ts`<br>`src/store/text-fetching-store.ts` |
| **Phase 5** | **Merchant Actionable Inbox UI** | Screen revamp: Bank carousel, provider pill filters, transaction cards, and scan button. | `src/app/(tabs)/text-fetching.tsx`<br>`src/components/text-fetching/*` |
| **Phase 6** | **Bookkeeping Conversion Modals** | 1-tap conversion to Sales, Expenses, and Bidr (debt) settlement with pre-filled inputs. | `src/features/text-fetching/modals/*`<br>`src/service/sales.ts`<br>`src/service/bidr.ts` |
| **Phase 7** | **Verification, Edge Cases & Testing** | Unit tests, physical Android USB testing, deduplication verification, and documentation. | `src/tests/*`<br>`docs/text-fetch/report/*` |

---

## Phase 1: Native Access & Module Setup

### Objectives
Establish direct, secure, and privacy-restricted access to Android's SMS inbox with runtime permission handling, graceful fallback for iOS/Web, and a mock test mode.

### Steps
1. **Declare Android Permissions in Expo Config**:
   - Update `mobile/app.json` to include `"android.permission.READ_SMS"` under `android.permissions`.
2. **Create Local Expo Module (`mobile/modules/expo-sms-inbox/`)**:
   - Create `expo-module.config.json` registering the native module.
   - Implement `ExpoSmsInboxModule.kt` in Kotlin:
     - Check runtime permission `READ_SMS`.
     - Query `Telephony.Sms.Inbox.CONTENT_URI` filtering strictly by bank sender addresses (`address IN ('127', 'telebirr', 'CBE', 'CBEBirr', '889', 'AWASH', 'BOA', 'DashenBank')`).
     - Project columns: `_id`, `address`, `body`, `date`.
     - Order by `date DESC LIMIT 200`.
   - Implement `index.ts` defining TypeScript exports:
     ```typescript
     export interface NativeSmsRecord {
       id: string;
       address: string;
       body: string;
       date: number;
     }
     export function isSmsReaderAvailable(): boolean;
     export function requestSmsPermissions(): Promise<boolean>;
     export function fetchBankSmsMessages(): Promise<NativeSmsRecord[]>;
     ```
3. **Build Safe Runtime Module Loader (`mobile/src/lib/sms-reader.ts`)**:
   - Use `requireOptionalNativeModule('ExpoSmsInbox')`.
   - If running on Expo Go, iOS, or Web, switch cleanly to the **Mock SMS Engine** without crashing.
4. **Implement Mock Bank SMS Generator (`mobile/src/mocks/mock-bank-sms.ts`)**:
   - Include realistic Ethiopian bank messages (telebirr, CBE, Awash, BoA) with varying dates and amounts for dev and emulator testing.

---

## Phase 2: Bank Parser Registry & Regex Engine

### Objectives
Extract structured financial entities (amount, type, reference, counterparty, account, balance) from raw bank text messages with zero latency and 100% precision.

### Steps
1. **Define Core Types (`mobile/src/types/text-fetching.ts`)**:
   - `BankProvider`: `'telebirr' | 'cbe' | 'awash' | 'boa' | 'dashen' | 'unknown'`
   - `TransactionFlow`: `'deposit' | 'expense' | 'unknown'`
   - `ParsedBankTransaction`: amount, currency, transactionRef, counterparty, accountMasked, balance, timestamp, confidenceScore.
2. **Implement Bank-Specific Parsers (`mobile/src/features/text-fetching/parsers/`)**:
   - `telebirr.parser.ts`:
     - Matches incoming: `"you have received ETB <amount> from <payer> with transaction number: <ref>"`
     - Matches outgoing: `"you have transferred ETB <amount> to <payee> with transaction number: <ref>"`
     - Extracts current balance and timestamp.
   - `cbe.parser.ts`:
     - Matches credit: `"Your account <acc> has been credited with ETB <amount> on <date> by <payer>. Ref: <ref>"`
     - Matches debit: `"Your account <acc> has been debited with ETB <amount> ... Ref: <ref>"`
     - Handles CBEBirr shortcodes (`889`, `829`).
   - `awash.parser.ts`:
     - Matches `"A/C <acc> has been credited by ETB <amount> from <payer> ... Txn ID: <ref>"`.
   - `boa.parser.ts`:
     - Matches `"ETB <amount> has been credited to your account <acc> ... Ref: <ref>"`.
   - `dashen.parser.ts`:
     - Matches Amole and Dashen Bank transfer notices.
   - `generic-fallback.parser.ts`:
     - Fallback extractor looking for keywords (`ETB`, `credited`, `debited`, `Ref:`, `Txn:`) if an unlisted Ethiopian microfinance or new bank sends an SMS.
3. **Create Parser Registry Orchestrator (`parser-registry.ts`)**:
   - Detects the provider by sender address or message body signatures.
   - Executes the targeted parser and returns the structured `ParsedBankTransaction`.
4. **Create Parser Unit Test Suite (`mobile/src/tests/sms-parsers.test.ts`)**:
   - Test against 25+ real Ethiopian SMS text vectors to verify exact amount parsing, comma decimal handling (e.g. `1,250.50`), and reference extraction.

---

## Phase 3: Local SQLite Storage & Deduplication Layer

### Objectives
Persist parsed SMS records in local SQLite with strict idempotency guarantees, avoiding duplicate sales or expenses.

### Steps
1. **Extend Schema (`mobile/src/db/schema.ts`)**:
   - Add `LocalBankSmsRow` interface and `CREATE TABLE local_bank_sms` SQL with `UNIQUE(transaction_ref)`.
2. **Create Database Migration (`mobile/src/db/migrations.ts`)**:
   - Increment database version and run `CREATE TABLE IF NOT EXISTS local_bank_sms` safely.
3. **Implement Repository (`mobile/src/repositories/local-sms.repo.ts`)**:
   - `insertOrIgnoreBatch(transactions: ParsedBankTransaction[])`: Uses `INSERT OR IGNORE` so duplicate scans succeed silently without altering existing records.
   - `getTransactions(filter?: { provider?: string; status?: string; flow?: string })`: Retrieves sorted list of SMS records.
   - `updateStatus(id: string, status: SmsImportStatus, convertedEntityId?: string)`: Marks an SMS as `converted_sale`, `converted_expense`, `settled_debt`, or `ignored`.
   - `getProviderSummaries(businessId: string)`: Returns grouped metrics (total deposits, total expenses, count) per bank provider.

---

## Phase 4: State Management & Service Layer

### Objectives
Orchestrate the end-to-end flow from native scan to local caching and provide reactive state to UI screens.

### Steps
1. **Implement Text Fetching Service (`mobile/src/service/text-fetching.ts`)**:
   - `scanAndProcessInbox()`:
     1. Fetches raw SMS via native module (or mock engine).
     2. Runs parser registry over each message.
     3. Inserts valid parsed messages into local SQLite via `localSmsRepo`.
     4. Returns newly discovered count.
2. **Implement Zustand Store (`mobile/src/store/text-fetching-store.ts`)**:
   - State variables:
     - `transactions: ParsedBankTransaction[]`
     - `providerSummaries: Record<BankProvider, ProviderSummary>`
     - `selectedProvider: BankProvider | 'all'`
     - `selectedStatus: SmsImportStatus | 'all'`
     - `isScanning: boolean`
     - `lastScanTime: string | null`
     - `useMockData: boolean` (toggle for testing)
   - Store Actions:
     - `scanInbox()`: Initiates scan, updates store, returns summary toast.
     - `loadSavedTransactions()`: Hydrates store from SQLite on startup.
     - `setProviderFilter(provider)`: Filters the active view.
     - `setStatusFilter(status)`: Filters between Pending, Converted, and Ignored.
     - `dismissTransaction(id)`: Marks an SMS as ignored.
     - `toggleMockMode()`: Switches between live Android SMS and mock demo data.

---

## Phase 5: Merchant Actionable Inbox UI

### Objectives
Replace the placeholder in `mobile/src/app/(tabs)/text-fetching.tsx` with a high-end, responsive merchant dashboard.

### Steps
1. **Top Header & Scan Controls**:
   - Title: **Bank & SMS Fetching** (`💬`).
   - Action bar: "Scan Now" button with animated loading spinner during active scan.
   - "Last scanned: 2 mins ago" status indicator.
   - Mock Data indicator badge when running in development/emulator.
2. **Bank Accounts Summary Carousel (`mobile/src/components/text-fetching/provider-carousel.tsx`)**:
   - Horizontal scrollable cards:
     - **telebirr**: Cyan card with balance, `+ETB 14,200` deposits, `-ETB 1,800` expenses, and transaction count.
     - **CBE / CBE Birr**: Purple card with balance, `+ETB 38,500` deposits, `-ETB 6,200` expenses.
     - **Awash Bank**: Orange card with balance and totals.
     - **Bank of Abyssinia**: Gold card with totals.
   - Tapping a card immediately filters the transaction list by that bank.
3. **Filter Pills**:
   - Provider pills: `[All]`, `[telebirr]`, `[CBE]`, `[Awash]`, `[BOA]`, `[Dashen]`.
   - Status pills: `[All]`, `[Pending Action]`, `[Converted]`, `[Ignored]`.
4. **Transaction Cards (`mobile/src/components/text-fetching/transaction-card.tsx`)**:
   - Provider badge with brand colors.
   - Flow badge: Green `↓ Received` for deposits, Red `↑ Sent` for expenses.
   - Prominent amount: `+450.00 ETB`.
   - Payer/Payee name and phone number.
   - Masked account (e.g. `1000****1234`) and transaction reference code (`FT...`).
   - Quick Action Buttons:
     - `[+ Convert to Sale]` (for incoming deposits).
     - `[- Convert to Expense]` (for outgoing transfers).
     - `[🤝 Settle Bidr]` (if debt match found).
     - `[✕ Ignore]` (removes from pending list).

---

## Phase 6: Bookkeeping Conversion & Settlement Modals

### Objectives
Enable 1-tap conversion of parsed SMS items directly into the merchant's official books, automatically triggering offline synchronization.

### Steps
1. **Convert to Sale Modal (`mobile/src/features/text-fetching/modals/convert-to-sale-modal.tsx`)**:
   - Opens pre-filled with:
     - Amount from SMS (e.g. `450.00`).
     - Customer name and phone from SMS.
     - Payment Method set to `telebirr` or `cbe`.
     - Description: `"Sale via " + provider`.
     - Notes: `"SMS Ref: " + transactionRef`.
   - On confirmation: calls `salesService.createSale()`, updates local SQLite, adds to `sync_queue`, and marks SMS as `converted_sale`.
2. **Convert to Expense Modal (`mobile/src/features/text-fetching/modals/convert-to-expense-modal.tsx`)**:
   - Opens pre-filled with amount and payee.
   - Category selector (`Utilities`, `Supplier`, `Inventory`, `Rent`, `Other`).
   - On confirmation: calls `expensesService.createExpense()` and marks SMS as `converted_expense`.
3. **Bidr (Customer Debt) Settlement Matcher (`mobile/src/features/text-fetching/modals/match-bidr-modal.tsx`)**:
   - Analyzes customer name/phone against active `local_sale` dube debts in `useBidrStore`.
   - If a matching debtor is found, displays:
     *"Abebe Kebede owes ETB 450.00. Settle this debt with this transfer?"*
   - On confirmation: marks the customer's debt as settled, attaches the bank reference number, and marks SMS as `settled_debt`.

---

## Phase 7: Verification, Edge Cases & Testing

### Objectives
Validate end-to-end correctness, verify performance under heavy transaction volumes, and ensure zero regressions across offline sync and physical Android devices.

### Verification Checklist
1. **Unit Testing (`mobile/src/tests/sms-parsers.test.ts`)**:
   - 25+ real SMS messages across all 5 Ethiopian banks.
   - Edge case: Messages with missing payer names.
   - Edge case: Amounts with commas (`1,500.00`) vs without commas (`1500`).
   - Edge case: Amharic and English mixed messages.
2. **Deduplication Testing (`mobile/src/tests/sms-deduplication.test.ts`)**:
   - Test scanning 100 messages where 50 are duplicates.
   - Verify `insertOrIgnoreBatch` inserts exactly 50 records without database errors.
3. **Offline Sync Integration**:
   - Ensure converting an SMS to a sale or expense properly generates a `sync_queue` entry.
   - Verify that when online, the converted transaction pushes to the PostgreSQL backend.
4. **Physical Android Device Validation**:
   - Test on physical Android smartphone connected over USB ADB (`npm run android`).
   - Verify runtime permission request dialog appears smoothly.
   - Confirm bank SMS messages from SIM card are read and parsed accurately.
5. **TypeScript and Build Validation**:
   - `npx tsc --noEmit` in `mobile/`.
   - `npm run build` in `backend/`.
