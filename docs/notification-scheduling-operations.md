# Notification Scheduling Operations

## Purpose

This document records the Phase 3 Milestone 3 scheduling layer for notifications.

The key boundary is simple:

- Milestone 2 gives Forge local rule evaluation plus browser delivery
- Milestone 3 gives Forge scheduled evaluation, idempotent run metadata, and weekly-summary orchestration

It does not magically turn browser notifications into native background push.

## Current Scheduling Model

Forge now has two scheduling entry points in Firebase Functions:

- `evaluateUserNotifications`
- `evaluateScheduledNotifications`

Current cadence:

- scheduled evaluation runs every 30 minutes

Why:

- this is frequent enough for operational notification eligibility checks
- it stays simple while the system still uses browser and installed-PWA delivery rather than native push plumbing

## What Scheduled Evaluation Does

For each user, the scheduled notification pipeline:

1. loads settings
2. loads day instances
3. loads notification state
4. loads recent notification logs
5. builds the same evaluation workspace used by the client
6. evaluates the shared notification rules
7. persists a notification run record
8. persists a scheduled notification log record when a fresh candidate exists

This is important because the server and the client are now using the same rule inputs instead of reimplementing notification meaning separately.

## Idempotency Strategy

Forge currently uses deterministic candidate ids for notification records.

Examples:

- daily candidate ids are tied to the source date
- weekly summary ids are tied to the source week key

If a scheduled run sees an existing notification log with the same candidate id, it records a `duplicate` run instead of creating a second scheduled notification record.

That means retries are observable without silently multiplying the same notification.

## Persisted Records

Current scheduled notification persistence includes:

- `users/{uid}/notificationState/default`
- `users/{uid}/notificationLog/{notificationId}`
- `users/{uid}/notificationRuns/{runId}`

The most important distinction is:

- `notificationLog` describes notification candidates and delivery-oriented records
- `notificationRuns` describes evaluation attempts and outcomes, including skipped and duplicate runs

## Honest Limitation

Because Forge is still using browser and installed-PWA notifications:

- scheduled Functions can determine eligibility and persist records
- they cannot directly deliver native mobile push notifications in the background

So the current milestone should be understood as:

- reliable scheduled orchestration
- idempotent metadata
- inspectable weekly-summary generation

not:

- full background push delivery on every device state

## Failure Handling

Scheduling failures should be treated as operational issues, not hidden noise.

Current expectations:

- failed scheduled runs should remain visible through run metadata
- duplicate candidates should be recorded explicitly
- skipped runs should keep the suppression reason
- future monitoring should alert on repeated failed or missing runs

## Local Verification Notes

The `functions/` workspace now uses two separate verification steps:

- `npm run typecheck`
- `npm run build`

Why:

- typechecking proves the scheduled-notification entrypoints and their shared server-safe dependencies are valid
- the build step bundles the Functions workspace into deployable output, which matters because plain TypeScript checking does not rewrite Forge's shared `@/` path aliases into runtime-safe imports

Current local verification status:

- the Functions workspace typechecks successfully
- the Functions workspace builds successfully into `functions/lib`
- the Functions workspace lints successfully
- `functions/.nvmrc` now pins the intended local major runtime to `20`

Current caveat:

- the local machine used for this verification is running Node `v22`, while the Functions package declares Node `20`
- this is acceptable for local validation, but runtime parity should still be checked against the deployed Firebase Functions Node 20 environment if any runtime-specific issue appears later

## Next Phase Boundary

What Milestone 3 intentionally does not finish:

- native push
- full remote delivery guarantees
- user-facing notification inbox or center
- advanced backoff and retry administration UI

Those remain later hardening or future-platform work.

## Release-Ready Limits

Phase 3 can honestly claim:

- shared client and Functions rule semantics
- scheduled evaluation with run metadata
- browser and installed-PWA delivery foundations

Phase 3 must not claim:

- guaranteed background delivery on every device state
- native mobile push
- a notification inbox or delivery-admin surface
