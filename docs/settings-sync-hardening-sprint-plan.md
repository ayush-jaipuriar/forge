# Settings Sync Hardening Sprint Plan

This sprint is the next focused step after the cross-device hydration work.

The previous sprint made Forge much better at:

- hydrating Firestore-backed shared state into IndexedDB
- keeping authenticated devices converged through live subscriptions
- exposing an explicit `Refresh from Cloud` recovery path

That solved the biggest architectural gap.

What still remains is a more subtle but very important risk:

- many shared settings mutations still write the **entire settings snapshot**
- a device that starts from a stale local baseline can still reassert unrelated old values
- this is especially risky across phone and desktop, where the user may touch different parts of the shared settings tree on different devices

This sprint narrows that risk.

## Problem Statement

Forge currently treats the `settings/default` document as one large shared object.

That makes these workflows fragile:

1. desktop updates `dayModeOverrides`
2. phone still has stale `prepTopicProgress`
3. phone updates `notificationsEnabled`
4. the phone sends a whole old settings snapshot back through replay
5. unrelated shared settings can be overwritten accidentally

Even with cloud hydration and subscriptions in place, replaying whole snapshots is still a bigger blast radius than we want.

## Sprint Goal

Make shared settings mutations narrower and safer across devices.

By the end of this sprint:

- the highest-risk shared settings writes no longer replay full settings snapshots
- shared settings are merged by subtree instead of replaced wholesale where practical
- exact same-field collisions follow a simple, explicit rule for now
- `Refresh from Cloud` remains the operator-owned recovery control
- phone/desktop verification confirms the narrowed mutation model behaves better in practice

## Locked Decisions

These scope choices are now fixed for the sprint.

### 1. Mutation scope

Start with the highest-risk shared settings paths:

- `dayModeOverrides`
- `dayTypeOverrides`
- `dailySignals`
- `prepTopicProgress`
- `workoutLogs`
- `notificationsEnabled`
- `calendarIntegration` where already touched by real flows

Do not expand into a fully generic patch system for every future subtree in this sprint.

Reason:

- this keeps the work bounded
- these are the real shared settings areas that already create cross-device drift risk
- it gives us the biggest correctness gain first

### 2. Merge model

Use `merge-by-subtree`.

That means:

- changing `dailySignals[date]` should not rewrite unrelated `prepTopicProgress`
- changing `notificationsEnabled` should not resend all `workoutLogs`
- changing one override map entry should not replace the entire settings document blindly if we can avoid it

### 3. Collision rule

For exact same-field collisions in this sprint:

- latest `updatedAt` wins

Reason:

- simple
- explainable
- good enough for a first hardening pass

This sprint does **not** try to build explicit user-facing conflict resolution for settings.

### 4. Manual cloud refresh

`Refresh from Cloud` remains authoritative while online.

Reason:

- it is the deliberate operator recovery path
- the user expectation is that it resets local shared truth from Firestore

### 5. Verification

This sprint includes:

- code and automated verification
- real phone/desktop verification after implementation

Reason:

- this problem is fundamentally behavioral across devices
- tests alone are not enough

## Non-Goals

This sprint does **not** aim to:

- redesign the sync UI again
- add CRDT-style merge logic
- surface settings conflicts to end users
- refactor all app persistence into generic patch infrastructure
- change device-local-only state ownership

## Expected Behavior After The Sprint

### Different subtrees changed on different devices

Expected result:

- desktop updates day mode
- phone updates notification preference
- both changes survive
- unrelated settings branches do not get overwritten

### Same subtree, different keys

Expected result:

- desktop updates `dailySignals['2026-04-18']`
- phone updates `dailySignals['2026-04-19']`
- both entries survive

### Same exact field on two devices

Expected result:

- latest `updatedAt` wins
- result is deterministic
- no whole-settings rollback of unrelated state

### Manual cloud refresh

Expected result:

- local shared settings are replaced by current Firestore truth
- cloud remains authoritative while online

## Workstreams

## 1. Shared Settings Patch Contract

Define the narrow settings patch model explicitly.

Checklist:

