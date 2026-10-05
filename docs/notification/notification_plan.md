# Push Notification Feature Plan
## 1. Overview

NetWorth Ethiopia provides push notifications for overdue Dube records.
The feature alerts the business owner when a Dube becomes overdue.
Notifications are delivered through Expo Push.
The notification can be received while the app is open, backgrounded, or closed.
Tapping the notification opens the relevant Dube screen.
The MVP focuses only on overdue Dube notifications.
In-app notification history is deferred.

## 2. Feature Scope

### 2.1 Included

- Register the owner's Expo push token.
- Request notification permission from the mobile user.
- Detect overdue Dube records.
- Create one notification event per overdue Dube.
- Send push to registered devices.
- Prevent duplicate overdue notifications.
- Handle notification taps.
- Enforce ownership on token registration.
- Test on a real device.

### 2.2 Deferred

- In-app notification inbox.
- Email and SMS.
- Preferences and quiet hours.
- Multiple notification categories.
- Staff and multi-role targeting.

## 3. Architecture & File Structure

Backend: Express, TypeScript, Drizzle ORM, PostgreSQL.
Mobile: React Native, Expo SDK 57, TypeScript, Expo Router.

The existing Dube implementation remains the source of truth for ownership and status.
Legacy `bidr` module names are preserved. No files are renamed.

### 3.1 Backend Files

| File | Status | Purpose |
|------|--------|---------|
| `backend/src/db/notification-management.ts` | NEW | Tables |
| `backend/src/db/schema.ts` | MODIFY | Re-export |
| `backend/src/types/notifications.ts` | NEW | Types |
| `backend/src/validations/notification.validation.ts` | NEW | Zod |
| `backend/src/repositories/notifications.repository.ts` | NEW | DB queries |
| `backend/src/service/notifications.service.ts` | NEW | Logic |
| `backend/src/service/push-sender.ts` | NEW | Expo Push |
| `backend/src/controllers/notification.controller.ts` | NEW | HTTP |
| `backend/src/routes/notification.routes.ts` | NEW | Routes |
| `backend/src/jobs/reminder.job.ts` | NEW | Cron |
| `backend/src/index.ts` | MODIFY | Mount + scheduler |

### 3.2 Mobile Files

| File | Status | Purpose |
|------|--------|---------|
| `mobile/src/lib/notifications.ts` | NEW | Permission + handler |
| `mobile/src/service/notifications.ts` | NEW | API client |
| `mobile/src/hooks/use-push-notifications.ts` | NEW | Orchestration |
| `mobile/src/store/notification-store.ts` | NEW | Pending route state |
| `mobile/src/app/_layout.tsx` | MODIFY | Cold-start nav |
| `mobile/app.json` | MODIFY | Notifications plugin |
| `mobile/google-services.json` | NEW | Android FCM |

## 4. Data Model

### 4.1 Notification table

| Column | Type | Notes |
|--------|------|-------|
| `id` | text | PK |
| `user_id` | text | FK → user.id, CASCADE |
| `type` | text | `dube_overdue` |
| `title` / `body` | text | bounded |
| `data` | jsonb | nullable |
| `dedupe_key` | text | unique per user |
| `created_at` | timestamp | default now |
| `read_at` | timestamp | nullable (reserved for future inbox) |

Indexes: `(user_id, created_at DESC)`, unique `(user_id, dedupe_key)`.

### 4.2 Device token table

| Column | Type | Notes |
|--------|------|-------|
| `id` | text | PK |
| `user_id` | text | FK → user.id, CASCADE |
| `token` | text | unique |
| `platform` | text | `ios` / `android` |
| `is_active` | boolean | default true |
| `created_at` / `updated_at` | timestamp | |

