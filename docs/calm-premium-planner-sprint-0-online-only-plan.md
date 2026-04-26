# Calm Premium Planner Sprint 0 Plan: Authenticated Online-Only State Pivot

## Status

Implementation complete pending the next hardening slice.

Approved for implementation and completed for authenticated cloud-direct writes, online mutation guards, local queue quarantine, user-switch cleanup, automated regression coverage, and authenticated desktop route QA.

## Purpose

Sprint 0 exists to simplify Forge's runtime model before the visual redesign begins.

The current app has a local-first sync architecture that is real, tested, and thoughtfully built, but it is also too complex for the product's current stage. It creates stale-state risk across devices and forces the UI to expose sync posture, recovery language, queue status, and technical details that users do not care about.

This sprint moves authenticated Forge usage to an online-only model:

- Firestore becomes the source of truth for signed-in users.
- Local IndexedDB remains useful only where it is clearly non-authoritative.
- Offline authenticated mutation is disabled instead of silently queued.
- Demo mode remains local.
- PWA shell caching remains, but authenticated data actions require connection.

The goal is not to delete all local code immediately. The goal is to create a clean source-of-truth boundary so the upcoming calm premium planner redesign is not fighting old sync ambiguity.

## Locked Decisions

- Authenticated Forge is online-only for now.
- Firestore is the authenticated source of truth.
- IndexedDB can remain for demo/guest workspace, appearance preference, PWA shell startup metadata, backup staging, and explicitly temporary non-authoritative caches.
- Authenticated writes should not silently queue while offline.
- Offline authenticated users should see a calm online-required state.
- Cross-device freshness should come from Firestore reads and live subscriptions.
- Settings should stop foregrounding low-value sync diagnostics for normal users.
- This sprint should avoid visual redesign except for necessary online/offline and sync-state copy cleanup.
- Desktop and mobile must both be validated.

## Current Architecture Summary

Forge currently uses:

- IndexedDB via `idb` as a local repository layer.
- Local repositories for settings, day instances, calendar cache, health state, backup state, sync diagnostics, and sync queue.
- React Query hooks that mostly read from local repositories.
- Local-first writes that update IndexedDB first.
- A custom sync queue that later replays changes to Firestore.
- Firestore hydration and `onSnapshot` subscriptions that copy remote data back into IndexedDB.
- PWA service-worker caching that keeps the app shell available after a successful online load.

Focused tests currently pass for this architecture, which means the issue is not simply "broken code." The issue is product and runtime complexity.

## Problems To Solve

- Authenticated reads can still treat stale IndexedDB data as authoritative.
- Remote Firestore state can hydrate local records, but remote absence does not always clear stale local records.
- IndexedDB is browser-profile global and not cleanly user-scoped enough for source-of-truth use.
- Sign-out/sign-in can leave local workspace data around unless every repository is carefully reset.
- Sync queue failure states require technical UX that makes the app feel like an admin console.
- Remote snapshots and local queued writes can race.
- Offline shell availability can be confused with offline data correctness.
- Users experience cross-device mismatch as a trust issue, not as a "sync architecture" issue.

## Product Principle

When signed in, Forge should prefer being honest over being clever.

That means:

- If online, show current Firestore-backed data.
- If offline, do not imply stale local data is current.
- If a write cannot be saved to Firestore, block the write with a calm explanation.
- If a user wants offline mutation later, design it intentionally as a future product capability.

## Scope

### In Scope

- Define the authenticated online-only behavior in code and docs.
- Add or harden a source-of-truth boundary for authenticated data access.
- Route authenticated primary reads away from local-authoritative IndexedDB.
- Route authenticated primary writes directly to Firestore.
- Preserve demo/guest local behavior.
- Preserve local appearance preference.
- Preserve PWA shell installability and cached shell startup.
- Disable or clearly block authenticated mutations while offline.
- Retain Firestore `onSnapshot` subscriptions for cross-device freshness.
- Reduce normal-user sync queue/degraded UI.
- Add a manual refresh-from-cloud action if still useful after the source boundary is implemented.
- Update tests and documentation.

### Out Of Scope

