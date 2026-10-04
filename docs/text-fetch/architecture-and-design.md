# Text & SMS Bank Fetching — Architecture & Technical Design

## 1. Architectural Overview

The **Text & SMS Bank Fetching System** bridges physical mobile banking notifications on the merchant's Android device into the NetWorth accounting and ledger core.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            ANDROID HARDWARE                                 │
│  [Physical SIM Card 1] [Physical SIM Card 2]                                │
│       │                      │                                              │
│       ▼                      ▼                                              │
│  [Android Telephony Service & SMS Storage Provider]                         │
│  content://sms/inbox                                                        │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼ (Scoped & Whitelisted Query)
┌─────────────────────────────────────────────────────────────────────────────┐
│                    TIER 1: NATIVE FETCH MODULE (KOTLIN)                     │
│  mobile/modules/expo-sms-inbox                                              │
│  • Checks android.permission.READ_SMS                                       │
│  • Executes ContentResolver query with address whitelist                    │
│  • Reads: _id, address, body, date, read, thread_id                         │
│  • Returns typed array to React Native JavaScript thread                    │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼ (Raw SMS Payloads)
┌─────────────────────────────────────────────────────────────────────────────┐
│                    TIER 2: BANK PARSER REGISTRY                             │
│  mobile/src/features/text-fetching/parsers/                                 │
│  • telebirr.parser.ts (127, telebirr)                                       │
│  • cbe.parser.ts (CBE, CBEBirr, 889, 829)                                   │
│  • awash.parser.ts (AWASH, AwashBank)                                       │
│  • boa.parser.ts (BOA, Abyssinia)                                           │
│  • dashen.parser.ts (DashenBank, Amole)                                     │
│  • generic-fallback.parser.ts                                               │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼ (ParsedBankTransaction Objects)
┌─────────────────────────────────────────────────────────────────────────────┐
│                    TIER 3: PERSISTENCE & DEDUPLICATION                      │
│  mobile/src/repositories/local-sms.repo.ts (expo-sqlite)                    │
│  • Table: local_bank_sms                                                    │
│  • UNIQUE(transaction_ref) prevents duplicate financial entries             │
│  • Tracks state: pending | converted_sale | converted_expense | ignored     │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼ (Reactive State)
┌─────────────────────────────────────────────────────────────────────────────┐
│                    TIER 4: STATE & UI PRESENTATION                          │
│  mobile/src/store/text-fetching-store.ts                                    │
│  • Provider grouping (telebirr, CBE, Awash, etc.)                           │
│  • Provider metric aggregations (Total Deposits, Total Expenses)            │
│  • Filter pills: All | telebirr | CBE | Awash | BoA                         │
│  • Conversion Dialogs & 1-Tap Booking Dispatch                              │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼ (Ledger Mutation)
┌─────────────────────────────────────────────────────────────────────────────┐
│                    TIER 5: BOOKKEEPING INTEGRATION                          │
│  • POST to local_sale (+ Sync Queue) for sales                              │
│  • POST to local_expense (+ Sync Queue) for expenses                        │
│  • UPDATE local_debt (+ Sync Queue) to settle customer credit (Bidr)        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Native Access & Security Architecture

### 2.1 Android Permission Scoping
Accessing SMS notifications requires Android's `READ_SMS` permission. This permission is handled with runtime verification:
- Declared in `mobile/app.json`:
  ```json
  "android": {
    "permissions": ["android.permission.READ_SMS"]
  }
  ```
- Checked and requested dynamically at runtime before scanning via `PermissionsAndroid.request(...)`.

### 2.2 Strict Whitelist Content Query (Privacy by Design)
To guarantee 100% merchant privacy and prevent accessing personal, family, or sensitive private text messages, the native Kotlin module executes an SQL selection directly at the Android `ContentResolver` level:

