# Forge Senior Engineering Study Guide

## Purpose

This guide is a repo-specific, senior-level study companion for Forge.

It is based on the implemented work across:

- Phase 1: core execution system
- Phase 2: analytics, Command Center, projections, insights, gamification
- Phase 3: integrations, notifications, backup and restore, Calendar, sync diagnostics
- Phase 4: launch hardening, native shell foundation, platform ownership, recovery completion
- UI modernization Sprints 1 to 7
- auth hardening follow-up work

This is not a generic React or Firebase tutorial.

The goal is to help you understand:

- what we built
- why each architectural decision exists
- what tradeoffs we accepted
- which concepts matter at a senior-engineer level
- where those concepts live in this repo

## How To Use This Guide

Study this document in three passes:

1. Read Sections 1 to 5 to understand the product, architecture, and cross-cutting engineering principles.
2. Read the phase sections in order to see how the system evolved and why responsibilities were added when they were.
3. Use the final sections as a revision checklist, interview-prep prompt bank, and code-reading map.

Best companion docs while reading this guide:

- `README.md`
- `PRS.md`
- `docs/architecture-overview.md`
- Section 19 in this same document for the interview Q&A companion
- `docs/phase-1-spec-implementation-plan.md`
- `docs/phase-2-spec-implementation-plan.md`
- `docs/phase-3-spec-implementation-plan.md`
- `docs/phase-4-spec-implementation-plan.md`

## 1. Product Thinking Before Code

Forge is not a generic productivity app.
It is an opinionated execution system.

That product decision drives nearly every technical choice:

- the routine is seeded, not free-form
- the UI is allowed to guide behavior instead of being neutral
- the system prefers honest pressure over vanity metrics
- local-first speed matters because daily use must feel immediate
- analytics must be explainable, not magical
- integrations are allowed only when they materially improve execution clarity

Senior lesson:
Good architecture starts with product truth.
If the product is structured and opinionated, the code should not pretend it is a generic task engine.

## 2. The Main Architectural Shape

Forge is organized around layered responsibility rather than around framework convenience.

Primary repo areas:

- `src/domain`
  Pure business logic, types, rule engines, derivations, selectors, scoring, readiness, analytics, notifications, sync semantics, platform semantics.
- `src/services`
  Application orchestration. This is where repositories, domain logic, Firebase clients, and UI-facing workspaces are composed into usable flows.
- `src/data`
  Concrete persistence adapters, especially IndexedDB repositories and Firebase repositories.
- `src/features`
  Route-level product surfaces, hooks, providers, and UI-specific composition.
- `src/components`
  Shared visual primitives and shell elements.
- `src/lib`
  Low-level framework and platform setup such as Firebase clients and query client setup.
- `functions/src`
  Firebase Functions orchestration for scheduled and callable server-owned flows.
- `android`
  Capacitor Android shell project.

Senior lesson:
This structure protects business meaning from framework churn.
If the UI changes, the rule engines survive.
If Firebase ownership shifts, repository and service seams reduce blast radius.

## 3. Core Engineering Principles Used Repeatedly

### 3.1 Local-First, Then Sync

Forge treats the browser as an operational runtime, not just a thin API client.

Implications:

- IndexedDB is a real persistence layer, not a cache afterthought.
- UI writes happen locally first.
- sync is an explicit secondary concern with queueing and diagnostics.
- the app can remain useful during network instability.

Relevant files:

- `src/data/local/forgeDb.ts`
- `src/services/sync/SyncProvider.tsx`
- `src/services/sync/syncQueue.ts`
- `src/services/sync/syncOrchestrator.ts`

Why this matters:
For an execution product, latency and continuity are part of the UX contract.
The user should not feel blocked by a round-trip just to mark a block complete or switch modes.

### 3.2 Shared Domain Meaning

The same business concepts are reused across surfaces:

- day instances
- routine blocks
- readiness signals
- analytics facts
- projections
- notification triggers
- sync health states
- platform capability states

This keeps the product coherent.
Today, Readiness, Schedule, Command Center, Settings, and Functions are not inventing separate meanings for the same thing.

Relevant files:

- `src/domain/routine/types.ts`
- `src/domain/analytics/types.ts`
- `src/domain/notifications/types.ts`
- `src/domain/sync/types.ts`
- `src/domain/platform/types.ts`

### 3.3 Explainable Logic Over Black Boxes

Forge deliberately favors pure functions and explicit rule engines over opaque scoring.

Examples:

- score previews are derived from weighted categories
- recommendations are rule-key based and precedence-driven
- insights carry `ruleKey`, `severity`, and `confidence`
- streaks and missions are derived from explicit continuity rules

Relevant files:

- `src/domain/scoring/calculateDayScorePreview.ts`
- `src/domain/recommendation/getNextActionRecommendation.ts`
- `src/domain/analytics/insights.ts`
- `src/domain/analytics/gamification.ts`

Senior lesson:
Explainable systems are easier to trust, test, document, and evolve than systems driven by hidden heuristics embedded in UI code.

### 3.4 Ownership Clarity

A recurring theme in later phases is: which runtime should own this behavior?

Examples:

- browser owns fast local interaction and local-first state
- PWA runtime owns installability and cached shell behavior
- Firebase Functions own scheduled orchestration
- Android shell owns native packaging but not yet full native behavior parity

Relevant files:

- `src/domain/platform/ownership.ts`
- `src/services/platform/platformOwnershipService.ts`
- `src/services/platform/platformFunctionService.ts`
- `functions/src/index.ts`

Senior lesson:
Many architecture problems are ownership problems in disguise.

## 4. Tooling And Platform Foundations

### 4.1 React + Vite + TypeScript

Forge uses a client-rendered SPA architecture with:

- React 19
- Vite
- TypeScript strict typing

Why this combination works here:

- Vite gives fast iteration and a predictable production build
- React is enough for a rich multi-surface client app
- strict typing is essential because the product has many cross-surface domain contracts

Senior nuance:
TypeScript here is not just for component props.
It is used to stabilize domain meaning across browser, Functions, storage payloads, and tests.

### 4.2 MUI As A Base, Not A Visual Identity

Forge uses MUI as a primitive and layout foundation, but the product identity comes from custom tokens and composition rules.

Relevant files:

- `src/app/theme/tokens.ts`
- `src/app/theme/theme.ts`
- `src/components/common/SurfaceCard.tsx`
- `src/components/common/MetricTile.tsx`

Concepts to study:

- theme tokens
- typography hierarchy
- reusable state surfaces
- deliberate color discipline
- density management
- responsive composition

### 4.3 TanStack Query And Zustand Separation

State responsibilities are intentionally split:

- TanStack Query handles async data and cache-backed state
- Zustand handles UI and app-shell state
- Context handles fundamental environment concerns such as auth and sync

Why this matters:
Mixing UI toggles, async data, and session lifecycle into one global store would increase coupling and reduce clarity.

### 4.4 Testing Toolchain

Forge uses:

- Vitest
- Testing Library
- `fake-indexeddb`
- jsdom

This matters because a local-first app cannot rely only on end-to-end testing.
The business rules and repository behavior need fast, deterministic unit and integration coverage.

## 5. Cross-Cutting Concepts You Should Understand First

Before going phase by phase, make sure these concepts are clear.

### 5.1 Seeded Systems Versus User-Generated Systems

Forge is seeded.

That means:

- routine templates are code-defined
- prep taxonomy is code-defined
- workout schedule is code-defined
- user interventions are constrained overrides, not open-ended edits

Why it matters:
This dramatically changes data modeling.
You need override records and transformation rules, not a full custom planner schema.

Relevant files:

- `src/data/seeds/routine.ts`
- `src/data/seeds/prepTaxonomy.ts`
- `src/data/seeds/workoutSchedule.ts`
- `src/domain/schedule/overrideRules.ts`

### 5.2 Derived State Versus Stored State

Forge stores canonical inputs and derives high-value outputs.

Stored examples:

- day instances
- settings
- sync queue items
- notification logs
- backup metadata

Derived examples:

- score preview
- readiness pace
- recommendation
- analytics facts
- insights
- momentum
- platform capability posture

Senior lesson:
Persist as little derived state as needed.
Persist stable records when durability or cross-runtime reuse justifies it.

### 5.3 Idempotency

Idempotency matters in Functions and scheduled jobs.

Why:

- schedulers can retry
- callable operations can be invoked more than once
- duplicate runs should not double-apply effects

Forge handles this through run records and explicit operation state.

Relevant files:

- `src/services/notifications/scheduledNotificationRunService.ts`
- `functions/src/notifications/pipeline.ts`
- `functions/src/backups/pipeline.ts`

### 5.4 Honest Runtime State

Forge repeatedly avoids lying to the user.

Examples:

- sync can be `stable`, `syncing`, `queued`, `stale`, `conflicted`, or `degraded`
- health integrations can be scaffolded without pretending to be live
- native shell can exist without claiming full native capability parity
- browser notifications are real without pretending to be native background push

Senior lesson:
Operational trust is built by accurate state modeling, not by optimistic copywriting.

## 6. Phase 1: Core Execution System

Phase 1 established the product's operational backbone.

### 6.1 Design System And Shell Foundations

Key ideas:

- a route-based application shell
- shared visual primitives
- navigation separation between authenticated and public surfaces
- sync visibility as part of the shell

What to study:

- why shared primitives reduce UI drift
- why shell structure should be built before page detail
- why empty and degraded states deserve design-system treatment

Relevant files:

- `src/components/layout/AppShell.tsx`
- `src/components/common/SectionHeader.tsx`
- `src/components/common/EmptyState.tsx`
- `src/components/status/SyncIndicator.tsx`

### 6.2 Auth Boundary Design

Concepts:

- Firebase Auth bootstrapping
- route guarding
- user session restoration
- first-login bootstrap
- guest mode as a separate workspace model

Relevant files:

- `src/features/auth/providers/AuthSessionProvider.tsx`
- `src/features/auth/services/bootstrapUserSession.ts`
- `src/features/auth/services/bootstrapGuestSession.ts`
- `src/app/router/AppRouter.tsx`

Senior nuance:
Auth is not only about logging in.
It is about lifecycle, restoration, error handling, bootstrapping, and separating unauthenticated routing from protected stateful workspaces.

### 6.3 Routine Engine

Key ideas:

- typed routine templates
- day generation from templates
- fallback transformations
- schedule selectors and mutations

Relevant files:

- `src/domain/routine/generateDayInstance.ts`
- `src/domain/routine/mutations.ts`
- `src/domain/routine/selectors.ts`
- `src/domain/execution/fallbacks.ts`

Important tradeoff:
The app seeds a fixed routine and allows bounded overrides.
That produces strong product constraints and simpler logic than a free-form planner, but it requires careful override rules so the user can still react to reality.

### 6.4 IndexedDB Persistence Foundation

Key ideas:

- IDB schema versioning
- object stores by concern
- repository interfaces
- local-first query paths

Relevant files:

- `src/data/local/forgeDb.ts`
- `src/data/repositories/types.ts`
- `src/data/local/localDayInstanceRepository.ts`
- `src/data/local/localSettingsRepository.ts`

Minute things to notice:

- `forgeDb` uses explicit object-store names and indexes
- the schema version is a real migration contract
- local stores exist for operational state, not just UI convenience

### 6.5 Sync Queue And Mutation Replay

Key ideas:

- queued writes
- FIFO replay
- coalescing
- sync status visibility
- eventual cloud alignment

Relevant files:

- `src/domain/execution/sync.ts`
- `src/services/sync/persistSyncableChange.ts`
- `src/services/sync/syncQueue.ts`
- `src/services/sync/syncOrchestrator.ts`
- `src/services/sync/SyncProvider.tsx`

Tradeoff:
Forge deliberately uses coarse snapshot-style replay for some entities instead of complicated patch merges.
This is simpler and safer for early-phase operational records, though it sacrifices fine-grained collaborative merge behavior.

### 6.6 Today, Schedule, Prep, Physical, Readiness

Phase 1 is where the main operational surfaces stopped being placeholders.

Concepts:

- workspaces built from domain data plus persisted settings
- recommendation context composition
- bounded override systems
- lightweight logging rather than heavy journaling
- readiness as a heuristic, not a prediction engine

Relevant files:

- `src/features/today/pages/TodayPage.tsx`
- `src/features/schedule/pages/SchedulePage.tsx`
- `src/features/prep/pages/PrepPage.tsx`
- `src/features/physical/pages/PhysicalPage.tsx`
- `src/features/readiness/pages/ReadinessPage.tsx`

### 6.7 Scoring And Recommendation Foundations

Key ideas:

- weighted scoring categories
- score ceilings for strategically bad execution
- rule precedence
- fallback-aware recommendations

Relevant files:

- `src/domain/scoring/calculateDayScorePreview.ts`
- `src/domain/recommendation/getFallbackModeSuggestion.ts`
- `src/domain/recommendation/getNextActionRecommendation.ts`

Senior lesson:
If a productivity product allows low-value activity to wash out prime misses, the product becomes a toy.
Phase 1 avoids that.

### 6.8 PWA Foundation

Concepts:

- manifest setup
- service worker generation
- install messaging
- offline shell behavior
- runtime status surfaces

Relevant files:

- `vite.config.ts`
- `src/features/pwa/pwaStatus.ts`
- `src/features/pwa/providers/PwaProvider.tsx`
- `src/features/pwa/components/PwaStatusCard.tsx`

## 7. Phase 2: Analytics And Command Center

Phase 2 turns operational records into interpretable intelligence.

### 7.1 Analytics Contracts

Before building charts, Forge defined the analytics vocabulary.

Concepts:

- versioned snapshot contracts
- rolling windows
- summary records
- source ranges
- insufficient-data states

Relevant files:

- `src/domain/analytics/types.ts`

Senior lesson:
Analytics should begin with semantics, not with chart components.

### 7.2 Facts And Rollups

Key ideas:

- transform raw day-level operational state into stable analytics facts
- summarize facts into rolling windows and chart-ready aggregates
- centralize meaning away from UI pages

Relevant files:

- `src/domain/analytics/facts.ts`
- `src/domain/analytics/rollups.ts`

Tradeoff:
Some data remains approximate because the app does not yet persist every historical signal with ideal granularity.
Forge documents that limit instead of hiding it.

### 7.3 Projections

Concepts:

- readiness projection
- pace toward a target date
- forecast honesty
- insufficient-data handling

Relevant files:

- `src/domain/analytics/projections.ts`

Senior nuance:
Projection is not prediction magic.
It is a disciplined interpretation layer built from available facts and known assumptions.

### 7.4 Functions-Based Snapshot Pipelines

Key ideas:

- scheduled generation of durable analytics snapshots
- shared derivation logic between browser and Functions
- region- and time-zone-aware scheduled jobs

Relevant files:

- `src/services/analytics/snapshotGeneration.ts`
- `functions/src/analytics/pipeline.ts`
- `functions/src/index.ts`

Minute things to notice:

- Functions are pinned to `asia-south1`
- schedules use `Asia/Kolkata`
- server ownership is introduced only where durability and orchestration matter

### 7.5 Command Center As An Application Service Problem

The Command Center is not just a page.
It is a workspace composition problem.

Relevant files:

- `src/services/analytics/commandCenterWorkspaceService.ts`
- `src/features/command-center/pages/CommandCenterPage.tsx`

Key concept:
Page complexity is kept out of React where possible.
The service prepares a page-ready workspace from durable analytics and interpretation outputs.

### 7.6 Charts As Domain Semantics

Key ideas:

- chart meaning belongs in derivation helpers
- chart inputs should be tested
- visualization should consume prepared data, not raw execution records

Relevant files:

- `src/domain/analytics/chartData.ts`

Senior lesson:
If chart meaning lives inside components, analytics will drift and become hard to verify.

### 7.7 Insight Rules And Pattern Detection

Key ideas:

- modular rule evaluation
- severity and confidence
- evidence-backed guidance
- coach-style summarization

Relevant files:

- `src/domain/analytics/insights.ts`
- `src/services/analytics/analyticsInterpretationService.ts`

### 7.8 Disciplined Gamification

Key ideas:

- streaks grounded in category-specific semantics
- missions derived from real deficits
- momentum penalized for hollow execution

Relevant files:

- `src/domain/analytics/gamification.ts`

Senior lesson:
Good gamification reinforces product truth.
Bad gamification creates reward loops that corrupt the product's purpose.

### 7.9 Operational Analytics Surfacing

Analytics was intentionally pushed back into execution surfaces.

Relevant files:

- `src/services/analytics/operationalAnalyticsService.ts`
- `src/components/common/OperationalSignalCard.tsx`

Concept:
Command Center owns depth.
Today, Schedule, and Readiness receive compressed, high-value operational signals.

## 8. Phase 3: Integrations, Durability, And External Coordination

Phase 3 is where Forge became more than a strong local operational app.

### 8.1 Sync Diagnostics And Conflict Modeling

Key ideas:

- richer sync states
- stale and degraded semantics
- conflict records
- diagnostics snapshots

Relevant files:

- `src/domain/sync/types.ts`
- `src/domain/sync/conflicts.ts`
- `src/services/sync/syncHealthService.ts`

Minute things to notice:

- `SyncProvider` evaluates health before and after flush
- monitoring severity is derived from sync state
- conflict policy differs by entity type

### 8.2 Notifications

Concepts:

- notification rules as domain logic
- permission versus preference separation
- delivery logging
- daily caps
- browser/PWA channel honesty

Relevant files:

- `src/domain/notifications/rules.ts`
- `src/services/notifications/browserNotificationService.ts`
- `src/services/notifications/notificationEligibilityService.ts`
- `src/services/notifications/notificationDeliveryService.ts`
- `src/features/notifications/providers/NotificationProvider.tsx`

Senior lesson:
User intent, browser capability, and actual delivery outcomes are different concepts and should be modeled separately.

### 8.3 Scheduled Notification Orchestration

Key ideas:

- shared notification workspaces
- scheduled evaluation in Functions
- run records for idempotency
- persistence of scheduled outcomes

Relevant files:

- `src/services/notifications/notificationWorkspaceService.ts`
- `src/services/notifications/scheduledNotificationRunService.ts`
- `functions/src/notifications/pipeline.ts`

### 8.4 Backup And Restore

Key ideas:

- versioned export schemas
- staged restore
- partial-aware restore behavior
- queue clearing before final apply
- browser download flows

Relevant files:

- `src/domain/backup/types.ts`
- `src/services/backup/backupService.ts`
- `src/services/backup/restoreService.ts`
- `src/services/backup/browserDownload.ts`

Senior nuance:
Restore is dangerous because it mutates local truth.
Forge handles this through staging, warnings, partial reporting, and explicit apply steps instead of instant overwrite behavior.

### 8.5 Scheduled Backups And Cloud Storage

Key ideas:

- server-generated backups
- retention policy
- metadata in Firestore
- heavy payload storage in Cloud Storage

Relevant files:

- `functions/src/backups/pipeline.ts`
- `src/services/backup/backupPayloadStorage.ts`
- `src/tests/domain/backup-retention.spec.ts`

Tradeoff:
Firestore is used for metadata, not as the payload body for large durable backup content.
That lowers document bloat and improves query posture.

### 8.6 Google Calendar Read Integration

Concepts:

- external event normalization
- collision analysis
- integration state snapshots
- local session artifacts

Relevant files:

- `src/services/calendar/calendarIntegrationService.ts`
- `src/services/calendar/googleCalendarClient.ts`
- `src/domain/calendar/types.ts`

### 8.7 Calendar Write Mirroring And Conflict Handling

Concepts:

- mirror records
- provider event identifiers
- write reconciliation
- feedback-loop avoidance
- manual-review conflict posture

Relevant files:

- `src/data/local/localCalendarMirrorRepository.ts`
- `src/tests/services/calendar-mirror.spec.ts`
- `src/tests/domain/calendar-mirrors.spec.ts`

Senior lesson:
External write integration is not just "call an API."
You need state about what you wrote, what you later observed, and when the two disagree.

### 8.8 Health Integration Scaffolding

Forge intentionally stops at a disciplined scaffold.

Concepts:

- provider states
- normalization boundaries
- unsupported versus not connected versus error

Relevant files:

- `src/domain/health/types.ts`
- `src/domain/health/providers.ts`
- `src/domain/health/normalization.ts`
- `src/services/health/healthIntegrationService.ts`

Senior lesson:
Scaffolding done honestly is better than fake support.

## 9. Phase 4: Launch Hardening, Native Shell, And Ownership Correction

Phase 4 is about operational maturity and platform boundaries.

### 9.1 Launch Baseline And Ownership Audit

Key ideas:

- written baseline of current production posture
- explicit ownership map
- feature freeze discipline
- validation matrix across runtimes

Relevant docs:

- `docs/phase-4-launch-baseline-audit.md`
- `docs/phase-4-spec-implementation-plan.md`

Senior lesson:
Launch readiness is partly a documentation and ownership problem.
If teams cannot answer "who owns this behavior?" they do not actually have launch readiness.

### 9.2 Configuration And Secrets Hardening

Concepts:

- browser config versus Functions runtime config
- environment boundaries
- placeholder-only examples
- deployment verification discipline

Relevant docs and files:

- `docs/firebase-setup.md`
- `docs/phase-4-configuration-safety-checklist.md`
- `functions/.env.example`
- `package.json`

### 9.3 Monitoring And Operational Diagnostics

Key ideas:

- central monitoring seam
- operator-facing diagnostics summary
- severity normalization
- ownership hints for debugging

Relevant files:

- `src/services/monitoring/monitoringService.ts`
- `src/services/monitoring/operationalDiagnosticsService.ts`
- `src/features/settings/pages/SettingsPage.tsx`

Tradeoff:
Forge surfaces support-grade diagnostics, not a full observability console.
Deep forensic work still belongs in Firebase Console, browser devtools, and deployment tools.

### 9.4 Release Operations

Key ideas:

- repeatable verification
- smoke-test matrix
- rollback isolation by surface
- support runbooks

Relevant files and docs:

- `package.json`
- `docs/phase-4-launch-operations.md`
- `docs/phase-4-release-readiness-checklist.md`

Minute things to notice:

- root-level `launch:verify` composes web and Functions checks
- rollback expectations differ for Hosting, Functions, and rules

### 9.5 Capacitor Native Shell Foundation

Concepts:

- reuse of the web app inside a native shell
- local Android builds
- webDir packaging model
- shell boundary versus capability parity

Relevant files:

- `capacitor.config.ts`
- `android/`
- `docs/phase-4-native-shell-workflow.md`

Senior lesson:
Capacitor is a strategic compromise.
It maximizes reuse and minimizes rewrite risk, but it does not magically convert web assumptions into native-first behavior.

### 9.6 Platform Capabilities

Key ideas:

- capability interpretation by runtime
- environment truth instead of persisted user preference
- honest support messaging per runtime

Relevant files:

- `src/domain/platform/capabilities.ts`
- `src/services/platform/platformCapabilitiesService.ts`
- `src/domain/platform/types.ts`

### 9.7 Remote Restore Completion

Key ideas:

- remote backup staging
- unifying local and remote restore into one apply path
- source metadata for restore stages

Relevant files:

- `src/services/backup/serverBackupRestoreService.ts`
- `src/services/backup/restoreService.ts`
- `src/features/settings/pages/SettingsPage.tsx`

### 9.8 Platform Service Extraction

Concepts:

- ownership maps for server-owned operations
- callable Functions invocation as application services
- limiting extraction to cases where browser ownership is wrong

Relevant files:

- `src/domain/platform/ownership.ts`
- `src/services/platform/platformFunctionService.ts`
- `src/services/platform/platformOwnershipService.ts`
- `src/features/settings/hooks/useInvokePlatformOperation.ts`

## 10. UI Modernization Track

This work is important because it changed how the product communicates meaning, not just how it looks.

### 10.1 Sprint 1: Design System And Shell Translation

Key ideas:

- translating inspiration into production-safe design rules
- rejecting fake semantics
- left-rail shell
- stronger typography hierarchy
- premium dark-plus-amber discipline

Relevant files:

- `src/app/theme/tokens.ts`
- `src/app/theme/theme.ts`
- `src/components/layout/AppShell.tsx`

### 10.2 Sprint 2: Today And Command Center Composition

Key ideas:

- three-zone Today layout
- strategy-surface Command Center hierarchy
- desktop/mobile parity in priority, not identical pixels

Relevant files:

- `src/features/today/pages/TodayPage.tsx`
- `src/features/command-center/pages/CommandCenterPage.tsx`

### 10.3 Sprint 3: Schedule And Settings As Operational Surfaces

Key ideas:

- weekly board plus selected-day inspector
- Settings grouped by operator workflows
- calmer shell density

Relevant files:

- `src/features/schedule/pages/SchedulePage.tsx`
- `src/features/settings/pages/SettingsPage.tsx`

### 10.4 Sprint 4: Support Surfaces As First-Class Pages

Key ideas:

- Prep as progress intelligence
- Physical as execution support
- Readiness as pressure-and-pace intelligence

Relevant files:

- `src/features/prep/pages/PrepPage.tsx`
- `src/features/physical/pages/PhysicalPage.tsx`
- `src/features/readiness/pages/ReadinessPage.tsx`

### 10.5 Sprint 5 And Sprint 6: Restraint, Copy Compression, State-Surface Quality

Key ideas:

- structure carrying more meaning than text
- quieter readiness strips
- clearer focus-visible states
- auth and loading surfaces feeling integrated with the product
- route-level non-happy-path polish

Relevant files:

- `src/features/auth/providers/AuthSessionProvider.tsx`
- `src/features/auth/components/AuthStatusScreen.tsx`
- `src/features/auth/pages/AuthPage.tsx`
- `src/components/common/EmptyState.tsx`

### 10.6 Sprint 7: Release-Candidate Visual QA

Key ideas:

- real rendered QA, not just code reasoning
- grid auto-placement pitfalls
- layout rebalancing
- calmer Settings density
- cross-app screenshot verification

Senior lesson:
Rendered browser behavior can invalidate a layout that seemed correct in code review.
Visual QA is a real engineering discipline, not a cosmetic afterthought.

## 11. Auth Hardening Follow-Up

This work is especially important because it demonstrates runtime-specific bug fixing and platform nuance.

Key concepts:

- popup versus redirect tradeoffs
- same-origin redirect constraints
- dynamic auth domain decisions
- observer-first auth restoration
- service worker boundaries around Firebase helper paths
- immediate bootstrap from popup result to avoid observer lag races

Relevant files:

- `src/features/auth/providers/AuthSessionProvider.tsx`
- `src/lib/firebase/client.ts`
- `src/lib/firebase/config.ts`
- `vite.config.ts`

Minute but very important lessons:

- OAuth correctness is partly app logic and partly deployment configuration.
- Service workers must not treat Firebase reserved `__/auth` helper paths as ordinary SPA navigations.
- Popup success can happen before `onAuthStateChanged` settles; production auth flows must account for that race.

## 12. Testing Strategy And Why It Works

Forge's testing posture is layered.

### 12.1 Domain Tests

These prove business rules and semantics.

Examples:

- routine generation
- score previews
- recommendation precedence
- analytics rollups and insights
- backup retention
- platform capabilities

Relevant paths:

- `src/tests/domain`

### 12.2 Service Tests

These prove orchestration and repository interactions.

Examples:

- analytics persistence
- sync health
- restore service
- notification state
- scheduled run behavior
- calendar mirrors

Relevant paths:

- `src/tests/services`

### 12.3 UI And Provider Tests

These prove route rendering, auth state transitions, and critical workflows.

Examples:

- auth page and provider tests
- settings page tests
- schedule page tests
- today workflow tests

Relevant paths:

- `src/tests/*.spec.tsx`

### 12.4 Browser QA And Render Verification

In the modernization track, the project also used real browser verification and screenshots because some issues only appear in actual rendered composition.

Senior lesson:
A mature frontend system needs both code-level confidence and rendered-runtime confidence.

## 13. Security, Reliability, And Release Discipline

Important concepts used in the repo:

- Firestore rules as part of source control
- App Check bootstrap
- deny-by-default posture where possible
- owner-scoped collections
- release readiness checklists
- rollback planning
- secrets hygiene and env separation

Relevant files and docs:

- `firestore.rules`
- `firestore.indexes.json`
- `src/lib/firebase/appCheck.ts`
- `docs/phase-2-release-readiness-checklist.md`
- `docs/phase-3-release-readiness-checklist.md`
- `docs/phase-4-release-readiness-checklist.md`

Senior lesson:
Reliability is not one feature.
It is the sum of:

- good contracts
- good validation
- good runtime visibility
- good rollback discipline
- honest documentation

## 14. Minute Things A Senior Engineer Should Notice

These details are easy to skip, but they matter.

- IndexedDB schema versioning is a product continuity concern, not just a local dev detail.
- Query invalidation boundaries determine whether local-first UI feels instant and coherent.
- Queue coalescing is a practical way to reduce replay noise for singleton-like records such as settings.
- Some state belongs in local repositories instead of synced settings because capability or permission truth is runtime-specific.
- `insufficientData` is a first-class analytical state and is healthier than fake precision.
- Cloud Storage is a better home for backup payload blobs than Firestore documents.
- Scheduled jobs must record enough metadata to explain retries, skips, or duplicate evaluations.
- Native-shell presence does not equal native capability parity.
- Service workers can break auth if infrastructure routes are accidentally captured.
- Hosted auth success depends on browser logic, Firebase config, and allowed origins all aligning together.
- Real screenshot verification can reveal CSS grid and breakpoint issues that unit tests cannot.

