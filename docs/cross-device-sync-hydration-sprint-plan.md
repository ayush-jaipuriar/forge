# Cross-Device Sync Hydration Sprint Plan

This sprint is a focused sync-correctness pass.

Its goal is not to add more sync vocabulary or more status surfaces. Its goal is to make Forge behave more honestly and more predictably across phone and desktop when the same authenticated user moves between devices.

The trigger for this sprint is a real product issue observed in use:

- phone and desktop can drift
- the app can still show a healthy or synced-looking posture
- the current implementation is stronger at replaying local writes outward than at hydrating cloud truth back inward

This sprint closes that gap.

## Problem Statement

Forge currently has:

- local-first persistence in IndexedDB
- a queue for replaying local writes to Firestore
- queue-health diagnostics

Forge does **not** currently have:

- authoritative Firestore-to-IndexedDB hydration on authenticated session startup
- live cross-device reconciliation for shared user state
- an honest distinction between `queue empty` and `cross-device state converged`

That makes the current system vulnerable to this failure mode:

1. desktop changes local state and replays it to Firestore
2. phone signs in later or continues from stale local state
3. phone still reads from old or default IndexedDB state
4. both devices can appear healthy locally while showing different data
5. a later whole-settings write from either device can overwrite the other device’s changes

## Sprint Goal

Make authenticated shared state behave like real cross-device state.

By the end of this sprint:

- Firestore is treated as the source of truth for shared authenticated data
- IndexedDB becomes the offline cache and optimistic local workspace, not the long-lived source of truth while online
- authenticated startup hydrates shared cloud state into local repositories
- live Firestore subscriptions keep multiple devices converged while online
- Settings includes a manual `Refresh from Cloud` control for explicit repair/debug recovery
- sync status language becomes quieter and more honest

## Scope Decisions

These scope choices are now locked for the sprint.

### Shared state to hydrate and subscribe

Include:

- `settings/default`
- `dayInstances/*`
- cloud-backed user workspace truth that directly affects Today, Schedule, Prep, Physical, Readiness, Command Center, and Settings

Do not treat these as cloud-authoritative in this sprint:

- browser notification permission state
- install prompt state / service worker install posture
- local calendar OAuth session artifacts
- device-local shell/runtime capability state

Reason:

- those states are intentionally per-device
- trying to converge them across devices would make the app less truthful, not more correct

### Source-of-truth rule

When authenticated and online:

- Firestore wins for shared state

When offline:

- IndexedDB remains the working cache and local execution surface

Queued local writes:

- still matter
- must not be destroyed casually
- but must be reconciled deliberately against hydrated cloud truth so stale local snapshots do not overwrite newer remote data

### Delivery model

This sprint includes both:

- startup hydration
- live `onSnapshot` subscriptions

This is intentional.

Hydration without live subscriptions would still leave the app stale after sign-in.
Live subscriptions without initial hydration would still leave cold-start correctness weak.

### Operator support

Add:

- `Refresh from Cloud` action in Settings

Reason:

- useful for debugging
- useful for explicit recovery after stale offline sessions
- useful for making sync behavior inspectable during development and support

### Status honesty

This sprint should stop implying more than the app can prove.

The current `Synced` label is too strong if it only means:

- no local queued writes
- no failed queue items

The UI should instead communicate a quieter, more accurate state model tied to:

- cloud-connected and current
- waiting to sync
- offline with local changes
- replay failed
- cloud refresh needed

Exact wording can be finalized during implementation, but the rule is:

- do not overclaim convergence

## Non-Goals

This sprint does **not** aim to:

- redesign the UI broadly
- solve long-lived server-managed Calendar OAuth
- sync device-local browser permission state across devices
- merge arbitrary per-device runtime capability state
- build a full CRDT or complex collaborative merge engine
- change backup or restore architecture beyond what is needed for sync correctness

## Expected Behavior After The Sprint

### Authenticated sign-in on a second device

Expected result:

- the app signs in
- shared Firestore-backed settings hydrate into IndexedDB
- existing day instances hydrate into IndexedDB
- Today, Schedule, and Settings reflect the same shared truth as the other device

### Live cross-device change

Expected result:

- desktop updates a shared setting or day block
- Firestore changes
- phone receives the update through subscription
- phone updates its local IndexedDB
- phone UI reflects the new shared value without manual refresh

### Offline edit

Expected result:

- device can still operate locally
- queued writes are preserved
- status reflects local-pending posture honestly
- once reconnected, replay happens and subscriptions converge the other device

### Manual recovery

Expected result:

- operator can trigger `Refresh from Cloud`
- current authenticated cloud state is rehydrated into local shared repositories
- UI re-renders from the refreshed shared baseline

## Workstreams

## 1. Shared Sync Contract And State Ownership

Define and implement the shared-state boundary explicitly.

Checklist:

- [x] Document which repositories are cloud-authoritative and which are device-local.
- [x] Separate shared authenticated state from per-device runtime state in code comments and implementation contracts.
- [x] Audit current settings/day-instance writes to ensure they are treated as shared cloud-backed entities.
- [x] Add explicit implementation notes for why notification permission and calendar session artifacts stay local.

