<p align="center">
  <img src="web/public/logo.png" alt="NetWorth Ethiopia Logo" width="130" />
</p>

<h1 align="center">NetWorth Ethiopia</h1>

<p align="center">
  <strong>Transforming Informal African Retail Into Bankable Enterprises</strong>
</p>

<p align="center">
  An offline-first financial operating system, automated SMS ledger, and alternative credit underwriting engine built to bridge the multi-billion-dollar MSME financing gap in Ethiopia.
</p>

---

##Our Research

In Ethiopia and across sub-Saharan Africa, micro, small, and medium enterprises (MSMEs) drive over 80% of urban employment and 90% of private business activity. Yet over 85% of these merchants cannot secure a single Birr in working capital from commercial banks. 

They are not failing businesses; they are profitable, cash-generative merchants trapped in an outdated banking paradigm. 

Commercial banks (Commercial Bank of Ethiopia, Awash, Dashen, and regional microfinance institutions) require physical real-estate collateral, audited balance sheets, and tax clearance certificates. An informal shopkeeper, electronics retailer, or food distributor in Addis Ababa does not have land deeds—what they have is high inventory turnover, daily customer transactions, and active digital inflows across mobile money platforms.

**NetWorth Ethiopia replaces physical collateral with verified transaction velocity.** 

By turning the merchant's mobile phone into an automated accounting terminal, NetWorth captures informal cash flow at the source, parses incoming bank SMS payments, formalizes undocumented credit sales (*Dube*), and translates daily operational history into an institutional-grade, cryptographic credit dossier that commercial loan officers can audit and approve in minutes.

---

## The Problems We Solved

### 1. The Collateral Trap and the Unbankable Merchant
- **The Reality**: Ethiopian commercial banks reject up to 90% of small business loan applications because borrowers lack physical property titles or formal financial audits.
- **The NetWorth Solution**: We replace asset-backed collateral with **cash-flow-backed underwriting**. By measuring daily sales consistency, margin stability, and customer credit recovery discipline over 30 to 90 days, we compute an objective Credit Readiness Score (0 to 100) and establish a mathematically sound, recommended working capital loan ceiling.

### 2. The Paper Notebook (*Defter*) Breakdown
- **The Reality**: The lifeblood of Ethiopian neighborhood retail is *Dube* (informal short-term customer credit). Millions of Birr in receivables are tracked in dog-eared paper notebooks (*defter*). Pages get lost, balances are disputed, collection discipline is lax, and banks treat these assets as non-existent.
- **The NetWorth Solution**: A digital *Dube* ledger built directly into the merchant's daily workflow. Merchants log credit grants, set repayment terms, and record partial settlements with timestamps. The system measures collection speed and recovery rates, turning informal customer trust into a verifiable, auditable credit history.

### 3. The Unstructured SMS Money Flood
- **The Reality**: The rapid adoption of Ethio Telecom's Telebirr and Commercial Bank of Ethiopia's CBE Birr means millions of Birr flow digitally every hour. However, this revenue lands as unorganized, raw SMS notifications buried in the merchant's personal phone inbox. Merchants cannot reconcile which SMS paid for which sale, and loan underwriters cannot verify thousands of disconnected text messages.
- **The NetWorth Solution**: An on-device SMS parsing engine. The NetWorth mobile app scans incoming transactional SMS alerts from Telebirr, CBE, and partner banks, automatically extracting reference codes, timestamps, and payment amounts. With a single tap, merchants reconcile incoming notifications directly into verified sales, business expense deductions, or *Dube* debt settlements.

### 4. Zero-Infrastructure Downtime (The Connectivity Bottleneck)
- **The Reality**: Retail merchants cannot afford to tell a customer to wait because the cellular network is down or regional power failed. Web-only or cloud-dependent accounting tools fail immediately in real-world African retail environments.
- **The NetWorth Solution**: An **offline-first local database architecture**. Every sale, expense, and credit entry commits immediately to a local SQLite database on the handset. The merchant experiences instantaneous sub-millisecond response times regardless of network status. When cellular connectivity returns, a background reconciliation engine batches pending mutations to the central PostgreSQL database without data loss.

### 5. The Underwriter's Information Asymmetry
- **The Reality**: For a loan officer at a commercial bank or MFO, underwriting an informal merchant typically requires days of site visits, physical receipt reviews, and subjective guesswork.
- **The NetWorth Solution**: **Self-Sovereign Cryptographic Dossiers**. When a merchant applies for working capital, they generate a secure, time-bounded, 64-character public link from their phone. The loan underwriter opens this link in any browser to review verified gross transaction volume (GTV), digital settlement ratios, historical revenue curves, and risk factors—with zero administrative account overhead or security risk to the platform.

---

## How It Works: The Value Chain

