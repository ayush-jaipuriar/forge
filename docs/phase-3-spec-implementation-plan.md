# Forge Phase 3 Spec and Implementation Plan

## Document Purpose

This document translates the Phase 3 intent in [PRS.md](../PRS.md) into a concrete implementation specification and execution checklist.

It is designed to do four jobs:

1. define what Phase 3 actually is, and what still remains intentionally deferred
2. recommend the right build order so notification and sync hardening happen before external-calendar depth
3. break the work into trackable milestones with embedded testing and documentation
4. preserve Forge as a serious execution OS while introducing real delivery channels and external integrations

## Phase 3 Clarified Constraints

This Phase 3 plan is based on the product spec in [PRS.md](../PRS.md) plus explicit planning decisions made after Phase 2:

- prioritize notifications and sync hardening before real Calendar integration
- include scheduled and automatic backup behavior as first-class Phase 3 work
- create a new dedicated Phase 3 plan while treating the Phase 2 analytics stack as feature-frozen except for bug fixes and integration-safe hardening

Additional architecture recommendations adopted in this plan:

- stay on the current Firebase plus Firebase Functions posture rather than introducing a separate backend platform in Phase 3
- ship browser and PWA notifications as the real delivery channel for Phase 3, while leaving native mobile push as future scaffolding rather than pretending to fully support it now

## Phase 3 Scope Extracted from PRS

Phase 3 in [PRS.md](../PRS.md) is explicitly:

- notifications
- more polished sync behavior
- Google Calendar read and write integration
- export and backup
- health integration scaffolding polish

Phase 3 is not the stage for:

- another major analytics expansion
- a routine-template editor
- multi-user collaboration
- AI-generated planning or agentic coaching
- a backend replacement with Spring Boot

Those either remain future work or are already covered by earlier phases.

## Phase 3 Outcome

By the end of Phase 3, Forge should be a durable, integration-capable execution system rather than only a strong local-first product.

That means:

- critical notifications are real, conditional, and limited
- sync behavior is more conflict-aware, more observable, and more trustworthy across reconnects and multiple surfaces
- Calendar integration can read external pressure and mirror major Forge blocks without destabilizing the routine model
- users can export, restore, and rely on scheduled backup behavior
- health integration remains scaffolded honestly, with stronger data boundaries and settings seams but without fake provider depth

## Product Intent to Preserve

Phase 3 must preserve these product truths from [PRS.md](../PRS.md):

- Forge is still an execution OS first, not a notification app or calendar wrapper
- notifications must feel operational and conditional, never spammy or chatty
- Calendar should influence decisions, not replace the fixed routine model
- export and backup are safety and durability features, not analytics gimmicks
- health integration should stay honest about what is and is not connected

## In Scope

- notification rule contracts and delivery-channel architecture
- browser and PWA notification permission flow, scheduling, and suppression rules
- sync queue hardening, replay diagnostics, conflict semantics, and cross-device consistency improvements
- durable export and restore flows
- scheduled and automatic backup generation
- backup metadata, retention strategy, and restore validation
- Google Calendar read integration and collision modeling
- Google Calendar write and mirror behavior for major Forge blocks
- Calendar metadata persistence and sync observability
- health integration settings and typed scaffolding polish
- Firebase Functions jobs for notification orchestration, backup generation, and Calendar sync support
- documentation, testing, and operational runbooks for these integration layers

## Explicitly Out of Scope

- native mobile push notification delivery as a production-complete feature
- wearable-device ingestion or direct Apple Health / Fitbit / Google Fit sync
- full two-way routine editing driven from Calendar
- enterprise-grade backup administration
- multi-tenant orchestration or dedicated backend extraction to a separate platform

## Success Criteria

Phase 3 is complete only if all of the following are true:

- notification delivery exists as a real user-facing feature with permission handling, caps, and suppression logic
- sync status and replay behavior are more truthful than the Phase 1 and 2 baseline, especially around stale queues and multi-surface writes
- the app can read Calendar events and translate them into schedule pressure or collision context
- the app can write and maintain mirrored major Forge blocks into Google Calendar using stable metadata conventions
- export works reliably and restore behavior is documented and validated
- scheduled or automatic backup behavior exists and is observable
- health integration seams are clearer and more honest without overstating provider support
- the system remains serious and controlled rather than turning into a generic reminder tool