Primary files likely involved:

- [src/data/repositories/types.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/data/repositories/types.ts)
- [src/data/local/localSettingsRepository.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/data/local/localSettingsRepository.ts)
- [src/data/local/localDayInstanceRepository.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/data/local/localDayInstanceRepository.ts)
- [docs/future-extension-notes.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/future-extension-notes.md)

## 2. Authenticated Startup Hydration

Add a real cloud-to-local hydration step on authenticated session startup.

Checklist:

- [x] Load authoritative remote `settings/default` after auth success.
- [x] Load relevant remote day instances on startup.
- [x] Write hydrated cloud state into local IndexedDB repositories.
- [ ] Ensure hydration happens before the app settles into normal authenticated steady state.
- [x] Preserve guest-mode isolation and guest-to-user transition correctness.
- [x] Make hydration failure visible as a real sync/runtime problem rather than silently falling back to defaults.

Primary files likely involved:

- [src/features/auth/services/bootstrapUserSession.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/auth/services/bootstrapUserSession.ts)
- [src/features/auth/providers/AuthSessionProvider.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/auth/providers/AuthSessionProvider.tsx)
- [src/data/firebase/firestoreSettingsRepository.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/data/firebase/firestoreSettingsRepository.ts)
- [src/data/firebase/firestoreDayInstanceRepository.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/data/firebase/firestoreDayInstanceRepository.ts)

## 3. Live Firestore Subscriptions

Add real-time subscriptions so devices converge while online.

Checklist:

- [x] Add `onSnapshot` subscription for shared settings.
- [x] Add `onSnapshot` subscription strategy for day instances.
- [x] Update local repositories when remote snapshots change.
- [x] Avoid subscription loops where local replayed writes immediately cause redundant harmful local overwrites.
- [x] Ensure cleanup/unsubscribe works on sign-out and auth transitions.
- [x] Ensure guest mode never starts authenticated cloud listeners.

Primary files likely involved:

- [src/services/sync/SyncProvider.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/sync/SyncProvider.tsx)
- [src/data/firebase/firestoreSettingsRepository.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/data/firebase/firestoreSettingsRepository.ts)
- [src/data/firebase/firestoreDayInstanceRepository.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/data/firebase/firestoreDayInstanceRepository.ts)
- [src/app/providers/AppProviders.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/app/providers/AppProviders.tsx)

## 4. Safer Shared-State Replay

Reduce the risk of stale-device overwrite behavior.

Checklist:

- [x] Review full-settings snapshot replay behavior.
- [x] Introduce reconciliation safeguards so stale local snapshots do not blindly overwrite newer hydrated cloud state.
- [ ] Prefer narrower update semantics where practical for touched settings mutations.
- [ ] Ensure queued local changes survive offline correctly without reintroducing stale-overwrite behavior after hydration.
- [x] Reassess how replayed writes interact with subscription-driven local updates.

Primary files likely involved:

- [src/services/sync/persistSyncableChange.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/sync/persistSyncableChange.ts)
- [src/services/sync/syncOrchestrator.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/sync/syncOrchestrator.ts)
- [src/services/settings/dayModeOverrideService.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/settings/dayModeOverrideService.ts)
- [src/services/settings/dailySignalsService.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/settings/dailySignalsService.ts)
- [src/services/settings/notificationPreferenceService.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/settings/notificationPreferenceService.ts)

## 5. Manual Cloud Refresh

Expose a deliberate operator recovery path in Settings.

Checklist:

- [x] Add `Refresh from Cloud` action in Settings.
- [x] Wire it to authenticated startup hydration logic or a shared refresh service.
- [x] Show honest loading/success/failure feedback.
- [x] Keep the copy short and operational.
- [x] Ensure it is unavailable or clearly disabled when unauthenticated.

Primary files likely involved:

- [src/features/settings/pages/SettingsPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/settings/pages/SettingsPage.tsx)
- [src/features/settings/hooks](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/settings/hooks)
- [src/services/settings/settingsWorkspaceService.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/settings/settingsWorkspaceService.ts)

## 6. Sync Status Honesty

Make sync language quieter and more accurate.

Checklist:

- [x] Review current sync status semantics in diagnostics and shell status.
- [x] Replace overclaiming labels like `Synced` where they only mean queue-clean.
- [x] Distinguish `cloud current` from `local queue clear`.
- [x] Keep the user-facing language simpler, not more technical.
- [x] Preserve detailed diagnostics in Settings without making the shell noisy.

Primary files likely involved:

- [src/services/sync/syncHealthService.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/sync/syncHealthService.ts)
- [src/components/status/SyncIndicator.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/components/status/SyncIndicator.tsx)
- [src/services/monitoring/operationalDiagnosticsService.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/monitoring/operationalDiagnosticsService.ts)
- [src/features/settings/pages/SettingsPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/settings/pages/SettingsPage.tsx)