```kotlin
// Scoped selection query in Kotlin
val targetAddresses = arrayOf(
    "127", "telebirr", "Telebirr",
    "CBE", "CBEBirr", "889", "829",
    "AWASH", "AwashBank", "Awash Bank",
    "BOA", "Abyssinia", "Bank of Abyssinia",
    "DashenBank", "Dashen", "Amole"
)

val selection = Telephony.Sms.ADDRESS + " IN (" + targetAddresses.joinToString(",") { "'$it'" } + ")"
val sortOrder = "${Telephony.Sms.DATE} DESC LIMIT 200"

val cursor = context.contentResolver.query(
    Telephony.Sms.Inbox.CONTENT_URI,
    arrayOf(
        Telephony.Sms._ID,
        Telephony.Sms.ADDRESS,
        Telephony.Sms.BODY,
        Telephony.Sms.DATE,
        Telephony.Sms.TYPE
    ),
    selection,
    null,
    sortOrder
)
```

**Privacy Guarantee**: Non-banking text messages are never fetched from the Android OS into memory, never sent across the React Native bridge, and never stored.

---

## 3. Ethiopian Banking Providers & Parsing Specifications

### 3.1 Bank Provider Classification

Each recognized sender address maps to a standardized `BankProvider` entity:

| Provider Key | Display Name | Brand Color | Accepted Address Identifiers |
| :--- | :--- | :--- | :--- |
| `telebirr` | **telebirr** | `#00A3E0` | `'127'`, `'telebirr'`, `'Telebirr'` |
| `cbe` | **Commercial Bank of Ethiopia** | `#6A1B9A` | `'CBE'`, `'CBEBirr'`, `'889'`, `'829'` |
| `awash` | **Awash Bank** | `#FF6600` | `'AWASH'`, `'AwashBank'`, `'Awash Bank'` |
| `boa` | **Bank of Abyssinia** | `#C49A45` | `'BOA'`, `'Abyssinia'`, `'Bank of Abyssinia'` |
| `dashen` | **Dashen Bank** | `#0A2540` | `'DashenBank'`, `'Dashen'`, `'Amole'` |
| `unknown` | **Other Bank** | `#64748B` | Fallback matching financial terms |

---

### 3.2 Real-World Ethiopian Bank SMS Templates & Regex Rules

#### A. telebirr (127 / telebirr)
*Template 1 (Incoming Transfer / Deposit - Customer payment to merchant)*:
```text
Dear customer, you have received ETB 450.00 from 251911223344 (ABEBE KEBEDE) with transaction number: 2026100412345678 on 04/10/2026 14:22:10. Your current balance is ETB 12,450.00.
```
- **Type**: `DEPOSIT`
- **Amount Regex**: `/(?:received|credited with|transferred to you)\s+ETB\s*([\d,]+(?:\.\d{1,2})?)/i`
- **Payer Regex**: `/(?:from)\s+([\w\d\s\(\)]+?)\s+with transaction/i`
- **Txn Ref Regex**: `/(?:transaction number:|txn:?)\s*([A-Z0-9]+)/i`
- **Balance Regex**: `/(?:current balance is|balance is)\s+ETB\s*([\d,]+(?:\.\d{1,2})?)/i`

*Template 2 (Outgoing Transfer / Expense - Supplier payment or withdrawal)*:
```text
Dear customer, you have transferred ETB 2,500.00 to 251922334455 (ETHIO TRADING PLC) with transaction number: 2026100498765432 on 04/10/2026 15:10:00. Your current balance is ETB 9,950.00.
```
- **Type**: `EXPENSE`
- **Amount Regex**: `/(?:transferred|paid)\s+ETB\s*([\d,]+(?:\.\d{1,2})?)/i`
- **Payee Regex**: `/(?:to)\s+([\w\d\s\(\)]+?)\s+with transaction/i`

---