## Recommended Build Strategy

## 1. Delivery and Sync Before Calendar

Recommendation:

- do not start Phase 3 by wiring Google Calendar first
- strengthen notification rules, sync semantics, and backup safety before adding bidirectional external state

Why:

- Calendar introduces another source of drift, duplication, and conflict
- if replay and restore semantics are weak, Calendar integration multiplies failure modes
- notification credibility depends on sync truthfulness and good state freshness

## 2. Firebase and Functions, Not a New Backend

Recommendation:

- keep Firebase Authentication, Firestore, Hosting, and Functions as the backend posture for Phase 3

Why:

- the current app is already structured around Firebase and local-first repositories
- Functions are appropriate for scheduled notifications, backup generation, reconciliation helpers, and Calendar sync jobs
- adding a separate backend now would create platform churn without solving the core product problem

Use Functions for:

- scheduled notification eligibility evaluation
- backup generation and retention jobs
- Calendar reconciliation and mirror cleanup where server-side reliability matters
- periodic sync health checks and stale-state remediation

Keep in client:

- permission flows
- immediate notification preview and suppression UI
- local-first queueing and optimistic operational flows
- lightweight Calendar collision display and schedule-pressure presentation

## 3. Browser and PWA Notifications First

Recommendation:

- Phase 3 should deliver browser and installed-PWA notifications as the real supported channel
- native mobile push should remain scaffolded and documented as future work

Why:

- Forge is currently a React plus Vite plus PWA product, not a native mobile shell
- browser notifications are aligned with the current architecture and can still serve Android-installed PWA usage well
- pretending to fully support native mobile push now would create operational promises the product cannot honestly keep

## 4. Backup as Product Safety, Not Just Export

Recommendation:

- treat scheduled backup generation and restore validation as a core milestone, not an optional enhancement

Why:

- by Phase 3, Forge holds enough execution history and analytics context that data durability matters materially
- export-only flows protect user agency, but backup behavior protects continuity and trust
- scheduled backup also creates a clean foundation for future migrations and disaster recovery

## Architecture Principles

## 1. External Systems Are Inputs and Mirrors, Not Sources of Truth

Forge remains the system of record for routine intent and execution state.

This means:

- Calendar events can influence pressure and collision handling
- mirrored Forge events in Calendar should be derived from Forge state
- Calendar should not silently rewrite the routine model

## 2. Sync Semantics Must Be Explicit

Phase 3 should make sync behavior more understandable, not merely more complex.

This means:

- distinguish local, queued, syncing, stale, conflicted, and failed states explicitly
- document merge and replacement rules per entity family
- expose enough state that notification and Calendar flows can avoid acting on stale assumptions

## 3. Notifications Must Be Explainable

Every notification should be traceable to a documented rule.

This means:

- each notification should carry a rule key, suppression reason when skipped, and eligibility window
- user-facing copy should feel operational, not motivational-fluff heavy
- daily caps and quieting behavior must be enforced centrally

## 4. Backup and Restore Must Be Reproducible

Export and restore should be deterministic and versioned.

This means:

- exported payloads need schema versioning and metadata
- restore logic should validate and report partial failures honestly
- automatic backups should be inspectable rather than invisible magic

## 5. Honest Scaffolding Over Fake Integration

Health and future mobile-push seams should be typed and documented without pretending they are live.

This means:

- build provider contracts, settings surfaces, and state placeholders only where they clarify future architecture
- avoid dead buttons or fake connected states

## Proposed High-Level Architecture

## Application Layers

### Presentation Layer

- notification settings and permission UX
- backup and restore controls
- Calendar integration settings and collision views
- sync-health surfaces and conflict/status messaging
- health integration settings and provider placeholders

### Application Layer

- notification eligibility orchestration
- backup scheduling and restore flows
- Calendar sync workspace loaders
- conflict resolution and replay coordination
- integration-status and diagnostics aggregation

### Domain Layer

- notification rule engine
- sync conflict semantics
- backup snapshot schema and retention policy
- Calendar mirror conventions and collision model
- health provider contracts and normalization scaffolding

### Data Layer