## 7. Validation

This sprint needs stronger validation than a normal local-only feature pass because the failure mode is inherently multi-device.

Checklist:

- [x] Add unit tests for startup hydration behavior.
- [x] Add tests for subscription-driven local repository updates.
- [ ] Add tests for offline queue + later hydration interplay.
- [x] Add tests for stale local settings not overwriting fresher remote truth after hydration.
- [x] Add tests for manual `Refresh from Cloud`.
- [x] Run `npm run lint`.
- [x] Run `npm run typecheck`.
- [x] Run `npm run test:run`.
- [x] Run `npm run build`.
- [ ] Manually verify cross-device propagation between desktop and phone.

Primary verification targets:

- Today
- Schedule
- Settings
- auth sign-in on second device
- local offline edit then reconnect

## Acceptance Criteria

The sprint is complete when:

- an authenticated second device hydrates shared state from Firestore on startup
- shared updates propagate across devices while online
- Forge no longer silently falls back to default local settings as if they were shared truth for authenticated users
- Settings exposes a working `Refresh from Cloud` control
- sync status language is quieter and more honest
- automated tests and manual cross-device verification are green

## Risks And Tradeoffs

### Risk: subscription loops

Why it matters:

- local optimistic write
- Firestore replay
- subscription event
- local write again

can create churn or overwrite bugs if not guarded

Mitigation:

- treat subscription application as hydration/reconciliation, not as a user mutation path
- avoid re-enqueueing remote-applied writes

### Risk: destructive overwrite on hydration

Why it matters:

- if hydration always bluntly overwrites local state, a user with offline pending work can lose expected local continuity

Mitigation:

- reconcile queued writes explicitly
- keep offline queue semantics visible and intentional

### Risk: too much sync jargon

Why it matters:

- users want confidence, not a distributed-systems dashboard

Mitigation:

- keep shell copy short
- keep deep detail in Settings only

## Recommended Implementation Order

1. shared-state ownership contract
2. authenticated startup hydration
3. live subscriptions
4. replay safety improvements
5. manual cloud refresh
6. sync status honesty pass
7. automated + real cross-device verification

That order matters because:

- hydration establishes the base truth model
- subscriptions keep it alive
- replay safety prevents the old stale-overwrite failure mode from simply moving around

## Progress Log

Initial planning decisions captured:

- Firestore is the source of truth for authenticated shared state
- IndexedDB remains the offline cache and local-first execution layer
- manual cloud refresh will be added in Settings
- live `onSnapshot` subscriptions are in scope now, not deferred
- first hydration set will target shared settings and day instances, while intentionally excluding device-local runtime artifacts

Implementation progress:

- Added Firestore read/subscription support to [src/data/firebase/firestoreSettingsRepository.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/data/firebase/firestoreSettingsRepository.ts) and [src/data/firebase/firestoreDayInstanceRepository.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/data/firebase/firestoreDayInstanceRepository.ts).
- Added the shared cloud hydration/subscription service in [src/services/sync/cloudSyncService.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/sync/cloudSyncService.ts).
- Updated [src/services/sync/SyncProvider.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/sync/SyncProvider.tsx) so authenticated sessions hydrate cloud-backed state on startup, refresh after connectivity returns, and start live Firestore subscriptions.
- Added a manual `Refresh from Cloud` action through [src/features/settings/hooks/useRefreshCloudWorkspace.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/settings/hooks/useRefreshCloudWorkspace.ts) and [src/features/settings/pages/SettingsPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/settings/pages/SettingsPage.tsx).
- Tightened sync language in [src/components/status/SyncIndicator.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/components/status/SyncIndicator.tsx) and [src/services/monitoring/operationalDiagnosticsService.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/monitoring/operationalDiagnosticsService.ts) so queue health does not masquerade as vague “synced” certainty.
- Added regression coverage in [src/tests/services/cloud-sync-service.spec.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/tests/services/cloud-sync-service.spec.ts), [src/tests/sync-provider.spec.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/tests/sync-provider.spec.tsx), [src/tests/settings-page.spec.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/tests/settings-page.spec.tsx), [src/tests/ui-primitives.spec.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/tests/ui-primitives.spec.tsx), and a sandbox-stable calendar test harness adjustment in [src/tests/services/calendar-mirror.spec.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/tests/services/calendar-mirror.spec.ts).

Validation results:

- `npm run lint`
- `npm run typecheck`
- `npm run test:run` → `69` files, `253` tests passed
- `npm run build`

Open follow-up items:

- authenticated startup still hydrates through `SyncProvider` immediately after sign-in rather than blocking the auth transition until cloud hydration finishes
- shared settings mutations still send whole settings snapshots; narrower field-level replay remains a worthwhile next hardening step
- real phone/desktop propagation still needs manual verification in the product, because automated tests cannot fully substitute for two-device confirmation

## Next Step After Review

Common next actions:

1. approve and start implementation
2. request scope changes to the hydration set or subscription strategy
3. ask for a smaller first slice if you want startup hydration before live subscriptions
