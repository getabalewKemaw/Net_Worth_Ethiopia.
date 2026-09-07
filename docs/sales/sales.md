# Sales Feature File Map

This document maps the current sales-related code to the intended folder structure for the NetWorth Ethiopia repo.

It follows the repository guidance in `docs/AGENTS.md`:

- Keep route files thin.
- Reuse existing primitives before creating new ones.
- Put generic UI in `mobile/src/components/ui/`.
- Put reusable feature widgets in `mobile/src/components/`.
- Put feature-specific screens in `mobile/src/features/`.
- Put validation in `mobile/src/validations/`.
- Put API access in `mobile/src/services/`.
- Keep local UI state local unless multiple screens truly share it.

This is a placement plan only. No implementation changes are made here.

## 1. Sales Scope

The sales feature currently spans the following files:

- `mobile/src/app/(tabs)/sales.tsx`
- `mobile/src/app/(tabs)/bidr.tsx`
- `mobile/src/components/navigation/hamburger-drawer.tsx`
- `mobile/src/components/navigation/bottom-tab-bar.tsx`
- `mobile/src/app/(tabs)/index.tsx`
- `mobile/src/components/charts/dashboard-charts.tsx`

The main sales screen is currently a single large route file that includes:

- Route-level screen composition
- Mock data
- Local state for sales and expenses
- Modal UI for adding sales and expenses
- Helper functions for due-date formatting
- Badge and summary UI
- Screen styling

That makes it a good candidate for splitting along feature boundaries.

## 2. Recommended Folder Structure

Recommended target structure for sales-related code:

```text
mobile/src/
├── app/
│   └── (tabs)/
│       ├── sales.tsx
│       ├── bidr.tsx
│       └── _layout.tsx
│
├── features/
│   └── sales/
│       ├── sales-screen.tsx
│       ├── add-sale-modal.tsx
│       ├── add-expense-modal.tsx
│       └── sales-empty-state.tsx
│
├── components/
│   ├── sales/
│   │   ├── payment-badge.tsx
│   │   ├── sale-type-badge.tsx
│   │   ├── category-badge.tsx
│   │   ├── section-summary.tsx
│   │   └── sales-toggle.tsx
│   ├── charts/
│   │   └── dashboard-charts.tsx
│   └── navigation/
│       ├── hamburger-drawer.tsx
│       └── bottom-tab-bar.tsx
│
├── hooks/
│   └── use-sales.ts
│
├── services/
│   ├── sales.ts
│   └── expenses.ts
│
├── validations/
│   └── sales.ts
│
├── constants/
│   └── sales.ts
│
└── types/
    └── sales.ts
```

## 3. File-by-File Placement Plan

### 3.1 Route Files

#### `mobile/src/app/(tabs)/sales.tsx`

Current role:

- Sales route entry
- Currently contains the full sales UI and all sales logic

Target role:

- Thin route wrapper only
- Should import and render the sales feature screen

Suggested final responsibility:

- `export default function SalesRoute() { return <SalesScreen />; }`

#### `mobile/src/app/(tabs)/bidr.tsx`

Current role:

- Route entry for debt / bidr
- Placeholder screen

Target role:

- Keep as the route entry for the debt feature
- Later it can either stay a placeholder or mount a dedicated bidr feature screen

Relation to sales:

- This is a conceptual sibling to sales, not a reusable sales component

#### `mobile/src/app/(tabs)/_layout.tsx`

Current role:

- Declares the tab navigation structure

Target role:

- Keep here
- No sales-specific extraction needed

### 3.2 Feature Screens

#### `mobile/src/features/sales/sales-screen.tsx`

Should contain:

- Main sales/expenses tab UI
- Screen composition
- Local screen state if it stays feature-local
- Integration of sales feature components and modals

Should not contain:

- Inline constant mock data if that can move to `constants/sales.ts`
- Badge components
- Validation schemas
- API calls
- Large styling blocks for reusable elements

#### `mobile/src/features/sales/add-sale-modal.tsx`

Should contain:

- Add sale modal UI
- Sale type toggle inside the modal if it is only used there
- Due-date selection UI
- Form behavior for creating a sale entry

Good candidates to extract further:

- Date helper logic
- Reusable input rows
- Payment method selector, if shared

#### `mobile/src/features/sales/add-expense-modal.tsx`

Should contain:

- Expense modal UI
- Category selection UI
- Expense entry behavior

If expense tracking grows into a broader feature, this could later move into a separate `features/expenses/` area.

#### `mobile/src/features/sales/sales-empty-state.tsx`

Optional file for:

- Empty sales and expenses states
- Reusable empty-state illustration/text/layout

Only worth creating if both lists start sharing the same pattern or if the screen grows further.

### 3.3 Sales Components

#### `mobile/src/components/sales/payment-badge.tsx`

Current inline responsibility:

- Renders payment method chip for cash, Telebirr, and CBE Birr

Why this belongs here:

- It is a small reusable sales visual, not a generic UI primitive

#### `mobile/src/components/sales/sale-type-badge.tsx`

Current inline responsibility:

- Shows `Instant` versus `Dube`

Why this belongs here:

- Sales-domain-only label and styling

#### `mobile/src/components/sales/category-badge.tsx`

Current inline responsibility:

- Displays expense category pill

Why this belongs here:

- It is reusable within sales/expense screens, but not generic enough for `components/ui/`

#### `mobile/src/components/sales/section-summary.tsx`

Current inline responsibility:

- Renders the summary card used for sales and expenses

Why this belongs here:

- Reusable feature summary card, not a universal UI primitive

#### `mobile/src/components/sales/sales-toggle.tsx`

Current inline responsibility:

- Main screen toggle between sales and expenses
- Sale-type segmented switcher in the modal, if reused

Placement note:

- If the component is only used once, it can stay in the feature file instead
- Extract it only if it reduces duplication or improves clarity

### 3.4 Hooks

#### `mobile/src/hooks/use-sales.ts`

Should contain:

- Sales screen local state
- Add-sale and add-expense actions
- Date formatting helpers if they are business-logic-ish
- Any future persistence/loading logic

Good fit for this hook:

- `sales` state
- `expenses` state
- `showAddSale`
- `showAddExpense`
- `activeTab`
- `handleAddSale`
- `handleAddExpense`

Not a good fit:

- Pure visual components
- Styling
- Route navigation definitions

### 3.5 Services

#### `mobile/src/services/sales.ts`

Should contain:

- API calls for sales persistence
- Fetching sales
- Creating sales
- Updating sales
- Marking debt sales as paid, if that workflow is added later

#### `mobile/src/services/expenses.ts`

Should contain:

- API calls for expense persistence
- Fetching expenses
- Creating expenses

These services do not exist yet, but they are the logical home once the in-memory sales tab becomes persistent.

### 3.6 Validations

#### `mobile/src/validations/sales.ts`

Should contain:

- Zod schema for sale creation/editing
- Validation for instant sale entries
- Validation for dube/debt sale entries
- Validation for due date fields and payment method selection

Potential schemas:

- `saleSchema`
- `saleTypeSchema`
- `dueDateSchema`

#### `mobile/src/validations/expenses.ts`

This file is not required immediately, but it would be the matching home for expense validation if expense forms become more than a simple modal.

### 3.7 Constants

#### `mobile/src/constants/sales.ts`

Should contain:

- `INITIAL_SALES`
- `INITIAL_EXPENSES`
- `PAYMENT_METHODS`
- `EXPENSE_CATEGORIES`
- `DUE_PRESETS`
- Sales type labels and colors

Why this belongs here:

- These are feature constants and static config, not logic

This file is also the right place for display labels if the sales UI and bidr UI share terms.

### 3.8 Types

#### `mobile/src/types/sales.ts`

Should contain:

- `SaleType`
- `SaleEntry`
- `ExpenseEntry`
- `PaymentMethod`
- related payload types for add/update flows

Why this belongs here:

- The sales screen currently defines domain types inline
- Those types should be shared by the feature components, hook, validation, and service layers

## 4. Files That Should Stay Where They Are

These files are sales-adjacent but should not be moved into the sales feature:

- `mobile/src/components/navigation/hamburger-drawer.tsx`
- `mobile/src/components/navigation/bottom-tab-bar.tsx`
- `mobile/src/app/(tabs)/_layout.tsx`
- `mobile/src/app/(tabs)/index.tsx`
- `mobile/src/components/charts/dashboard-charts.tsx`

Reason:

- They are shared app infrastructure or dashboard UI, not sales-owned code
- They can reference sales routes, but they should remain in their current structural homes

## 5. What Lives Inside `sales.tsx` After Splitting

After the split, the route file should only do this:

- Import the sales feature screen
- Render it
- Keep route-level concerns only

It should not contain:

- Mock data
- Modal implementations
- Badge components
- Date helper functions
- Expense/sale state
- Inline screen styling for all subparts

## 6. Suggested Extraction Order

If we later implement the split, the safest order is:

1. Move shared types to `mobile/src/types/sales.ts`
2. Move feature constants to `mobile/src/constants/sales.ts`
3. Move helpers and local state into `mobile/src/hooks/use-sales.ts`
4. Move badge and summary UI into `mobile/src/components/sales/`
5. Move modal UIs into `mobile/src/features/sales/`
6. Reduce `mobile/src/app/(tabs)/sales.tsx` to a thin route wrapper

This order keeps the code compiling incrementally and avoids a large risky refactor.

## 7. Relationship To Bidr

The `bidr` screen is the conceptual debt sibling of sales, but it is not yet implemented as a real feature.

Current state:

- Sales has an in-memory mock workflow
- Bidr is a placeholder page
- The dashboard and navigation already surface both concepts

Recommended rule:

- Keep sales and bidr conceptually separate until bidr gets its own real data model
- Share constants or badges only when the labels and behavior are genuinely common

## 8. Summary

Sales-related code should be split like this:

- Route files stay thin in `mobile/src/app/(tabs)/`
- Feature screens live in `mobile/src/features/sales/`
- Reusable sales UI lives in `mobile/src/components/sales/`
- Local controller logic lives in `mobile/src/hooks/use-sales.ts`
- Static config lives in `mobile/src/constants/sales.ts`
- Validation lives in `mobile/src/validations/sales.ts`
- API access lives in `mobile/src/services/sales.ts`
- Shared app navigation and dashboard files stay where they are