## 15. Senior-Level Tradeoffs To Be Able To Explain

You should be able to defend these decisions clearly:

- Why local-first IndexedDB plus sync queue was chosen instead of cloud-first writes.
- Why repository and service seams were worth the upfront structure in a single-user product.
- Why analytics semantics were defined before chart density was increased.
- Why Forge uses explainable heuristics rather than machine-learning-style scoring.
- Why Calendar integration is bounded and conflict-aware instead of pretending to be a full sync engine.
- Why scheduled orchestration moved into Functions while execution interaction stayed in the browser.
- Why Capacitor was preferred over a React Native rewrite for Phase 4.
- Why the product repeatedly favors honest state exposure over smoother but misleading UX.

## 16. Code-Reading Roadmap

If you want to learn this system deeply from the code, read in this order:

1. `README.md`
2. `docs/architecture-overview.md`
3. `src/domain/routine`
4. `src/domain/scoring`
5. `src/domain/recommendation`
6. `src/data/local/forgeDb.ts`
7. `src/services/sync`
8. `src/features/auth/providers/AuthSessionProvider.tsx`
9. `src/services/analytics`
10. `src/domain/analytics`
11. `src/services/notifications`
12. `src/services/backup`
13. `src/services/calendar`
14. `src/domain/platform` and `src/services/platform`
15. `functions/src`
16. `src/features/*/pages`

Why this order works:

- it starts with stable domain truth
- then adds persistence and sync
- then adds orchestration
- then adds integrations and platform ownership
- then lands in UI surfaces that consume the prepared workspaces

## 17. Interview And Mastery Questions

Use these to test whether you really understand the repo.

- Why is a seeded routine architecture materially different from a free-form planner architecture?
- Which data in Forge is canonical, and which data is derived?
- Why is a sync queue necessary if Firestore already exists?
- What makes a recommendation engine explainable?
- Why were analytics contracts versioned?
- How does Forge avoid false confidence when historical data is shallow?
- Why were scheduled notifications and backups pushed into Firebase Functions?
- What does idempotency mean in this project?
- Why is restore staged instead of instant?
- What makes Calendar write mirroring harder than Calendar reads?
- Why does Phase 4 focus on ownership and launch support rather than new features?
- What are the real benefits and limits of Capacitor in this repo?
- How can a service worker accidentally break OAuth flows?
- Why is "honest UI" a serious engineering principle rather than just a copy choice?

## 18. Final Mental Model

The best way to think about Forge is:

- Phase 1 built an execution engine.
- Phase 2 built an interpretation engine.
- Phase 3 built a durability and integration engine.
- Phase 4 built a launch and platform-ownership engine.
- The modernization and auth-hardening work made those systems feel coherent, trustworthy, and production-grade in the real runtime.

If you can explain Forge that way, and then map each layer to concrete files and tradeoffs, you understand the project at a senior-engineer level rather than just at a feature-demo level.


## 19. Senior Interview Q&A Companion

This section merges the former standalone interview companion directly into this guide so the study material and interview prep live in one place.

### 1. Architecture Shape And Boundaries

Q1.1  
Why does Forge use a layered architecture with `domain`, `services`, `data`, `features`, and `functions` instead of organizing everything by pages or Firebase collections?

A1.1  
Forge uses layered boundaries because the product's hardest problems are not UI rendering problems. They are business-meaning, persistence, sync, and ownership problems.

At a senior level, the benefit is not "clean folders." The real benefit is that each layer answers a different engineering question:

- `domain` answers: what is the business rule?
- `services` answer: how is the rule applied in a use case?
- `data` answers: where does the state live?
- `features` answer: how is the state presented and interacted with?
- `functions` answer: which operations should be server-owned?

That makes the system easier to test, easier to migrate, and easier to reason about when product scope changes.

Example:

```ts
// domain/recommendation/getNextActionRecommendation.ts
export type RecommendationContext = {
  sleepHours: number | null
  primeBlockMissed: boolean
  energy: 'low' | 'steady' | 'high'
}

export type Recommendation = {
  ruleKey: string
  message: string
}

export function getNextActionRecommendation(ctx: RecommendationContext): Recommendation {
  // Domain code should only care about business meaning.
  // It does not know about React, Firebase, or IndexedDB.
  if (ctx.primeBlockMissed && ctx.energy !== 'low') {
    return {
      ruleKey: 'missed-prime-salvage',
      message: 'Recover the highest-value block before doing lower-value work.',
    }
  }

  return {
    ruleKey: 'advance-top-priority',
    message: 'Continue with the next priority block.',
  }
}

// services/todayWorkspaceService.ts
import { getNextActionRecommendation } from '@/domain/recommendation/getNextActionRecommendation'

export async function buildTodayWorkspace(repos: {
  settingsRepo: { getDefault(): Promise<{ sleepHours: number | null; energy: 'low' | 'steady' | 'high' }> }
  dayRepo: { getByDate(date: string): Promise<{ primeBlockMissed: boolean }> }
}, date: string) {
  // Service code composes repositories + domain logic into a screen-ready use case.
  const [settings, day] = await Promise.all([
    repos.settingsRepo.getDefault(),
    repos.dayRepo.getByDate(date),
  ])

  return {
    recommendation: getNextActionRecommendation({
      sleepHours: settings.sleepHours,
      primeBlockMissed: day.primeBlockMissed,
      energy: settings.energy,
    }),
  }
}
```

Q1a  
What is the most common failure mode when teams claim to have layers but really do not?

A1a  
The most common failure mode is hidden business logic leakage into UI components or infrastructure adapters.

Examples of leakage:

- score logic inside a page component
- analytics semantics inside chart components
- sync status rules inside a badge component
- Calendar conflict policy inside a Firebase adapter

That kind of leakage makes refactors expensive because behavior is smeared across the stack.

```ts
// Bad: UI component deciding business meaning.
function ScoreChip({ completed, skipped }: { completed: number; skipped: number }) {
  // This looks harmless, but now the business rule is trapped in React.
  const label = completed > skipped ? 'Strong day' : 'Weak day'
  return <span>{label}</span>
}

// Better: the domain owns the meaning, UI just renders.
type DayStrength = 'strong' | 'weak'

function deriveDayStrength(completed: number, skipped: number): DayStrength {
  return completed > skipped ? 'strong' : 'weak'
}
```

### 2. Seeded System Versus Free-Form System

Q1.2  
Why is Forge intentionally modeled as a seeded system instead of a free-form planner?

A1.2  
Because the product promise is structured execution, not open-ended planning.

A seeded system changes the design in three important ways:

- it reduces authoring complexity
- it makes analytics more comparable across days
- it allows the app to guide behavior instead of merely storing user input

The user can still react to reality, but through bounded overrides rather than unconstrained structure editing.

Example:

```ts
type DayType =
  | 'wfh_high_output'
  | 'wfo_continuity'
  | 'weekend_deep_work'
  | 'low_energy'
  | 'survival'

type Weekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

function getSeededDayType(weekday: Weekday): DayType {
  // The base schedule is product-owned and code-defined.
  switch (weekday) {
    case 'mon':
    case 'thu':
    case 'fri':
      return 'wfh_high_output'
    case 'tue':
    case 'wed':
      return 'wfo_continuity'
    case 'sat':
    case 'sun':
      return 'weekend_deep_work'
  }
}

function resolveDayType(weekday: Weekday, override?: DayType): DayType {
  // The user can intervene, but the intervention is bounded and explicit.
  return override ?? getSeededDayType(weekday)
}
```

Q2a  
What tradeoff do you accept when you choose a seeded model?

A2a  
You trade flexibility for coherence.

That is acceptable here because Forge wants:

- comparable execution days
- meaningful readiness pressure
- limited routine drift

It would be the wrong choice for a collaborative planning product or a generic calendar editor.

```ts
function canUseOverride(weekday: Weekday, requested: DayType): boolean {
  // Guardrails are the heart of a seeded model.
  // You are not trying to block all change.
  // You are trying to keep change inside product-safe semantics.
  if (weekday === 'sat' || weekday === 'sun') {
    return requested === 'weekend_deep_work' || requested === 'low_energy' || requested === 'survival'
  }

  return requested !== 'weekend_deep_work'
}
```

### 3. Derived State Versus Stored State

Q1.3  
How do you decide whether something should be stored or derived in a system like Forge?

A1.3  
Store canonical inputs. Derive interpretable outputs unless durability, auditability, or cross-runtime reuse requires persistence.

In Forge:

- store: day instances, settings, queue items, logs, backup metadata
- derive: score previews, recommendations, readiness pace, insights, momentum

The senior-level test is:

1. Is this value reconstructable from more canonical state?
2. Will storing it create semantic drift?
3. Do multiple runtimes need a durable snapshot of it?

Example:

```ts
type DayInputs = {
  completedPrimeBlocks: number
  completedSupportBlocks: number
  primeBlockMissed: boolean
}

type ScorePreview = {
  total: number
  ceiling: number
}

export function calculateScorePreview(input: DayInputs): ScorePreview {
  // Score is derived from execution state.
  // Storing it as the primary truth would be risky because the
  // underlying day state might later change.
  const base = input.completedPrimeBlocks * 20 + input.completedSupportBlocks * 5
  const ceiling = input.primeBlockMissed ? 55 : 100

  return {
    total: Math.min(base, ceiling),
    ceiling,
  }
}
```

Q3a  
When would you intentionally persist derived state anyway?

A3a  
When the derived state becomes a durable product artifact.

Examples:

- analytics snapshots used across sessions and runtimes
- scheduled notification run records
- backup metadata

You are no longer storing "convenience math." You are storing an auditable operational record.

