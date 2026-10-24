# Notification Feature

## What it does

When a Dube goes past its due date, the shop owner gets notified:

1. **Push notification** in the phone tray -- works even when the app is closed
2. **Bell icon** in the app with unread badge and a list of past notifications

Tapping either one opens the specific Dube.

## Status

Code is complete on `feature/notification`. All local functionality is tested on a real Android device. Remote push delivery is pending team credential setup, which is tracked separately.

## How it works

Cron runs daily at 09:00 Ethiopian time:

1. Finds Dubes where `saleType = 'dube'`, `status = 'pending'`, `dueDate < today`
2. Creates one notification per Dube (dedupe key prevents duplicates)
3. Looks up user's active Expo push tokens
4. Sends one push per user (batched: 5 overdue Dubes = 1 push)
5. Records delivery status for retry

A retry cron runs every 15 minutes (up to 3 attempts).

Tapping a notification opens the Dube via `data.route`.

## Backend files

| File | Purpose |
|---|---|
| `db/notification-management.ts` | Tables: `notification`, `device_token` |
| `types/notifications.ts` | Types |
| `validations/notification.validation.ts` | Zod schemas |
| `repositories/notification.repository.ts` | DB queries |
| `service/push-sender.ts` | Expo SDK wrapper |
| `service/notifications.service.ts` | Business logic, batching, retry |
| `jobs/reminder.job.ts` | Job entry |
| `jobs/scheduler.ts` | Cron: 09:00 + 15-min retry |
| `controllers/notification.controller.ts` | HTTP handlers |
| `routes/notification.routes.ts` | Routes |
| `db/schema.ts`, `index.ts` | Wiring |

## Mobile files

| File | Purpose |
|---|---|
| `lib/notifications.ts` | Permission, channel, Expo token |
| `service/notification.service.ts` | API client |
| `hooks/use-push-notifications.ts` | Token registration, tap handler |
| `hooks/use-notifications.ts` | Fetch list, read state |
| `components/navigation/notification-bell.tsx` | Bell + badge |
| `app/notifications.tsx` | List screen |
| `app/_layout.tsx`, `hamburger-drawer.tsx` | Mount hook + bell |
| `app.json`, `google-services.json` | Firebase config |

## API

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/notifications` | List for current user |
| PATCH | `/api/notifications/:id/read` | Mark one read |
| PATCH | `/api/notifications/read-all` | Mark all read |
| POST | `/api/notifications/device-token` | Register token |
| POST | `/api/notifications/device-token/deactivate` | Deactivate on logout |

All require auth. Owner from session, not request body.

## Database

Two tables:

- `notification`: one row per overdue event; has `delivery_status`, `delivery_attempts`, `last_attempt_at`
- `device_token`: one row per device

## Bugs fixed

1. **Zod coercion** -- `z.coerce.boolean()` turned `"false"` into `true`. Read notifications never showed. Fixed with `z.preprocess`.
2. **Response unwrapping** -- `authClient.$fetch` returns `{ data, error }`. Hook was reading `res.items` directly. Fixed with `(raw as any)?.data ?? raw`.
3. **Undefined array access** -- `createdForUser[id].push(...)` failed strict TS. Fixed with local reference.
4. **`req.params.id` type** -- Express types as `string | string[] | undefined`. Fixed with `String(...)`.

## Security

- Generic lockscreen text ("You have an overdue Dube. Tap to view.") -- no customer names on lock screen
- Users can't read or modify another user's notifications or tokens
- `DeviceNotRegistered` errors auto-deactivate stale tokens

## Deferred

- iOS push (needs APNs cert)
- Email / SMS
- Quiet hours, preferences
- Multiple notification categories
- Staff targeting

## Verified working

- Permission request on first launch
- Token registration + DB storage
- Cron fires, finds overdue Dubes
- Notification row created (dedupe-protected)
- Batched per user
- Retry cron
- Bell icon with badge
- List screen with pull-to-refresh
- Mark read / mark all read
- Tap to navigate
- Lockscreen privacy
- `tsc --noEmit` clean on backend and mobile

## References

- Implementation: `feature/notification` branch
- This doc: `docs/notification-feature.md`