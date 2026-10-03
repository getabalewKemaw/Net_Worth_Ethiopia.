# Sales Backend Plan

This document lays out the backend implementation for sales and expenses in phased steps.

It follows the rules in `docs/AGENTS.md`:

- Understand before modifying.
- Reuse existing backend patterns first.
- Keep route files thin.
- Put business rules in services.
- Put persistence in repositories.
- Put validation at the boundary.
- Make the smallest safe change per phase.
- Validate after each phase.

The goal is to avoid a large all-at-once backend rewrite and instead deliver the sales backend in stable increments.

## 1. Scope and Starting Assumptions

Current situation:

- Sales is still largely frontend-driven.
- Expense entry is also handled in the mobile app.
- The backend already has a working structure for business and branch management.
- We should reuse the existing backend conventions rather than invent a new architecture.

Primary backend targets for this plan:

- Sales persistence
- Expense persistence
- Debt / bidr support
- Validation and authorization
- Data isolation by business and branch
- Sync-friendly endpoints if needed later

## 2. Planned Backend Folder Targets

The current backend structure already has these relevant folders:

```text
backend/src/
├── config/
├── controllers/
├── db/
├── helpers/
├── middleware/
├── repositories/
├── routes/
├── service/
├── types/
└── validations/
```

This plan keeps that structure and extends it for sales-related behavior.

## 3. Phase 1: Inventory and Domain Design

### Goal

Understand the existing backend surface and define the sales domain contract before writing endpoints.

### Work

- Inspect the current backend business and branch patterns.
- Identify where sales data should attach:
  - business
  - branch
  - user/session ownership
- Define the core sales domain entities:
  - sale
  - expense
  - payment method
  - sale type
  - debt / bidr state
- Identify reusable backend helpers:
  - response helper
  - error helper
  - auth middleware
  - validation conventions
- Confirm whether the current DB layer already supports the needed tables or whether schema additions are required.

### Likely files to review

- `backend/src/db/schema.ts`
- `backend/src/db/business-branch-management.ts`
- `backend/src/routes/business.routes.ts`
- `backend/src/routes/branch.routes.ts`
- `backend/src/controllers/business.controller.ts`
- `backend/src/controllers/branch.controller.ts`
- `backend/src/service/business.service.ts`
- `backend/src/service/branch.service.ts`
- `backend/src/repositories/business.repository.ts`
- `backend/src/repositories/branch.repository.ts`
- `backend/src/validations/business.validation.ts`
- `backend/src/validations/branch.validation.ts`
- `backend/src/helpers/errors.ts`
- `backend/src/helpers/response.ts`
- `backend/src/middleware/auth.ts`

### Exit criteria

- The sales domain boundaries are defined.
- The backend file ownership is clear.
- We know which existing patterns to reuse.

### Validation

- No code changes yet, or only notes/docs if needed.
- Confirm the design does not conflict with current business/branch handling.

## 4. Phase 2: Data Model and Contracts

### Goal

Define the persistent sales and expense data model and shared types before wiring routes.

### Work

- Add or extend DB schema for:
  - sales
  - expenses
  - debt records if they need to be tracked separately
  - optional payment or settlement fields
- Define TypeScript types in `backend/src/types/`.
- Define validation schemas in `backend/src/validations/`.
- Decide which fields are required versus optional.

### Likely fields

For sales:

- id
- businessId
- branchId
- saleType
- amount
- description
- customer name
- phone number
- payment method
- due date for debt sales
- status
- timestamps

For expenses:

- id
- businessId
- branchId
- description
- category
- amount
- timestamps

### Design rules

- Do not overfit the schema to the mobile mock UI.
- Keep optional fields optional when they reflect real-world missing data.
- Keep debt-specific fields separate from instant-sale behavior when that reduces complexity.

### Exit criteria

- DB schema exists or is confirmed sufficient.
- Backend types and validation contracts are explicit.
- The API shape is known before route implementation.

### Validation

- Schema review
- Type review
- Validation review

## 5. Phase 3: Sales and Expense Core CRUD

### Goal

Implement the core persistence workflow for sales and expenses.

### Work

Build endpoints in thin route/controller/service/repository layers:

- create sale
- list sales
- get sale by id if needed
- create expense
- list expenses
- get expense by id if needed

### Suggested file split

- `backend/src/routes/sales.routes.ts`
- `backend/src/controllers/sales.controller.ts`
- `backend/src/service/sales.service.ts`
- `backend/src/repositories/sales.repository.ts`
- `backend/src/validations/sales.validation.ts`

- `backend/src/routes/expenses.routes.ts`
- `backend/src/controllers/expenses.controller.ts`
- `backend/src/service/expenses.service.ts`
- `backend/src/repositories/expenses.repository.ts`
- `backend/src/validations/expenses.validation.ts`

### Responsibilities by layer

Routes:

- Register HTTP paths and middleware only.

