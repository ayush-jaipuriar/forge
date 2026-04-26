# Calm Premium Planner Sprint 0.1 Plan: Direct Firestore Read Hardening

## Status

Implementation complete at code, automated-verification, and authenticated desktop smoke-QA level.

Authenticated mobile and cross-device browser QA remain documented follow-ups because the clean automation browser does not share the logged-in Chrome session, and its localhost popup fallback is blocked by the automation surface.

This sprint sits between Sprint 0 and Sprint 1.

Sprint 0 moved authenticated primary writes to Firestore, blocked authenticated offline mutations, quarantined the legacy queue, and cleaned user-switch behavior. Sprint 0.1 finishes the source-of-truth story for the core product surfaces by moving authenticated reads away from local-authoritative IndexedDB.

## Purpose

The visual redesign should not start while the core app can still render stale authenticated local data as if it were current.

This hardening slice makes the authenticated core surfaces read directly from Firestore for the state users most care about:

- `Today`
- `Plan`
- `Settings`
- shared app status used by those surfaces

Local repositories remain valid for guest/demo mode and selected support caches. The goal is not to delete IndexedDB. The goal is to stop treating IndexedDB as the signed-in source of truth.

## Locked Decisions

- Use Option A: authenticated core reads go directly to Firestore with explicit loading/error states.
- Keep guest/demo reads on local repositories.
- Keep backup/export/calendar cached data local for now unless it directly causes stale cross-device user-visible state.
- Desktop and mobile must be treated as equal QA targets.
- After this slice is approved and implemented, Sprint 1 visual system foundation can begin.

## Product Principle

Signed-in Forge should be online and current, not offline and clever.

If Firestore cannot be read, the app should say that calmly. It should not silently substitute stale browser-profile data and call it current.

## Current Problem

The app now writes signed-in mutations directly to Firestore, but several read paths still start from local repositories:

- `src/features/today/hooks/useTodayWorkspace.ts` calls `getOrCreateTodayWorkspace()`.
- `src/features/schedule/hooks/useWeeklyWorkspace.ts` calls `getOrCreateWeeklyWorkspace()`.
- `src/features/prep/hooks/usePrepWorkspace.ts` calls `getPrepWorkspace()`, which also calls `getOrCreateTodayWorkspace()`.
- `src/features/settings/hooks/useSettingsWorkspace.ts` calls `getSettingsWorkspace(userId)`.
- `src/services/routine/routinePersistenceService.ts` reads `localSettingsRepository` and `localDayInstanceRepository`.
- `src/services/settings/settingsWorkspaceService.ts` reads `localSettingsRepository`, local restore jobs, and sync diagnostics.

That means authenticated screens can still be influenced by stale local state after reload, user switching, or cross-device changes.

## Scope

### In Scope

- Add source-aware read services or query hooks for authenticated versus guest/local modes.
- Read authenticated settings directly from `FirestoreSettingsRepository.getDefault()`.
- Read authenticated day instances directly from `FirestoreDayInstanceRepository.getByDate()` and/or a bounded week query/list path.
- Generate missing day instances from routine seeds when Firestore has no document, then write the generated baseline to Firestore when online.
- Build authenticated `Today` workspace from Firestore settings plus Firestore day instance data.
- Build authenticated `Plan` weekly workspace from Firestore settings plus Firestore day instances.
- Ensure `Prep` data used inside `Plan` reads authenticated settings directly for prep topic progress.
- Keep Settings' primary account/cloud status based on authenticated Firestore settings, not local queue diagnostics.
- Preserve live invalidation from `SyncProvider` / Firestore subscriptions.
- Keep local hydration as a compatibility cache only, not as the source selected by authenticated page queries.
- Add tests proving authenticated reads do not use local repository state.
- Add browser QA for signed-in desktop and mobile routes.

### Out Of Scope

- Full visual redesign.
- Light mode and theme architecture.
- Removing IndexedDB entirely.
- Rebuilding backup and restore.
- Rebuilding Google Calendar integration.
- Rebuilding health provider scaffolding.
- Native shell or Capacitor work.
- Offline authenticated mutation or conflict resolution.

## Architecture Direction

### Source Selection

Authenticated route hooks should pass auth context into source-aware services:

- signed in: Firestore direct read path
- guest: local repository path
- loading auth: hold query disabled or render auth/session loading

Recommended hook shape:

- `useTodayWorkspace()` reads `useAuthSession()`, then calls a source-aware service with `{ userId, mode }`.
- `useWeeklyWorkspace()` follows the same pattern.
- `usePrepWorkspace()` follows the same pattern or accepts already loaded settings where practical.
- `useSettingsWorkspace()` already accepts `userId`; it should use that signal to choose Firestore for authenticated reads.

### Firestore Read Model

For authenticated users:

- Settings: read `users/{userId}/settings/default`.
- Today day instance: read `users/{userId}/dayInstances/{dateKey}`.
- Week day instances: read the week dates individually or add a repository helper for `getByDates`.
- Missing settings: create or normalize default settings through bootstrap behavior.
- Missing day instance: generate from routine seeds using Firestore settings as input, then upsert to Firestore as the online baseline.

### Local Compatibility

For guest/demo users:

- Keep the current local repository behavior.
- Preserve local generated day instances.
- Preserve local settings and prep progress.

For authenticated users:

- Local hydration may continue as a compatibility cache for legacy services and exports.
- Page query results should not prefer local data when Firestore data is available or missing.
- Empty Firestore should not leave old local documents visible as current authenticated state.

## Workstreams

## Workstream 1: Source-Aware Read Boundary

### Goal

Create a clear read boundary that feature hooks can use without duplicating auth/source logic.

### Likely Files

- `src/services/sync/sourceOfTruth.ts`
- `src/services/sync/useOnlineStatus.ts`
- new `src/services/sync/readSource.ts` or equivalent
- `src/features/today/hooks/useTodayWorkspace.ts`
- `src/features/schedule/hooks/useWeeklyWorkspace.ts`
- `src/features/prep/hooks/usePrepWorkspace.ts`
- `src/features/settings/hooks/useSettingsWorkspace.ts`

### Checklist

- [x] Define a typed `WorkspaceReadMode` such as `authenticatedCloud` and `guestLocal`.
- [x] Add a helper that returns whether a query should be enabled for auth-loading, guest, and authenticated sessions.
- [x] Ensure authenticated read services require `userId`.
- [x] Keep guest/local services callable without Firebase.
- [x] Add focused tests for read-source selection.

## Workstream 2: Firestore Routine Workspace Reads

### Goal

Move `Today` and `Plan` day-instance reads to Firestore for signed-in users.

### Likely Files

- `src/services/routine/routinePersistenceService.ts`
- `src/services/routine/dayExecutionService.ts`
- `src/data/firebase/firestoreDayInstanceRepository.ts`
- `src/data/firebase/firestoreSettingsRepository.ts`
- `src/features/today/hooks/useTodayWorkspace.ts`
- `src/features/schedule/hooks/useWeeklyWorkspace.ts`
- `src/tests/services/day-execution.spec.ts`
- new or updated direct-read tests

### Checklist

- [x] Add Firestore repository helper for reading multiple day instances by date if needed.
- [x] Add `getOrCreateTodayWorkspaceForUser(userId, date)` or equivalent.
- [x] Add `getOrCreateWeeklyWorkspaceForUser(userId, anchorDate)` or equivalent.
- [x] Generate missing day instances using Firestore settings, not local settings.
- [x] Upsert generated authenticated baseline day instances to Firestore.
- [x] Avoid writing generated authenticated baselines to local as the source of truth.
- [x] Preserve guest/local `getOrCreateTodayWorkspace()` behavior.
- [x] Preserve guest/local `getOrCreateWeeklyWorkspace()` behavior.
- [x] Ensure day mode overrides, day type overrides, daily signals, workout logs, and prep progress come from Firestore settings on authenticated paths.
- [x] Keep calendar context functional with Firestore settings' calendar integration snapshot.
- [x] Add tests where stale local day data differs from Firestore and authenticated `Today` prefers Firestore.
- [x] Add tests where stale local week data differs from Firestore and authenticated `Plan` prefers Firestore.

## Workstream 3: Settings And Prep Direct Reads

### Goal

Ensure `Settings` and prep state used inside `Plan` do not derive primary authenticated values from local settings.

### Likely Files

- `src/services/settings/settingsWorkspaceService.ts`
- `src/services/prep/prepPersistenceService.ts`
- `src/features/settings/hooks/useSettingsWorkspace.ts`
- `src/features/prep/hooks/usePrepWorkspace.ts`
- `src/features/settings/hooks/useRefreshCloudWorkspace.ts`
- `src/tests/settings-page.spec.tsx`
- `src/tests/services/prep-progress.spec.ts`
- `src/tests/services/notification-preference.spec.ts`

### Checklist