- repositories for notifications, backups, sync diagnostics, and Calendar metadata
- Firestore persistence for integration state and mirror metadata
- local caches for pending notifications, sync health, and restore staging
- export serializers and restore validators

### Integration Layer

- Firebase Functions for scheduled jobs and reconciliation
- browser Notification API and service-worker integration
- Google Calendar API and OAuth scopes
- backup job scheduling and retention enforcement

## Proposed Folder Expansion

```text
src/
  features/
    notifications/
      components/
      hooks/
      pages/
    backups/
      components/
      hooks/
      pages/
    integrations/
      components/
      hooks/
      pages/
  domain/
    notifications/
      rules.ts
      types.ts
    sync/
      conflicts.ts
      diagnostics.ts
      types.ts
    backup/
      serialization.ts
      restore.ts
      retention.ts
      types.ts
    calendar/
      mirrors.ts
      collisions.ts
      sync.ts
    health/
      providers.ts
      normalization.ts
      types.ts
  data/
    firebase/
      firestoreNotificationRepository.ts
      firestoreBackupRepository.ts
      firestoreCalendarRepository.ts
    local/
      localNotificationRepository.ts
      localBackupRepository.ts
      localSyncDiagnosticsRepository.ts
  services/
    notifications/
      notificationEligibilityService.ts
      notificationDeliveryService.ts
    sync/
      syncHealthService.ts
      syncConflictService.ts
    backup/
      backupService.ts
      restoreService.ts
    calendar/
      calendarSyncWorkspaceService.ts
      calendarMirrorService.ts
    health/
      healthIntegrationService.ts
functions/
  src/
    notifications/
      evaluateEligibility.ts
      scheduleDigests.ts
    backups/
      generateBackupSnapshot.ts
      enforceRetention.ts
    calendar/
      reconcileMirrors.ts
      refreshExternalEvents.ts
    sync/
      repairMetadata.ts
```

## Phase 3 Data Model Direction

Phase 3 should add integration and durability documents intentionally instead of leaking everything into `settings/default`.

## Primary Source Records Already Available

- `users/{uid}`
- `users/{uid}/settings/default`
- `users/{uid}/dayInstances/{dayId}`
- `users/{uid}/analyticsSnapshots/*`
- `users/{uid}/projections/default`
- `users/{uid}/missions/*`
- `users/{uid}/streaks/default`

## New Derived Collections and Documents

Recommended additions:

- `users/{uid}/notificationState/default`
- `users/{uid}/notificationLog/{notificationId}`
- `users/{uid}/syncMetadata/default`
- `users/{uid}/syncConflicts/{conflictId}`
- `users/{uid}/backups/{backupId}`
- `users/{uid}/restoreJobs/{restoreId}`
- `users/{uid}/calendarState/default`
- `users/{uid}/calendarMirrors/{mirrorId}`
- `users/{uid}/externalEvents/{eventId}` or a bounded rolling cache depending on cost
- `users/{uid}/healthIntegration/default`

## Key Data Categories

Each Phase 3 derivation and integration path should aim to persist stable records such as:

- notification eligibility evaluations and suppression reasons
- last-delivered notification categories and daily-cap counters
- queue health summaries, stale-replay counts, and conflict metadata
- export payload metadata, backup generation timestamps, and retention markers
- mirrored Calendar block ids, source block references, and reconciliation timestamps
- external-event collision summaries and schedule-pressure annotations
- provider connection status and health-data readiness flags

## Versioning and Auditability

Every export payload, backup snapshot, restore job, and Calendar mirror record should include:

- `schemaVersion`
- `generatedAt` or `syncedAt`
- `sourceRange` where relevant
- `sourceRecordVersion` or equivalent metadata where drift matters
- `status`

Why:

- Phase 3 introduces multiple durable and externally visible records
- backups and mirrors become untrustworthy quickly if version drift is not explicit
- restore and reconciliation flows need inspectable metadata

## Security and Hardening Direction

Phase 3 should deepen the deployable Firebase posture rather than bypass it.

Recommended hardening targets:

- tighter Firestore rules for new integration and durability collections
- Function-level environment and secret handling for Calendar credentials and notification config
- App Check coverage review for new browser-facing flows
- monitoring for missed backup jobs, failed notification runs, stale Calendar mirrors, and replay conflicts
- rate-limited and user-scoped Calendar operations
- documented retention and cleanup behavior for backups, logs, and external-event caches

