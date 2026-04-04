# Phase 4 Launch Operations

Use this document as the repeatable launch runbook for the current Forge platform.

Its purpose is practical:

- define the exact pre-launch verification path
- define the smoke-test matrix for the highest-risk flows
- define rollback expectations for Hosting and Functions
- define first-response support steps for common launch failures

This is intentionally an operator document, not a product overview.

## Pre-Launch Verification

Run this from the repo root before any launch candidate is treated as credible:

```bash
npm run launch:verify
```

This command currently covers:

- `npm run lint`
- `npm run typecheck`
- `npm run test:run`
- `npm run build`
- `npm run functions:verify`

Why this matters:

- root app correctness and Functions correctness now both affect launch posture
- release verification should be one repeatable command, not memory-driven command picking

## Smoke-Test Matrix

These flows should be validated manually against a launch candidate build or deployed preview.

### 1. Auth

Expected result:

- app loads without config warnings
- Google sign-in succeeds
- authenticated shell renders
- sign-out returns to auth gate

Operator notes:

- if sign-in fails, check Firebase Auth authorized origins and browser popup blocking
- if sign-out looks partial, check whether local Calendar session state was cleared as expected

### 2. Today Execution

Expected result:

- current block loads
- day mode change persists
- complete, skip, move, and restore actions update the day model
- score preview and recommendation react to state changes

Operator notes:

- if state appears stuck, check sync diagnostics in Settings first
- if recommendation looks stale, refresh and verify the restored/generated day instance is current

### 3. Schedule Overrides

Expected result:

- week view loads
- allowed day-type override applies
- override is reflected back in Today and Schedule
- schedule pressure tags render honestly

Operator notes:

- if override appears local-only, inspect sync and queued-state posture

### 4. Notifications

Expected result:

- notification settings render correctly
- browser permission request behaves honestly
- enabled/disabled preference persists
- recent notification records are visible

Operator notes:

- Forge only supports browser and installed-PWA delivery today
- lack of native mobile push is not a launch bug for the current product boundary

### 5. PWA Shell

Expected result:

- install prompt or installed state renders honestly
- update availability renders honestly when a new shell is waiting
- offline shell loads after one successful online visit
- queued or degraded-state messaging remains honest while offline

Operator notes:

- test this from a built preview or deployed origin, not the raw Vite dev server
- if service-worker behavior looks stale, clear site data and the service worker before retesting

### 6. Backup Export and Restore

Expected result:

- manual JSON export succeeds
- markdown note export succeeds
- restore file stages successfully
- restore apply succeeds or reports partial compatibility honestly
- recent restore jobs update

Operator notes:

- if restore fails, use the Settings diagnostics surface and restore-job summary first
- restore intentionally clears queued sync writes to prevent stale replay

### 7. Calendar Read

Expected result:

- read access connect works
- cache refresh succeeds
- Today and Schedule show Calendar pressure honestly
- stale or error state is louder than neutral collision tone

Operator notes:

- current support is primary-calendar only
- browser OAuth is the current supported auth model

### 8. Calendar Write Mirroring

Expected result:

- write access upgrade succeeds
- explicit `Sync major blocks` creates or updates eligible mirror events
- mirrored block counts and sync result feedback render
- disconnect clears local Calendar session artifacts

Operator notes:

- mirroring is explicit and operator-triggered by design
- background reconciliation is not yet part of the supported launch posture

## Rollback Expectations

### Hosting Rollback

Use when:

- the web shell deploy is broken
- PWA shell or routing is visibly broken
- the deployed build differs from the validated launch candidate

Rollback posture:

- revert to the last known-good Hosting deploy through the Firebase Hosting release history
- do not redeploy blindly from a dirty workspace
- rerun `npm run launch:verify` against the intended rollback candidate before re-promoting it if time permits

### Functions Rollback

Use when:

- scheduled notifications misfire
- scheduled backups fail repeatedly
- retention cleanup introduces unexpected degradation

Rollback posture:

- revert to the last known-good Functions deploy
- treat Functions rollback independently from Hosting rollback when possible
- after rollback, verify scheduled backup and scheduled notification posture from the Settings diagnostics surface plus Firebase logs

### Firestore / Storage Rules Rollback

Use when:

- legitimate user data access is blocked
- backup payload access breaks due to rules mismatch

Rollback posture:

- revert the specific ruleset rather than broad platform changes
- verify owner-only access and backup payload retrieval immediately after rollback

## Common Failure Modes And First Support Steps

### Auth failure

First checks:

- Firebase Auth enabled
- authorized origins correct
- browser popup not blocked

### App Check or auth mismatch

First checks:

- App Check site key configured correctly for the deployed web origin
- localhost-only App Check assumptions are not being used to judge deployed behavior
- authenticated Firebase user still matches the local session assumptions for Calendar and sync-sensitive flows
- Firebase Console and browser devtools checked for token, origin, or rejected-request clues

### Sync degradation

First checks:

- Settings diagnostics card
- sync health state
- replayable, failed, or conflicted counts

### Scheduled backup degradation

First checks:

- backup diagnostics summary in Settings
- recent backup health state
- Firebase Functions logs
- Cloud Storage payload presence for recent scheduled backups

### Restore issue

First checks:

- recent restore job summary
- restore warnings
- whether stale sync queue items were cleared

### Notification issue

First checks:

- notification permission state
- Forge notification preference state
- recent notification records in Settings
- browser support for the current notification channel

### Calendar degradation

First checks:

- read connection state
- mirror sync state
- last sync error
- whether the browser session still has valid Calendar OAuth scope

## Product Honesty Reminder

Launch QA must respect the current support boundary:

- browser and installed-PWA notifications only
- primary-calendar Google Calendar support only
- explicit operator-triggered Calendar mirroring only
- health scaffolding is not live provider ingestion
- scheduled remote backups can be staged for restore, but Forge still does not provide a full backup-management console or automatic cross-device recovery

If QA expects any of those future capabilities, that is a scope mismatch, not necessarily a product defect.
