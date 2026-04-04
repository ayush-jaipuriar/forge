# Phase 4 Spec and Implementation Plan

## Purpose

Phase 4 turns Forge from a strong multi-phase product build into a launch-ready platform.

Phases 1 through 3 established:

- the execution engine
- the analytics and Command Center layer
- notifications, backup durability, Calendar integration, and health scaffolding

Phase 4 is not another feature-expansion phase in the same style.

It is the point where Forge must become:

- operationally launch-ready
- natively installable beyond the browser shell
- more explicit about platform boundaries and ownership
- safer to evolve without the current client-heavy Firebase posture becoming a long-term drag

This plan is intentionally architecture-first, because launch pressure often creates the temptation to bolt on ad hoc fixes. The goal of Phase 4 is to remove that temptation by making deployment, runtime behavior, and future expansion more disciplined.

## Phase 4 Product Definition

Phase 4 covers three priorities in this order:

1. production launch hardening
2. native mobile shell work
3. backend and platform extraction

That ordering is deliberate.

Why:

- Launch hardening should come first because there is no value in adding a native shell on top of unclear production operations.
- Native shell work should come before deeper backend extraction because it is the fastest path to unlocking real mobile capabilities while preserving the existing product.
- Backend and platform extraction should happen after the launch and shell boundaries are clear, so the backend is shaped by real integration needs rather than by abstract architectural ambition.

## Locked Assumptions

These assumptions are fixed for the Phase 4 plan unless product direction changes later:

- Phases 1 through 3 are feature-frozen except for bugs, hardening, and integration-safe fixes.
- Firebase plus Firebase Functions remains the core platform in Phase 4.
- The native mobile strategy should minimize rewrite risk and preserve the existing React + Vite application logic wherever possible.
- A dedicated backend extraction should be incremental, service-oriented, and justified by concrete operational or integration needs.
- Browser and PWA support remain first-class even after native shell work begins.

## Architectural Recommendation

### Native Shell Recommendation

Recommended Phase 4 native-shell posture:

- use Capacitor as the first native shell layer around the existing Vite application

Why this is the recommended path:

- Forge already has a mature web/PWA product with strong local-first behavior
- Capacitor lets us keep the current React application and design system intact
- it creates a path to native permissions, native packaging, native notification capabilities, and future health-provider bridges without forcing an immediate React Native rewrite
- it keeps Phase 4 focused on launch and capability unlocks instead of app re-platforming

What this recommendation is not:

- it is not a claim that Capacitor is the forever-mobile architecture
- it is not a rejection of a future dedicated native client

It is a Phase 4 decision optimized for:

- fastest credible native shell
- highest code reuse
- lowest platform rewrite risk

### Backend Extraction Recommendation

Recommended backend/platform posture for Phase 4:

- stay on Firebase + Firebase Functions
- formalize a platform-service layer inside the repo
- move the highest-risk orchestration work toward server ownership where appropriate

Why:

- Phase 3 already introduced scheduled notifications and scheduled backups through Functions
- the next platform step is not a brand-new backend stack
- the right move is to formalize server-owned responsibilities such as:
  - scheduled orchestration
  - remote backup retrieval
  - integration token handling prep
  - delivery/admin diagnostics

What should remain deferred:

- full Spring Boot extraction
- broad microservice decomposition
- multi-service operational complexity without concrete need

## Phase 4 Scope

### In Scope

- production launch hardening
- runtime and deployment safety
- release and environment discipline
- observability and operational diagnostics improvements
- native mobile shell foundation with real local builds
- native permission, packaging, and shell-level integration readiness
- platform-service extraction inside Firebase Functions where it materially reduces risk
- more explicit remote restore and integration operations surfaces where already justified by existing Phase 3 groundwork

### Out of Scope

- major new analytics surfaces
- large new recommendation or AI systems
- full health-provider ingestion
- full server-managed Google Calendar token lifecycle if it requires a deeper auth redesign than Phase 4 can safely absorb
- complete React Native rewrite
- broad multi-user SaaS transformation

## Success Criteria

Phase 4 should be considered complete when Forge can honestly claim:

- production launch posture is documented, tested, and supportable
- the app has a real native mobile shell strategy implemented locally
- the most important platform-sensitive paths are no longer over-owned by browser-only code
- operations, limits, and recovery paths are visible enough that launch does not depend on tribal knowledge

## Guiding Principles

### 1. Launch Honesty Over Cosmetic Completeness

Do not hide platform gaps behind polished UI.

