# Current Folder Structure

This document reflects the current repo layout as of September 7, 2026.

## `mobile/src/`

```text
mobile/src/
├── app/
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   └── signup-success.tsx
│   ├── (business)/
│   │   ├── _layout.tsx
│   │   ├── branches.tsx
│   │   ├── business-profile.tsx
│   │   ├── create-branch.tsx
│   │   ├── create-business.tsx
│   │   └── edit-branch.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── bidr.tsx
│   │   ├── index.tsx
│   │   ├── profile.tsx
│   │   └── sales.tsx
│   ├── _layout.tsx
│   └── explore.tsx
├── components/
│   ├── app-tabs.tsx
│   ├── app-tabs.web.tsx
│   ├── animated-icon.tsx
│   ├── animated-icon.web.tsx
│   ├── animated-icon.module.css
│   ├── auth/
│   │   ├── AuthCard.tsx
│   │   ├── BackgroundGrid.tsx
│   │   └── GoogleButton.tsx
│   ├── business/
│   │   ├── category-selector.tsx
│   │   └── step-indicator.tsx
│   ├── charts/
│   │   └── dashboard-charts.tsx
│   ├── hint-row.tsx
│   ├── navigation/
│   │   ├── bottom-tab-bar.tsx
│   │   └── hamburger-drawer.tsx
│   ├── sales/
│   │   ├── category-badge.tsx
│   │   ├── payment-badge.tsx
│   │   ├── sale-type-badge.tsx
│   │   └── section-summary.tsx
│   ├── themed-text.tsx
│   ├── themed-view.tsx
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── collapsible.tsx
│   │   └── input.tsx
│   ├── external-link.tsx
│   └── web-badge.tsx
├── constants/
│   ├── business.ts
│   ├── sales.ts
│   └── theme.ts
├── features/
│   ├── business/
│   │   ├── branches-ui.tsx
│   │   ├── business-profile-ui.tsx
│   │   ├── create-branch-ui.tsx
│   │   ├── create-business-ui.tsx
│   │   └── edit-branch-ui.tsx
│   └── sales/
│       ├── add-expense-modal.tsx
│       ├── add-sale-modal.tsx
│       └── sales-screen.tsx
├── global.css
├── hooks/
│   ├── use-business-profile.ts
│   ├── use-branches.ts
│   ├── use-color-scheme.ts
│   ├── use-color-scheme.web.ts
│   ├── use-create-branch.ts
│   ├── use-create-business.ts
│   ├── use-edit-branch.ts
│   ├── use-sales.ts
│   └── use-theme.ts
├── lib/
│   ├── auth-client.ts
│   ├── online-manager-polyfill.ts
│   └── storage.ts
├── service/
│   ├── branch.ts
│   └── business.ts
├── store/
│   └── business-store.ts
├── types/
│   └── sales.ts
└── validations/
    ├── branch.ts
    └── business.ts
```

## `backend/src/`

```text
backend/src/
├── config/
│   ├── auth.ts
│   └── db.ts
├── controllers/
│   ├── bidr.controller.ts
│   ├── branch.controller.ts
│   ├── business.controller.ts
│   ├── expenses.controller.ts
│   └── sales.controller.ts
├── db/
│   ├── business-branch-management.ts
│   ├── sales-expense-management.ts
│   └── schema.ts
├── helpers/
│   ├── errors.ts
│   └── response.ts
├── middleware/
│   ├── auth.ts
│   └── error.ts
├── repositories/
│   ├── bidr.repository.ts
│   ├── branch.repository.ts
│   ├── business.repository.ts
│   ├── expenses.repository.ts
│   └── sales.repository.ts
├── routes/
│   ├── bidr.routes.ts
│   ├── branch.routes.ts
│   ├── business.routes.ts
│   ├── expenses.routes.ts
│   └── sales.routes.ts
├── service/
│   ├── bidr.service.ts
│   ├── branch.service.ts
│   ├── business.service.ts
│   ├── expenses.service.ts
│   └── sales.service.ts
├── types/
│   ├── bidr.ts
│   ├── index.ts
│   └── sales.ts
├── validations/
│   ├── bidr.validation.ts
│   ├── branch.validation.ts
│   ├── business.validation.ts
│   └── sales.validation.ts
└── index.ts
```

## Notes

* The mobile app currently uses a singular `service/` folder.
* The structure is intentionally separated by responsibility rather than by file type alone.
* Route files should remain thin and delegate real behavior to `features/`, `components/`, `hooks/`, and `service/`.
