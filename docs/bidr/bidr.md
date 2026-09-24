# Customer Credit (Bidir / ብድር) Management Documentation

## 1. Overview

The **Customer Credit (Bidir / ብድር)** feature allows business owners and store operators to track, manage, remind, and settle customer credit sales across single or multi-branch business accounts. 

It is designed with a **mobile-first, clean visual hierarchy**, using soft gradient metrics, unified horizontal filter bars, pure SVG iconography (zero emoji glyphs), and structured modal forms harmonized with the rest of the application.

---

## 2. Architecture & File Structure

Following the repository principles outlined in `docs/AGENTS.md` and `docs/architecture/folder_structure.md`:

```text
Net_Worth_Ethiopia/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── bidr.controller.ts        # Request handlers & schema parsing
│   │   ├── routes/
│   │   │   └── bidr.routes.ts            # Route definitions & authentication middleware
│   │   ├── service/
│   │   │   └── bidr.service.ts           # Business logic & Drizzle ORM queries
│   │   └── validations/
│   │       └── bidr.validation.ts        # Zod request validators
│
├── mobile/
│   ├── src/
│   │   ├── app/
│   │   │   └── (tabs)/
│   │   │       └── bidr.tsx              # Thin route mount rendering BidrScreen
│   │   ├── components/
│   │   │   ├── bidr/
│   │   │   │   ├── debt-card.tsx         # Full-width card with customer info, deadline & actions
│   │   │   │   ├── debt-summary.tsx      # Full-width hero metrics card with soft gradient
│   │   │   │   └── debt-filter-bar.tsx   # Segmented horizontal filter track
│   │   │   └── icons/
│   │   │       └── index.tsx             # Pure SVG icons (CreditCard, Alert, Clock, Check, etc.)
│   │   ├── constants/
│   │   │   └── bidr.ts                   # Filter tabs, sorting options, presets & constants
│   │   ├── features/
│   │   │   └── bidr/
│   │   │       ├── bidr-screen.tsx       # Main screen with search, sort, filters & list
│   │   │       ├── settle-debt-modal.tsx # Debt settlement modal with payment method selection
│   │   │       ├── update-debt-modal.tsx # Edit debt details & due date modal
│   │   │       └── debt-detail-modal.tsx # Full debt audit modal
│   │   ├── hooks/
│   │   │   └── use-bidr.ts               # Hook delegating to Zustand store with reactive selectors
│   │   ├── lib/
│   │   │   └── bidr-utils.ts             # Date, currency, status display & deadline insights utils
│   │   ├── service/
│   │   │   └── bidr.ts                   # Better-fetch API client functions
│   │   ├── store/
│   │   │   └── bidr-store.ts             # Zustand store for Bidir state management
│   │   └── types/
│   │       └── bidr.ts                   # TypeScript interfaces & enums
│
└── docs/
    └── bidr/
        └── bidr.md                       # Feature documentation (this document)
```

---

## 3. Backend API Specifications

Base path: `/api/bidr`  
All endpoints require bearer authentication (`requireAuth` middleware) and respect multi-tenancy (`businessId` and optional `branchId`).

### 3.1 Endpoints

| Method | Path | Description | Query / Body Params |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/bidr` | List credit records | `businessId`, `branchId`, `status`, `isOverdue`, `startDate`, `endDate`, `limit`, `offset` |
| `GET` | `/api/bidr/summary` | Aggregate credit metrics | `businessId`, `branchId` |
| `GET` | `/api/bidr/:id` | Fetch credit details by ID | Route param `:id` |
| `POST` / `PATCH` | `/api/bidr/:id/settle` | Settle credit record | Body: `{ paymentMethod?: string, notes?: string }` |
| `PATCH` | `/api/bidr/:id` | Update credit details | Body: `{ dueDate?: string, customerName?: string, customerPhone?: string, notes?: string, status?: string }` |

### 3.2 Key Business Logic & Schema Mapping

- **Credit Records**: Stored in the `sales` table where `paymentMethod = 'credit'`.
- **Status Lifecycle**:
  - `pending`: Active unpaid credit.
  - `settled`: Paid credit (`paidAt` timestamp set, status updated).
  - `overdue`: Auto-classified when `dueDate < CURRENT_DATE` and `status = 'pending'`.
- **Summary Metrics**:
  - `totalCreditAmount`: Total ETB value of all credit given.
  - `pendingAmount`: Sum of active unpaid credit.
  - `settledAmount`: Sum of recovered/settled credit.
  - `overdueAmount`: Sum of active credit past due date.
  - `dueSoonAmount`: Sum of active credit due within the next 7 days.
  - `totalDebts`, `pendingCount`, `settledCount`, `overdueCount`, `dueSoonCount`.

---

## 4. Mobile Client Architecture

### 4.1 State & Controller (`useBidr`)
The [`use-bidr.ts`](file:///c:/Users/Hp/Desktop/NetworthET/Net_Worth_Ethiopia/mobile/src/hooks/use-bidr.ts) hook provides a single source of truth for the screen:
- **Filtering**: Filters locally by status (`all`, `pending`, `overdue`, `due_soon`, `settled`) and search query (matches `customerName`, `customerPhone`, or sale ID).
- **Sorting**: Supports sorting by `dueDate_asc`, `dueDate_desc`, `amount_desc`, `amount_asc`, `createdAt_desc`.
- **Optimistic Updates & Refetches**: Refetches data and recalculates summary metrics immediately after settlement or update.

### 4.2 Component Design & Visual System
- **Hero Card ([`debt-summary.tsx`](file:///c:/Users/Hp/Desktop/NetworthET/Net_Worth_Ethiopia/mobile/src/components/bidr/debt-summary.tsx))**:
  - Single full-width container.
  - Soft light gradient palette (`#f4fbf7` to `#e8f7ee`).
  - 4 key metrics in a 2x2 grid with hairline dividers: Active Credit, Past Due, 1-Wk Due, and Recovered.
- **Filter Track ([`debt-filter-bar.tsx`](file:///c:/Users/Hp/Desktop/NetworthET/Net_Worth_Ethiopia/mobile/src/components/bidr/debt-filter-bar.tsx))**:
  - Unified horizontal segmented bar with badge counters.
- **Card Item ([`debt-card.tsx`](file:///c:/Users/Hp/Desktop/NetworthET/Net_Worth_Ethiopia/mobile/src/components/bidr/debt-card.tsx))**:
  - Full-width card with clean typography.
  - Visual status and deadline badge (e.g. `Overdue by 3 days`, `Due in 4 days`, `Settled`).
  - Direct customer contact actions (Phone Call / SMS via React Native `Linking`).
  - Settle debt CTA.
- **Modal Forms**:
  - Aligned with the sales modal conventions: lowercase/sentence-case labels, full-height scroll views, and clean payment method selectors.
- **Zero Emojis**:
  - Pure vector SVG icons (`react-native-svg`) are used exclusively.

---

## 5. Verification & Testing

- **Backend Typecheck**: `npx tsc --noEmit` passing with 0 errors.
- **Mobile Typecheck**: `npx tsc --noEmit` passing with 0 errors.
- **Route Validation**: Both `POST` and `PATCH` methods are supported on the settlement endpoint `/api/bidr/:id/settle`.