- [x] Define which settings subtrees get patch-style replay in this sprint.
- [x] Define the patch payload shapes clearly in code.
- [x] Keep the contract small and explicit rather than abstract too early.
- [x] Document which branches still remain full-snapshot if any.

Primary files likely involved:

- [src/domain/execution/sync.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/domain/execution/sync.ts)
- [src/domain/settings/types.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/domain/settings/types.ts)
- [src/services/sync/persistSyncableChange.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/sync/persistSyncableChange.ts)

## 2. Firestore Patch Replay

Replace whole-settings replay for the targeted branches with narrower remote writes.

Checklist:

- [x] Add subtree-aware Firestore update helpers for shared settings.
- [x] Replay only the changed subtree for targeted settings mutations.
- [x] Preserve Firestore as the source of truth for authenticated shared state.
- [x] Keep replay behavior deterministic.

Primary files likely involved:

- [src/data/firebase/firestoreSettingsRepository.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/data/firebase/firestoreSettingsRepository.ts)
- [src/services/sync/syncOrchestrator.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/sync/syncOrchestrator.ts)

## 3. Mutation Path Conversion

Convert the highest-risk settings mutation flows to use the narrower patch model.

Checklist:

- [x] Update day mode override writes.
- [x] Update day type override writes.
- [x] Update daily signals writes.
- [x] Update prep progress writes.
- [x] Update workout log writes.
- [x] Update notification preference writes.
- [x] Update calendar connection writes if needed to keep behavior consistent.

Primary files likely involved:

- [src/services/settings/dayModeOverrideService.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/settings/dayModeOverrideService.ts)
- [src/services/settings/dayTypeOverrideService.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/settings/dayTypeOverrideService.ts)
- [src/services/settings/dailySignalsService.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/settings/dailySignalsService.ts)
- [src/services/settings/prepProgressService.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/settings/prepProgressService.ts)
- [src/services/settings/workoutLogService.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/settings/workoutLogService.ts)
- [src/services/settings/notificationPreferenceService.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/settings/notificationPreferenceService.ts)
- [src/services/calendar/calendarIntegrationService.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/calendar/calendarIntegrationService.ts)

## 4. Hydration And Subscription Compatibility

Ensure the earlier cloud hydration/subscription work still behaves correctly with narrower mutation replay.

Checklist:

- [x] Confirm subscriptions still rehydrate local settings correctly.
- [x] Ensure patch replay does not reintroduce subscription loops.
- [x] Ensure queued patch items are cleared/superseded correctly when cloud truth arrives.
- [x] Keep `Refresh from Cloud` behavior consistent.

Primary files likely involved:

- [src/services/sync/cloudSyncService.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/sync/cloudSyncService.ts)
- [src/services/sync/SyncProvider.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/sync/SyncProvider.tsx)
- [src/features/settings/hooks/useRefreshCloudWorkspace.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/settings/hooks/useRefreshCloudWorkspace.ts)

## 5. Validation

Checklist:

- [x] Add unit tests for subtree patch replay.
- [x] Add tests proving unrelated settings branches are preserved.
- [ ] Add tests for same-subtree different-key updates.
- [ ] Add tests for latest-`updatedAt` same-field collision behavior where practical.
- [x] Run `npm run lint`.
- [x] Run `npm run typecheck`.
- [x] Run `npm run test:run`.
- [x] Run `npm run build`.
- [ ] Verify real phone/desktop propagation for the highest-risk settings flows.

## Acceptance Criteria

The sprint is complete when:

- targeted shared settings mutations no longer replay the whole settings snapshot
- unrelated settings branches survive cross-device updates
- exact same-field collisions behave deterministically
- cloud hydration and live subscriptions still work with the narrowed patch model
- `Refresh from Cloud` still behaves as the explicit cloud-authoritative reset
- automated checks are green
- real phone/desktop verification is complete

## Implementation Notes

The implementation took the conservative route:

- Forge still supports `upsertSettings` for broader restore/bootstrap paths where replaying a full settings document remains appropriate.
- High-risk shared settings mutations now use a new explicit `patchSettings` action instead of replaying the whole `settings/default` document.
- Queue identity is now narrow for those patched branches, for example:
  - `default:notificationsEnabled`
  - `default:dayModeOverrides:2026-03-26`
  - `default:dailySignals:2026-03-27`
- That means overlapping writes to the same field supersede each other, while unrelated settings branches can stay queued independently.

### Files changed during implementation

- [src/domain/execution/sync.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/domain/execution/sync.ts)
- [src/domain/settings/sync.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/domain/settings/sync.ts)
- [src/services/settings/settingsSyncPersistence.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/settings/settingsSyncPersistence.ts)
- [src/data/firebase/firestoreSettingsRepository.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/data/firebase/firestoreSettingsRepository.ts)
- [src/services/sync/syncOrchestrator.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/sync/syncOrchestrator.ts)
- [src/services/sync/cloudSyncService.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/sync/cloudSyncService.ts)
- [src/services/settings/dayModeOverrideService.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/settings/dayModeOverrideService.ts)
- [src/services/settings/dayTypeOverrideService.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/settings/dayTypeOverrideService.ts)
- [src/services/settings/dailySignalsService.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/settings/dailySignalsService.ts)
- [src/services/settings/prepProgressService.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/settings/prepProgressService.ts)
- [src/services/settings/workoutLogService.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/settings/workoutLogService.ts)
- [src/services/settings/notificationPreferenceService.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/settings/notificationPreferenceService.ts)
- [src/services/calendar/calendarIntegrationService.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/calendar/calendarIntegrationService.ts)
- [src/tests/domain/sync-queue.spec.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/tests/domain/sync-queue.spec.ts)
- [src/tests/services/cloud-sync-service.spec.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/tests/services/cloud-sync-service.spec.ts)
- [src/tests/services/day-mode-override.spec.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/tests/services/day-mode-override.spec.ts)
- [src/tests/services/day-type-override.spec.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/tests/services/day-type-override.spec.ts)
- [src/tests/services/daily-signals.spec.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/tests/services/daily-signals.spec.ts)
- [src/tests/services/prep-progress.spec.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/tests/services/prep-progress.spec.ts)
- [src/tests/services/workout-log.spec.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/tests/services/workout-log.spec.ts)
- [src/tests/services/notification-preference.spec.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/tests/services/notification-preference.spec.ts)

### Verification

Completed:

- `npm run lint`
- `npm run typecheck`
- `npm run test:run` → `69` files, `255` tests passed
- `npm run build`

Still pending:

- real phone/desktop verification of the narrowed settings patch behavior

### Next step

The next meaningful validation step is live cross-device testing of:

1. day mode on one device plus notification toggle on the other
2. daily signals on one device plus prep/workout changes on the other
3. manual `Refresh from Cloud` after mixed-device edits

## Risks And Tradeoffs

### Risk: patch-model sprawl

Why it matters:

- too much abstraction too early can make the sync layer harder to reason about

Mitigation:

- only convert the highest-risk shared settings branches first

### Risk: false sense of conflict safety

Why it matters:

- narrower patches reduce overwrite risk, but do not remove all conflict cases

Mitigation:

- explicitly keep latest-`updatedAt` wins as the sprint rule
- document that full user-facing conflict resolution is still out of scope

### Risk: replay/subscription churn

Why it matters:

- subscriptions plus patch replay can still cause unexpected local invalidation churn if the boundaries are not clean

Mitigation:

- keep remote-applied writes non-user-mutational
- preserve the existing hydration/subscription service as the single inbound application path

## Recommended Implementation Order

1. define patch payload contract
2. add Firestore patch replay support
3. convert highest-risk mutation services
4. confirm hydration/subscription compatibility
5. add tests
6. run real phone/desktop verification

## Progress Log

Implementation recommendations chosen:

- narrow only the highest-risk shared settings writes first
- use merge-by-subtree
- use latest-`updatedAt` wins for same-field collisions in this sprint
- keep `Refresh from Cloud` authoritative while online
- include real phone/desktop verification after implementation

## Next Step After Review

Common next actions:

1. approve and start implementation
2. request scope changes before coding