- Light mode implementation.
- Full calm premium visual redesign.
- Native shell or Capacitor-specific work.
- Rebuilding backup/restore architecture.
- Deleting every local repository.
- Building a new offline conflict-resolution engine.
- Supporting authenticated offline mutation.
- Changing Firestore security rules unless implementation uncovers a required fix.

## Relevant Files

### Auth And Session

- `src/features/auth/providers/AuthSessionProvider.tsx`
- `src/features/auth/services/bootstrapUserSession.ts`
- `src/features/auth/services/bootstrapGuestSession.ts`
- `src/features/auth/services/authRedirectStorage.ts`

### Sync Runtime

- `src/services/sync/SyncProvider.tsx`
- `src/services/sync/cloudSyncService.ts`
- `src/services/sync/persistSyncableChange.ts`
- `src/services/sync/syncOrchestrator.ts`
- `src/services/sync/syncQueueService.ts`

### Firestore Data

- `src/data/firebase/firestoreDayInstanceRepository.ts`
- `src/data/firebase/firestoreSettingsRepository.ts`
- `src/data/firebase/firestoreUserRepository.ts`
- `src/data/firebase/firestoreConverters.ts`

### Local Data

- `src/data/local/forgeDb.ts`
- `src/data/local/*`
- `src/services/settings/settingsSyncPersistence.ts`
- `src/services/routine/routinePersistenceService.ts`

### Product Surfaces

- `src/features/today/hooks/*`
- `src/features/today/pages/TodayPage.tsx`
- `src/features/plan/pages/PlanPage.tsx`
- `src/features/insights/pages/InsightsPage.tsx`
- `src/features/settings/pages/SettingsPage.tsx`
- `src/components/status/SyncIndicator.tsx`

### Tests

- `src/tests/services/cloud-sync-service.spec.ts`
- `src/tests/sync-provider.spec.tsx`
- `src/tests/domain/sync-queue.spec.ts`
- `src/tests/services/day-execution.spec.ts`
- `src/tests/services/prep-progress.spec.ts`
- `src/tests/services/notification-preference.spec.ts`
- `src/tests/services/forge-db-reset.spec.ts`
- Add new focused tests where the source-of-truth boundary is introduced.

## Implementation Strategy

### Step 1: Inventory Local-Authoritative Paths

Purpose:

Find every place where authenticated routes read or write local data as if it were truth.

Checklist:

- [x] List authenticated reads used by `Today`.
- [x] List authenticated reads used by `Plan`.
- [x] List authenticated reads used by `Insights`.
- [x] List authenticated reads used by `Settings`.
- [x] List authenticated writes used by completion actions, prep actions, settings updates, notifications, and calendar actions.
- [x] Mark each path as `authenticated primary`, `guest/demo`, `appearance/local utility`, or `non-authoritative cache`.
- [x] Document any path that cannot be moved to Firestore in this sprint and why.

Expected outcome:

We know which paths need a source-aware adapter and which paths can remain local.

### Step 2: Define The Source-Of-Truth Boundary

Purpose:

Make online-only behavior explicit instead of scattering `if signed in` checks across pages.

Recommended approach:

Add a small source-aware layer that can answer:

- Is this workspace authenticated?
- Is this workspace demo/local?
- Is this browser currently online?
- Can this action mutate cloud state right now?
- Should this read use Firestore or local repositories?

Checklist:

- [x] Add a typed data-mode helper or service for `authenticatedOnlineOnly` versus `guestLocal`.
- [x] Keep the helper small and dependency-light.
- [x] Ensure the helper is easy to unit test.
- [x] Avoid adding another broad global state system unless the existing providers cannot support this cleanly.
- [x] Add tests for authenticated online, authenticated offline, and guest/local modes.

Expected outcome:

Feature code can make consistent data-source decisions without duplicating source logic.

### Step 3: Harden Firestore Bootstrap Shape

Purpose:

Make Firestore records complete enough to be read directly by authenticated views.

Checklist:

- [x] Review `bootstrapUserSession` for settings shape completeness.
- [x] Ensure authenticated settings records contain the fields the app expects.
- [x] Normalize server timestamp fields before they reach UI code.
- [x] Confirm day-instance Firestore reads return complete domain objects.
- [ ] Add or update converter tests for direct Firestore-backed reads.