## Milestones

## Milestone 0: Phase 3 Foundation and Contracts

### Goal

Define the notification, sync-hardening, backup, Calendar, and health scaffolding contracts before building new flows.

### Deliverables

- notification domain contracts
- sync diagnostics and conflict contracts
- backup and restore schemas
- Calendar mirror and collision contracts
- health integration scaffolding contracts

### Checklist

- [x] Define notification categories, rule keys, suppression reasons, delivery caps, and quieting semantics.
- [x] Define sync-health, stale-state, replay, and conflict metadata contracts.
- [x] Define export payload, backup snapshot, and restore job document shapes.
- [x] Define Calendar mirror records, external-event cache records, and collision summary contracts.
- [x] Define health integration status and provider scaffolding types.
- [x] Add schema notes and indexing considerations for all new collections.

### Testing and Documentation

- [x] Add fixture strategy notes for notifications, conflicts, backups, and Calendar scenarios.
- [x] Document schema and orchestration contracts in architecture docs.

### Exit Criteria

- Phase 3 semantics are clear enough that implementation can proceed without inventing integration meaning ad hoc

## Milestone 1: Sync Hardening and Diagnostics Foundation

### Goal

Strengthen the local-first and replay model before external integrations begin writing more state.

### Deliverables

- sync-health service
- richer queue-state semantics
- conflict metadata model
- replay diagnostics surfaces

### Checklist

- [x] Expand sync-state modeling to distinguish queued, syncing, stale, failed, conflicted, and repaired states.
- [x] Add durable sync metadata records for last-success, last-failure, replay backlog, and stale-age tracking.
- [x] Introduce explicit conflict policies for singleton settings, day instances, backup state, and integration metadata.
- [x] Improve shell and settings visibility for sync-health and repairable failures.
- [x] Add monitoring hooks for replay failure storms and stale local-first state.

### Testing and Documentation

- [x] Add unit and integration tests for sync-state transitions and conflict semantics.
- [x] Document conflict-resolution rules and replay expectations.

### Exit Criteria

- sync health is more trustworthy and explainable before notifications or Calendar rely on it

## Milestone 2: Notification Rules, Permissions, and Delivery Foundation

### Goal

Create the serious, limited notification system defined by the PRS without drifting into spam or generic reminders.

### Deliverables

- notification rule engine
- permission flow
- delivery service
- suppression and daily-cap enforcement

### Checklist

- [x] Implement notification categories for missed critical block, fallback suggestion, and weekly summary.
- [x] Enforce documented delivery caps and conditional-only behavior from one shared rule engine.
- [x] Add browser and PWA permission handling with honest unsupported-state UX.
- [x] Implement notification delivery through the browser Notification API and service-worker-compatible flows where needed.
- [x] Add notification state persistence for last delivery, suppression reasons, and daily counters.
- [x] Add settings controls for enabling, muting, and understanding notification behavior without creating clutter.

### Testing and Documentation

- [x] Add rule tests covering caps, suppression, quieting, and eligibility windows.
- [x] Document notification categories, copy tone, and delivery-channel limits honestly.

### Exit Criteria

- Forge can deliver credible, limited notifications without violating the product tone

## Milestone 3: Scheduled Notification Orchestration and Weekly Summary Jobs

### Goal

Move notification eligibility and recurring summary generation into reliable scheduled infrastructure where needed.

### Deliverables

- Functions-based notification evaluation jobs
- weekly summary generation path
- scheduling metadata
- observability for skipped and delivered runs

### Checklist

- [x] Add Functions job structure for evaluating notification eligibility on a schedule.
- [x] Implement weekly summary notification generation using persisted execution and analytics context.
- [x] Persist notification-run metadata including rule version, evaluated window, and skip reason.
- [x] Add idempotency protections so the same notification is not delivered repeatedly by retries.
- [x] Add monitoring for failed scheduled runs and delivery drift.

### Testing and Documentation

- [x] Add tests for scheduled eligibility helpers and idempotent run behavior.
- [x] Document scheduled-run cadence, retry expectations, and failure handling.
- [x] Verify the `functions/` workspace locally with dedicated typecheck, lint, and build steps after introducing scheduled notification orchestration.

