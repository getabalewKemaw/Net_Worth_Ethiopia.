# Sales Staff Interface & Role-Based Access Control

**Module**: Sales Staff Interface & Branch Assignment Engine  
**Target Repository**: NetWorth Ethiopia  
**Status**: Architecture & Planning Phase  
**Related Documentation Suite**:
- 🗄️ [**schema-and-data-model.md**](file:///home/eaglex/Documents/insa-ctc/FinalProject/docs/staff-interface/schema-and-data-model.md) — PostgreSQL Drizzle tables, SQLite local mirrors, indexes, and migrations.
- 🌐 [**architecture-and-api.md**](file:///home/eaglex/Documents/insa-ctc/FinalProject/docs/staff-interface/architecture-and-api.md) — Unified auth routing, branch auto-tagging, API contracts, and security rules.
- 🎨 [**ui-and-ux-design.md**](file:///home/eaglex/Documents/insa-ctc/FinalProject/docs/staff-interface/ui-and-ux-design.md) — Staff interface layout (Option B), branch assignment modal, and Owner Daily Digest screen.
- 📋 [**implementation-plan.md**](file:///home/eaglex/Documents/insa-ctc/FinalProject/docs/staff-interface/implementation-plan.md) — Step-by-step phased execution matrix.

---

## 1. Executive Summary

As Ethiopian MSMEs scale from single-owner shops to multi-branch retail stores, supermarkets, and wholesale depots (in commercial centers like Merkato, Bole, Piassa, and regional cities), business owners delegate counter operations to sales clerks and cashiers. 

Currently, **NetWorth Ethiopia** operates under an owner-only model where every authenticated account has full access to sensitive business data, overall profit margins, bank loan dossiers, and all operating branches. 

The **Sales Staff Interface** introduces role-based access control (RBAC) and branch-scoped counter operations:
1. **Branch-Locked Staff POS Interface (Option B)**:
   - Dedicated counter workspace locked strictly to the salesperson's assigned branch.
   - **Today's Drawer Summary**: Real-time counter shift metrics (Cash in Drawer, Telebirr collected, CBE Birr collected).
   - **3 Core Workflows**: Instant Sales, Customer Credit (*Dube* issuance & settlement), and Petty Operating Expenses.
   - **Confidentiality Shield**: Profit margins, Business Health (`/health`), loan dossiers, and other branches' revenues are completely hidden from staff.
2. **Seamless Branch Assignment in Branch Management**:
   - Owners assign staff members directly within the existing **Branch Management** module by typing their email.
   - Pending invite system with automatic claiming upon staff sign-in.
3. **Automatic Branch Tagging (Zero Manual Input)**:
   - All sales, expenses, and debts automatically inherit the branch ID in the background with 0ms latency.
4. **Owner Daily Branch Digest (Dedicated Hamburger Menu Screen)**:
   - An uncluttered, comprehensive end-of-day audit view showing daily sales, cash handovers, and settled debt logs across all operating branches.

---

## 2. Core User Personas

```
┌────────────────────────────────────────────────────────────────────────┐
│                        BUSINESS OWNER (Full Admin)                     │
│  • Manages multiple branches (Bole, Piassa, Merkato).                  │
│  • Assigns staff members to specific branches via email.               │
│  • Audits daily multi-branch collections & cash handovers.             │
│  • Retains exclusive access to Business Health & Bank Loan Dossiers.   │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ Assigns staff to branch
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     SALES STAFF / CASHIER (Branch-Locked)              │
│  • Operates counter checkout strictly at their assigned branch.        │
│  • Records instant sales (Cash, Telebirr, CBE Birr).                   │
│  • Manages customer Dube (view active debts & record settlements).     │
│  • Tracks daily shift drawer (cash handover at end of day).            │
│  • Zero visibility into net profits, margins, or other branches.       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. High-Level Role & Permissions Matrix

| Feature / Capability | Business Owner | Sales Staff / Cashier | Security Enforcement |
| :--- | :---: | :---: | :--- |
| **Branch Selection** | Dynamic (All Branches) | **Permanently Locked 🔒** | Client route guard & backend middleware |
| **Record Instant Sales** | Yes | Yes (Assigned Branch) | Auto-tagged with `branchId` + `recordedByName` |
| **Customer Dube (Credit)** | View & Settle All | **View & Settle Own Branch** | SQLite query filtered by `branch_id` |
| **Record Operating Expenses** | Direct (`approved`) | Direct for Own Branch | Auto-tagged with `branchId` |
| **Shift Drawer / Cash Count** | View All Branches | View Own Shift Drawer | Shift calculation aggregated from local records |
| **Daily Multi-Branch Digest** | Dedicated Screen | **Hidden ❌** | Screen hidden from staff drawer |
| **Staff Member Assignment** | Full Control (Add/Remove) | **Hidden ❌** | Protected by `requireOwner` middleware |
| **Business Health & Loan Dossier** | Full Access (`/health`) | **Hidden ❌** | Route blocked & navigation removed |
| **Branch Configuration & TIN** | Full Control | **Hidden ❌** | Protected by `requireOwner` middleware |

---

## 4. Architectural Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                 UNIFIED SIGN-IN (Email / Google)            │
└──────────────────────────────┬──────────────────────────────┘
                               │
                Is user assigned as Staff?
                 ├── YES ───► Locked Staff Interface
                 │            • Scoped to assigned branch
                 │            • Shift Drawer Summary
                 │            • Sales + Dube + Expenses
                 │
                 └── NO ────► Is user an Owner?
                              ├── YES ──► Owner Experience (All Branches, Health)
                              └── NO ───► Business Registration Flow (New User)
```
