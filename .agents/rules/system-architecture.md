# NetWorth Ethiopia — System Architecture & Structure

This rule document provides the complete architecture and structural blueprint of the **NetWorth Ethiopia** platform. It must be consulted before making architectural decisions or creating/modifying files.

---

## 1. High-Level Architecture

The platform consists of a cross-platform mobile client, an Express.js backend API, and a PostgreSQL database connected via Drizzle ORM:

```
[ Mobile Client (Expo SDK 57 / React Native 0.86) ]
   ├── Expo Router (File-based navigation)
   ├── NativeWind v4 / Tailwind CSS styling
   ├── Zustand Store (Active business & branch context)
   ├── Custom Hook Controllers (State, mutations, optimistic UI)
   └── Better Auth Client (@better-auth/expo)
           │
           │ (HTTP requests / Deep-linking: networth://)
           │ Physical Android via USB: ADB Reverse tcp:3000 tcp:3000
           ▼
[ Backend API (Express.js 5 + TypeScript + tsx) ]
   ├── Better Auth (Google OAuth, Expo plugin)
   ├── Routers -> Controllers -> Validations (Zod) -> Services -> Repositories
   └── Centralized Error Handling & AppError hierarchy
           │
           │ (Drizzle ORM over node-postgres)
           ▼
[ Database (PostgreSQL) ]
   ├── Auth: user, session, account, verification
   ├── Business: business, branch
   └── Transactions: sale, expense
```

---

## 2. Directory Layout & Separation of Concerns

### 2.1 Mobile Application (`mobile/src/`)

The mobile client strictly separates routing, presentation, business logic, API communication, and state management:

| Directory | Responsibility | Guidelines |
| :--- | :--- | :--- |
| `app/` | Thin route binders | Do NOT put heavy UI or business logic here. Delegate to `features/` and `hooks/`. Groups: `(auth)`, `(business)`, `(tabs)`. |
| `features/` | Feature screen layouts | High-level screen components (e.g. `sales-screen.tsx`, `branches-ui.tsx`). |
| `components/` | Reusable UI widgets | Subdivided into `ui/` (generic buttons, inputs), `auth/`, `business/`, `sales/`, `charts/`, and `navigation/`. |
| `hooks/` | Controller hooks | Encapsulate local state, Zod validation, API calls, and optimistic update rollbacks (e.g. `use-sales.ts`, `use-create-business.ts`). |
| `service/` | API client functions | Data-fetching functions calling `authClient.$fetch` (e.g. `sales.ts`, `expenses.ts`, `business.ts`, `branch.ts`). |
| `store/` | Global state stores | Zustand stores holding cross-screen context, primarily `business-store.ts` (`activeBusiness`, `activeBranch`). |
| `constants/` | Constant definitions | Theme tokens, business types, sale types, payment options. |
| `types/` | TypeScript types/interfaces | Domain models, request payloads, response interfaces. |
| `validations/` | Zod client schemas | Form validation schemas for businesses, branches, sales, etc. |

### 2.2 Backend Application (`backend/src/`)

The backend follows a strict 5-layer layered architecture:

| Layer / Directory | Responsibility | Key Rules |
| :--- | :--- | :--- |
| `routes/` | HTTP endpoint definitions | Mount auth middleware (`requireAuth`), bind routes to controller methods. |
| `controllers/` | Request/Response handlers | Extract params, query, body, and auth session. Pass to validations and services. Wrap responses in `apiResponse()`. |
| `validations/` | Zod boundary schemas | Parse and validate incoming inputs using `.safeParse()`. Throw `ValidationError` on failure. |
| `service/` | Business logic & authorization | Enforce business rules, ownership checks (`resolveUserBusinessId`), data transformation, and UUID generation. |
| `repositories/` | Database persistence | Execute SQL queries via Drizzle ORM (`db.select()`, `db.insert()`, `db.update()`). |
| `helpers/` | Utilities | `errors.ts` (`AppError`, `NotFoundError`, `ForbiddenError`, `BadRequestError`, `ValidationError`), `response.ts` (`apiResponse`). |
| `middleware/` | Pipeline processing | `auth.ts` (session extraction via Better Auth), `error.ts` (centralized error logging and JSON error responses). |
| `config/` | Application configs | `auth.ts` (Better Auth setup, trustedOrigins), `db.ts` (PostgreSQL pool & Drizzle instance). |
| `db/` | Database schemas | `schema.ts`, `business-branch-management.ts`, `sales-expense-management.ts`. |

---

## 3. Core Subsystems

### 3.1 Authentication & Multi-Tenancy
* **Auth Engine:** Better Auth with Google Social OAuth and `@better-auth/expo` plugin.
* **Scheme:** `networth://`
* **Multi-Tenancy Hierarchy:**
  `User (Merchant)` ──(1:N)──> `Business` ──(1:N)──> `Branch` ──(1:N)──> `Sale / Expense`
* **Scoping:** Every transactional record (`sale`, `expense`) is strictly foreign-keyed to both `businessId` and `branchId`.
* **Context Resolution:** The backend `resolveUserBusinessId(userId, requestedId)` ensures users can only access businesses they own. The frontend transmits context via query parameters or `x-business-id` / `x-branch-id` headers.

### 3.2 Sales, Expenses & Credit (Dube / Bidr)
* **Instant Sales:** Paid immediately via `cash`, `telebirr`, or `cbe`. Stored with `status: 'settled'` and populated `paidAt`.
* **Credit Sales (Dube / Bidr):** Sales where payment is deferred. Mandatory fields: `customerName`, `customerPhone`, and `dueDate` (promised payment timestamp). Initial `status: 'pending'`.
* **Debt Settlement:** When a customer repays, the sale status transitions to `'settled'` and `paidAt` is set to the settlement timestamp.
* **Expenses:** Business expenditures categorized into Rent, Utilities, Salary, Inventory, Transport, Maintenance, or Other.