### Exit Criteria

- the most important notifications do not depend purely on an active browser tab at the right moment

## Milestone 4: Export, Restore, and Automatic Backup Foundation

### Goal

Give users durable control over their data with reliable export and restore semantics.

### Deliverables

- manual export flow
- restore flow
- backup schema and metadata
- validation and error reporting

### Checklist

- [x] Implement versioned JSON export of the core user record, settings, day instances, analytics essentials, and integration metadata.
- [x] Add markdown-friendly note export where execution notes or summaries make that worthwhile.
- [x] Implement restore validation and staging so invalid payloads fail honestly.
- [x] Add restore reporting for partial compatibility or skipped records.
- [x] Persist backup and restore metadata records for traceability.
- [x] Ensure restore neutralizes stale queued local sync writes and refreshes every affected workspace after apply.

### Testing and Documentation

- [x] Add fixture-based tests for export serialization and restore validation.
- [x] Document export contents, restore limits, and schema-version expectations.

### Exit Criteria

- Forge data can be exported and restored predictably rather than remaining trapped in Firestore state

## Milestone 5: Scheduled Backups, Retention, and Recovery Operations

### Goal

Turn backups from a manual escape hatch into a durable safety system.

### Deliverables

- scheduled backup jobs
- retention policy
- backup status surfaces
- recovery runbooks

### Checklist

- [x] Implement scheduled backup generation through Firebase Functions or equivalent Firebase-native orchestration.
- [x] Define and enforce retention policy for automatic backups.
- [x] Surface latest backup health, freshness, and failure status in settings or operations surfaces.
- [x] Add restore-from-backup guidance and operational recovery notes.
- [x] Add monitoring for missed backup jobs, stale backups, and retention cleanup failures.

### Testing and Documentation

- [x] Add tests for backup generation metadata and retention pruning helpers.
- [x] Document scheduled-backup cadence, retention window, and failure handling.

### Exit Criteria

- users have both manual export control and scheduled backup protection
- known backup scale limits and the planned payload-storage migration are documented honestly rather than hidden

## Milestone 6: Cloud Storage Backup Payload Migration and Server Restore Foundations

### Goal

Move scheduled backup payload bodies out of Firestore and establish the retrieval model needed for future user-facing restore from server-side scheduled backups.

### Deliverables

- Cloud Storage payload persistence
- Firestore metadata pointer model
- scheduled-backup payload retrieval service
- future-safe restore selection foundation

### Checklist

- [x] Add Firebase Storage integration for scheduled backup payload bodies while keeping backup metadata in Firestore.
- [x] Replace `backupPayloads/{backupId}` document-body persistence with deterministic Cloud Storage object paths derived from `backupId`.
- [x] Extend backup metadata to store payload location, storage provider, byte size, checksum, and restore eligibility.
- [x] Add retrieval helpers that can fetch scheduled backup payloads by Firestore metadata pointer instead of assuming Firestore document storage.
- [x] Define and implement payload cleanup behavior so retention expiry also removes Cloud Storage payload objects.
- [x] Add restore-foundation contracts for future user-facing server-backup selection and guarded restore eligibility checks.
- [x] Surface honest scheduled-backup storage state in Settings or operations views without pretending server-restore UI is already complete.
- [x] Add monitoring for payload upload failures, payload cleanup failures, and metadata-to-object drift.

### Testing and Documentation

- [x] Add tests for metadata-pointer generation, payload cleanup planning, and restore-eligibility helpers.
- [x] Document Cloud Storage bucket assumptions, object-key conventions, cleanup behavior, and the staged path toward in-app restore from server backups.

### Exit Criteria

- scheduled backups no longer rely on single Firestore documents for full payload bodies
- Forge has a documented and testable foundation for future user-facing restore from server-side scheduled backups

## Milestone 7: Google Calendar Read Integration and Collision Modeling

### Goal

Introduce external calendar awareness without allowing Calendar to replace the Forge routine model.

### Deliverables

- Google Calendar connection flow
- external-event ingestion
- collision model
- schedule-pressure surfaces

### Checklist

