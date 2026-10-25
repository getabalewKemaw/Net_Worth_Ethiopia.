# Sales Staff Interface — UI & UX Design Blueprint

This document details the interface layout, screen anatomy, component hierarchies, and user interaction flows for:
1. **The Sales Staff Counter Interface** (Option B: 3 Tabs + Daily Shift Dashboard).
2. **The Branch Staff Assignment UI** (integrated inside Branch Management).
3. **The Owner Daily Branch Digest Screen** (accessible via the Hamburger Menu).

---

## 1. Sales Staff Counter Interface (`mobile/src/app/staff/`)

The sales counter interface is built for speed, contrast, and distraction-free operation on low-cost Android phones and tablets.

### Layout Anatomy (Staff Home / POS)

```
┌─────────────────────────────────────────────────────────────┐
│ Addis Premium Store · Bole Outlet 🔒       [ 👤 Chala (Sales)│ <-- Top Header
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │  TODAY'S SHIFT DRAWER (Bole Branch)                     │ │
│ │  Total Shift Volume: 15,800.00 ETB                      │ │
│ │ ┌───────────────────────┬─────────────────────────────┐ │ │ <-- Shift Summary Card
│ │ │ 💵 Cash in Drawer     │ 📱 Telebirr Collected       │ │ │     (Reconciles counter cash)
│ │ │ 4,200.00 ETB          │ 8,500.00 ETB                │ │ │
│ │ ├───────────────────────┼─────────────────────────────┤ │ │
│ │ │ 🏦 CBE Birr Collected │ 👥 Dube Recovered           │ │ │
│ │ │ 3,100.00 ETB          │ 2,400.00 ETB                │ │ │
│ │ └───────────────────────┴─────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  COUNTER WORKSPACE                                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ [ + Quick Instant Sale ]    [ 📝 Issue Dube Credit ]  │  │ <-- Quick Action Bar
│  └───────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  SHIFT SALES FEED (Today)                                   │
│  • Instant Sale · 450 ETB (Telebirr)             10:24 AM   │
│  • Dube Settlement · 1,200 ETB (Cash) · Almaz    09:50 AM   │
│  • Instant Sale · 2,100 ETB (Cash)               09:12 AM   │
│  • Transport Expense · 150 ETB (Cash)            08:30 AM   │
└─────────────────────────────────────────────────────────────┘
│    [ 🧾 Sales ]        [ 👥 Customer Dube ]    [ 💸 Expenses ]│ <-- Staff 3-Tab Bottom Bar
└─────────────────────────────────────────────────────────────┘
```

### Visual Specifications
- **Branch Lock Banner**: Deep slate pill `#0F172A` with lock icon `🔒` showing the cashier that transactions belong strictly to this location.
- **Cash Handover Card**: Background Emerald `#064E3B` with crisp white and emerald callouts for physical cash versus digital mobile wallets.
- **Zero Profit Display**: Net profit and business-wide profit margins are completely omitted from the staff client to safeguard the owner's financial confidentiality.

---

## 2. Staff Bottom Navigation (3 Core Tabs)

### Tab 1: Sales (`/staff-sales`)
- **Register Sale**: Fast counter entry for instant sales.
  - Amount input (numeric pad optimized).
  - One-tap payment method selector: `[ Cash ]`, `[ Telebirr ]`, `[ CBE Birr ]`.
  - Item / Description note.
  - Automatically tags `branchId` and `recordedByName: "Chala Tadesse"`.
- **Shift Sales History**: Reverse chronological list of all sales recorded today at this branch.

### Tab 2: Customer Dube / Credit (`/staff-dube`)
- **Active Debt Registry**:
  - Filter by: `All Active`, `Due Soon`, `Overdue`.
  - Displays customer name, phone number, and outstanding balance in ETB.
- **Settle Dube**:
  - One-tap "Settle Debt" button on customer card.
  - Cashier enters amount received (handles partial or full settlements).
  - Cashier selects payment method (Cash / Telebirr / CBE).
  - Automatically logged to the Owner's Daily Audit Digest.
- **Issue New Dube**:
  - Form: Customer Name, Phone, Total Amount, Due Date, Items list.
  - Automatically bound to the staff member's branch.

### Tab 3: Operating Expenses (`/staff-expenses`)
- Allows cashiers to record shop operating expenses (e.g. packaging bags, cleaning supplies, staff lunch, local transport).
- Amount, expense category, and description.
- Automatically records `branchId` and `recordedByName`.