If a native feature is scaffolded but not actually supported, the product should say that clearly.

### 2. Extraction Only Where Ownership Is Wrong

Backend extraction should happen when the current owner is wrong, not just because “backend sounds cleaner.”

Examples of correct extraction candidates:

- scheduled orchestration
- remote restore/recovery operations
- privileged integration coordination
- release and audit diagnostics

Examples of work that should stay in the client:

- local-first interaction shaping
- screen composition
- fast operational state transitions
- explainable local recommendation context

### 3. One Product, Multiple Shells

Forge should continue to act like one product with multiple delivery surfaces:

- browser
- installed PWA
- native mobile shell

That means shared domain rules should remain shared wherever possible.

### 4. Local Build Priority

Native work should prefer local iteration and local device/emulator builds over cloud-only workflows.

This is already consistent with the repo rules and should remain a hard constraint in Phase 4.

## Major Workstreams

### A. Launch Hardening

Focus:

- release gates
- production configuration safety
- monitoring and diagnostics
- deploy confidence
- recovery and support documentation

### B. Native Shell Enablement

Focus:

- shell packaging
- local Android and later iOS readiness
- shell permission boundaries
- native bridge planning for future notifications and health integrations

### C. Platform Extraction

Focus:

- moving the right responsibilities to server-owned orchestration
- clarifying remote versus local truth
- reducing browser-only ownership where it creates risk

## Milestone Sequence

## Milestone 0: Phase 4 Baseline and Readiness Audit

### Goal

Start Phase 4 with an explicit launch baseline rather than assuming the end of Phase 3 already equals release readiness.

### Deliverables

- a launch-readiness baseline audit
- a native-shell architecture decision record
- a platform-ownership map

### Checklist

- [ ] Audit the current production posture across Hosting, Functions, Storage, Auth, Firestore rules, and App Check.
- [ ] Record which responsibilities are currently owned by browser code, PWA runtime, and Functions.
- [ ] Confirm the chosen native-shell direction and document why it is preferred over a rewrite.
- [ ] Freeze the Phase 1 through Phase 3 feature surfaces and identify only bug-fix-safe areas.
- [ ] Define the Phase 4 deployment and validation matrix:
  - browser desktop
  - browser mobile
  - installed PWA
  - Android native shell
  - Functions/server workflows

### Testing and Documentation

- [x] Create a Phase 4 baseline audit section in the architecture docs.
- [x] Document native-shell rationale and phased boundaries.

### Implementation Notes

- Added [docs/phase-4-launch-baseline-audit.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/phase-4-launch-baseline-audit.md)
  as the Milestone 0 baseline artifact. It records:
  - what Forge can honestly ship today
  - what is still not launch-ready
  - current production posture across Hosting, Functions, Storage, Auth, Firestore rules, and App Check
  - the browser/PWA/Functions/shared-domain ownership map
  - the native-shell decision record for Capacitor
  - the Phase 4 validation matrix
- Updated [docs/architecture-overview.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/architecture-overview.md)
  to include the new Phase 4 baseline assumptions and why the current client/PWA/Functions ownership split is good enough to launch from, but not yet strong enough to stop there.
- Linked the baseline from [README.md](/Users/ayushjaipuriar/Documents/GitHub/forge/README.md) and
  updated [docs/future-extension-notes.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/future-extension-notes.md)
  so the repo’s roadmap stays consistent.
- Phase 4 now begins from an explicit launch posture instead of from inferred memory carried forward from Phase 3.

### Exit Criteria

- the team knows exactly what is launch-ready, what is scaffolded, and what Phase 4 must change before launch
- ✅ achieved: launch posture, native-shell direction, and platform ownership map are now documented explicitly

## Milestone 1: Production Configuration and Secrets Hardening

### Goal

Make production configuration explicit, safe, and deployable without relying on local memory.

### Deliverables

- stricter environment documentation
- deployment configuration audit
- secrets and configuration checklist

### Checklist

- [x] Audit all Firebase, Functions, Storage, and Google integration configuration inputs.
- [x] Separate local-only, deploy-time, and runtime-managed configuration expectations clearly.
- [x] Tighten environment and secret handling docs for web, Functions, and future native shell builds.
- [x] Confirm `.gitignore` and pre-commit guidance still cover all new Phase 3 and upcoming Phase 4 artifacts.
- [x] Add placeholder-only examples for any new platform configs.
- [x] Review OAuth callback/origin requirements for browser, PWA, and native shell directions.

### Testing and Documentation

