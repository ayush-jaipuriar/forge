# Phase 3 Release Readiness Checklist

Use this as the final release gate for the integration-focused Phase 3 system.

## Core Verification

- [x] `npm run lint`
- [x] `npm run test:run`
- [x] `npm run typecheck`
- [x] `npm run build`
- [x] `cd functions && npm run lint`
- [x] `cd functions && npm run typecheck`
- [x] `cd functions && npm run build`

## Sync and Notification Integrity

- [x] sync health distinguishes healthy, queued, stale, degraded, and conflicted states honestly
- [x] failed or conflicted sync does not masquerade as a stable state in the shell
- [x] notification rules remain bounded to missed critical block, fallback suggestion, and weekly summary
- [x] browser permission and notification setting state are both visible in Settings
- [x] scheduled notification Functions use the same rule semantics as the client rather than reinterpreting notification meaning
- [x] browser and installed-PWA delivery remain the only claimed notification channels

## Backup and Restore Integrity

- [x] manual backup export produces versioned JSON plus markdown note export
- [x] restore validates schema and applies through a staged flow instead of blind overwrite
- [x] restore clears outstanding sync queue items so stale pre-restore writes cannot replay later
- [x] scheduled backup metadata, retention, and restore-eligibility state are documented honestly
- [x] scheduled backup Functions build successfully and target Node 20
- [x] current server-restore posture is documented as foundation-only, not a finished picker workflow

## Calendar Integration Integrity

- [x] read integration remains bounded to the primary Google Calendar
- [x] write mirroring remains explicit, operator-triggered, and limited to eligible major blocks
- [x] Forge-managed mirrored events do not reappear as external collision pressure
- [x] Calendar session state is cleared on sign-out so one user cannot inherit another user's local Calendar access
- [x] stale or error Calendar sync state is louder than raw collision count in user-facing surfaces
- [x] long-lived server-managed OAuth and background reconciliation are documented as not yet complete

## Health Scaffolding Integrity

- [x] health integration state uses a real persistence seam instead of being rebuilt from static defaults every render
- [x] Physical and Readiness consume the same health workspace flow as Settings
- [x] sleep duration and sleep consistency are modeled as separate normalized signals
- [x] no fake provider connect buttons or pretend connected states are exposed in the UI
- [x] current health integration limits are documented honestly as scaffold-only

## Security and Operations

- [x] Firestore rules remain repo-managed
- [x] Storage rules remain repo-managed for scheduled backup payload access
- [x] App Check rollout posture is documented as environment-safe and intentionally relaxed for localhost
- [x] monitoring seams exist for sync degradation, backup health degradation, and integration failures
- [x] repo docs still avoid committing secrets and keep environment values in local configuration only

## Accepted Phase 3 Limits

These are not release blockers for the current phase, but they must stay documented:

- notifications are browser and installed-PWA only; Forge does not yet provide native mobile push
- scheduled notification Functions persist candidates and run metadata, but background delivery still depends on browser/PWA capability
- scheduled backups are durable through Cloud Storage plus Firestore metadata, but the in-app server-backup picker and full remote-restore UX are not finished yet
- Calendar supports primary-calendar read plus explicit major-block write mirroring, not long-lived server-managed bidirectional sync
- health integration is a typed, persisted scaffold and UX contract, not a live provider ingestion system

## Signoff Result

- [x] Phase 3 implementation is operationally credible within its documented limits
- [x] no future-phase capabilities are being claimed as already shipped