---

## 3. Branch Management Staff Assignment UI (Owner Side)

Located inside the existing **Branch Management** module (`mobile/src/features/business/edit-branch-ui.tsx` or branch details screen).

```
┌─────────────────────────────────────────────────────────────┐
│ ← Back      Edit Branch: Bole Outlet                        │
├─────────────────────────────────────────────────────────────┤
│  BRANCH DETAILS                                             │
│  Branch Name: Bole Outlet                                   │
│  City: Addis Ababa · Sub-City: Bole Woreda 03               │
├─────────────────────────────────────────────────────────────┤
│  ASSIGNED COUNTER STAFF                                     │
│  Team members authorized to operate this branch counter     │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 👤 Chala Tadesse (chala@gmail.com)                    │  │
│  │    Role: Sales / Cashier · [✓ Active]                 │  │
│  │    [ Reassign Branch ]               [ ✕ Remove ]     │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │ 👤 Almaz Worku (almaz.sales@gmail.com)                │  │
│  │    Role: Sales · [⏳ Pending Registration]            │  │
│  │    [ Resend Invite ]                 [ ✕ Cancel ]     │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  [ + Assign New Staff Member by Email ]                     │ <-- Action Button
└─────────────────────────────────────────────────────────────┘
```

### Assignment Modal (Triggered by "+ Assign New Staff Member")
* **Input Fields**:
  1. **Staff Member Email**: e.g. `cashier.bole@gmail.com`.
  2. **Staff Name / Nickname**: e.g. `Chala (Day Shift)`.
  3. **Role**: Radio selection `Sales Staff / Cashier` (Default).
* **Validation**:
  - Validates email format.
  - Checks if email is already assigned to this branch.
* **On Submit**: Creates a pending assignment. The moment the staff member logs into the app with that email, their account is automatically claimed and routed to this branch.

---

## 4. Owner Daily Branch Digest Screen (`mobile/src/app/daily-digest.tsx`)

Accessible exclusively to the business owner via the **Hamburger Navigation Drawer** under *Financial Intelligence* (`route: '/daily-digest'`).

```
┌─────────────────────────────────────────────────────────────┐
│ ☰  Daily Branch Digest                 [ 📅 Today (Oct 24) ▾│ <-- Date Picker
├─────────────────────────────────────────────────────────────┤
│  COMPANY-WIDE RECONCILIATION SUMMARY                        │
│  Total Gross Inflow: 28,400.00 ETB                          │
│  ┌───────────────────────────┬────────────────────────────┐ │
│  │ 💵 Physical Cash to Collect│ 📱 Digital Bank Trails     │ │
│  │ 11,200.00 ETB             │ 17,200.00 ETB (Telebirr/CBE│ │
│  └───────────────────────────┴────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  BRANCH COUNTER AUDITS (2 Operating Locations)              │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 🏬 BOLE OUTLET                     Cashier: Chala T.  │  │
│  │  Inflow: 16,400 ETB  ·  Expenses: 1,200 ETB           │  │
│  │  Cash in Drawer: 6,200 ETB  ·  Telebirr: 7,800 ETB    │  │
│  │                                                       │  │
│  │  👥 DEBTS SETTLED TODAY (1 Customer):                 │  │
│  │  • Almaz Kebede · 3,200 ETB (Telebirr)                │  │
│  │    Logged by Chala T. at 02:15 PM                     │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 🏬 PIASSA MAIN STORE               Cashier: Tigist H. │  │
│  │  Inflow: 12,000 ETB  ·  Expenses: 800 ETB             │  │
│  │  Cash in Drawer: 5,000 ETB  ·  CBE Birr: 7,000 ETB    │  │
│  │                                                       │  │
│  │  👥 DEBTS SETTLED TODAY (2 Customers):                │  │
│  │  • Dawit Isaak · 2,400 ETB (Cash)                     │  │
│  │  • Meron Haile · 1,200 ETB (CBE Birr)                 │  │
│  │    Logged by Tigist H.                                │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Key Capabilities of the Daily Digest:
1. **Physical Cash Accountability**: The owner knows precisely how much physical paper cash each branch cashier holds before closing the store.
2. **Digital Verification**: Telebirr and CBE transaction amounts can be cross-referenced with bank SMS notifications.
3. **Debt Collection Transparency**: Lists which customer credit was collected, by which cashier, and in what payment form.