```text
[ Daily Business Operations ]
  |
  +--> Over-the-counter Cash Sales
  +--> Telebirr & CBE Birr Payments (Auto-captured via On-Device SMS Parser)
  +--> Customer Store Credit (Dube Ledger tracking repayments & defaults)
  +--> Inventory & Operating Expenses
  |
  v
[ NetWorth Offline-First Engine (Local SQLite) ]
  |
  +--> Zero-latency recording during network drops
  +--> Deterministic timestamping and local queueing
  |
  v (When connectivity is available)
[ Central Ledger & Financial Health Engine (PostgreSQL / Express API) ]
  |
  +--> Aggregates Gross Transaction Volume (GTV)
  +--> Calculates Digital Trail Ratio (Telebirr + CBE Birr vs Cash)
  +--> Measures Dube Recovery Velocity and Operating Margin
  +--> Generates 0-100 Credit Readiness Score and Safe Loan Ceiling
  |
  v
[ Institutional Access & Underwriting (Next.js 16 Web Portal) ]
  |
  +--> For Merchants: Instant 1-tap shareable Dossier URL
  +--> For Loan Officers: Real-time, read-only financial audit view
  +--> For Platform Admins: Ecosystem-wide telemetry with zero synthetic data
```

---

## Monorepo Architecture

NetWorth Ethiopia is engineered as a clean, decoupled monorepo designed for institutional reliability, security, and independent service scalability.

```text
Net_Worth_Ethiopia/
|-- mobile/                 # Merchant Operating System (React Native / Expo SDK 57)
|   |-- src/app/            # Expo Router architecture (auth, tabs, business management)
|   |-- src/components/     # Design system, glass primitives, NativeWind styling
|   |-- src/db/             # Local SQLite database schemas & migrations
|   |-- src/features/       # Domain engines: SMS text-fetching, sales, dube ledger
|   |-- src/lib/            # Better Auth client, API client, SQLite drivers
|   `-- src/store/          # Zustand global stores (auth, business, branch, sync)
|
|-- backend/                # Core REST API & Scoring Engine (Express 5 / TypeScript)
|   |-- src/controllers/    # HTTP handlers, validation enforcement, response formatting
|   |-- src/db/             # PostgreSQL schemas via Drizzle ORM & seed utilities
|   |-- src/middleware/     # Auth guards, role authorization, error handling
|   |-- src/repositories/   # Encapsulated database queries & SQL aggregations
|   |-- src/routes/         # Express endpoint routing
|   |-- src/service/        # Telemetry calculations, health scoring, admin operations
|   `-- src/validations/    # Zod schemas validating all ingress data
|
|-- web/                    # Telemetry Console & Loan Underwriting Portal (Next.js 16)
|   |-- app/admin/          # Central operations dashboard (platform GTV, merchant roster)
|   |-- app/dossier/        # Public, read-only tokenized underwriter dossiers
|   |-- components/         # D3.js visualization engines, metric cards, data tables
|   |-- lib/                # API communication clients and proxy rewrites
|   `-- store/              # Zustand state stores for administrative sessions
|
`-- docs/                   # Architectural guides, telemetry dictionaries, and runbooks
```

---

## Technical Stack & Architectural Decisions

### Mobile Client: React Native / Expo SDK 57
- **Why Expo SDK 57 & React Native 0.86**: Combines modern React Native performance with stable native modules for local storage, background processing, and secure device storage.
- **Why Local SQLite (`expo-sqlite`)**: Essential for the emerging market reality. Shopkeepers cannot lose transaction records when cellular data fails. All writes are local-first, queued, and asynchronously synced.
- **Why NativeWind & Custom Glass Primitives**: Delivers a fluid, premium visual experience tailored for merchants while maintaining 60 FPS performance on lower-tier Android smartphones.
- **Why `@better-auth/expo`**: Enterprise-grade session handling with seamless deep linking (`networth://`) for social authentication and credential verification.

### Backend: Express 5, TypeScript, PostgreSQL, Drizzle ORM
- **Why Express 5 & TypeScript**: High-throughput REST API with strict static type safety across data layers, services, and HTTP envelopes.
- **Why Drizzle ORM & PostgreSQL**: Unlike heavy abstractions, Drizzle provides compile-time type safety with zero runtime overhead, enabling fast, SQL-like aggregations directly over raw transaction tables.
- **Why Better Auth**: Centralized, secure authentication handling email/password and Google OAuth, with strict role-based separation between merchants, staff, and superadministrators.
- **Why Zod Validation**: Zero trust on external payloads. Every incoming request is validated against strict runtime schemas before reaching business logic.

### Web Platform: Next.js 16, React 19, D3.js
- **Why Next.js 16 App Router**: Server-side rendering and static optimization for public underwriting dossiers, providing instant page loads for commercial bank loan officers without client-side lag.
- **Why D3.js over Generic Chart Libraries**: Financial underwriters require customized, precision visualizations—specifically cash flow velocity area curves and digital settlement ratio donuts—with dynamic empty-state handling and zero visual distortion.
- **Why Reverse-Proxy Route Rewriting**: Next.js automatically rewrites `/api/*` requests to the Express backend on port 3000, completely eliminating CORS friction in cross-port local and production setups.