#### B. Commercial Bank of Ethiopia (CBE / CBE Birr)
*Template 1 (Account Credit / Customer Bank Transfer)*:
```text
Dear Customer, Your account 1000****1234 has been credited with ETB 1,800.00 on 04/10/2026 by CHALA TOLOSA. Ref: FT26278ABCD1. Your current balance is ETB 45,200.50. Thank you for banking with CBE!
```
- **Type**: `DEPOSIT`
- **Amount Regex**: `/(?:credited with|deposited with)\s+ETB\s*([\d,]+(?:\.\d{1,2})?)/i`
- **Account Regex**: `/(?:account|A\/C)\s*([0-9\*]+)/i`
- **Payer Regex**: `/(?:by)\s+([A-Za-z\s]+?)\.\s*(?:Ref|Txn)/i`
- **Txn Ref Regex**: `/(?:Ref:?|Txn ID:?)\s*([A-Za-z0-9]+)/i`

*Template 2 (Account Debit / Shop Rent or Supplier Withdrawal)*:
```text
Dear Customer, Your account 1000****1234 has been debited with ETB 5,000.00 on 04/10/2026 for TRANSFER TO KEBEDE ENTERPRISE. Ref: FT26279WXYZ2. Current Balance: ETB 40,200.50.
```
- **Type**: `EXPENSE`
- **Amount Regex**: `/(?:debited with|withdrawn)\s+ETB\s*([\d,]+(?:\.\d{1,2})?)/i`

---

#### C. Awash Bank (AWASH)
```text
Dear Customer, your A/C 0132****5678 has been credited by ETB 3,200.00 from ALMAZ AYANA on 04-Oct-2026. Txn ID: AW261004991. Current Bal ETB 28,150.00.
```
- **Type**: `DEPOSIT`
- **Amount Regex**: `/(?:credited by|credited with)\s+ETB\s*([\d,]+(?:\.\d{1,2})?)/i`
- **Txn Ref Regex**: `/(?:Txn ID:?|Ref:?)\s*([A-Za-z0-9]+)/i`

---

#### D. Bank of Abyssinia (BOA)
```text
Dear Customer, ETB 1,250.00 has been credited to your account 2098****4321 on 04/10/2026. Sender: MIKIYAS BEKELE. Ref: BOA26100412. Available balance: ETB 14,800.00.
```
- **Type**: `DEPOSIT`
- **Amount Regex**: `/(?:ETB)\s*([\d,]+(?:\.\d{1,2})?)\s+(?:has been credited)/i`
- **Txn Ref Regex**: `/(?:Ref:?)\s*([A-Za-z0-9]+)/i`

---

## 4. Data Models & TypeScript Specifications

### 4.1 Native SMS Payload Interface
```typescript
export interface RawSmsMessage {
  id: string;             // Android _ID or generated client ID
  address: string;        // '127', 'CBE', 'AWASH', etc.
  body: string;           // Full SMS message content
  timestamp: number;      // Epoch millisecond timestamp
  dateFormatted: string;  // ISO 8601 string
}
```

### 4.2 Parsed Bank Transaction Interface
```typescript
export type BankProvider = 'telebirr' | 'cbe' | 'awash' | 'boa' | 'dashen' | 'unknown';
export type TransactionFlow = 'deposit' | 'expense' | 'unknown';
export type SmsImportStatus = 'pending' | 'converted_sale' | 'converted_expense' | 'settled_debt' | 'ignored';

export interface ParsedBankTransaction {
  id: string;                     // Unique UUID
  rawSmsId: string;               // Source SMS ID
  provider: BankProvider;         // Identified bank
  senderAddress: string;          // Source address string
  transactionFlow: TransactionFlow;
  amount: number;                 // Numeric Birr amount (e.g. 1500.50)
  currency: string;               // 'ETB'
  transactionRef: string;         // Unique bank reference code
  counterparty: string | null;    // Payer / Payee name or phone
  accountMasked: string | null;   // e.g. "1000****1234"
  currentBalance: number | null;  // Remaining balance if reported
  timestamp: string;              // ISO timestamp of transaction
  rawBody: string;                // Unmodified text body
  confidenceScore: number;        // 0.0 - 1.0 (parser certainty)
  importStatus: SmsImportStatus;  // Current processing status
  convertedEntityId: string | null; // ID of created sale/expense
}
```

---

