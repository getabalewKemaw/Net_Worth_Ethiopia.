# NetWorth Ethiopia — Web Platform

The web portal for the NetWorth Ethiopia ecosystem, built with Next.js 16 (App Router), React 19, Tailwind CSS v4, and D3.js.

It hosts two primary interfaces:
1. **Central Telemetry & Operations Console (`/admin`)**: Real-time administrative oversight, platform GTV telemetry, settlement method breakdowns, and merchant rosters.
2. **Public Loan Underwriting Dossiers (`/dossier/[token]`)**: Time-bounded, read-only financial health and credit readiness reports for partner commercial bank and microfinance loan officers.

For full system architecture, backend integration, mobile client documentation, and local setup instructions, see the root repository documentation:

- [Root Repository README](../README.md)
- [Admin Portal & Telemetry Guide](../docs/ADMIN_PORTAL_GUIDE.md)

---

## Local Development

```bash
# Install dependencies
npm install

# Start development server on port 3001
npm run dev

# Production build
npm run build
npm run start
```

Requests to `/api/*` are automatically proxied to the Express backend on `http://localhost:3000` via `next.config.ts`.