- [x] Implement Google Calendar OAuth connection flow and settings state for the existing primary-calendar posture.
- [x] Read external events into a bounded cache or summary model appropriate for collision analysis.
- [x] Implement collision and pressure derivation between external events and major Forge blocks.
- [x] Surface collision risk and tradeoff context in Schedule, Today, and integration settings.
- [x] Persist connection status, sync timestamps, and event-cache metadata honestly.

### Testing and Documentation

- [x] Add tests for collision rules, event normalization, and pressure derivation.
- [x] Document Google scopes, connection assumptions, and external-event limitations.

### Exit Criteria

- Forge can read Calendar pressure safely without surrendering control of routine intent

## Milestone 8: Google Calendar Write and Mirror Management

### Goal

Mirror major Forge blocks into Google Calendar with stable metadata and reconciliation behavior.

### Deliverables

- mirror write service
- mirror reconciliation rules
- metadata conventions
- cleanup behavior

### Checklist

- [x] Implement write flows for major mirrored Forge blocks only, using the `[FORGE] <block title>` convention.
- [x] Add color and description metadata conventions for mirrored events.
- [x] Persist Calendar mirror mappings between Forge blocks and external event ids.
- [x] Implement reconciliation rules for changed, moved, skipped, or deleted mirrored blocks.
- [x] Add cleanup behavior for stale or orphaned mirror records.
- [x] Add visibility into last Calendar sync status and mirror errors.

### Testing and Documentation

- [x] Add tests for mirror creation, update, delete, and reconciliation helpers.
- [x] Document mirror conventions, allowed block classes, and known edge cases.

### Exit Criteria

- mirrored major blocks behave predictably and do not create silent Calendar drift

## Milestone 9: Health Integration Scaffolding Polish

### Goal

Polish the future-facing health seams so the product stays honest and ready for later integrations.

### Deliverables

- health integration settings
- provider placeholders
- typed normalization seams
- honest unsupported-state UX

### Checklist

- [x] Refine health integration settings and status surfaces so they distinguish disconnected, unsupported, and future-provider states.
- [x] Define provider contracts and normalized health-signal types for future sleep, recovery, or activity imports.
- [x] Add placeholder sync metadata and diagnostics without implying live provider support.
- [x] Ensure Readiness and Physical surfaces can reference future provider state honestly without fake connected data.

### Testing and Documentation

- [x] Add tests for provider-state interpretation and unsupported-state UX contracts.
- [x] Document what is scaffolded versus actually integrated.

### Implementation Notes

- Expanded `src/domain/health/types.ts` with richer `HealthProviderStatus` enum (planned/notConnected/unsupported/connected/error),
  `HealthProviderUnavailableReason` enum, individual normalized signal contracts (`NormalizedSleepSignal`, `NormalizedRecoverySignal`,
  `NormalizedActivitySignal`), and a `HealthIntegrationSettingsWorkspace` type for UI consumption.
- Added `src/domain/health/providers.ts` — pure domain functions for interpreting provider state into honest display labels
  (`getProviderStatusLabel`, `getUnavailableReasonLabel`, `isSignalAvailable`, `deriveHealthConnectionSummaryLabel`,
  `deriveHealthPhaseNotice`).
- Added `src/domain/health/normalization.ts` — typed normalization seam functions (`normalizeSleepSignal`,
  `normalizeSleepConsistencySignal`, `normalizeRecoverySignal`, `normalizeStepsSignal`, `normalizeHeartRateSignal`,
  `validateNormalizedSignal`). Sleep duration and sleep consistency are now modeled as separate normalized signals,
  which keeps the contract honest for future adapters and prevents one helper from pretending to emit two distinct
  signal types at once.
- Added `src/data/local/localHealthIntegrationRepository.ts` and a new `healthIntegration` store in
  `src/data/local/forgeDb.ts`, so Milestone 9 health state is persisted locally instead of being rebuilt from defaults
  on every call. This matters because future providers, restore flows, and settings workspaces now share one seam.
- Updated `src/services/health/healthIntegrationService.ts` so it reads and writes through the repository seam and
  derives `connectionSummary` from provider state instead of passing through a static snapshot field. The service is
  now async for the right reason: it already respects persistence boundaries, so moving to Firestore later will not
  require the UI contract to change.