- [x] Update deployment and Firebase setup docs with production-safe configuration expectations.
- [x] Add a Phase 4 configuration safety checklist.

### Implementation Notes

- Added root-level Functions verification scripts in [package.json](/Users/ayushjaipuriar/Documents/GitHub/forge/package.json):
  `functions:lint`, `functions:typecheck`, and `functions:verify`. This makes the launch verification path repeatable from
  the repo root instead of depending on manual workspace navigation.
- Added [functions/.env.example](/Users/ayushjaipuriar/Documents/GitHub/forge/functions/.env.example) as a placeholder-only
  reminder that deployed Functions should prefer Firebase-managed runtime configuration and that injected values like
  `FIREBASE_CONFIG` should not be mirrored into committed local files.
- Added [docs/phase-4-configuration-safety-checklist.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/phase-4-configuration-safety-checklist.md)
  to separate browser build config, Functions runtime config, Hosting/Storage config, OAuth origin boundaries, and future
  native-shell config into one operator-facing checklist.
- Updated [docs/firebase-setup.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/firebase-setup.md) with an explicit
  Phase 4 configuration boundary section so browser env, Functions runtime config, and future native-shell config are no
  longer described as one blurred setup surface.
- Updated [docs/deployment-guide.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/deployment-guide.md) to use
  `npm run functions:verify` in the deploy flow and to record the current browser/PWA/native-shell auth boundary more
  explicitly.
- Updated [README.md](/Users/ayushjaipuriar/Documents/GitHub/forge/README.md) so the new checklist and Functions
  verification command are visible from the repo entry point.

### Exit Criteria

- production configuration can be reasoned about without guessing and without risking secret leakage
- ✅ achieved: configuration layers, secret-handling posture, and verification commands are now explicit and repeatable

## Milestone 2: Observability, Monitoring, and Operational Diagnostics

### Goal

Strengthen runtime supportability so launch issues can be seen and triaged quickly.

### Deliverables

- expanded monitoring event coverage
- integration-health diagnostics surfaces
- clearer operator-facing failure semantics

### Checklist

- [x] Audit current monitoring coverage for sync, notifications, backups, restore, Calendar, and Functions.
- [x] Add missing monitoring events for the highest-risk Phase 3 runtime paths.
- [x] Create an operator-facing diagnostics summary surface or document where each critical failure can be observed.
- [x] Improve any silent or ambiguous failure copy that still reads as a successful state.
- [x] Define severity and ownership expectations for common operational failures:
  - scheduled notification failure
  - scheduled backup failure
  - backup retention cleanup failure
  - Calendar read/write degradation
  - App Check or auth mismatch

### Testing and Documentation

- [x] Add tests for any new diagnostic or monitoring state transitions.
- [x] Document the observability model and known blind spots.

### Exit Criteria

- the most important launch failures are visible and interpretable without ad hoc debugging
- ✅ achieved: Forge now aggregates launch-critical subsystem health in Settings, emits monitoring events for manual backup and local restore paths, and documents its observability blind spots explicitly

### Implementation Notes

- Added [src/services/monitoring/operationalDiagnosticsService.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/monitoring/operationalDiagnosticsService.ts) to compress sync, backup, notification, Calendar, and restore posture into one operator-facing workspace.
- Wired the diagnostics workspace into [src/services/settings/settingsWorkspaceService.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/settings/settingsWorkspaceService.ts) and surfaced it in [src/features/settings/pages/SettingsPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/settings/pages/SettingsPage.tsx) as a dedicated launch-support card with severity, ownership, timestamps, and blind-spot notes.
- Added missing monitoring coverage for manual backup and local restore paths in [src/services/backup/backupService.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/backup/backupService.ts) and [src/services/backup/restoreService.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/backup/restoreService.ts).
- Added focused verification in [src/tests/services/operational-diagnostics.spec.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/tests/services/operational-diagnostics.spec.ts), [src/tests/services/backup-export.spec.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/tests/services/backup-export.spec.ts), and [src/tests/services/restore-service.spec.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/tests/services/restore-service.spec.ts).
- Documented the new observability model and blind spots in [docs/phase-4-operational-diagnostics.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/phase-4-operational-diagnostics.md).

## Milestone 3: Release Operations and Launch QA

### Goal

Convert the Phase 3 release posture into a production launch process that can actually be repeated.

### Deliverables

- a launch checklist
- a smoke-test matrix
- deployment and rollback notes

### Checklist