Expected outcome:

Firestore data can be trusted by the UI without requiring IndexedDB normalization as a hidden middle layer.

### Step 4: Move Authenticated Reads To Firestore-Backed Data

Purpose:

Stop showing stale local data as current data for signed-in users.

Recommended approach:

Use Firestore repositories and live subscriptions for authenticated paths, while retaining local repositories for guest/demo paths. If a direct page migration is too large, introduce source-aware service functions first and migrate pages behind those functions.

Checklist:

- [ ] Move authenticated settings reads to direct Firestore-backed reads.
- [ ] Move authenticated day-instance reads to direct Firestore-backed reads.
- [x] Keep guest/demo reads local.
- [x] Preserve React Query loading/error states.
- [x] Avoid rendering local cached authenticated data as current unless it is explicitly labelled non-authoritative.
- [x] Keep live Firestore subscription behavior for cross-device updates.
- [ ] Add loading and empty-state handling for direct cloud reads.

Expected outcome:

Refreshing the same signed-in account on two devices shows Firestore-backed state, not whichever local IndexedDB state was last available.

### Step 5: Move Authenticated Writes Directly To Firestore

Purpose:

Remove silent authenticated offline queueing from the primary product path.

Checklist:

- [x] Route primary authenticated day execution mutations to Firestore.
- [x] Route authenticated settings mutations to Firestore.
- [x] Route notification preference mutations to Firestore where applicable.
- [x] Keep guest/demo mutations local.
- [x] Remove or bypass `persistSyncableChange` for authenticated primary mutations.
- [x] Invalidate or update relevant React Query caches after successful cloud writes.
- [x] Add error handling that preserves user trust if Firestore writes fail.

Expected outcome:

Signed-in user actions save directly to the cloud or fail visibly. They do not silently become a local-only truth.

### Step 6: Add Online-Required Mutation Guards

Purpose:

Make offline behavior honest and calm.

Checklist:

- [x] Add a shared `canMutateCloud` style guard for authenticated actions.
- [x] Disable primary authenticated mutation buttons while offline.
- [x] Use concise copy such as `Reconnect to save changes`.
- [x] Avoid dramatic warnings or technical sync wording.
- [x] Ensure disabled controls remain accessible with labels or helper text.
- [ ] Validate mobile touch targets and disabled states.

Expected outcome:

Offline authenticated users understand that data actions need a connection without seeing queue internals.

### Step 7: Simplify Sync Provider Behavior

Purpose:

Stop normal signed-in usage from depending on queue/degraded sync concepts.

Checklist:

- [x] Keep Firestore live subscriptions where useful.
- [x] Remove sync queue flushing from authenticated primary data flow.
- [x] Keep any remaining sync queue behavior quarantined to legacy or explicit flows.
- [x] Reduce `SyncIndicator` states to user-meaningful states.
- [x] Remove or hide degraded queue copy from normal settings/status surfaces.
- [ ] Preserve enough diagnostics for development and future support if needed.

Expected outcome:

The app can say `Current`, `Offline`, or `Needs connection` instead of exposing operational sync internals.

### Step 8: Prevent Cross-User Local Leakage

Purpose:

Ensure old local state cannot appear after account switches.

Checklist:

- [x] Review sign-out cleanup behavior.
- [x] Clear or ignore authenticated local workspace data on sign-out.
- [x] Clear or ignore authenticated local workspace data when a different user signs in.
- [x] Preserve appearance preference across sign-out.
- [x] Preserve demo workspace behavior separately.
- [x] Add tests for user switch behavior where practical.

Expected outcome:

Signing out and signing into another account cannot display the previous user's local workspace as current state.

### Step 9: Add Manual Refresh From Cloud

Purpose:

Give users a simple recovery action without exposing sync machinery.

Checklist:

- [ ] Add a concise `Refresh from cloud` action in Settings if the final data flow still benefits from it.
- [ ] Avoid showing low-level queue stats beside it.
- [ ] Make the action refetch Firestore-backed queries/subscriptions.
- [ ] Show simple success/error feedback.
- [ ] Hide or de-emphasize the action if live subscriptions make it unnecessary.

Expected outcome:

Users have a low-risk recovery action, but Settings no longer looks like a sync debugger.