```ts
type AnalyticsSnapshot = {
  version: number
  windowKey: '7d' | '30d'
  averageScore: number
  generatedAt: string
}

async function persistAnalyticsSnapshot(repo: {
  upsert(snapshot: AnalyticsSnapshot): Promise<void>
}, snapshot: AnalyticsSnapshot) {
  // This is worth persisting because multiple surfaces may rely on it,
  // and it represents a durable interpretation at a point in time.
  await repo.upsert(snapshot)
}
```

### 4. Local-First IndexedDB Persistence

Q1.4  
Why is IndexedDB a first-class persistence layer in Forge instead of just a cache?

A1.4  
Because the product's core promise depends on operational continuity and low-latency interaction.

If every action waited on the network:

- the app would feel slower
- offline behavior would become brittle
- daily execution interactions would be more fragile than they should be

IndexedDB is not just performance optimization here.
It is part of the product model.

Example:

```ts
import { openDB } from 'idb'

type DayInstance = {
  id: string
  date: string
  primeBlockMissed: boolean
}

async function getForgeDb() {
  return openDB('forge-db', 1, {
    upgrade(db) {
      const store = db.createObjectStore('dayInstances', { keyPath: 'id' })
      store.createIndex('byDate', 'date')
    },
  })
}

export async function saveDayInstance(instance: DayInstance) {
  const db = await getForgeDb()

  // Local write happens immediately, even if the network is unstable.
  await db.put('dayInstances', instance)
}
```

Q4a  
What is the senior-level concern with IndexedDB that junior engineers often miss?

A4a  
Schema evolution and operational recovery.

If you change object stores, key paths, or indexes carelessly, you can break real user state across sessions.

```ts
const DB_VERSION = 2

async function openForgeDb() {
  return openDB('forge-db', DB_VERSION, {
    upgrade(db, oldVersion) {
      // Version-aware upgrades matter because users may migrate across releases.
      if (oldVersion < 1) {
        const store = db.createObjectStore('settings', { keyPath: 'id' })
        store.createIndex('byUpdatedAt', 'updatedAt')
      }

      if (oldVersion < 2 && !db.objectStoreNames.contains('syncDiagnostics')) {
        db.createObjectStore('syncDiagnostics', { keyPath: 'id' })
      }
    },
  })
}
```

### 5. Repository Pattern And Persistence Seams

Q1.5  
What problem does the repository pattern actually solve in Forge?

A1.5  
It isolates business use cases from persistence ownership.

That means:

- the UI does not need to know if state came from IndexedDB or Firestore
- services can compose data sources predictably
- migrations become local changes instead of app-wide rewrites

Example:

```ts
type Settings = {
  id: string
  energy: 'low' | 'steady' | 'high'
}

interface SettingsRepository {
  getDefault(): Promise<Settings>
  upsert(settings: Settings): Promise<void>
}

class LocalSettingsRepository implements SettingsRepository {
  async getDefault(): Promise<Settings> {
    return { id: 'default', energy: 'steady' }
  }

  async upsert(settings: Settings): Promise<void> {
    // Local persistence implementation goes here.
    console.log('local upsert', settings)
  }
}

async function updateEnergy(repo: SettingsRepository, energy: Settings['energy']) {
  // Service code only depends on the repository contract.
  const current = await repo.getDefault()
  await repo.upsert({ ...current, energy })
}
```

Q5a  
What is a bad repository abstraction?

A5a  
A bad repository either:

- leaks provider-specific behavior into the interface, or
- becomes so generic that it carries no domain meaning

```ts
// Bad: provider leakage.
interface BadSettingsRepo {
  setFirestoreDocument(path: string, payload: unknown): Promise<void>
}

// Better: domain-shaped contract.
interface BetterSettingsRepo {
  getDefault(): Promise<Settings>
  upsert(settings: Settings): Promise<void>
}
```

### 6. Sync Queue, Replay, And Coalescing

Q1.6  
Why does Forge use a sync queue instead of writing directly to Firestore and trusting retries?

A1.6  
Because local-first correctness and remote eventual consistency are separate concerns.

The queue gives Forge:

- ordered replay
- retryable writes
- visibility into outstanding state
- the ability to keep the UI fast while deferring cloud alignment

Example:

```ts
type QueueItem = {
  id: string
  entity: 'settings' | 'day-instance'
  status: 'queued' | 'syncing' | 'failed'
  payload: unknown
  queuedAt: string
}

function enqueue(queue: QueueItem[], item: QueueItem): QueueItem[] {
  // FIFO ordering is explicit and testable.
  return [...queue, item].sort((a, b) => a.queuedAt.localeCompare(b.queuedAt))
}

async function flushQueue(items: QueueItem[]) {
  for (const item of items) {
    // Each queued write can be replayed later.
    console.log('replaying', item.entity, item.id)
  }
}
```

Q6a  
What is coalescing, and why is it useful for settings-like records?

A6a  
Coalescing means collapsing older queued writes when a newer write fully supersedes them.

That is useful for singleton-like snapshots such as settings because you usually care about the latest intended state, not every intermediate edit.

```ts
function coalesceSettingsWrites(items: QueueItem[]): QueueItem[] {
  const nonSettings = items.filter((item) => item.entity !== 'settings')
  const latestSettings = [...items]
    .filter((item) => item.entity === 'settings')
    .sort((a, b) => b.queuedAt.localeCompare(a.queuedAt))[0]

  // Keep only the latest settings snapshot.
  return latestSettings ? [...nonSettings, latestSettings] : nonSettings
}
```

### 7. Honest Runtime State And Sync Health

Q1.7  
Why is "honest runtime state" a real engineering concept in Forge rather than just a UX writing choice?

A1.7  
Because runtime state affects operator trust, debugging accuracy, and recovery behavior.

If the app says "all good" when:

- a queue is stale
- conflicts exist
- replay has failed

then the UI is lying about operational reality.

Example:

```ts
type SyncStatus = 'stable' | 'syncing' | 'queued' | 'stale' | 'conflicted' | 'degraded'

function assessSyncStatus(input: {
  outstandingCount: number
  failedCount: number
  conflictCount: number
  isFlushing: boolean
}): SyncStatus {
  if (input.conflictCount > 0) return 'conflicted'
  if (input.failedCount > 0) return 'degraded'
  if (input.isFlushing) return 'syncing'
  if (input.outstandingCount > 0) return 'queued'
  return 'stable'
}
```

Q7a  
What is the tricky interview follow-up here?

A7a  
The tricky follow-up is: why not hide degraded states to reduce user anxiety?

The answer is that hiding high-impact runtime truth creates larger support and recovery failures later.
The right move is to compress and prioritize the signal, not falsify it.

```ts
function summarizeSyncStatus(status: SyncStatus): string {
  // Honest, but concise.
  switch (status) {
    case 'degraded':
      return 'Some local changes have not synced correctly.'
    case 'conflicted':
      return 'A conflict needs review before sync can fully settle.'
    default:
      return 'Workspace state is aligned.'
  }
}
```

### 8. Auth Session Restoration And Guest/User Boundaries

Q1.8  
What makes auth restoration more complicated than just checking whether `currentUser` exists?

A1.8  
Because Forge must reconcile:

- provider lifecycle
- bootstrap timing
- guest mode boundaries
- route protection
- partially restored browser sessions

A production auth system is not just "is the user present?" It is also "is the workspace ready?"

Example:

```ts
type AuthState =
  | { status: 'checking' }
  | { status: 'guest'; userId: 'guest' }
  | { status: 'authenticated'; userId: string }
  | { status: 'unauthenticated' }

async function restoreSession(input: {
  firebaseUser: { uid: string } | null
  hasPendingGuestSession: boolean
}): Promise<AuthState> {
  if (input.hasPendingGuestSession) {
    // Guest workspace is a valid runtime mode with its own lifecycle.
    return { status: 'guest', userId: 'guest' }
  }

  if (input.firebaseUser) {
    // Real apps often need a second bootstrap step after auth resolution.
    return { status: 'authenticated', userId: input.firebaseUser.uid }
  }

  return { status: 'unauthenticated' }
}
```

Q8a  
What auth race condition is especially tricky in popup-based sign-in?

A8a  
Popup success can happen before the auth observer has settled.

If the app waits only for the observer, it can briefly think the user is still unauthenticated and bounce them back to the auth route.

```ts
async function signInWithPopupAndBootstrap(authClient: {
  signInWithPopup(): Promise<{ user: { uid: string } }>
}) {
  const result = await authClient.signInWithPopup()

  // Bootstrap immediately from the popup result instead of waiting
  // for a later observer tick that may briefly lag.
  return {
    status: 'authenticated' as const,
    userId: result.user.uid,
  }
}
```

### 9. Scoring Engine Design

Q1.9  
What makes a scoring engine credible in Forge instead of feeling gamed or toy-like?

A1.9  
The score is credible because it reflects value hierarchy, not activity volume.

That means:

- prime work matters more than low-value completion
- missing critical work can cap the day
- support tasks cannot fully wash out strategic misses

Example:

```ts
type ScoreInput = {
  primeDone: number
  supportDone: number
  primeMissed: boolean
}

function scoreDay(input: ScoreInput) {
  const raw = input.primeDone * 25 + input.supportDone * 5

  // Missing the prime block caps the day.
  const ceiling = input.primeMissed ? 55 : 100

  return {
    raw,
    total: Math.min(raw, ceiling),
  }
}
```

Q9a  
What is the common interview trap when discussing scoring systems?

A9a  
The trap is talking only about formulas and not about behavior incentives.

Senior engineers should explain:

- what behavior the score reinforces
- what behavior it discourages
- how it avoids being padded

```ts
function explainScore(total: number, ceiling: number) {
  // This kind of metadata makes the model explainable in UI and tests.
  if (total === ceiling && ceiling < 100) {
    return 'Day was capped because critical work was missed.'
  }

  return 'Day score reflects weighted execution across categories.'
}
```

### 10. Recommendation Engine Precedence And Explainability