## 5. Local SQLite Persistence Schema

To support offline operation and enforce idempotency, the following DDL table is added to `mobile/src/db/schema.ts`:

```sql
-- Local Bank SMS Transactions Table
CREATE TABLE IF NOT EXISTS local_bank_sms (
  id TEXT PRIMARY KEY NOT NULL,
  raw_sms_id TEXT,
  provider TEXT NOT NULL,
  sender_address TEXT NOT NULL,
  transaction_flow TEXT CHECK(transaction_flow IN ('deposit', 'expense', 'unknown')) NOT NULL,
  amount REAL NOT NULL,
  currency TEXT DEFAULT 'ETB' NOT NULL,
  transaction_ref TEXT UNIQUE NOT NULL,
  counterparty TEXT,
  account_masked TEXT,
  current_balance REAL,
  raw_body TEXT NOT NULL,
  received_at TEXT NOT NULL,
  confidence_score REAL DEFAULT 1.0 NOT NULL,
  import_status TEXT CHECK(import_status IN ('pending', 'converted_sale', 'converted_expense', 'settled_debt', 'ignored')) DEFAULT 'pending' NOT NULL,
  converted_entity_id TEXT,
  business_id TEXT NOT NULL,
  branch_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_bank_sms_ref ON local_bank_sms(transaction_ref);
CREATE INDEX IF NOT EXISTS idx_bank_sms_provider ON local_bank_sms(provider, received_at DESC);
CREATE INDEX IF NOT EXISTS idx_bank_sms_status ON local_bank_sms(import_status);
CREATE INDEX IF NOT EXISTS idx_bank_sms_flow ON local_bank_sms(transaction_flow);
```

### Idempotency Guarantee
The `UNIQUE(transaction_ref)` constraint ensures that:
- Scanning the inbox multiple times or receiving duplicate SMS transmissions will not create duplicates.
- SQLite `INSERT OR IGNORE` safely absorbs identical messages.

---

## 6. Bookkeeping Integration Architecture

When a merchant interacts with a detected transaction card, the system executes one of four dispatch workflows:

```
                      [Detected SMS Card]
                               │
       ┌───────────────────────┼───────────────────────┐
       ▼                       ▼                       ▼
[+ Convert to Sale]   [- Convert to Expense]   [🤝 Settle Bidr Debt]
       │                       │                       │
       ▼                       ▼                       ▼
Prefills:               Prefills:               Matches Customer:
• Amount                • Amount                • Finds debt with
• Date                  • Date                    matching phone/name
• PaymentMethod         • Category: Bank        • Updates debt status
  (telebirr / cbe)        Transfer / Utilities    to 'settled'
• Customer Name         • Vendor Name           • Attaches Txn Ref
• Ref in Notes          • Ref in Notes
       │                       │                       │
       ▼                       ▼                       ▼
[Inserts into           [Inserts into           [Inserts Settle
 local_sale]             local_expense]          Mutation & updates
       │                       │                 local_sale/debt]
       └───────────────────────┼───────────────────────┘
                               │
                               ▼
               Updates local_bank_sms:
               • import_status = 'converted_sale' | 'converted_expense' | 'settled_debt'
               • converted_entity_id = entity.id
```

### 1-Tap Conversion Contracts:
1. **Sales Bridge**:
   - Creates a `local_sale` record with `amount = sms.amount`, `payment_method = sms.provider`, `customer_name = sms.counterparty`, and `notes = "Imported from Bank SMS Ref: " + sms.transactionRef`.
   - Queues outbox mutation in `sync_queue` so it replicates to PostgreSQL when online.
2. **Expense Bridge**:
   - Creates a `local_expense` record with `amount = sms.amount`, `category = "Bank Transfer"`, and description from payee.
3. **Customer Debt (Bidr) Settlement Bridge**:
   - If an outstanding credit record exists for the customer phone/name, prompts: *"Settle [Customer Name]'s debt of ETB [Amount]?"*
   - Marks the debt as settled and links the bank confirmation reference.
