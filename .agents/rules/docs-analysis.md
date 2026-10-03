# Comprehensive Analysis of `docs/` Documentation

This document synthesizes and analyzes all product, design, and technical specifications found within the `docs/` folder.

---

## 1. Document Directory Inventory

| File Path | Core Subject | Key Takeaways |
| :--- | :--- | :--- |
| [docs/AGENTS.md](file:///home/eaglex/Documents/insa-ctc/FinalProject/docs/AGENTS.md) | AI Engineering Rules | 10 Core Principles: Understand before modifying, reuse existing code, keep route files thin, validate after changes, avoid unnecessary refactors. |
| [docs/architecture/folder_structure.md](file:///home/eaglex/Documents/insa-ctc/FinalProject/docs/architecture/folder_structure.md) | Repo File Map | Canonical directory hierarchy for `mobile/src/` and `backend/src/` as of September 2026. Explicit rule: thin routes, logic in hooks, HTTP in singular `service/`. |
| [docs/business-branch-management.md](file:///home/eaglex/Documents/insa-ctc/FinalProject/docs/business-branch-management.md) | Business & Branch Feature | End-to-end specification of multi-business and multi-branch management. Explains step-by-step wizard, Telebirr/CBE payment credentials setup, and Drizzle models. |
| [docs/sales/sales.md](file:///home/eaglex/Documents/insa-ctc/FinalProject/docs/sales/sales.md) | Sales Feature File Map | Architectural blueprint for decomposing large sales screens into `features/sales/`, `components/sales/`, `hooks/use-sales.ts`, and `service/sales.ts`. |
| [docs/sales/sales-backend-plan.md](file:///home/eaglex/Documents/insa-ctc/FinalProject/docs/sales/sales-backend-plan.md) | Phased Sales Backend Plan | 5-phase incremental delivery plan for backend sales/expenses/bidr persistence, ensuring safe boundary validations and branch-level tenant isolation. |
| [docs/sales/detailed-sales-report.md](file:///home/eaglex/Documents/insa-ctc/FinalProject/docs/sales/detailed-sales-report.md) | Sales Implementation Report | Production report on implemented sales, expenses, and credit debt tracking. Documents schemas, rollback dialogs on optimistic updates, and date filtering. |
| [docs/design/FullDesign/initial.md](file:///home/eaglex/Documents/insa-ctc/FinalProject/docs/design/FullDesign/initial.md) | Merchant Interface Spec | Product vision, merchant UX philosophy, color system (green, orange, white, neutral grays), role-based permissions (owner, manager, cashier). |
| [docs/design/structure/folders.md](file:///home/eaglex/Documents/insa-ctc/FinalProject/docs/design/structure/folders.md) | Auth Flow Layout Plan | Proposed route grouping separating `(auth)` from protected `(tabs)` and custom auth UI components. |
| [docs/TROUBLESHOOTING_HISTORY.md](file:///home/eaglex/Documents/insa-ctc/FinalProject/docs/TROUBLESHOOTING_HISTORY.md) | Diagnostics & Solutions | Record of connection failures (`adb reverse` port 3000), missing DB tables (`sale`/`expense`), and Better Auth deep-link callback validation. |

---

## 2. In-Depth Analysis by Functional Domain

### 2.1 Product Philosophy & UX Standards (`docs/design/FullDesign/initial.md`)
* **Mission:** "Make everyday business operations extremely fast while automatically turning business activity into useful financial intelligence."
* **Target Audience:** Small and medium Ethiopian merchants (retail, restaurants, wholesale, services).
* **Approachability:** Must NOT feel like an enterprise banking app or crypto dashboard. It must feel like an approachable, fast, daily operating tool with clear local currency formatting (`ETB` / `Birr`).
* **Visual Identity:**
  * Clean white backgrounds and card containers.
  * Primary Green for financial health, success, cash flow, and positive balances.
  * Accent Orange for highlights, pending dues, warnings, and alerts.
  * Neutral grays for subtle borders, backgrounds, and structural hierarchy.
* **Immediate Answers on App Launch:**
  1. How much was sold today?
  2. How much cash/digital money was collected?
  3. How much do customers owe (Yebeden / Dube)?
  4. Are there any pending actions requiring immediate attention?

### 2.2 Engineering Rules & Standards (`docs/AGENTS.md`)
* **Understand Before Modifying:** Never start rewriting or generating code without checking existing patterns, models, and shared utilities.
* **Reuse Before Creating:** Do not create duplicate components, hooks, or schemas. Check `components/ui/`, `hooks/`, and existing service files first.
* **Thin Route Files:** Files in `mobile/src/app/` must only serve as entry binders connecting hooks to presentation components in `features/`.
* **Layer Isolation:**
  * Mobile: UI -> Hook -> Service -> Backend.
  * Backend: Route -> Auth Middleware -> Controller -> Zod Validation -> Service -> Repository -> Database.
* **Error Handling:** Use typed `AppError` subclasses. Never return generic unhandled exceptions to the client.

### 2.3 Business & Multi-Branch Management (`docs/business-branch-management.md`)
* **Step-by-Step Creation:** 2-step setup wizard with progress animations collecting basic business info first, then optional legal/tax details (TIN, trade license).
* **Branch Payout Credentials:** Each branch can configure independent payout configurations (`telebirr_merchant_id`, `cbe_birr_merchant_id`) for receiving local payments directly.
* **Global Context:** The user's active business and active operating branch are stored in `mobile/src/store/business-store.ts` (persisted across screens).

### 2.4 Sales, Expenses & Credit Debt Subsystem (`docs/sales/`)
* **Transaction Separation:**
  * **Instant Sale:** Settled immediately with payment method (`cash`, `telebirr`, `cbe`).
  * **Credit Sale (Dube / Bidr):** Unsettled payment requiring customer identity and promised repayment timestamp.
  * **Expense:** Operating expenditure categorized by type.
* **Optimistic UI:** When a sale or expense is recorded, the mobile app optimistically updates the local list and totals immediately, with an automated rollback dialog if the network request fails.
* **Data Scoping:** All sales and expenses are strictly filtered by `businessId` and operating `branchId` to maintain strict multi-tenant isolation.