- [x] Build a formal browser/PWA/manual QA matrix for all critical user flows.
- [x] Define launch smoke tests for:
  - auth
  - Today execution
  - Schedule overrides
  - notifications
  - backup export/restore
  - Calendar read
  - Calendar write mirroring
- [x] Define rollback expectations for Hosting and Functions deploys.
- [x] Confirm data-recovery expectations and support steps for common failure modes.
- [x] Review copy and product honesty around all external-integration surfaces.

### Testing and Documentation

- [x] Add a Phase 4 release/launch checklist doc or expand the release docs to include launch operations.
- [x] Update README and deployment docs with launch-focused references.

### Exit Criteria

- launch can be executed and repeated using docs rather than memory
- ✅ achieved: Forge now has a repeatable launch verification command, a launch runbook, a release checklist, and explicit rollback/support notes for the highest-risk flows

### Implementation Notes

- Added `launch:verify` to [package.json](/Users/ayushjaipuriar/Documents/GitHub/forge/package.json) so release verification now runs the root app and Functions workspace as one repeatable operator command instead of a remembered sequence.
- Added [docs/phase-4-launch-operations.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/phase-4-launch-operations.md) with the browser/PWA smoke-test matrix, rollback notes, and first-response support steps for auth, sync, backup, restore, notifications, and Calendar issues.
- Added [docs/phase-4-release-readiness-checklist.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/phase-4-release-readiness-checklist.md) as the operator-facing Phase 4 launch gate.
- Updated [docs/deployment-guide.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/deployment-guide.md) and [README.md](/Users/ayushjaipuriar/Documents/GitHub/forge/README.md) so the launch-focused docs and verification path are discoverable from the repo entry points.

## Milestone 4: Native Shell Foundation with Capacitor

### Goal

Create the first real native mobile shell while reusing the current product.

### Deliverables

- Capacitor integration
- Android shell bootstrap
- native build and run instructions

### Checklist

- [x] Add Capacitor to the project with a repo-managed native-shell setup.
- [x] Create the Android shell project and wire it to the built web assets.
- [x] Verify local Android build and run flow.
- [x] Define how environment configuration should work for native shell builds.
- [x] Confirm shell boot behavior, deep-link or auth callback assumptions, and offline startup behavior.
- [x] Keep the current web/PWA path intact without degrading it.

### Testing and Documentation

- [x] Document the local native-shell build workflow and prerequisites.
- [x] Add shell verification notes for emulator and device runs.

### Exit Criteria

- Forge can be built and run as a native Android shell locally without breaking the existing web product
- ✅ achieved: Forge now has a repo-managed Capacitor shell, a generated Android project, a verified local build/install/launch flow, and explicit native workflow docs

### Implementation Notes

- Added Capacitor dependencies and native scripts in [package.json](/Users/ayushjaipuriar/Documents/GitHub/forge/package.json): `native:doctor`, `native:sync`, `android:sync`, `android:assemble`, `android:install`, `android:open`, and `android:run`.
- Added repo-managed Capacitor config in [capacitor.config.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/capacitor.config.ts) with `dist/` as the native web asset source and an explicit Android shell boundary.
- Generated the Android shell project in [android](/Users/ayushjaipuriar/Documents/GitHub/forge/android), including Gradle wrapper, app module, and Capacitor asset sync wiring.
- Verified the local native path with `npm run native:doctor`, `npm run build`, `./gradlew assembleDebug`, `adb install -r android/app/build/outputs/apk/debug/app-debug.apk`, and emulator launch confirmation for `com.forge.executionos/.MainActivity`.
- Documented prerequisites, environment posture, boot assumptions, and emulator/device notes in [docs/phase-4-native-shell-workflow.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/phase-4-native-shell-workflow.md).

## Milestone 5: Native Capability Boundaries and Mobile Supportability

### Goal

Make the new native shell operationally honest and ready for future native-only integrations.

### Deliverables

- shell-aware capability detection
- mobile-specific UX guardrails
- native support notes

### Checklist

- [x] Add platform-detection seams so Forge can distinguish browser, installed PWA, and native shell contexts.
- [x] Define native permission boundaries for notifications, storage access, and later health-provider integrations.
- [x] Review mobile interaction quality inside the native shell, especially around auth, restore, backup export, and Calendar flows.
- [x] Add native-shell-specific fallback copy where browser-only assumptions no longer apply cleanly.
- [x] Document what Phase 4 native shell supports and what remains deferred.

### Testing and Documentation

- [x] Add tests for platform-detection and capability interpretation helpers.
- [x] Update mobile and deployment docs with shell-specific support boundaries.