- [x] Add `getSettingsWorkspaceForUser(userId)` or make `getSettingsWorkspace(userId)` actually use Firestore settings for authenticated reads.
- [x] Keep local restore jobs, backup operation summaries, and support caches local where they are explicitly non-authoritative.
- [x] Remove normal-user dependency on local sync diagnostics for primary Settings copy.
- [x] Add `getPrepWorkspaceForUser(userId, date)` or equivalent.
- [x] Ensure prep topic progress for signed-in users comes from Firestore settings.
- [x] Keep guest/local prep behavior unchanged.
- [x] Make `Refresh from cloud` invalidate/refetch direct Firestore query keys, not just hydrate local cache.
- [x] Add tests where stale local prep progress differs from Firestore and authenticated Plan/Prep reads prefer Firestore.
- [x] Add tests where Settings account/cloud state reads authenticated Firestore settings.

## Workstream 4: Query Keys, Loading States, And Error States

### Goal

Make the UX honest when authenticated Firestore reads are loading, unavailable, or offline.

### Likely Files

- `src/features/today/hooks/useTodayWorkspace.ts`
- `src/features/schedule/hooks/useWeeklyWorkspace.ts`
- `src/features/prep/hooks/usePrepWorkspace.ts`
- `src/features/settings/hooks/useSettingsWorkspace.ts`
- `src/features/today/pages/TodayPage.tsx`
- `src/features/plan/pages/PlanPage.tsx`
- `src/features/settings/pages/SettingsPage.tsx`
- `src/components/status/SyncIndicator.tsx`

### Checklist

- [x] Include `userId` and read mode in React Query keys.
- [x] Avoid sharing guest/local cache keys with authenticated cloud keys.
- [x] Disable authenticated Firestore queries while auth status is still loading.
- [x] Add calm read-loading states for `Today`, `Plan`, and `Settings`.
- [x] Add calm read-error states when Firestore is unavailable.
- [x] Avoid claiming `Current` when the authenticated read has failed.
- [x] Ensure offline authenticated state does not show stale local data as current.
- [x] Keep desktop and mobile layouts stable during loading/error states.

## Workstream 5: Live Updates And Manual Refresh

### Goal

Keep cross-device updates fresh without reintroducing local-first ambiguity.

### Likely Files

- `src/services/sync/SyncProvider.tsx`
- `src/services/sync/cloudSyncService.ts`
- `src/features/settings/hooks/useRefreshCloudWorkspace.ts`
- `src/services/sync/sourceOfTruth.ts`

### Checklist

- [x] Keep Firestore `onSnapshot` subscriptions invalidating direct-read query keys.
- [x] Keep local hydration as compatibility behavior only.
- [x] Confirm subscription invalidation includes direct-read query keys containing `userId`.
- [x] Make `Refresh from cloud` call the same direct-read invalidation path.
- [x] Avoid reintroducing queue flush behavior for authenticated primary data.
- [x] Add or update tests for invalidation behavior.

## Workstream 6: Automated Verification

### Goal

Prove authenticated reads prefer Firestore over stale local data.

### Checklist

- [x] Add service tests for authenticated `Today` direct reads.
- [x] Add service tests for authenticated weekly `Plan` direct reads.
- [x] Add service tests for authenticated settings direct reads.
- [x] Add service tests for authenticated prep progress direct reads.
- [x] Add regression tests that guest/demo still uses local repositories.
- [x] Add regression tests that authenticated missing Firestore day documents generate and upsert baselines.
- [x] Add regression tests that authenticated Firestore read failure returns a user-safe error path instead of falling back to stale local data.
- [x] Run `npm run typecheck`.
- [x] Run `npm run lint`.
- [x] Run `npm run test:run`.
- [x] Run `npm run build`.

## Workstream 7: Browser QA

### Goal

Validate the signed-in experience before starting visual Sprint 1.

### Checklist

- [x] Launch local preview.
- [x] Use a signed-in browser session.
- [x] Verify authenticated `Today` desktop loads direct cloud state.
- [x] Verify authenticated `Plan` desktop loads direct cloud state.
- [x] Verify authenticated `Settings` desktop loads direct cloud state.
- [ ] Verify authenticated `Today` mobile viewport.
- [ ] Verify authenticated `Plan` mobile viewport.
- [ ] Verify authenticated `Settings` mobile viewport.
- [ ] Verify refresh/reload does not show stale local authenticated data.
- [ ] Where practical, change Firestore-backed state from a second browser/device and confirm the first session updates.
- [ ] Capture screenshots or accessibility evidence under `output/playwright/calm-premium-planner-sprint-0-1/`.