Q1.10  
Why does Forge use precedence-ordered recommendation rules instead of one big weighted formula?

A1.10  
Because recommendation systems often need discrete operational priorities.

Some signals should dominate others.
For example:

- conflict protection should outrank generic productivity advice
- missed-prime salvage should outrank low-value next steps

Rule precedence is easier to test and easier to explain than one opaque weighted score.

Example:

```ts
type RecommendationContext = {
  hasCalendarConflict: boolean
  primeBlockMissed: boolean
}

function recommend(ctx: RecommendationContext) {
  // Precedence is explicit and readable.
  if (ctx.hasCalendarConflict) {
    return { ruleKey: 'protect-conflict-boundary', message: 'Protect the current time window from collision.' }
  }

  if (ctx.primeBlockMissed) {
    return { ruleKey: 'missed-prime-salvage', message: 'Recover the prime block before switching to lighter work.' }
  }

  return { ruleKey: 'advance-top-priority', message: 'Continue with the next high-priority block.' }
}
```

Q10a  
What tricky follow-up often appears in interviews?

A10a  
How do you prevent rule engines from becoming an unmaintainable pile of `if` statements?

The answer is to standardize rule contracts and keep rule evaluation isolated from rendering.

```ts
type Rule = {
  key: string
  applies(ctx: RecommendationContext): boolean
  message: string
}

const rules: Rule[] = [
  {
    key: 'protect-conflict-boundary',
    applies: (ctx) => ctx.hasCalendarConflict,
    message: 'Protect the current time window from collision.',
  },
  {
    key: 'missed-prime-salvage',
    applies: (ctx) => ctx.primeBlockMissed,
    message: 'Recover the prime block before switching to lighter work.',
  },
]
```

### 11. Analytics Contracts, Facts, And Rollups

Q1.11  
Why should analytics begin with contracts and facts instead of chart implementation?

A1.11  
Because charts are presentation; analytics contracts define business meaning.

If you skip contracts:

- different screens may compute different versions of the same metric
- Functions and client code may drift
- tests become shallow and UI-bound

Example:

```ts
type DailyFact = {
  date: string
  score: number
  deepWorkDone: boolean
}

type RollingSnapshot = {
  version: 1
  windowKey: '7d' | '30d'
  averageScore: number
  sourceDates: string[]
}

function buildRollingSnapshot(windowKey: '7d' | '30d', facts: DailyFact[]): RollingSnapshot {
  const averageScore = facts.length === 0
    ? 0
    : facts.reduce((sum, fact) => sum + fact.score, 0) / facts.length

  return {
    version: 1,
    windowKey,
    averageScore,
    sourceDates: facts.map((fact) => fact.date),
  }
}
```

Q11a  
What does "fact layer" mean in practice?

A11a  
It means converting raw operational records into stable analytics inputs before summarizing them.

That avoids asking charts or UI pages to interpret low-level execution state directly.

```ts
type DayInstance = {
  date: string
  completedPrimeBlocks: number
  totalPrimeBlocks: number
}

function deriveDailyFact(day: DayInstance): DailyFact {
  return {
    date: day.date,
    score: day.completedPrimeBlocks * 20,
    deepWorkDone: day.completedPrimeBlocks === day.totalPrimeBlocks,
  }
}
```

### 12. Projections And Insufficient-Data States

Q1.12  
Why is `insufficientData` a first-class state in a projection system?

A1.12  
Because false precision is worse than admitted uncertainty.

When history is shallow, projecting readiness as a confident percentage creates misleading product behavior.

Example:

```ts
type Projection =
  | { status: 'insufficientData' }
  | { status: 'projected'; readinessByTargetDate: number }

function projectReadiness(recentScores: number[]): Projection {
  // Senior design choice: do not fake confidence with shallow data.
  if (recentScores.length < 5) {
    return { status: 'insufficientData' }
  }

  const avg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length
  return {
    status: 'projected',
    readinessByTargetDate: Math.min(avg, 100),
  }
}
```

Q12a  
How do you discuss heuristics honestly in an interview without weakening your answer?

A12a  
By explaining that heuristics are acceptable when:

- inputs are explicit
- limits are documented
- outputs are explainable
- the UI does not overclaim precision

```ts
function projectionExplanation(projection: Projection): string {
  if (projection.status === 'insufficientData') {
    return 'More execution history is required before a readiness projection becomes trustworthy.'
  }

  return `Projection is heuristic and directional, not a guarantee: ${projection.readinessByTargetDate}%`
}
```

### 13. Insight Rules, Severity, And Confidence

Q1.13  
What makes an analytics insight engine explainable?

A1.13  
An explainable insight engine exposes:

- which rule fired
- how severe the issue is
- how confident the system is
- what evidence was used

That makes the insight reviewable, testable, and debuggable.

Example:

```ts
type Insight = {
  ruleKey: string
  severity: 'info' | 'warning' | 'critical'
  confidence: 'low' | 'medium' | 'high'
  message: string
  evidence: string[]
}

function detectSleepRisk(avgSleep: number, avgScore: number): Insight | null {
  if (avgSleep < 6 && avgScore < 60) {
    return {
      ruleKey: 'sleep-underperformance-link',
      severity: 'warning',
      confidence: 'high',
      message: 'Low sleep is strongly correlated with weaker recent execution.',
      evidence: ['avgSleep<6', 'avgScore<60'],
    }
  }

  return null
}
```

Q13a  
What tricky follow-up is often asked here?

A13a  
How do you keep confidence from becoming arbitrary?

The answer is: tie it to evidence quality and signal consistency, not gut feel.

```ts
function deriveConfidence(sampleSize: number, matchingDays: number): Insight['confidence'] {
  // Confidence is rule-derived, not hand-waved.
  if (sampleSize >= 10 && matchingDays / sampleSize > 0.7) return 'high'
  if (sampleSize >= 5) return 'medium'
  return 'low'
}
```

### 14. Disciplined Gamification

Q1.14  
What does "disciplined gamification" mean, and how is it different from vanity gamification?

A1.14  
Disciplined gamification reinforces the product's real success criteria.
Vanity gamification rewards activity regardless of value.

In Forge:

- streaks are category-specific
- missions are deficit-driven
- momentum is penalized for hollow execution

Example:

```ts
type MomentumInput = {
  recentScoreAverage: number
  primeMisses: number
  fallbackDays: number
}

function deriveMomentum(input: MomentumInput): number {
  let value = input.recentScoreAverage

  // Penalize strategically weak behavior.
  value -= input.primeMisses * 10
  value -= input.fallbackDays * 5

  return Math.max(0, Math.min(100, value))
}
```

Q14a  
What is the most important interview defense of this design?

A14a  
That the reward model must not undermine the core product intent.

If low-value completions can inflate momentum, the product teaches the wrong behavior.

```ts
function qualifiesForDeepWorkStreak(completedPrimeBlocks: number): boolean {
  // A strict streak rule is more honest than a broad "any activity counts" rule.
  return completedPrimeBlocks >= 1
}
```

### 15. Notifications: Preference, Permission, Delivery

Q1.15  
Why should notification preference, browser permission, and actual delivery state be modeled separately?

A1.15  
Because they represent different truths:

- preference = what the user wants
- permission = what the runtime allows
- delivery state = what actually happened

If you collapse them into one boolean, you lose operational clarity.

Example:

```ts
type NotificationPreference = {
  enabled: boolean
}

type NotificationPermissionState = 'default' | 'granted' | 'denied'

type NotificationLog = {
  id: string
  delivered: boolean
  reason: string
}

function canDeliver(pref: NotificationPreference, permission: NotificationPermissionState): boolean {
  // Both user intent and runtime capability must be true.
  return pref.enabled && permission === 'granted'
}
```

Q15a  
What is the tricky product honesty follow-up here?

A15a  
A scheduled job can evaluate a notification and persist a candidate, but that does not mean native push was sent.

Senior engineers should separate "candidate produced" from "user definitely saw it."

```ts
type NotificationCandidate = {
  id: string
  channel: 'browser'
  message: string
}

function describeDelivery(candidate: NotificationCandidate, deliveredInBrowser: boolean): string {
  if (!deliveredInBrowser) {
    return `Candidate ${candidate.id} was generated, but browser delivery was not confirmed.`
  }

  return `Candidate ${candidate.id} was generated and displayed in the browser runtime.`
}
```

### 16. Backup, Restore, And Durable Recovery

Q1.16  
Why is staged restore a better design than immediate restore in Forge?

A1.16  
Because restore is a high-risk mutation of local truth.

Staging allows Forge to:

- validate the payload
- show warnings
- explain what will and will not be restored
- require explicit confirmation before apply

Example:

```ts
type RestoreStage = {
  source: 'local-file' | 'scheduled-backup'
  warnings: string[]
  dayInstanceCount: number
}

function stageRestore(payloadVersion: number, dayInstanceCount: number): RestoreStage {
  const warnings: string[] = []

  if (payloadVersion !== 1) {
    warnings.push('Payload version is different from the expected local version.')
  }

  return {
    source: 'local-file',
    warnings,
    dayInstanceCount,
  }
}
```

Q16a  
What is the subtle sync-related restore risk interviewers may ask about?

A16a  
Outstanding pre-restore queue items may replay over the newly restored state.

That is why restore often needs queue clearing or queue invalidation rules.

```ts
async function applyRestore(input: {
  clearSyncQueue(): Promise<void>
  writeRestoredState(): Promise<void>
}) {
  // Clear stale mutations before applying restored truth.
  await input.clearSyncQueue()
  await input.writeRestoredState()
}
```

### 17. Calendar Read, Write Mirroring, And Conflict Handling

Q1.17  
Why is Calendar write mirroring harder than Calendar read integration?

A1.17  
Reading is mostly normalization.
Writing introduces ownership, reconciliation, and feedback-loop problems.

You need to know:

- what Forge wrote
- what the provider later reports
- whether the provider state still matches the app's intent

