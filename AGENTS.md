# NetWorth Ethiopia — Agent Guidelines & Project Knowledge

This repository contains the **NetWorth Ethiopia** mobile app (Expo / React Native) and backend API (Express / Better Auth / Drizzle ORM / PostgreSQL).

For general AI engineering behavior and coding standards, refer to [docs/AGENTS.md](file:///home/eaglex/Documents/insa-ctc/FinalProject/docs/AGENTS.md).

---

## Architecture Summary

- **Frontend (`mobile/`)**:
  - Expo SDK 57 (React Native 0.86, Expo Router, NativeWind / Tailwind CSS).
  - Auth client: `@better-auth/expo` with deep linking scheme `networth://`.
  - Base URL: In [mobile/src/lib/auth-client.ts](file:///home/eaglex/Documents/insa-ctc/FinalProject/mobile/src/lib/auth-client.ts), physical Android devices target `http://localhost:3000` over ADB reverse proxy.
- **Backend (`backend/`)**:
  - Express.js with TypeScript (`tsx watch src/index.ts`).
  - Auth: `better-auth` with Google OAuth and Expo plugin.
  - Database: PostgreSQL with `drizzle-orm` and `drizzle-kit`.

---

## Critical Knowledge & Known Gotchas

### 1. Physical Android Device Connection (`ConnectException: Failed to connect to localhost:3000`)
- **Issue**: Physical Android phones connected via USB debugging resolve `localhost` (127.0.0.1) to the phone itself.
- **Solution**: ADB port reversal (`adb reverse tcp:3000 tcp:3000`) must be active for the phone to communicate with the host's Express backend.
- **How to run**:
  - Use `npm run android` in `mobile/`, which uses [mobile/scripts/run-android.js](file:///home/eaglex/Documents/insa-ctc/FinalProject/mobile/scripts/run-android.js) to automatically and continuously maintain the ADB reverse mapping.
  - If re-plugging USB manually, run:
    ```bash
    npm run reverse
    ```

### 2. Database Migrations (`sale` and `expense` tables)
- **Issue**: Drizzle schema files in `backend/src/db/` define tables (e.g. `sale`, `expense`, `branch`, `business`), but migrations must be applied to PostgreSQL.
- **Solution**:
  - To generate migrations: `npm run db:generate` in `backend/`
  - To apply migrations: `npm run db:migrate` in `backend/`
  - Note: Ensure `drizzle/` migration files are committed to git so team members and CI have access to them.

### 3. Better Auth & Expo Social Sign-in
- **Deep-linking Callback URLs**:
  - Better Auth validates callback URLs against `trustedOrigins` in [backend/src/config/auth.ts](file:///home/eaglex/Documents/insa-ctc/FinalProject/backend/src/config/auth.ts).
  - In `authClient.signIn.social(...)`, `errorCallbackURL` is **not** automatically prefixed by `@better-auth/expo`. Always format `errorCallbackURL` with `Linking.createURL('/(auth)/signup', ...)` so it produces a valid app scheme URI (`networth://...`).
- **Trusted Origins**:
  - [backend/src/config/auth.ts](file:///home/eaglex/Documents/insa-ctc/FinalProject/backend/src/config/auth.ts) must include `networth://*`, `http://localhost:8081`, `http://localhost:3000`, and any active local network IPs when testing across Wi-Fi.

---

## Essential Commands

### Mobile (`cd mobile`)
- Start on Android with persistent reverse: `npm run android`
- Check / enforce port 3000 reverse: `npm run reverse`
- Start general Expo bundler: `npm run start`

### Backend (`cd backend`)
- Start dev server: `npm run dev`
- Run DB migrations: `npm run db:migrate`
- Generate new DB migration: `npm run db:generate`