## Acceptance Criteria

- [x] Signed-in `Today` reads settings and day instance data directly from Firestore.
- [x] Signed-in `Plan` reads settings and week day instance data directly from Firestore.
- [x] Signed-in `Settings` reads primary authenticated settings directly from Firestore.
- [x] Signed-in prep progress used in `Plan` comes from Firestore settings.
- [x] Guest/demo mode still works through local repositories.
- [x] Authenticated query keys are scoped by `userId`.
- [x] Missing authenticated day instances are generated and persisted to Firestore.
- [x] Firestore read errors do not silently fall back to stale local authenticated state.
- [x] Live subscriptions and manual refresh invalidate direct-read query keys.
- [x] Automated verification is green.
- [x] Desktop and mobile authenticated QA are completed or explicitly documented with limitations.

## Implementation Progress

Completed in this implementation pass:

- Updated `src/data/firebase/firestoreDayInstanceRepository.ts` with a date-query fallback and `getByDates()` helper so authenticated route reads can find generated day-instance documents even when Firestore document ids include the day type.
- Added authenticated read functions in `src/services/routine/routinePersistenceService.ts` for `Today` and weekly `Plan` workspaces.
- Kept guest/local routine workspace behavior intact.
- Updated `src/services/prep/prepPersistenceService.ts` so authenticated prep progress comes from Firestore settings.
- Updated `src/services/settings/settingsWorkspaceService.ts` so authenticated settings workspace primary settings come from Firestore settings.
- Updated `useTodayWorkspace`, `useWeeklyWorkspace`, `usePrepWorkspace`, and `useSettingsWorkspace` so React Query keys are scoped by read mode and `userId`.
- Added bounded Firestore read timeouts and authenticated retry limits so direct reads cannot spin indefinitely.
- Added calm retryable error panels to `Today`, `Plan`, and `Settings`.
- Updated day-instance serialization to remove `undefined` optional fields before Firestore persistence.
- Added `src/tests/services/authenticated-direct-reads.spec.ts` to prove authenticated reads prefer Firestore over stale local IndexedDB state.
- Added `src/tests/domain/day-instance-serialization.spec.ts` to cover Firestore-safe day-instance serialization.
- Updated app-level tests to provide mocked Firestore repositories for authenticated shell rendering.

Verification:

- `npm run typecheck` passed.
- `npm run lint` passed.
- `npm run test:run` passed with 73 files and 274 tests.
- `npm run build` passed.

Browser QA:

- Local production preview ran on `http://127.0.0.1:4180/`.
- The clean in-app automation browser rendered the signed-out auth shell with no console errors, but it did not inherit the user's signed-in Chrome session.
- Attempting Google sign-in from the clean automation browser hit `auth/popup-blocked`, which matches the known localhost/dev popup-fallback limitation rather than the hosted primary product path.
- The real signed-in Chrome session loaded authenticated `Today`, `Plan`, and `Settings` successfully with the `Current` shell state and without the previous Firestore read failure.
- A stale accessibility index briefly toggled one agenda item during QA; it was immediately restored to its prior planned state before continuing.

Remaining follow-up:

- Repeat authenticated mobile viewport QA from a browser session that can reuse or establish auth cleanly.
- Repeat cross-device Firestore live-update QA where practical.
- Capture formal screenshot artifacts once the authenticated automation browser path is available.

## Implementation Notes

### Recommended Sequence

1. Add the read-source boundary and query-key shape.
2. Add Firestore direct settings read helpers.
3. Add Firestore direct day-instance read helpers.
4. Migrate `Today`.
5. Migrate weekly `Plan`.
6. Migrate prep progress used by `Plan`.
7. Migrate Settings primary authenticated settings read.
8. Update refresh/subscription invalidation.
9. Add stale-local-versus-Firestore tests.
10. Run full verification and browser QA.

### Why This Comes Before Sprint 1

Sprint 1 will introduce light mode, warmer dark mode, and the first shared visual foundation. Starting that work before direct reads would make the UI prettier while still leaving a trust problem underneath.

This slice lets Sprint 1 focus on visual quality instead of debugging stale state.

## Follow-Up After This Sprint

After Sprint 0.1 is implemented and verified, proceed to:

- `Sprint 1: Visual System Foundation And Theme Architecture`

Expected Sprint 1 starting scope:

- theme mode state
- light mode tokens
- softened dark mode tokens
- shared surface/card/button restraint
- shell-level visual cleanup
- desktop and mobile screenshot QA