- Updated `src/services/settings/settingsWorkspaceService.ts` to include `healthIntegration` workspace.
- Updated `src/services/physical/physicalPersistenceService.ts` and
  `src/services/readiness/readinessPersistenceService.ts` so Physical and Readiness read health state through their
  normal workspace flow rather than freezing a module-level snapshot.
- Updated `src/features/settings/pages/SettingsPage.tsx` to show a Health Integration card with honest provider state
  (all planned, none connectable, no fake buttons).
- Updated `src/features/physical/pages/PhysicalPage.tsx` with a Health Provider Integration card explaining what will be
  automated in future phases.
- Updated `src/features/readiness/pages/ReadinessPage.tsx` with a Recovery Signal Scaffolding card explaining what will
  be factored into readiness scoring when providers connect.
- Updated backup flows in `src/services/backup/backupService.ts`, `src/services/backup/backupSerialization.ts`, and
  `src/services/backup/restoreService.ts` so health integration state is exported and restored alongside the other
  Phase 3 integration seams instead of being silently dropped.
- Added and expanded `src/tests/domain/health-integration.spec.ts` so it now covers persisted health state,
  derived connection summaries, and the corrected sleep-duration vs sleep-consistency normalization contract.
- Verification: typecheck, lint, `npm run test:run` (53 files, 190 tests — all passing), build all green.

### Exit Criteria

- future health-provider work has clear seams and honest current-state presentation
- ✅ achieved: all seams are typed, all surfaces are honest, no fake connectivity exists

## Milestone 10: Phase 3 QA, Security, and Release Hardening

### Goal

Close Phase 3 with an operationally credible release posture across notifications, sync, backup, and Calendar.

### Deliverables

- end-to-end quality pass
- release-readiness checklist
- security and operational docs
- known-limits summary

### Checklist

- [ ] Run a full quality pass across notification delivery, sync-health visibility, backup generation, restore validation, and Calendar integration.
- [ ] Review security posture for new rules, Functions configuration, OAuth scopes, and secret handling.
- [ ] Confirm App Check and monitoring coverage are honest for the new browser-facing and Functions-based flows.
- [ ] Finalize architecture and operations documentation for notifications, backup, and Calendar sync.
- [ ] Add known limitations for browser-only notifications, backup guarantees, and Calendar assumptions honestly.
- [ ] Confirm no future-phase scope leaked into Phase 3 implementation.

### Testing and Documentation

- [ ] Run and verify the full test suite including Phase 3 logic.
- [ ] Add a Phase 3 release-readiness checklist or expand the existing one.

### Exit Criteria

- the product can support real external integration and durability without hiding operational risk

## Phase 3 Progress Tracker

- [x] Milestone 0 complete
- [x] Milestone 1 complete
- [x] Milestone 2 complete
- [x] Milestone 3 complete
- [x] Milestone 4 complete
- [x] Milestone 5 complete
- [x] Milestone 6 complete
- [x] Milestone 7 complete
- [x] Milestone 8 complete
- [x] Milestone 9 complete
- [ ] Milestone 10 complete

## Recommended Immediate Execution Order

If implementation starts now, the recommended order is:

1. Milestone 0
2. Milestone 1
3. Milestone 2
4. Milestone 3
5. Milestone 4
6. Milestone 5
7. Milestone 6
8. Milestone 7
9. Milestone 8
10. Milestone 9
11. Milestone 10

That order deliberately puts sync truthfulness, notification credibility, and data safety ahead of Calendar depth.

## Open Design Assumptions

These assumptions are locked into this plan unless product direction changes later:

- browser and installed-PWA notifications are the real supported delivery mechanism in Phase 3
- native mobile push remains future work until Forge gains a native mobile shell or dedicated mobile delivery stack
- Firebase plus Functions remains the right orchestration posture for this phase
- Calendar remains a bounded integration focused on major blocks and schedule pressure, not total routine ownership
- backup and restore are versioned product behaviors rather than hidden admin tasks

## Completion Standard

Phase 3 should only be considered complete when Forge can:

- notify with discipline
- sync with more truth
- survive data loss better
- coordinate with Calendar without surrendering control
- and present future health integration honestly

Anything less is useful progress, but not a signed-off Phase 3.
