# Diagnosis and Troubleshooting History

**Date**: September 23, 2026  
**Conversation Topic**: Frontend & Backend Connection, Google Auth, and Database Migration Issues

---

## 1. Problem: `java.net.ConnectException: Failed to connect to localhost/127.0.0.1:3000`

### Symptom
Metro bundler in `mobile/.expo/dev/logs/start.log` threw:
```
[handleGoogleLogin] Exception during Google login:
[Error: fetch failed: java.net.ConnectException: Failed to connect to localhost/127.0.0.1:3000]
```

### Root Cause
- The app was tested on a physical Samsung phone (`SM-A065F`) connected via USB.
- `mobile/src/lib/auth-client.ts` sets `baseURL` to `http://localhost:3000` for physical devices.
- On Android, `localhost` (127.0.0.1) refers to the phone itself.
- When `expo start --android` booted, it only kept `tcp:8081` reversed. The rule `adb reverse tcp:3000 tcp:3000` had been cleared.

### Solution
- Ran `adb reverse tcp:3000 tcp:3000`.
- Created `mobile/scripts/run-android.js` which starts Expo and polls to ensure `adb reverse tcp:3000 tcp:3000` is kept alive.
- Added `npm run reverse` to `mobile/package.json` for quick manual reversal.

---

## 2. Problem: `Failed to fetch sales/expenses from backend: Internal server error`

### Symptom
Metro bundler logged:
```
{"level":"warn","data":["Failed to fetch sales/expenses from backend:","Internal server error"]}
```

### Root Cause
- `backend/src/db/sales-expense-management.ts` defined schemas for `sale` and `expense` tables.
- However, `drizzle-kit` migrations had never been run against PostgreSQL.
- The PostgreSQL database only contained `user`, `account`, `session`, `verification`, `business`, and `branch`.
- Any query to `/api/sales` or `/api/expenses` failed with PostgreSQL error `relation "sale" does not exist`.

### Solution
- Generated Drizzle migration `0001_empty_jubilee.sql` with `npx drizzle-kit generate`.
- Applied migration using `npx drizzle-kit migrate`.
- Added `db:generate`, `db:migrate`, and `db:push` scripts to `backend/package.json`.

---

## 3. Problem: `403 INVALID_ERROR_CALLBACK_URL` on Google Sign-In

### Symptom
Metro bundler logged:
```
[handleGoogleLogin] Auth returned error: {"status": 500, "statusText": "Internal Server Error"}
```

### Root Cause
- `mobile/src/app/(auth)/login.tsx` called `authClient.signIn.social` with `errorCallbackURL: "/(auth)/signup?message=..."`.
- `@better-auth/expo` only converts `callbackURL` into an app scheme (`networth:///...`), leaving `errorCallbackURL` as a relative path.
- Better Auth server checks callback URLs against `trustedOrigins`. Relative URLs fail validation with `INVALID_ERROR_CALLBACK_URL`.

### Solution
- Updated `mobile/src/app/(auth)/login.tsx` to generate full deep-link with `Linking.createURL('/(auth)/signup', { queryParams: { message: signupMessage } })`.

---

## 4. Problem: Stale Network IP in Backend Auth Config

### Root Cause
- `backend/src/config/auth.ts` had hardcoded `http://172.16.4.34:8081` in `trustedOrigins`.
- The current machine IP is `192.168.137.195`.

### Solution
- Updated `trustedOrigins` in `backend/src/config/auth.ts` to include `http://192.168.137.195:8081` and `http://192.168.137.195:3000`.