Example:

```ts
type MirrorRecord = {
  forgeBlockId: string
  providerEventId: string
  lastMirroredAt: string
}

function reconcileMirror(record: MirrorRecord, providerEventId: string | null) {
  if (!providerEventId) {
    return { status: 'conflict', reason: 'Mirrored provider event is missing.' }
  }

  if (record.providerEventId !== providerEventId) {
    return { status: 'conflict', reason: 'Provider event id no longer matches the mirror record.' }
  }

  return { status: 'aligned' as const }
}
```

Q17a  
What is a good senior answer to "why not auto-merge every conflict?"

A17a  
Because not every external disagreement is safe to resolve automatically.

For Calendar, silent merge behavior can overwrite meaningful external edits or hide provider drift.

```ts
function resolveCalendarConflict(autoMergeAllowed: boolean) {
  // Senior design choice: manual review may be safer than forced merge.
  if (!autoMergeAllowed) {
    return { status: 'needs-review', message: 'Calendar conflict requires explicit operator review.' }
  }

  return { status: 'merged' }
}
```

### 18. Platform Ownership: Browser, PWA, Functions, Native Shell

Q1.18  
How do you decide whether a capability should belong to the browser, the PWA runtime, Firebase Functions, or the native shell?

A1.18  
Use the ownership question:

"Which runtime has the correct authority and execution characteristics for this responsibility?"

Examples:

- browser: fast local interactions
- PWA runtime: installability and cached shell
- Functions: scheduled orchestration
- native shell: packaging and future device capability bridges

Example:

```ts
type Owner = 'browser' | 'pwa-runtime' | 'functions' | 'native-shell'

function decideOwner(capability: 'daily-scoring' | 'scheduled-backup' | 'install-prompt' | 'health-bridge'): Owner {
  switch (capability) {
    case 'daily-scoring':
      return 'browser'
    case 'scheduled-backup':
      return 'functions'
    case 'install-prompt':
      return 'pwa-runtime'
    case 'health-bridge':
      return 'native-shell'
  }
}
```

Q18a  
What is the common overengineering mistake here?

A18a  
Extracting to the backend just because backend sounds cleaner.

The better rule is: extract when the current owner is wrong, not when abstraction feels fashionable.

```ts
function shouldExtractToServer(input: {
  needsSchedule: boolean
  needsPrivilegedSecrets: boolean
  needsImmediateLocalFeedback: boolean
}): boolean {
  // Server ownership makes sense for schedules and privileged operations,
  // but not for the fastest local interaction loop.
  return input.needsSchedule || input.needsPrivilegedSecrets
}
```

### 19. UI Modernization As Systems Work

Q1.19  
Why should a senior engineer treat UI modernization as systems work instead of cosmetic work?

A1.19  
Because UI modernization changes:

- information hierarchy
- action discoverability
- degradation behavior
- route consistency
- operator trust

In Forge, the modernization track was not a paint job.
It reorganized major surfaces so they communicated product meaning more clearly.

Example:

```tsx
type TodayWorkspace = {
  recommendation: string
  executionBlocks: string[]
  supportSignals: string[]
}

export function TodayLayout({ workspace }: { workspace: TodayWorkspace }) {
  return (
    <main>
      {/* Main execution area comes first because it is the primary job of the page. */}
      <section>
        <h1>Current execution</h1>
        <p>{workspace.recommendation}</p>
      </section>

      {/* Support signals are secondary and should not visually outrank the main mission. */}
      <aside>
        <h2>Support layer</h2>
        <ul>{workspace.supportSignals.map((signal) => <li key={signal}>{signal}</li>)}</ul>
      </aside>
    </main>
  )
}
```

Q19a  
What tricky front-end interview follow-up might you get here?

A19a  
How do you know the redesign actually improved the product?

A senior answer should include:

- rendered QA
- responsive verification
- interaction regression tests
- evidence that the new structure better matches the page's purpose

```ts
function validateLayoutResult(input: {
  mainMissionVisible: boolean
  supportSignalsSecondary: boolean
  mobileLayoutStillReadable: boolean
}) {
  // This is not pixel-perfect automation.
  // It is validation of information hierarchy and interaction intent.
  return input.mainMissionVisible && input.supportSignalsSecondary && input.mobileLayoutStillReadable
}
```

### 20. Security, Reliability, Release Discipline, And Auth Hardening

Q1.20  
What is the senior-level way to explain Forge's release and reliability posture in an interview?

A1.20  
Forge treats reliability as a system made of:

- typed contracts
- test coverage
- source-controlled rules
- monitoring seams
- launch verification commands
- operator runbooks
- explicit accepted limitations

This is stronger than saying "we ran tests."

Example:

```ts
type ReleaseCheck = {
  lint: boolean
  typecheck: boolean
  tests: boolean
  build: boolean
  functionsVerify: boolean
}

function canLaunch(check: ReleaseCheck): boolean {
  // Launch is a gate, not a vibe.
  return check.lint && check.typecheck && check.tests && check.build && check.functionsVerify
}
```

Q20a  
What is the tricky auth-hardening follow-up frequently asked in interviews?

A20a  
How can a service worker or deployment config break an otherwise correct OAuth flow?

Because auth correctness depends on more than code:

- the OAuth provider config must be valid
- the app must use the right runtime flow for the environment
- service workers must not intercept reserved helper routes

```ts
function shouldHandleNavigation(url: string): boolean {
  // Reserved Firebase helper paths should not be treated like ordinary SPA routes.
  // If a service worker captures them, redirect auth can break.
  if (url.includes('/__/auth')) {
    return false
  }

  return true
}
```

### Closing Advice

If you use this document for interview prep, do not memorize the wording.
Practice answering in this sequence:

1. define the problem
2. explain the tradeoff
3. justify the design
4. show how the code structure supports the decision
5. mention one failure mode or limitation honestly

## 20. Per-Topic Advanced Interview Banks

This section expands the merged guide with deeper interview question banks for each major concept family.

Use these as high-volume practice prompts after you finish Section 19.

### 20.1 Architecture, Product Truth, And Domain Modeling

1. How would you explain the relationship between product truth and system architecture in Forge?
   Follow-up: What architectural mistake happens when engineers treat product rules as UI copy instead of domain constraints?
2. Why is Forge better served by layered boundaries than by a purely page-based folder structure?
   Follow-up: When can a page-based structure still work, and why does Forge outgrow it?
3. How does a seeded execution product change schema design compared with a generic planner?
   Follow-up: Which entities disappear or shrink in complexity when routine structure is product-owned?
4. What is the difference between a bounded override model and a free-form editing model?
   Follow-up: How would analytics quality degrade if overrides became unconstrained?
5. Why should routine templates live outside components and screen-local hooks?
   Follow-up: What specific bugs appear when screens derive their own versions of the routine?
6. How do you decide whether a concept belongs in `domain`, `services`, `data`, or `features`?
   Follow-up: Give an example of a concept that people often place in the wrong layer.
7. Why is repository design in Forge domain-shaped instead of provider-shaped?
   Follow-up: What is the long-term cost of letting Firebase path details leak into repo interfaces?
8. How do stored state and derived state differ in a product like Forge?
   Follow-up: When does derived state become important enough to persist?
9. Why is explainability a first-class engineering property for recommendations and insights?
   Follow-up: What goes wrong when teams optimize for "smart sounding" outputs instead of explainable ones?
10. How would you defend strict rule precedence over a single weighted recommendation score?
    Follow-up: When is a weighted model still useful, and where would it fit better?
11. Why is "honest UI" a systems principle in Forge rather than just a UX slogan?
    Follow-up: How can dishonest simplification hurt debugging and product trust?
12. What makes a product concept worthy of its own type contract?
    Follow-up: When is adding a new contract overengineering instead of good design?
13. How should a senior engineer think about semantic drift in a typed codebase?
    Follow-up: Which parts of Forge are most at risk of semantic drift if not guarded carefully?
14. Why is it useful to separate canonical inputs from interpretive outputs early?
    Follow-up: How does this separation help when you introduce Functions later?
15. How would you evaluate whether a business rule belongs in a pure function?
    Follow-up: Which conditions justify letting orchestration logic live in a service instead?
16. What is the real benefit of giving recommendations `ruleKey` values?
    Follow-up: How does rule identity help across analytics, UI, and testing?
17. Why is consistency across Today, Schedule, Readiness, and Command Center a domain problem first?
    Follow-up: What is the usual sign that a team tried to solve consistency too late in the UI layer?
18. How would you explain the difference between "extensible" and "overengineered" in Forge?
    Follow-up: Which early decisions were intentionally extensible without becoming speculative?
19. What does it mean to preserve product meaning while still leaving future seams open?
    Follow-up: How did Forge keep Phase 2 and Phase 3 visible without polluting Phase 1?
20. If Forge later became multi-user and collaborative, which current domain assumptions would break first?
    Follow-up: Which abstractions would survive that shift with minimal change?

### 20.2 Local-First Persistence, Sync, And Auth Restoration

1. Why is local-first a product decision in Forge instead of a performance trick?
   Follow-up: Which user interactions become meaningfully worse in a cloud-first posture?
2. Why was IndexedDB the right browser persistence choice for Forge?
   Follow-up: Which IndexedDB concerns are easy to ignore until a real release cycle begins?
3. How should you think about object stores and indexes in a local-first app?
   Follow-up: Which access patterns in Forge justify explicit indexes?
4. Why does schema versioning matter in browser-local storage?
   Follow-up: What is the hidden operational cost of sloppy upgrade logic?
5. Why are repository seams especially valuable in a local-first architecture?
   Follow-up: How do they help once both local and remote adapters exist?
6. What problem does a sync queue solve that optimistic local writes alone do not?
   Follow-up: Why is "we'll just retry Firestore writes" not enough?
7. When is FIFO replay the right sync policy?
   Follow-up: When does FIFO need to be augmented with smarter entity-specific policy?
