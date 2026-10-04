# Text & SMS Bank Fetching — NetWorth Ethiopia

## 1. Executive Summary

In Ethiopia's rapidly expanding digital economy, merchant financial transactions are predominantly conducted via mobile money and digital banking notifications rather than paper receipts. Millions of merchants receive customer payments through:
- **telebirr** (Ethio Telecom mobile money)
- **Commercial Bank of Ethiopia (CBE / CBE Birr)**
- **Awash Bank**, **Bank of Abyssinia (BOA)**, and **Dashen Bank (Amole)**

Currently, Ethiopian merchants are forced to manually transcribe SMS confirmation numbers, customer names, and Birr amounts into their sales register or paper ledger. This manual process causes:
1. **Missed and unrecorded sales** during peak store hours.
2. **Typographical and calculation errors** in Birr amounts.
3. **Difficulty in reconciliation** between physical bank balances and ledger balances.
4. **Time-consuming verification** when customers claim to have transferred money.

The **Text & SMS Bank Fetching Functionality** introduces an automated, privacy-first, on-device banking transaction reader. It continuously scans incoming official bank SMS messages, parses financial details (amount, transaction code, sender, date, type), groups them by banking provider, and gives the merchant **1-tap conversion into official Sales, Expenses, or Bidr (Customer Debt) settlements**.

---

## 2. Core Architecture Principles

```
  ┌──────────────────────────────────────────────────────────────┐
  │                 Android Telephony Provider                   │
  │                  (content://sms/inbox)                       │
  └──────────────────────────────┬───────────────────────────────┘
                                 │
                                 ▼ (Privacy-Filtered Query)
  ┌──────────────────────────────────────────────────────────────┐
  │               Local Expo Native Module                       │
  │            (modules/expo-sms-inbox - Kotlin)                 │
  │  - Queries ONLY addresses: '127', 'telebirr', 'CBE', etc.    │
  │  - ZERO access to personal or non-banking SMS                │
  └──────────────────────────────┬───────────────────────────────┘
                                 │
                                 ▼ (Normalized SMS Payload)
  ┌──────────────────────────────────────────────────────────────┐
  │                Bank Parser Registry                          │
  │  - telebirr Parser   - CBE / CBE Birr Parser                 │
  │  - Awash Parser      - Bank of Abyssinia Parser              │
  │  - Dashen Parser     - Generic Ethiopian Banking Fallback    │
  └──────────────────────────────┬───────────────────────────────┘
                                 │
                                 ▼ (Extracted Financial Entity)
  ┌──────────────────────────────────────────────────────────────┐
  │             Local SQLite Deduplication Engine                │
  │         (local_bank_sms with UNIQUE transaction_ref)         │
  └──────────────────────────────┬───────────────────────────────┘
                                 │
                                 ▼ (State & UI Layer)
  ┌──────────────────────────────────────────────────────────────┐
  │             Merchant Actionable Inbox UI                     │
  │  - Bank Carousel (telebirr, CBE, Awash balance summaries)    │
  │  - Provider Pill Filters                                     │
  │  - 1-Tap [+ Convert to Sale]                                 │
  │  - 1-Tap [- Convert to Expense]                              │
  │  - 1-Tap [🤝 Match to Customer Debt / Bidr Settlement]       │
  └──────────────────────────────────────────────────────────────┘
```

1. **Strict Privacy by Design**:
   - The native reader executes SQL filter clauses directly at the Android ContentResolver query level (`address IN ('127', 'telebirr', 'CBE', 'CBEBirr', '889', 'AWASH', 'BOA', 'DashenBank')`).
   - The app never reads, stores, or accesses personal chats, family messages, or non-banking OTPs.
2. **Deterministic Offline Parsing**:
   - Regex-based linguistic pattern extractors run 100% on-device in sub-millisecond time.
   - Zero cloud NLP latency, zero LLM token costs, zero internet connection required, and zero hallucination of monetary numbers.
3. **Idempotency & Deduplication Guarantee**:
   - Every Ethiopian banking SMS contains a unique transaction receipt code (e.g. telebirr transaction ID, CBE `FT...` code).
   - Local SQLite enforces a `UNIQUE(transaction_ref)` index so re-scanning the inbox never produces duplicate entries.
4. **Actionable Inbox (Review & Confirm)**:
   - Preserves merchant autonomy. Detected transactions are staged in an actionable inbox where the shopkeeper can verify, convert, or dismiss items.
5. **Cross-Platform Resilience**:
   - Since Apple iOS strictly prohibits third-party SMS inbox reading for sandboxing reasons, the mobile app incorporates an automatic environment detector:
     - **Android Physical Device**: Direct native module reading via `Telephony.Sms`.
     - **Web / iOS / Emulator**: Built-in interactive **Demo & Mock Data Generator** allowing complete UI, parser testing, and bookkeeping conversions.

---

## 3. Documentation Navigation

This documentation suite is organized into detailed architectural specifications and execution plans:

| Document | Focus & Description |
| :--- | :--- |
| **[1. Architecture & Design Specification](file:///home/eaglex/Documents/insa-ctc/FinalProject/docs/text-fetch/architecture-and-design.md)** | Deep technical architecture: native Android module design, SMS content resolver queries, Ethiopian bank provider mapping, linguistic parsing templates (telebirr, CBE, Awash, Abyssinia, Dashen), deduplication schema, and bookkeeping integration contracts. |
| **[2. Step-by-Step Implementation Plan](file:///home/eaglex/Documents/insa-ctc/FinalProject/docs/text-fetch/implementation-plan.md)** | Complete 6-phase engineering roadmap: native bridge setup, parser engine with test suite, SQLite persistence, Zustand store, Actionable Inbox UI, and 1-tap conversion to Sales, Expenses, and Bidr settlement. |

---

## 4. Supported Ethiopian Banking Providers

| Provider | Sender Identifier(s) | Transaction Types | Extracted Identifiers |
| :--- | :--- | :--- | :--- |
| **telebirr** | `127`, `telebirr` | Deposits, Outgoing Transfers, Merchant Payments | Amount, Payer Name/Phone, Txn ID, New Balance |
| **Commercial Bank of Ethiopia (CBE)** | `CBE`, `CBEBirr`, `889`, `829` | Account Credits, Debits, ATM, CBEBirr Wallet | Amount, Account (masked), Payer, FT Reference |
| **Awash Bank** | `AWASH`, `AwashBank` | Credits, Debits, POS Payments | Amount, Account (masked), Txn ID |
| **Bank of Abyssinia** | `Abyssinia`, `BOA` | Credits, Debits | Amount, Account (masked), Ref Code |
| **Dashen Bank** | `DashenBank`, `Amole` | Credits, Amole Wallets, Transfers | Amount, Payer, Transaction ID |