---

## Ground-Truth System Implementations

### 1. Automated SMS Ingestion Pipeline
The mobile app inspects device SMS messages from authorized banking shortcodes (`telebirr`, `CBE`, `AwashBank`). A deterministic regex parser extracts:
- Unique Transaction Reference IDs (preventing duplicate entries)
- Sender Name and Masked Phone / Account Number
- Transacted Amount in Ethiopian Birr (ETB)
- Timestamp of Confirmation

Merchants can convert these parsed items into an instant sale, an operational expense, or an automated settlement against an open *Dube* record.

### 2. Digital Trail Ratio: The Alternative Collateral Metric
Commercial banks in Ethiopia prioritize digital payments over physical cash because digital receipts cannot be retroactively falsified. NetWorth computes the **Digital Trail Ratio**:

$$\text{Digital Trail Ratio} = \left( \frac{\text{Telebirr Settled (ETB)} + \text{CBE Birr Settled (ETB)}}{\text{Total Settled Volume (ETB)}} \right) \times 100$$

A high Digital Trail Ratio unlocks higher credit ceilings, incentivizing informal merchants to transition their customer base to formal digital payments.

### 3. Tokenized, Read-Only Public Dossiers
Instead of complex institutional integrations requiring bank IT department sign-offs:
- A merchant taps "Share Dossier" in the mobile app, choosing the intended bank and token validity period (e.g., 30 days).
- The backend generates a 64-character high-entropy cryptographic token stored in `financial_share_token`.
- The bank loan officer opens `http://<domain>/dossier/<token>` to review real-time audited cash flow curves, margin stability, and credit readiness scores.
- Access is strictly read-only, expiring automatically upon elapsed validity.

### 4. Zero-Mock Platform Telemetry
The Central Admin Console (`/admin`) monitors ecosystem-level health:
- Total Registered Merchants and Operating Branches
- Ecosystem Gross Transaction Volume (GTV)
- Platform-Wide Digital Settlement Breakdown (Telebirr vs CBE vs Cash)
- Trailing Cash Flow Velocity Curves

**Zero Mock Data Policy**: Every metric card and chart is executed as a live SQL query against PostgreSQL. If the database is clean, the dashboard displays exact zeroes and intuitive empty-state cards. Synthetic or hardcoded demonstration numbers are strictly forbidden.

---

## Local Development & Setup

### Prerequisites
- Node.js (v20.x or higher)
- PostgreSQL (v15 or higher) running locally or remotely
- Android SDK Platform Tools (with `adb` in system path)
- Android device connected via USB with USB Debugging enabled (or Android Studio emulator)

---

### Step 1: Backend Setup

Navigate to the backend directory:

```bash
cd backend
npm install
```

Configure `backend/.env`:

```env
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/networth_db
BETTER_AUTH_SECRET=your_secure_random_secret_string
BETTER_AUTH_URL=http://localhost:3000
WEB_URL=http://localhost:3001
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

Initialize the database schema and seed the administrator account:

```bash
# Push schema migrations to PostgreSQL
npm run db:migrate

# Seed the superadmin account (strictly adheres to zero fake merchant data)
npm run db:seed

# Start backend development server
npm run dev
```

The Express API initializes on `http://localhost:3000`.

---

### Step 2: Mobile Client Setup

Navigate to the mobile directory:

```bash
cd mobile
npm install
```

Configure `mobile/.env`:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

#### Android Port Reversal Setup
Because physical Android devices connected via USB resolve `localhost` to the phone rather than the host computer, port reversal is mandatory:

```bash
# Maintain continuous ADB port reverse mapping for Port 3000 and Metro 8081
npm run android
```

If connecting an Android device manually after start:

```bash
npm run reverse
```

---

### Step 3: Web Portal Setup

Navigate to the web directory:

```bash
cd web
npm install
```

Configure `web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Start the web development server on port 3001:

```bash
npm run dev
```

The web portal is accessible at:
- **Central Admin Console**: `http://localhost:3001/admin`
  - Login: `admin1g@gmail.com`
  - Password: `admin1234`
- **Public Underwriter Dossier**: `http://localhost:3001/dossier/<token>`

---

## Architectural Principles & Standards

1. **Mission-Driven Engineering**: Code is built to solve real operational obstacles faced by small businesses in emerging economies.
2. **Offline-First Resilience**: Handset software must never freeze, drop data, or display fatal errors during network dropouts.
3. **Data Integrity Over Synthetics**: No fake metrics or synthetic numbers. Telemetry reflects genuine commercial activity.
4. **Non-Invasive Institutional Access**: Commercial banks evaluate borrowers via tokenized public dossiers without requiring internal IT system integration.
5. **Decoupled Architecture**: Strict separation of concerns between mobile client presentation, API transactional processing, and web analytics.

---

## License

Proprietary and Confidential. Developed by the NetWorth Ethiopia team. All rights reserved.