8. Why is write coalescing helpful for settings-like state?
   Follow-up: Which kinds of entities should usually not be aggressively coalesced?
9. Why does Forge model `stale`, `conflicted`, and `degraded` instead of flattening everything into `queued`?
   Follow-up: How do these richer states improve operator decision making?
10. Why keep sync diagnostics as a durable record instead of transient UI state?
    Follow-up: What becomes possible once diagnostics are stored as first-class records?
11. Why are conflict records separate from queue items?
    Follow-up: What confusion happens when teams try to infer conflict state purely from replay failures?
12. How would you explain snapshot-replacement semantics to an interviewer?
    Follow-up: What are the tradeoffs versus patch-based merge strategies?
13. Why does auth restoration need more than a simple `currentUser` check?
    Follow-up: What lifecycle steps happen between "Firebase knows the user" and "the workspace is ready"?
14. What makes guest mode architecturally different from an unauthenticated state?
    Follow-up: Why is guest workspace bootstrap a real runtime mode and not just demo UI?
15. Why was popup-result hydration important in the auth hardening work?
    Follow-up: What race exists if the app waits only for `onAuthStateChanged`?
16. Why is redirect versus popup auth a runtime-boundary decision instead of a UX preference?
    Follow-up: Which deployment and service worker details can change the correct auth choice?
17. Why should PWA/service worker behavior be considered part of auth correctness?
    Follow-up: What goes wrong when reserved auth helper paths are treated like normal app routes?
18. How do you decide what local state is runtime truth versus synced user data?
    Follow-up: Why are some capability states poor candidates for Firestore persistence?
19. Why does sync health belong in the shell, not just in Settings?
    Follow-up: How do you avoid turning shell status into noisy badge spam?
20. What are the biggest failure modes of local-first systems as they scale?
    Follow-up: Which current Forge decisions keep those risks manageable for now?

### 20.3 Analytics, Projections, Insights, And Gamification

1. Why should analytics start with contracts instead of charts?
   Follow-up: What kind of semantic drift happens when charts define their own meanings?
2. What is the value of a fact layer in analytics architecture?
   Follow-up: Why should raw operational records not be chart inputs directly?
3. How do rollups differ from projections?
   Follow-up: Why is it dangerous to talk about both as if they were the same kind of output?
4. Why is `insufficientData` a healthy analytical state?
   Follow-up: How do you keep that state from feeling like a product weakness?
5. Why are analytics snapshots versioned in Forge?
   Follow-up: What specific kinds of future changes make versioning necessary?
6. Why is the Command Center primarily a workspace-composition problem?
   Follow-up: What happens if the page itself becomes the analytics orchestrator?
7. Why should chart semantics live in domain helpers instead of visualization components?
   Follow-up: What testing advantages come from that separation?
8. How does Forge keep insights explainable?
   Follow-up: Why are `ruleKey`, `severity`, and `confidence` more than implementation details?
9. What makes a high-confidence insight different from a persuasive-sounding one?
   Follow-up: How should evidence quality affect confidence?
10. Why is coach-style summarization valuable on top of raw insights?
    Follow-up: How do you prevent the summary from becoming a second hidden rule engine?
11. What does "disciplined gamification" really mean?
    Follow-up: How is it different from simple streak inflation?
12. Why are streaks category-specific in a serious execution product?
    Follow-up: What goes wrong when all continuity is treated as the same kind of habit?
13. Why should weekly missions come from deficits and leverage points rather than random achievements?
    Follow-up: How does mission selection influence product seriousness?
14. Why is momentum a useful but dangerous metric?
    Follow-up: How do you keep momentum from rewarding hollow completion?
15. Why did Phase 2 push analytics back into Today, Readiness, and Schedule?
    Follow-up: How do you prevent those pages from turning into mini Command Centers?
16. What are the advantages of shared interpretation services across analytics consumers?
    Follow-up: How does this help with performance tuning later?
17. How do you decide which analytics should be durable server-owned snapshots versus client-derived views?
    Follow-up: What role does cost, recomputation, and cross-runtime reuse play here?
18. Why is explainability especially important in preparation/readiness products?
    Follow-up: How can overconfident analytics actively harm the user?
19. How would you defend Forge's analytical posture against "why not use machine learning"?
    Follow-up: When would a more statistical or ML-heavy approach become justified?
20. What are the biggest analytical limitations Forge still documents honestly?
    Follow-up: Why is documenting those limits part of good analytics engineering?

### 20.4 Notifications, Backup/Restore, Calendar, And Durable Integrations

1. Why should notification rules be separated from delivery transport?
   Follow-up: What bugs appear when one service owns both trigger meaning and browser transport?
2. Why are notification preference, permission, and outcome different states?
   Follow-up: How does separating them improve product honesty?
3. Why is a daily notification cap a product rule instead of just a UX preference?
   Follow-up: How do caps change the architecture of notification evaluation?
4. Why do scheduled notification runs need idempotent records?
   Follow-up: What failure patterns in serverless schedulers make this essential?
5. Why is browser/PWA notification support an important honesty boundary in Forge?
   Follow-up: What false claim would the product make if it blurred browser delivery with native push?
6. Why is backup a durability system and not just a download button?
   Follow-up: Which metadata makes backup behavior operationally supportable?
7. Why is restore staged instead of immediate?
   Follow-up: Which user and data-safety benefits come from a two-step restore path?
8. Why should restore be partial-aware?
   Follow-up: What kinds of state should usually not be blindly restored as if they were canonical?
9. Why is clearing pre-restore sync intent important?
   Follow-up: What corruption pattern appears if stale queue items replay after a restore?
10. Why split backup metadata in Firestore from payload bodies in Cloud Storage?
    Follow-up: What operational and cost problems does that split avoid?
11. Why do retention rules belong in the backup domain itself?
    Follow-up: Why is retention policy too important to leave as a console-side habit?
12. Why is Calendar read integration architecturally easier than write integration?
    Follow-up: Which responsibilities are added the moment the app writes to an external calendar?
13. Why do mirror records matter in Calendar write flows?
    Follow-up: What kinds of ambiguity appear if the app does not remember what it wrote?
14. Why is manual-review conflict handling sometimes the correct answer for Calendar sync?
    Follow-up: Why is automatic merge often more dangerous than it first appears?
15. How should you think about external event normalization in a product like Forge?
    Follow-up: What breaks when provider-specific event shapes leak into domain logic?
16. Why are Google Calendar session artifacts and token handling sensitive boundaries?
    Follow-up: What should never be casually mixed into broad synced settings state?
17. Why was health integration kept scaffold-only instead of pretending to be live?
    Follow-up: How do `unsupported`, `notConnected`, and `error` represent meaningfully different states?
18. What makes integration scaffolding "real" even before the provider is fully wired?
    Follow-up: How do contracts and state semantics reduce future rewrite cost?
19. How do external integrations change the testing burden of a frontend-heavy system?
    Follow-up: Which pieces should still be proven with pure tests instead of only live verification?
20. What are the biggest cross-system risks once notifications, backup, and Calendar all coexist?
    Follow-up: How does Forge reduce silent failure across those integration layers?

### 20.5 Platform Ownership, Native Shell, UI Modernization, Security, And Release Operations

1. What does platform ownership mean in Forge?
   Follow-up: How is ownership different from simple code location?
2. Why was Phase 4 focused on ownership correction instead of feature expansion?
   Follow-up: Why do launch phases often fail when they keep adding surface area?
3. How do you decide whether something belongs in browser code, PWA runtime, Functions, or native shell?
   Follow-up: What is a good example of browser ownership being wrong?
4. Why was Capacitor a strong Phase 4 choice for Forge?
   Follow-up: What did it solve, and what did it intentionally not solve?
5. Why should platform capabilities be interpreted live rather than stored as user state?
   Follow-up: Which capability truths are environment-specific and therefore poor persistence candidates?
6. What is the difference between "native shell exists" and "native runtime parity exists"?
   Follow-up: Which current Forge behaviors still inherit web constraints even in the native shell?
7. Why is local Android workflow important to Phase 4?
   Follow-up: What team behaviors improve when native setup is runnable from the repo root?
8. Why is UI modernization systems work rather than cosmetic polish?
   Follow-up: How did shell and page hierarchy changes alter product meaning, not just styling?
9. Why did Forge reject fake operator-console semantics during modernization?
   Follow-up: How can strong visuals still damage trust if the semantics become fictional?
10. Why are rendered browser audits a real engineering practice?
    Follow-up: Which kinds of layout failures are invisible to unit tests and code review alone?
11. Why was auth hardening part of product hardening rather than isolated auth work?
    Follow-up: How did redirect/popup behavior reveal deeper runtime-boundary issues?
12. Why does service worker behavior belong in release-risk conversations?
    Follow-up: How can one caching rule quietly break auth or runtime truth?
13. Why are Firestore rules and App Check part of frontend/system design here?
    Follow-up: How does source-controlled policy improve team reliability?
14. Why is a launch checklist an engineering artifact instead of a project-manager artifact?
    Follow-up: Which classes of failures become more likely without a written release gate?
15. Why does rollback planning need to distinguish Hosting, Functions, and rules?
    Follow-up: What goes wrong when rollback is treated as one generic action?
16. Why are operator-facing diagnostics valuable even in a single-user product?
    Follow-up: How do severity normalization and ownership hints reduce support confusion?
17. Why is "accepted limits" documentation part of release readiness?
    Follow-up: What trust problems appear when a product ships with vague capability claims?
18. How do you explain Forge's security and reliability posture without overselling it?
    Follow-up: Why is honest limitation framing a strength rather than a weakness?
19. What is the most important difference between launch readiness and feature completeness?
    Follow-up: Which parts of Forge were already feature-strong before Phase 4 but not yet launch-ready?
20. If Forge were handed to a new team tomorrow, which docs and commands would matter most?
    Follow-up: How do repo-owned runbooks reduce tribal knowledge risk during handoff?