## 5. Backend API

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/notifications/device-token` | Register or refresh token |
| DELETE | `/api/notifications/device-token/:id` | Deactivate on logout |

Rules:

- All endpoints require authentication.
- Token is bound to the authenticated user.
- A user cannot register or delete another user's token.
- No listing/read/mark-read endpoints in the MVP.

### 5.1 Detection trigger

A scheduled job runs daily at 09:00 `Africa/Addis_Ababa`.
It scans for Dube records where:

- `saleType = 'dube'`
- `status = 'pending'`
- `dueDate < today`

Each eligible record produces one notification with dedupe key `dube:{saleId}:overdue`.

### 5.2 Timezone

Overdue comparison uses `Africa/Addis_Ababa`.
`dueDate` is stored as `timestamp` without timezone.
The MVP handles this in query logic. A migration to `timestamptz` is deferred.

### 5.3 Duplicate prevention

Dedupe key: `dube:{saleId}:overdue`.
Unique constraint on `(user_id, dedupe_key)`.
Re-running the job cannot produce duplicates.

### 5.4 Push delivery

Push is sent to all active tokens for the user.
Message includes a route payload to open the Dube.
Failure is logged and does not remove the notification row.
`DeviceNotRegistered` deactivates the token.

## 6. Mobile Client

- Request notification permission after login, not at signup.
- Obtain Expo push token after permission granted.
- Register token with backend via authenticated API.
- Handle foreground display without disrupting the user.
- Handle background and closed-app notification taps.
- Navigate to the Dube when `data.route` is present.
- Fall back to the Dube list if the route is missing or invalid.
- Deactivate the token on logout.

## 7. Security & Ownership

- Token registration requires an authenticated session.
- Owner is derived from the session, not the request body.
- Dube ownership rules apply to notification creation.
- A user never receives another owner's Dube data.
- Push payload contains minimal business info.
- Errors do not expose auth or DB internals.

## 8. Implementation Phases

### Phase 1 — Discovery (0.5 day)

1. Read `AGENTS.md`, `mobile/AGENTS.md`, `.agents/rules/*`, `docs/AGENTS.md`.
2. Inspect Dube implementation, auth middleware, DB client, Drizzle config.
3. Locate the Dube source (table, owner field, due date, status).
4. Confirm push provider, platform scope, and scheduler library.

**Exit:** Dube source identified; rules agreed.
**Rollback:** N/A.

### Phase 2 — Backend (2 days)

1. Create `notification-management.ts` with both tables.
2. Re-export from `schema.ts`.
3. Add types in `types/notifications.ts`.
4. Add Zod schemas in `validations/notification.validation.ts`.
5. Add repository with `createIfAbsent`, `upsertToken`, `deactivateToken`, `listActiveTokens`.
6. Add service.
7. Add `push-sender.ts` (Expo Push).
8. Add controller and routes.
9. Mount routes in `index.ts`.
10. Add `jobs/reminder.job.ts` and start scheduler.
11. Generate and apply migration.

**Exit:** Job creates one notification per overdue Dube; reruns safe.
**Rollback:** disable job; drop tables; unmount routes.

### Phase 3 — Mobile (2 days)

1. Add `mobile/google-services.json`.
2. Configure `app.json` with notifications plugin.
3. Add `lib/notifications.ts` for permission and handlers.
4. Add `service/notifications.ts` for API client.
5. Add `hooks/use-push-notifications.ts` for orchestration.
6. Add `store/notification-store.ts` for `pendingRoute`.
7. Modify `_layout.tsx` for cold-start navigation.
8. Register token after login; deactivate on logout.
9. Handle foreground/background/closed tap → navigate to Dube.
10. Fall back to Dube list if route is invalid.

**Exit:** push arrives in all app states; tap navigates correctly.
**Rollback:** remove mobile files and revert app.json.

### Phase 4 — Verification (1 day)

1. Test permission granted and denied.
2. Test token registration.
3. Test overdue Dube notification.
4. Test duplicate prevention.
5. Test foreground/background/closed behavior.
6. Test tap navigation.
7. Test ownership failure (unauthorized token registration).
8. Run `npx tsc --noEmit` (both apps) and lint.
9. Test on a real device using an EAS dev or production build (Expo Go cannot receive push).

**Exit:** all cases pass.
**Rollback:** revert release.

## 9. Decisions Required Before Phase 2

| # | Decision | Owner | Due |
|---|----------|-------|-----|
| 1 | Cadence and lead time (T-1, T0, +3, +7) | Product | Phase 1 |
| 2 | Detection schedule and timezone | Backend | Phase 1 |
| 3 | Push client (`fetch` vs `expo-server-sdk`) | Backend | Phase 1 |
| 4 | Scheduler library | Backend | Phase 1 |
| 5 | Platform scope (Android only, or Android + iOS) | Team Lead | Phase 1 |
| 6 | Token deactivation on logout | Mobile | Phase 3 |
| 7 | Permission prompt copy | Product | Phase 3 |
| 8 | Test approach (Vitest or manual) | Backend | Phase 4 |

## 10. Scope Limitations

- No full notification center.
- No email or SMS.
- No quiet hours or preferences.
- No staff or multi-role targeting.
- Does not replace existing Dube management.
- Does not rename `bidr` files.
- Additional notification types deferred.

## 11. Definition of Done

- Authenticated owner can register a push token.
- Overdue Dube is detected using the agreed rule.
- Push arrives on the opted-in device.
- Duplicate overdue notifications are prevented.
- Push works when the app is backgrounded or closed.
- Tap opens the Dube or Dube list.
- Unauthorized users cannot register or access another owner's data.
- Backend and mobile tests pass.
- Type checks pass.
- Documentation matches the code.

## 12. References

- `AGENTS.md`
- `mobile/AGENTS.md`
- `.agents/rules/system-architecture.md`
- `.agents/rules/docs-analysis.md`
- `.agents/rules/setup-and-troubleshooting.md`
- `docs/AGENTS.md`
- `docs/business-branch-management.md`
- Expo SDK 57 notifications: https://docs.expo.dev/versions/v57.0.0/sdk/notifications/

## 13. Delivery Report

- Markdown only. No feature code, migrations, packages, or config changed.
- File: `docs/notification-feature.md`.
- Decisions pending: Section 9.