Controllers:

- Read request data.
- Call services.
- Return consistent responses.

Services:

- Apply business rules.
- Validate cross-field logic that belongs to the domain.
- Prepare data for persistence.

Repositories:

- Execute database queries only.

### Exit criteria

- Sales and expenses can be created and listed through the backend.
- No business rules are buried inside route handlers.
- Response and error shapes are consistent.

### Validation

- Endpoint tests or at least focused manual verification.
- Typecheck.
- Lint.

## 6. Phase 4: Bidr / Debt Workflows

### Goal

Add debt-specific functionality without mixing it into generic sales logic.

### Work

Implement the bidr-specific flows, such as:

- create debt sale
- list debt sales
- mark debt as paid
- update debt status
- optionally track partial payments later if the product requires it

### Design rules

- Keep bidr debt behavior separate from instant sale behavior where the workflow differs.
- Reuse shared sale types and repository patterns where possible.
- Do not force debt-specific fields onto all sales.

### Suggested files

- `backend/src/routes/bidr.routes.ts`
- `backend/src/controllers/bidr.controller.ts`
- `backend/src/service/bidr.service.ts`
- `backend/src/repositories/bidr.repository.ts`
- `backend/src/validations/bidr.validation.ts`

If the repo prefers one sales module with a debt subtype, keep that structure instead. The key rule is to keep the debt workflow explicit and not hidden in generic sale code.

### Exit criteria

- Debt records have a clear lifecycle.
- Marking paid or settled is server-controlled.
- The mobile app can rely on backend state instead of local-only assumptions.

### Validation

- Regression checks for debt creation and settlement.
- Ensure authorization is enforced on debt updates.

## 7. Phase 5: Branch and Business Scoping

### Goal

Make sure sales and expenses are always scoped to the correct business and branch.

### Work

- Enforce business ownership checks.
- Enforce branch ownership or membership checks.
- Add filters for:
  - business
  - branch
  - date range
  - sale type
  - expense category
- Ensure the authenticated user cannot access another business’s records by changing IDs.

### Reuse

Use the existing auth middleware and helper patterns from the backend business/branch modules.

### Exit criteria

- Queries are scoped correctly.
- Cross-business access is blocked.
- Branch-specific records are isolated.

### Validation

- Authorization tests.
- Query tests for scoped results.

## 8. Phase 6: Reporting and Summaries

### Goal

Add summary endpoints only after the core CRUD and scoping are stable.

### Work

Potential summary endpoints:

- daily sales total
- daily expense total
- sales by branch
- expenses by category
- debt totals and overdue totals
- payment-method breakdown

### Rules

- Do not create summary endpoints prematurely.
- Only add summaries that the mobile app actually needs.
- Prefer simple server-side aggregation over complex client-side recomputation.

### Exit criteria

- The mobile app can request summarized data without scanning all records locally.
- Summary endpoints are predictable and documented.

### Validation

- Aggregate logic tests.
- Edge cases for empty results and date filters.

## 9. Phase 7: Sync and Offline Support

### Goal

Add sync-friendly behavior if the mobile app needs reliable offline submission.

### Work

- Design idempotent create/update behavior.
- Add client request identifiers if repeated submission is expected.
- Support conflict-safe updates if records can be edited offline.
- Expose sync-friendly timestamps or version fields if needed.

### Rules

- Do not add sync complexity unless the mobile app truly needs it.
- Keep the contract simple and explicit.

### Exit criteria

- Replayed writes do not create obvious duplicates.
- The API can support offline-first behavior safely.

### Validation

- Retry and duplicate-submission checks.
- Conflict handling tests if updates are supported.

## 10. Phase 8: Testing and Hardening

### Goal

Stabilize the backend after the feature work is in place.

### Work

- Add validation tests.
- Add service tests.
- Add repository tests where useful.
- Add controller/route tests for critical paths.
- Review error handling and response consistency.
- Confirm no sensitive data leaks through logs or API responses.

### Exit criteria

- Critical sales and expense paths are covered.
- No major regressions are introduced by future changes.

### Validation order

1. Focused tests
2. Relevant test suite
3. Typecheck
4. Lint
5. Build if applicable

## 11. Recommended Delivery Order

Implement in this order:

1. Inventory and domain design
2. Data model and contracts
3. Core CRUD
4. Bidr / debt workflows
5. Business and branch scoping
6. Reporting and summaries
7. Sync support
8. Testing and hardening

This sequence keeps each step small and reduces the chance of breaking the app while the backend grows.

## 12. Definition of Done

The sales backend is complete when:

- Sales and expenses are persisted on the backend.
- Debt / bidr behavior is handled explicitly.
- Authorization is enforced server-side.
- Business and branch scoping works correctly.
- Validation lives at the API boundary.
- Route handlers stay thin.
- Tests or focused verification cover the critical flows.
- The mobile app no longer depends on mock-only sales state for core workflows.
