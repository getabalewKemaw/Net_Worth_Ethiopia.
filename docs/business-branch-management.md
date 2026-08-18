# Business & Branch Management Documentation

This document explains the end-to-end implementation of the **Business and Branch Management** feature for the NetWorth Ethiopia project.

---

## 1. Feature Overview

The Business and Branch Management module allows merchants to register their businesses, create multiple operating branch locations, switch active context, and configure payment options (Telebirr / CBE Birr) to prepare for payouts.

### Key Capabilities
* **Step-by-Step Business Registration:** An elegant 2-step setup wizard using progress animations to register a core profile (Step 1) and optional legal details (Step 2).
* **Business Profile Settings:** View and update registered business profiles.
* **Multi-Branch Operations:** Support for multiple branch locations per business, allowing merchants to switch their active operating branch.
* **Payment Credentials Setup:** Configure Telebirr Merchant IDs and CBE Birr Merchant IDs per branch to allow local payouts.

---

## 2. Directory Structure & Architecture

The feature is implemented end-to-end across a layered Node.js/Express backend and a modular React Native/Expo mobile app.

### Mobile Client Directory Layout
The mobile client enforces a strict **Separation of Concerns (SoC)** separating logic from visual layouts, and page routing from state management.

```text
mobile/src/
├── app/
│   └── (business)/                # Dynamic Router Wrappers (Thin Binders)
│       ├── create-business.tsx    # Binds useCreateBusiness() -> <CreateBusinessUI />
│       ├── business-profile.tsx   # Binds useBusinessProfile() -> <BusinessProfileUI />
│       ├── create-branch.tsx      # Binds useCreateBranch() -> <CreateBranchUI />
│       ├── edit-branch.tsx        # Binds useEditBranch() -> <EditBranchUI />
│       └── branches.tsx           # Binds useBranches() -> <BranchesUI />
│
├── features/
│   └── business/                  # Feature Screens (High-Level Presentation UI Layouts)
│       ├── create-business-ui.tsx
│       ├── business-profile-ui.tsx
│       ├── create-branch-ui.tsx
│       ├── edit-branch-ui.tsx
│       └── branches-ui.tsx
│
├── components/
│   └── business/                  # Reusable Widgets (Visual components only)
│       ├── category-selector.tsx  # Custom type selector card grid
│       └── step-indicator.tsx     # Animated stepper progress bar
│
├── hooks/                         # Logic Hook Controllers
│   ├── use-create-business.ts     # Handles wizard state & Zod validation
│   ├── use-business-profile.ts    # Handles updates & active profile loading
│   ├── use-create-branch.ts       # Handles branch form state
│   ├── use-edit-branch.ts         # Handles loading branch info & updates
│   └── use-branches.ts            # Handles switching business/branch selectors
│
├── store/
│   └── business-store.ts          # Zustand Global State store & API mutations
│
└── constants/
    └── business.ts                # Centralized business constant definitions
```

### Backend Server Directory Layout
The Express backend separates duties using standard repository-service-controller design patterns:

```text
backend/src/
├── db/
│   ├── schema.ts                  # Re-exports business-branch-management database schema
│   └── business-branch-management.ts # Mapped Drizzle PostgreSQL table schema
│
├── routes/                        # HTTP Endpoint mapping & auth injection
│   ├── business.routes.ts         # Routing for /api/businesses
│   └── branch.routes.ts           # Routing for /api/branches & /api/businesses/:id/branches
│
├── controllers/                   # HTTP Request parsing & JSON response wrapping
│   ├── business.controller.ts     
│   └── branch.controller.ts       
│
├── service/                       # Business logic, UUID generation, ownership validation
│   ├── business.service.ts        
│   └── branch.service.ts          
│
├── repositories/                  # SQL database CRUD queries using Drizzle ORM
│   ├── business.repository.ts     
│   └── branch.repository.ts       
│
└── validations/                   # Backend request validation schemas (Zod)
    ├── business.validation.ts     
    └── branch.validation.ts       
```

## 3. Database Schema & Migration Guide

The backend uses **Drizzle ORM** mapped to PostgreSQL.

### Schema Definition
The database models are defined in [`backend/src/db/business-branch-management.ts`](file:///c:/Users/Hp/Desktop/NetworthET/Net_Worth_Ethiopia/backend/src/db/business-branch-management.ts):
* **`business` Table:** Stores name, type, phone, email, TIN, and commercial registration numbers, references `user.id`.
* **`branch` Table:** Stores branch name, address, contact, and payment configuration IDs (`telebirr_merchant_id`, `cbe_birr_merchant_id`), references `business.id`.

### Database Sync & Migrations
To sync the schema with your local database instance:

1. **Configure Environment Variables:**
   Ensure `DATABASE_URL` is set in your `backend/.env` file:
   ```env
   DATABASE_URL=postgresql://<user>:<password>@localhost:5432/<db_name>
   ```

2. **Generate Migration Files:**
   If you make changes to [`schema.ts`](file:///c:/Users/Hp/Desktop/NetworthET/Net_Worth_Ethiopia/backend/src/db/schema.ts) or [`business-branch-management.ts`](file:///c:/Users/Hp/Desktop/NetworthET/Net_Worth_Ethiopia/backend/src/db/business-branch-management.ts), generate migrations using:
   ```bash
   npx drizzle-kit generate
   ```

3. **Apply Schema to Database:**
   Push the schema updates directly to the database:
   ```bash
   npx drizzle-kit push
   ```

---

## 4. Setup and Verification

To verify configuration setup:

1. **Launch Backend Server:**
   ```bash
   cd backend
   npm run dev
   ```
2. **Launch Mobile Expo Web/Simulator:**
   ```bash
   cd mobile
   npm run web
   ```
3. **Validate TypeScript & Compilation:**
   Ensure no type errors occur before committing changes:
   ```bash
   npx tsc --noEmit
   ```