### Step 10: Documentation And Progress Record

Purpose:

Keep the implementation auditable and easy to continue.

Checklist:

- [x] Update this sprint plan with completion checkmarks as implementation proceeds.
- [x] Update `docs/calm-premium-planner-visual-redesign-plan.md` with sprint status.
- [x] Document changed files, functions, components, and services.
- [x] Document any intentionally retained local behavior.
- [x] Document any follow-up risks for later sprints.

Expected outcome:

The next sprint can build visual simplification on a clear runtime base.

## Testing Plan

### Automated Checks

Run these before marking implementation complete:

- [x] `npm run typecheck`
- [x] `npm run lint`
- [x] `npm run test:run`
- [x] `npm run build`

### Focused Test Coverage

Add or update tests for:

- [x] Authenticated online writes use the Firestore-backed source boundary.
- [x] Authenticated offline mutations are blocked.
- [x] Guest/demo reads remain local.
- [x] Guest/demo writes remain local.
- [x] Sign-out/user-switch does not show stale authenticated local data.
- [x] Sync indicator does not expose queue/degraded state in normal authenticated usage.
- [ ] Manual refresh from cloud refetches the cloud-backed state.

### Browser QA

Capture screenshots under:

- `output/playwright/calm-premium-planner-sprint-0/`

Required routes:

- [x] Authenticated `Today` desktop.
- [x] Authenticated `Plan` desktop.
- [x] Authenticated `Insights` desktop.
- [x] Authenticated `Settings` desktop.
- [ ] Authenticated `Today` mobile.
- [ ] Authenticated `Plan` mobile.
- [ ] Authenticated `Insights` mobile.
- [ ] Authenticated `Settings` mobile.
- [ ] Authenticated offline state.
- [x] Guest/demo mode.

Browser QA note:

- Local preview was launched on `http://127.0.0.1:4181/`.
- The unauthenticated entry and demo-local messaging rendered successfully.
- Screenshots captured through Playwright MCP:
- `output/playwright/calm-premium-planner-sprint-0/calm-premium-planner-sprint-0-auth-desktop-preview.png`
- `output/playwright/calm-premium-planner-sprint-0/calm-premium-planner-sprint-0-auth-mobile-preview.png`
- Authenticated desktop route QA was completed against the user's signed-in Chrome session on `http://127.0.0.1:4180/` using Computer Use accessibility inspection.
- Verified authenticated `Today`, `Plan`, `Insights`, and `Settings` loaded without returning to auth and exposed the expected signed-in `Current` session state.
- `Today` desktop no longer showed the earlier broken middle-gap layout in the audited viewport; the hero, current execution, agenda, and context regions occupied the page normally.
- `Settings` exposed the simplified `Refresh from cloud` action and did not foreground local queue internals as a primary user concept.
- Full authenticated screenshot capture was not used as final evidence because macOS screenshot capture returned unreliable foreground-window results in this session. The trusted evidence for this pass is the live Chrome accessibility tree and route state.
- Authenticated mobile QA remains pending because the real logged-in Chrome session could not be reliably constrained to a true mobile viewport with the available automation path. Mobile should be validated with either a Playwright-auth storage state or a manually logged-in responsive-browser pass before production deployment.

Browser QA checks:

- [x] Signed-in online state loads without stale local confidence.
- [ ] Offline authenticated mutations are disabled.
- [ ] Offline copy is concise and user-friendly.
- [ ] Cross-device or simulated Firestore update is reflected where practical.
- [x] Settings no longer foregrounds sync queue internals.
- [x] No desktop visual regression from the existing simplified IA.

## Acceptance Criteria

- [x] Signed-in Forge treats Firestore as the source of truth for authenticated primary writes and live hydration.
- [x] Signed-in Forge does not silently queue primary offline mutations.
- [x] Offline signed-in users see a clear online-required state.
- [x] Demo/guest mode continues to work locally.
- [x] Local appearance preference is preserved.
- [x] Cross-device freshness is maintained through Firestore reads/subscriptions.
- [x] Settings removes or de-emphasizes normal-user sync queue/degraded details.
- [x] Sign-out/sign-in does not expose stale local workspace data.
- [x] Automated tests pass.
- [ ] Desktop and mobile browser QA screenshots are captured.
- [x] Documentation records what changed and what remains local.