### Exit Criteria

- the native shell is not just running; it is explainable, supportable, and honest about its current capabilities

### Implementation Notes

- Added the platform capability seam in [src/domain/platform/types.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/domain/platform/types.ts), [src/domain/platform/capabilities.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/domain/platform/capabilities.ts), and [src/services/platform/platformCapabilitiesService.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/platform/platformCapabilitiesService.ts) so Forge now distinguishes browser tabs, installed PWAs, and the Capacitor shell through one shared interpretation layer instead of scattered UI checks.
- Added [src/features/platform/hooks/usePlatformWorkspace.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/platform/hooks/usePlatformWorkspace.ts) and threaded its output into [src/features/settings/pages/SettingsPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/settings/pages/SettingsPage.tsx) to surface honest runtime-specific guardrails for auth, notifications, backup export, restore import, Calendar, and health-provider integrations.
- Updated [src/features/physical/pages/PhysicalPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/physical/pages/PhysicalPage.tsx) and [src/features/readiness/pages/ReadinessPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/readiness/pages/ReadinessPage.tsx) so health-provider messaging stays explicit even when the native shell exists: shell foundation is real, provider bridges are still deferred.
- Added focused runtime-capability coverage in [src/tests/domain/platform-capabilities.spec.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/tests/domain/platform-capabilities.spec.ts).

## Milestone 6: Remote Restore and Recovery Completion

### Goal

Finish the recovery path that Phase 3 intentionally left as foundation-only.

### Deliverables

- remote scheduled-backup picker
- restore-selection workflow
- stronger remote-recovery documentation

### Checklist

- [x] Build a user-facing picker for eligible scheduled backups.
- [x] Add a restore-selection confirmation flow with strong warnings and schema checks.
- [x] Ensure remote restore clearly distinguishes local-only versus remote-backed state.
- [x] Confirm restore still clears or reconciles unsafe queued writes before apply.
- [x] Review retention-expired and not-restore-ready behavior for clarity.

### Testing and Documentation

- [x] Add tests for remote backup selection and retrieval flows.
- [x] Update backup-and-restore operations docs with end-to-end remote restore behavior.

### Exit Criteria

- Forge has a complete, honest, user-facing scheduled-backup recovery path

### Implementation Notes

- Extended [src/services/backup/restoreService.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/backup/restoreService.ts) so every staged restore now carries explicit source metadata, which lets the UI distinguish local file restores from scheduled server-backed restores without creating a second apply path.
- Added the remote staging seam in [src/services/backup/serverBackupRestoreService.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/backup/serverBackupRestoreService.ts) and [src/features/settings/hooks/useLoadServerRestoreStage.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/settings/hooks/useLoadServerRestoreStage.ts), so selecting a restore-ready scheduled backup now resolves the remote payload, validates the schema, and produces the same `RestoreStage` object used by local files.
- Updated [src/features/settings/pages/SettingsPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/settings/pages/SettingsPage.tsx) with a scheduled-backup picker, restore-ready versus ineligible status messaging, and source-aware staged-restore feedback. The important product boundary is that remote selection only stages a restore; the existing apply button and warning surface remain the final confirmation step.
- Added regression coverage in [src/tests/services/restore-service.spec.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/tests/services/restore-service.spec.ts) and [src/tests/hooks/use-load-server-restore-stage.spec.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/tests/hooks/use-load-server-restore-stage.spec.ts) to protect both local-file and remote-backup staging semantics.

## Milestone 7: Platform Service Extraction Inside Firebase Functions

### Goal

Move the highest-risk orchestration paths toward clearer server ownership without introducing an unnecessary new backend stack.

### Deliverables

- explicit platform-service boundaries
- clearer remote orchestration ownership
- reduced browser-only ownership for privileged flows

### Checklist

- [x] Identify which Phase 3 services should remain client-owned and which should gain server-owned companions.
- [x] Extract or formalize server-owned orchestration for:
  - scheduled backup/recovery metadata
  - scheduled notification operations
  - future integration token/state handling preparation
  - platform diagnostics aggregation where justified
- [x] Define a clear contract between client repositories and Functions-backed operational services.
- [x] Avoid duplicating domain rule logic by keeping shared pure logic in reusable modules where possible.
- [x] Document what still does not justify extraction.

### Testing and Documentation

- [x] Add or expand Functions verification coverage for the extracted orchestration seams.
- [x] Update architecture docs with the new platform-ownership map.

### Exit Criteria