## Implementation Progress

Completed in this implementation pass:

- Added `src/services/sync/sourceOfTruth.ts` to centralize authenticated online-only write checks and mutation status semantics.
- Updated `src/services/routine/dayExecutionService.ts` so authenticated day execution writes go directly to Firestore and do not enqueue local sync work.
- Updated `src/services/settings/settingsSyncPersistence.ts` so authenticated settings patches go directly to Firestore and do not enqueue local sync work.
- Updated `src/services/sync/SyncProvider.tsx` so authenticated sessions use current/refresh-needed status instead of replaying legacy queue work.
- Updated `src/services/sync/cloudSyncService.ts` to discard old authenticated sync queue entries after cloud hydration.
- Updated `src/features/auth/providers/AuthSessionProvider.tsx` to clear local workspace data on signed-in sign-out and user switches.
- Updated `src/features/auth/services/bootstrapUserSession.ts` so newly bootstrapped settings use the complete local `UserSettings` shape.
- Updated mutation hooks across Today, Plan, Prep, Physical, and Settings so authenticated writes show updating rather than local changes.
- Added online status awareness to mutation hooks and disabled primary offline authenticated controls across Today, Plan, Schedule, Prep, Physical, and Settings.
- Added `src/tests/services/authenticated-online-only.spec.ts` for direct cloud writes, offline blocking, and queue avoidance.
- Updated sync, cloud hydration, app, and calendar mirror tests to reflect the online-only authenticated path.

Remaining before closing Sprint 0 fully:

- Authenticated route reads still use the existing local repository workspace after Firestore hydration rather than direct Firestore query functions. Writes, live hydration, queue quarantine, and offline guards are in place; a direct-read refactor should be treated as the next hardening slice if we want to remove the local read cache completely.
- Capture full authenticated mobile browser screenshots from a signed-in local or hosted session.
- Validate offline authenticated disabled states in a browser session where network simulation is reliable.
- Consider replacing the accessibility-only authenticated route evidence with deterministic Playwright screenshots once an authenticated storage state can be created safely.

Authenticated desktop QA completed in this pass:

- `Today`: loaded signed-in as `Puru`, showed `Current`, rendered the primary execution surface and agenda without the earlier wide empty middle gap.
- `Plan`: loaded signed-in, showed week selection and day cards with `Current` state.
- `Insights`: loaded signed-in, showed analytics/readiness surfaces with `Current` state.
- `Settings`: loaded signed-in, showed account, backup, calendar, account/cloud, notification controls, provider status, and `Refresh from cloud`.

## Implementation Risks

- Firestore repository methods may not yet cover every local repository operation.
- Some existing services may assume local writes are synchronous.
- Backup/export flows may currently depend on local snapshots.
- Calendar cache and health scaffolding may need careful classification as non-authoritative cache.
- Some tests may encode old local-first assumptions and need intentional updates.
- Browser offline simulation can be flaky if service-worker caching hides network state.

## Risk Controls

- Keep demo/local behavior intact instead of deleting local repositories.
- Introduce a source boundary first, then migrate reads/writes behind it.
- Prefer focused tests around source behavior over broad brittle UI tests.
- Use concise offline UI rather than adding new detailed diagnostics.
- Update documentation during implementation so retained local paths are explicit.

## Recommended Implementation Order

1. Inventory and classify local data paths.
2. Add the source-of-truth boundary.
3. Harden Firestore bootstrap/converters.
4. Migrate authenticated settings reads/writes.
5. Migrate authenticated day-instance reads/writes.
6. Add offline mutation guards.
7. Simplify sync/status UI.
8. Add manual refresh from cloud if it remains useful.
9. Add focused tests.
10. Run full verification and browser QA.
11. Update sprint checklist and main roadmap status.

## Definition Of Done

Sprint 0 is complete when a signed-in user can use Forge online with Firestore-backed state, cannot accidentally create local-only authenticated changes while offline, and no longer sees sync queue machinery as part of normal product usage.

At that point, Sprint 1 can safely begin the visual system foundation work without carrying stale offline-state complexity into the new design language.