- the system has clearer ownership boundaries and less accidental browser-only operational responsibility

### Implementation Notes

- Added the platform-ownership contract in [src/domain/platform/ownership.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/domain/platform/ownership.ts), which explicitly maps browser-owned, PWA-runtime-owned, and Firebase-Functions-owned responsibilities. The important architectural choice is that this file documents ownership truth, not deployment wishes: only scheduled backups, scheduled notifications, and analytics snapshot regeneration are treated as active Functions-backed operations today.
- Added [src/services/platform/platformOwnershipService.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/platform/platformOwnershipService.ts) and [src/services/platform/platformFunctionService.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/platform/platformFunctionService.ts) so the app can both describe and invoke the current server-owned companion operations through a shared seam instead of scattering callable names around Settings.
- Expanded [src/lib/firebase/client.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/lib/firebase/client.ts) with a region-bound Firebase Functions client helper, then added [src/features/settings/hooks/useInvokePlatformOperation.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/settings/hooks/useInvokePlatformOperation.ts) to handle mutation wiring and targeted query invalidation for backup, notification, and analytics regeneration operations.
- Updated [src/services/settings/settingsWorkspaceService.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/settings/settingsWorkspaceService.ts) and [src/features/settings/pages/SettingsPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/settings/pages/SettingsPage.tsx) so Settings now surfaces a real ownership map with manual Functions-backed operator actions. This is intentionally an operator boundary view, not a generic “run random admin jobs” console.
- Added focused coverage in [src/tests/domain/platform-ownership.spec.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/tests/domain/platform-ownership.spec.ts) and [src/tests/services/platform-function-service.spec.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/tests/services/platform-function-service.spec.ts), then verified the full root app plus Functions workflow. The main honesty boundary remains unchanged: long-lived integration token handling and richer cross-runtime diagnostics are documented as planned Functions-owned areas, but not prematurely implemented.

## Milestone 8: Launch Candidate Hardening

### Goal

Prepare a credible launch candidate after the shell and platform shifts are in place.

### Deliverables

- final hardening pass
- known-limits closeout
- launch-candidate verification report

### Checklist

- [ ] Re-run the full quality matrix across web, PWA, Android shell, and Functions.
- [ ] Review all user-facing integration copy for honesty after Phase 4 changes.
- [ ] Confirm documentation consistency across README, deployment, Firebase setup, operations docs, and future notes.
- [ ] Confirm no Phase 5 or future-scope work leaked into the launch candidate.
- [ ] Produce a short launch-candidate summary with known accepted limits.

### Testing and Documentation

- [ ] Add a Phase 4 release-readiness checklist.
- [ ] Record the final accepted limitations and deferred items explicitly.

### Exit Criteria

- Forge has a documented launch candidate across browser, PWA, native shell, and server workflows

## Phase 4 Progress Tracker

- [x] Milestone 0 complete
- [x] Milestone 1 complete
- [x] Milestone 2 complete
- [x] Milestone 3 complete
- [x] Milestone 4 complete
- [x] Milestone 5 complete
- [x] Milestone 6 complete
- [x] Milestone 7 complete
- [ ] Milestone 8 complete

## Recommended Immediate Execution Order

1. Milestone 0
2. Milestone 1
3. Milestone 2
4. Milestone 3
5. Milestone 4
6. Milestone 5
7. Milestone 6
8. Milestone 7
9. Milestone 8

That order deliberately hardens the shipped web system before adding the native shell, and it delays deeper platform extraction until we understand what the launch-ready product actually needs from the server side.

## Open Design Assumptions

- Capacitor is the correct Phase 4 native-shell strategy because it unlocks native packaging and permissions while preserving the existing React/Vite product.
- Firebase plus Firebase Functions remains the correct platform posture through Phase 4.
- Full dedicated-backend extraction remains a future decision that should be driven by real operational constraints, not by aesthetic preference.
- Remote restore should become fully user-facing in Phase 4 because the Phase 3 foundation is already present and launch credibility improves materially once recovery is complete.
- Health-provider live ingestion, native push, and long-lived server-managed Calendar OAuth remain beyond the minimum acceptable Phase 4 launch scope unless later discovery changes the priority.

## Completion Standard

Phase 4 should only be considered complete when Forge can:

- launch with operational clarity
- ship as a real native shell without a product rewrite
- recover more credibly from user-facing data failure cases
- and support future backend deepening from a stronger platform boundary

Anything less may still be useful progress, but it would not be a signed-off Phase 4.
