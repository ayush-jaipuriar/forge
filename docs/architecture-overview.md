# Forge Architecture Overview

## Purpose

This document captures the Phase 1 architectural baseline that implementation should follow.

## Current Foundation

- React + Vite + TypeScript
- MUI-based custom theme layer
- Zustand reserved for UI and app state
- TanStack Query reserved for async and cache state
- Browser-router-based shell with feature route slices
- Query client and Firebase config boundaries created up front
- PWA plugin wired with a baseline manifest

## Milestone 1 Design System Additions

- Sora variable font loaded at the app entry point
- theme tokens expanded to include gradients, shadows, and state-aware surfaces
- reusable `SectionHeader`, `SurfaceCard`, `MetricTile`, `EmptyState`, `StatusBadge`, and `SyncIndicator` primitives
- responsive shell refined with desktop command strips, mobile drawer navigation, and sync-state visibility
- placeholder screens aligned to one shared visual language instead of repeated one-off card markup

## Milestone 2 Auth Boundary Additions

- centralized Firebase app, Auth, Firestore, and Google provider initialization
- `AuthSessionProvider` now owns auth-state observation, session restoration, and first-login bootstrap
- route guards separate authenticated app surfaces from the public sign-in entry route
- first successful login bootstraps the user document and a default settings document in Firestore
- tests now cover authenticated shell rendering, unauthenticated routing, and sign-in interaction wiring
- live project verification has now confirmed the real Google sign-in flow plus Firestore bootstrap for `users/{uid}` and `users/{uid}/settings/default`

## Milestone 3 Routine Engine Additions

- shared domain types now cover weekdays, day types, block kinds, workout states, confidence states, readiness states, and sync states
- the fixed weekly routine is encoded in a typed seed module instead of being implied by screen text
- prep taxonomy and workout schedule are also seeded through typed modules
- `generateDayInstance` converts routine templates into concrete day instances keyed by date
- fallback behavior is modeled as a transformation over generated instances rather than mutation of the source templates
- serialization helpers now provide a persistence-ready shape for day instances
- Today and Schedule now read from generated routine snapshots instead of hardcoded placeholder agendas
- Prep and Physical now also consume seed-derived snapshot helpers so the screens reflect taxonomy shape and workout schedule reality instead of placeholder prose

## Milestone 4 Persistence Foundation Additions

- repository interfaces now exist for day instances, settings, prep progress, workout logs, sleep logs, scores, and sync queue access
- IndexedDB is the first concrete local-first persistence layer for day instances, settings, and queued sync actions
- Today and Schedule now load through persistence-aware query hooks instead of reading directly from pure seed helper functions
- a sync provider observes online/auth state and surfaces sync health through shared UI state
- Firestore day-instance/settings adapters now exist as replay targets for queued writes
- day mode overrides now flow through a dedicated settings mutation service instead of transient UI state, which makes the generated workspace genuinely depend on persisted local settings

### Current Offline Assumptions

- day instances are keyed by date and treated as the primary operational record for execution state in the current foundation
- local IndexedDB state is the first read path for Today and Schedule so the app can recover the current workspace without depending on a fresh network round-trip
- queued sync actions are replayed only when the browser is online and the auth session is authenticated
- current replay order is FIFO by queue time, which is sufficient while writes are still coarse-grained and scoped to a small number of entity types
- day mode override writes are applied locally first, then the affected Today and Schedule queries are invalidated so the regenerated workspace reflects persisted state immediately
- failed sync items still count as outstanding local state and remain replayable on future sync attempts instead of being treated as safely settled
- singleton settings writes are coalesced so the most recent local settings snapshot replaces older queued settings upserts
- the Today mode-override card now surfaces the active execution stance and mutation lifecycle explicitly so local-first state changes feel intentional instead of invisible
- day-instance block completion and skip actions now use the same local-first mutation path, with the latest day snapshot replacing older queued day-instance writes
- Today workspace generation now also produces a projected score preview and derived war-state so the shell can react to execution changes through domain results instead of ad hoc UI math
- score preview now consumes explicit workout expectation, sleep-status placeholder, and readiness-pressure context, and the first recommendation engine reuses that same workspace context instead of duplicating heuristics in the UI
- daily sleep and energy signals now persist through the same settings sync path, and the Today screen keeps a lightweight recommendation history so rule shifts stay inspectable instead of feeling arbitrary
- block states now support complete, skip, move-later, and restore through one shared day-instance mutation path, which is the clearest practical sign that the Milestone 4 repository/sync foundation is holding together

## Milestone 5 Today Flow Additions

- Today is now a fuller mobile-first execution surface rather than a status dashboard: the page leads with the current operating posture, recommendation access, quick-signal inputs, and the live agenda in one long scrollable flow
- fallback guidance is now surfaced explicitly as a dedicated interaction card when support signals or score pressure imply that the current mode is no longer honest
- the fallback card is intentionally one-tap actionable so the user can compress the day without navigating away or editing the routine itself
- block execution notes are stored directly on block instances as lightweight execution context, which keeps them local-first, syncable, and attached to the actual execution record instead of becoming a separate journaling system
- note capture remains optional and inline because the product goal is operational clarity, not forcing the user into post-hoc documentation during the day
- Today-focused component tests now cover the explicit fallback interaction and the lightweight note-capture flow so the primary execution loop has regression protection

## Milestone 6 Schedule Guardrails

- Schedule now operates as a week-level control surface, not a routine editor: it can reclassify a date into an allowed seeded day type, activate fallback modes, and apply sanctioned block-state changes
- day-type overrides are persisted in settings by date and validated against weekday-specific rules before they are accepted
- weekday overrides can only move within weekday-compatible shapes plus fallback types, and weekend overrides stay inside weekend shapes plus fallback types
- choosing the seeded day type again clears the override instead of storing redundant override state
- Schedule exposes block actions only through allowed transition helpers, which keeps operational recovery visible without opening arbitrary editing
- the explicit boundary is: users may reclassify a date and mutate execution state, but they may not change template structure, reorder seeded blocks globally, or author new routine shapes from the UI

## Milestone 7 Support-Surface Assumptions

- Prep, workout, and sleep state now ride on the same local-first settings snapshot used for other lightweight Phase 1 operational state, which keeps the persistence model simple while the product still has one operator and a narrow set of write paths
- Prep progress is modeled per topic with confidence, exposure state, revision count, solved count, hours spent, and lightweight notes; readiness is derived from those signals instead of being manually edited
- Readiness remains a Phase 1 heuristic, not a predictive model: it combines topic confidence, coverage, and effort into domain states plus a pace estimate, and it should be treated as honest directional pressure rather than a precise forecast
- Physical tracking is intentionally lightweight: workout logging supports done, skipped, and rescheduled states plus a quick note or miss reason, but does not drift into set/rep detail
- Manual sleep logging now uses duration as the primary input, and target-met status is derived against a temporary 7.5-hour Phase 1 threshold so the UI stays fast while leaving room for future device sync and smarter personalization

## Milestone 8 Scoring and Recommendation Principles

- projected score now uses weighted categories rather than flat completion counting: prime execution, prep continuity, physical execution, discipline, and day-type compliance are all intentionally separate so low-value tasks cannot wash out strategic misses
- deep-work-weighted days now apply explicit score ceilings when the prime required-output block is skipped, and an even lower ceiling applies if low-value completions are used to pad the day afterward
- block-duration fallback defaults are now part of the score model because several seeded deep-work and prep blocks are intentionally flexible; without that fallback, the score engine would undercount realistic prep capacity
- earned score is no longer required to start at zero: a fresh day can hold a small discipline baseline before execution lands, which reflects preserved focus rather than fake accomplishment
- recommendation rules now run in explicit precedence order and return a `ruleKey` so the Today surface, tests, and future analytics can all inspect why a recommendation fired
- the current precedence is: protect conflict boundary, missed-prime salvage, critical stabilization, fallback downgrades, closing workout window, stale low-value move-later, morning prime execution, WFO recovery shift, finish current block, then advance top priority
- recommendation context now includes actual workout state, readiness pace, fallback posture, sleep, energy, and score pressure from the same workspace generation path, which keeps the engine strict without duplicating UI-only heuristics

## Milestone 9 PWA and Hosting Assumptions

- the app now ships with a richer manifest, real install icons, and a service worker generated from the production build rather than relying on a minimal placeholder setup
- runtime caching is intentionally narrow and shell-focused: navigations use `NetworkFirst`, core shell assets use `StaleWhileRevalidate`, and images use `CacheFirst`; this keeps the app resilient without pretending that all remote data is offline-safe
- install, update, offline, and queued-state messaging now live in the app shell itself so the operator does not have to infer state from browser chrome or missing network indicators
- Firebase Hosting is now configured as an SPA target with explicit rewrite and cache-header behavior, which keeps deployed routing and service-worker refresh semantics aligned with the local production preview
- browser verification has now been completed on both desktop Chromium and a real Android Chrome device, including installability surfaces and cached-shell recovery after the origin was stopped

## Milestone 10 Calendar Boundary Assumptions

- calendar scaffolding now lives in typed domain models rather than UI placeholders alone, which means future provider integration can arrive without redefining settings or recommendation inputs
- the settings model now stores a `calendarIntegration` snapshot with provider status, feature-gate framing, managed-event mode, and selected-calendar ids; this replaces the older boolean placeholder with something future work can actually extend
- the Google Calendar service boundary is intentionally placeholder-only in Phase 1: it normalizes connection state, exposes a recommendation-ready collision context, and formats `[FORGE]` event metadata previews, but it does not perform provider reads or writes yet
- recommendation context now accepts typed calendar conflict input, and the top-precedence conflict-protection rule is already wired to respect that future context without changing the surrounding recommendation stack later
- the Settings screen is now the operational home for this scaffolding, which keeps integration state visible without leaking provider assumptions into Today or Schedule prematurely

## Phase 2 Milestone 0 Analytics Contracts

- a dedicated analytics domain contract layer now exists in [types.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/domain/analytics/types.ts) so future charts, projections, Functions, and insight cards all target one shared vocabulary instead of inventing their own shapes
- the contract set defines rolling-window keys, time bands, versioned analytics snapshots, projection snapshots, insight outputs, streak snapshots, missions, and analytics metadata
- snapshot shapes are deliberately versioned and source-range-aware because Phase 2 business meaning will evolve more than Phase 1 did, and silent semantic drift would make analytics hard to trust
- repository interfaces now include analytics snapshots, projections, insights, streaks, missions, and metadata, which creates the seam needed for later Firestore and Functions implementations without forcing infrastructure decisions into the domain layer yet
- default factories intentionally start projections and momentum in `insufficientData` states rather than pretending precision exists before enough history is available

## Phase 2 Milestone 1 Hardening Boundary

- Firestore policy is now repo-managed through [firestore.rules](/Users/ayushjaipuriar/Documents/GitHub/forge/firestore.rules) and [firestore.indexes.json](/Users/ayushjaipuriar/Documents/GitHub/forge/firestore.indexes.json), which means access control and query posture are no longer hidden in console state alone
- the current rules keep the data model owner-scoped and deny deletes by default, which is a sensible conservative posture while the product is still single-user and analytics collections are beginning to expand
- Forge now has an App Check bootstrap boundary in [appCheck.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/lib/firebase/appCheck.ts); local development intentionally skips App Check while real deployed environments can opt in via a site key
- a lightweight monitoring seam now exists in [monitoringService.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/monitoring/monitoringService.ts), and auth, sync, and App Check failures already route through it so later observability providers can attach without changing failure call sites again
- the security provider is intentionally a thin app-shell concern rather than a domain concern, because rollout posture belongs near environment bootstrap, not inside execution logic

## Phase 2 Milestone 2 Analytics Derivation Foundation

- analytics now has a per-day fact layer in [facts.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/domain/analytics/facts.ts), which converts day instances, score previews, sleep state, workout state, and focused prep domains into stable daily records instead of asking charts to interpret raw execution state themselves
- rolling and weekly summary builders now live in [rollups.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/domain/analytics/rollups.ts), which means summary metrics, chart-ready breakdowns, source ranges, and rolling-window filtering are all domain responsibilities rather than future UI logic
- the local day-instance repository now supports historical listing, which is the minimum persistence capability needed for analytics to reason across real history instead of just the current workspace
- a first analytics persistence service now exists in [analyticsPersistenceService.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/analytics/analyticsPersistenceService.ts), and it intentionally derives rolling snapshots from canonical source records plus current settings rather than from screen-specific view models
- the current derivation model is honest about its limits: block and score history are real, but prep-hours-by-domain still rely on current progress snapshots until deeper historical prep logging exists in later milestones

## Phase 2 Milestone 3 Functions Snapshot Pipeline

- a dedicated Firebase Functions workspace now exists in [functions/package.json](/Users/ayushjaipuriar/Documents/GitHub/forge/functions/package.json), which keeps server-side analytics generation inside the Firebase ecosystem without forcing a full backend extraction
- the shared snapshot-generation logic lives in [snapshotGeneration.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/analytics/snapshotGeneration.ts), while the Functions layer in [pipeline.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/functions/src/analytics/pipeline.ts) focuses on Firestore fetch and persist orchestration
- the first pipeline persists daily, weekly, and rolling analytics snapshots plus a default readiness projection and analytics metadata, which is the minimum durable derived-state footprint needed before Command Center UI depth begins
- readiness projection logic now has a real contract in [projections.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/domain/analytics/projections.ts); the current model is intentionally simple and explainable rather than pretending to be a sophisticated forecast engine already
- this split matters architecturally because it lets the browser and Functions reuse the same derivation semantics, which reduces the risk of analytics drift between client-side exploration and server-side snapshot generation

## Phase 2 Milestone 4 Command Center Shell

- a dedicated Command Center feature now exists under [src/features/command-center](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/command-center), which keeps the analytics cockpit separate from Today/Readiness instead of letting one oversized page become the product’s analytics layer
- [commandCenterWorkspaceService.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/analytics/commandCenterWorkspaceService.ts) is the important new application seam: it transforms snapshot bundles into a page-ready workspace with summary cards, chart-series inputs, warning cards, and lightweight insights so the React tree stays mostly declarative
- the first visualization primitives in [ChartCard.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/command-center/components/ChartCard.tsx), [ProjectionPanel.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/command-center/components/ProjectionPanel.tsx), [WarningCard.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/command-center/components/WarningCard.tsx), and [InsightCard.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/command-center/components/InsightCard.tsx) establish the Command Center’s visual vocabulary before deeper chart density begins
- Milestone 4 is intentionally honest about analytics maturity: some “insights” are still lightweight heuristics and the page leans on insufficient-data states where history is shallow, which is better than pretending the pattern engine already exists
- the route is now wired directly into the main shell and navigation, which means analytics is no longer only a future document topic; it is a real operator-facing surface with a desktop-first information architecture
- the first review pass tightened two important trust boundaries: query failures now render as explicit error states instead of infinite loading, and the prep-domain panel now derives a window-scoped approximation from historical facts instead of presenting global current-state prep totals as if they were rolling-window history

## Phase 2 Milestone 5 Core Charts

- the Command Center now renders the PRS-priority chart stack in a real form instead of only a shell: projected readiness curve, prep topic hours, sleep-performance comparison, WFO vs WFH comparison, best-performing time-window view, completion heatmap, deep-block trend, gym-productivity comparison, streak calendar, and score trend
- the semantic chart-derivation layer now lives in [chartData.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/domain/analytics/chartData.ts), which matters because chart meaning is now testable and reusable instead of being hidden in ad hoc page code
- Milestone 5 is intentionally mixed in its data sources: some charts are truly rolling-window fact views, while prep topic hours still come from cumulative topic progress; the repo now documents that distinction explicitly instead of flattening both into one “hours” story
- the heatmap and streak calendar deliberately avoid pretending the full disciplined gamification system already exists; they provide a clear operational precursor while leaving the formal streak engine for Milestone 7
- the first Milestone 5 review pass also tightened three trust boundaries: unknown sleep logging no longer qualifies as a meaningful sleep-performance comparison on its own, the time-window chart is now framed explicitly as execution reliability rather than deeper cognitive scoring, and streak-cell emphasis now uses the same threshold as streak counting

## Phase 2 Milestone 6 Pattern Detection Engine

- the analytics rule engine now lives in [insights.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/domain/analytics/insights.ts), which is the first real boundary between raw chart data and explainable coaching logic; this matters because warnings and insights are now generated from modular rules instead of page-local heuristics
- rule outputs are standardized through [types.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/domain/analytics/types.ts) with explicit `ruleKey`, `severity`, `confidence`, and evidence payloads, so the UI can render cards, warnings, and summaries from one shared contract rather than custom branching per rule
- the Command Center application seam in [commandCenterWorkspaceService.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/analytics/commandCenterWorkspaceService.ts) now evaluates rule outputs once, then maps them into three operator-facing layers: warning cards, insight cards, and a single coach summary that compresses the highest-priority signal into one opening narrative
- the page itself in [CommandCenterPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/command-center/pages/CommandCenterPage.tsx) now surfaces that coach summary explicitly, which is important product-wise because the PRS wants analytical, coach-like guidance rather than forcing the user to mentally synthesize ten charts every time
- the current rule set covers the PRS-priority categories that already have stable evidence inputs: sleep versus prep quality, gym versus mental performance, topic neglect, weekend utilization, missed or reliable time windows, pace prediction, WFO versus WFH differences, deep-block trend, readiness pace, behind-target pressure, and low-energy success patterns
- rule precedence is intentionally severity-first and confidence-second, with `critical` and `warning` signals outranking `info`; this keeps the most operationally urgent insight at the top without pretending the engine is a black box
- Milestone 6 is still deliberately explainable rather than predictive: these outputs are evidence-backed heuristics derived from rolling facts, not machine-learning forecasts, and the repo now documents that boundary explicitly in the dedicated insight-rule doc

## Phase 2 Milestone 7 Disciplined Gamification

- the formal streak, mission, and momentum derivation layer now lives in [gamification.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/domain/analytics/gamification.ts), which is important because this milestone keeps “gamification” inside the analytics domain instead of turning it into a separate reward toy with unrelated rules
- streak continuity is now grounded in explicit category semantics: execution, deep work, prep, workout, sleep, and logging each have their own relevance rules, success rules, and break reasons, so continuity pressure reflects actual behavior rather than generic checkbox counting
- weekly missions are selected from deficits and leverage points instead of random achievement prompts; the current mission engine uses projection pressure, underweight prep breadth, sleep drag, workout drift, weekend softness, and WFO continuity gaps to decide what deserves weekly attention
- momentum now weights recent score quality, strong-day rate, deep-work continuity, output capture, recovery, and penalties for prime misses or fallback dependence, which is the main anti-gamification guardrail keeping low-value completions from cheaply inflating the surface
- the Command Center workspace in [commandCenterWorkspaceService.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/analytics/commandCenterWorkspaceService.ts) now exposes `momentum`, `streaks`, `missions`, and an operating-posture summary, while the page consumes them through reusable presentation components instead of embedding derivation logic into React
- the old “precursor” streak calendar is now tied to the formal streak engine, and Milestone 7 adds dedicated components for momentum, mission progress, and category streak summaries so the visual layer can deepen without inventing new business meaning card by card

## Phase 2 Milestone 8 Operational Analytics Surfacing

- the shared cross-screen analytics seam now lives in [operationalAnalyticsService.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/analytics/operationalAnalyticsService.ts), which matters because Today, Readiness, and Schedule are now consuming the same projection, warning, and mission meaning instead of inventing their own screen-local interpretations
- Today now receives compact execution-layer pressure through [TodayPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/today/pages/TodayPage.tsx): behind-target risk, protect-this-window prompts, streak-break risk where relevant, and the top weekly mission when it changes immediate behavior
- Readiness now surfaces intervention-layer signals through [ReadinessPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/readiness/pages/ReadinessPage.tsx), which is the right place for pace-risk and breadth-risk alerts because that page already owns the target-date interpretation
- Schedule now carries week-level planning pressure and date-scoped protection tags through [SchedulePage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/schedule/pages/SchedulePage.tsx), which keeps WFO continuity and weekend utilization warnings close to the planning decisions they should influence
- the reusable [OperationalSignalCard.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/components/common/OperationalSignalCard.tsx) intentionally keeps the UI layer small and serious; the design goal is to make these warnings feel like operational pressure, not like mini dashboard widgets
- this milestone is disciplined about scope: operational pages get compressed, high-value signals only, while Command Center remains the place for deeper chart context and broader pattern explanation

## Phase 2 Milestone 9 Hardening and Supportability

- analytics interpretation now has a shared service boundary in [analyticsInterpretationService.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/analytics/analyticsInterpretationService.ts), which consolidates rolling-window chart semantics, rule evaluation, and gamification derivation so multiple analytics consumers do not duplicate the same heavy work
- [commandCenterWorkspaceService.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/analytics/commandCenterWorkspaceService.ts) and [operationalAnalyticsService.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/analytics/operationalAnalyticsService.ts) now both consume that shared interpretation seam, which reduces immediate duplicate work and gives future performance tuning one obvious place to target
- the repo now carries explicit hardening docs for Phase 2 performance, release gating, and heuristic limits, which matters because analytics products become hard to trust long before they become hard to compile
- the Phase 2 boundary is now explicitly closed in documentation: analytics depth, streaks, missions, momentum, and operational surfacing belong here; real Calendar sync, notifications, export, and deeper orchestration remain Phase 3 work

## Phase 3 Milestone 0 Foundation and Contracts

- Phase 3 now has dedicated domain contracts for notifications in [src/domain/notifications/types.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/domain/notifications/types.ts), sync diagnostics and conflict metadata in [src/domain/sync/types.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/domain/sync/types.ts), backup and restore schemas in [src/domain/backup/types.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/domain/backup/types.ts), and health-integration scaffolding in [src/domain/health/types.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/domain/health/types.ts)
- the important design choice is separation: these contracts define durable integration records without forcing the existing Phase 1 and 2 settings document to absorb every new responsibility prematurely
- calendar scaffolding in [src/domain/calendar/types.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/domain/calendar/types.ts) now includes explicit sync-state, mirror-record, and external-event-cache types, which gives later Calendar milestones stable shapes for read integration, write mirroring, and reconciliation
- repository seams in [src/data/repositories/types.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/data/repositories/types.ts) now cover notification state and logs, sync diagnostics and conflicts, backup and restore records, Calendar state and mirror records, and health-integration state; that matters because later services can be built against one interface vocabulary instead of inventing persistence assumptions ad hoc
- the new contract test in [src/tests/domain/phase-3-contracts.spec.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/tests/domain/phase-3-contracts.spec.ts) protects the most important defaults: notification caps, sync-health baselines, backup versioning and retention posture, Calendar sync defaults, and honest provider-scaffolding states for health integrations

## Phase 3 Milestone 1 Sync Hardening and Diagnostics

- sync meaning is no longer limited to `stable`, `syncing`, and `queued`; [src/domain/common/types.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/domain/common/types.ts) and [src/components/status/SyncIndicator.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/components/status/SyncIndicator.tsx) now support `stale`, `conflicted`, and `degraded` states so the shell can describe real operational risk instead of flattening everything into a generic queue badge
- the decision logic for those states now lives in [src/services/sync/syncHealthService.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/sync/syncHealthService.ts), which matters because stale replay backlog, failed queue items, and open conflicts now have one shared interpretation path instead of ad hoc status guesses in UI code
- local IndexedDB now includes durable sync diagnostics and conflict stores through [src/data/local/forgeDb.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/data/local/forgeDb.ts), [src/data/local/localSyncDiagnosticsRepository.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/data/local/localSyncDiagnosticsRepository.ts), and [src/data/local/localSyncConflictRepository.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/data/local/localSyncConflictRepository.ts); this is the first step toward explicit repair and reconciliation behavior instead of ephemeral shell-only status
- explicit entity-level conflict policy now lives in [src/domain/sync/conflicts.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/domain/sync/conflicts.ts); the important product choice is that settings and day instances stay on documented snapshot-replacement semantics for now, while Calendar conflicts are intentionally reserved for manual review instead of silent merging
- [src/services/sync/SyncProvider.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/sync/SyncProvider.tsx) now persists diagnostics snapshots, emits monitoring signals when sync health degrades, and avoids pretending that failed replay or open conflicts are just “queued” work waiting patiently
- the PWA/platform status layer in [src/features/pwa/pwaStatus.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/pwa/pwaStatus.ts) now reflects the richer sync vocabulary too, which keeps installability and cached-shell messaging aligned with the actual data-trust posture of the app
- new tests in [src/tests/services/sync-health.spec.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/tests/services/sync-health.spec.ts), [src/tests/sync-provider.spec.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/tests/sync-provider.spec.tsx), [src/tests/pwa-status.spec.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/tests/pwa-status.spec.ts), and [src/tests/ui-primitives.spec.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/tests/ui-primitives.spec.tsx) protect the new stale/degraded/conflicted semantics from regressing back into the older coarse model

## Phase 3 Milestone 2 Notification Rules and Delivery Foundation

- notifications now have a dedicated rule engine in [src/domain/notifications/rules.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/domain/notifications/rules.ts), which matters because the app’s notification behavior is now derived from real execution pressure and fallback logic instead of a disconnected reminder system
- the current supported rules are tightly bounded to the PRS priorities: missed critical block, fallback mode suggestion, and weekly summary; the app intentionally does not expose a generic reminder composer or broader engagement-notification layer
- browser and installed-PWA notification delivery now flows through [src/services/notifications/browserNotificationService.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/notifications/browserNotificationService.ts), while [src/services/notifications/notificationEligibilityService.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/notifications/notificationEligibilityService.ts) and [src/services/notifications/notificationDeliveryService.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/notifications/notificationDeliveryService.ts) keep rule evaluation separate from transport and logging concerns
- notification state now persists locally through [src/data/local/localNotificationStateRepository.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/data/local/localNotificationStateRepository.ts) and [src/data/local/localNotificationLogRepository.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/data/local/localNotificationLogRepository.ts); that gives Forge durable permission state, delivery counters, and recent-notification visibility instead of ephemeral in-memory behavior
- the app shell now includes [src/features/notifications/providers/NotificationProvider.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/notifications/providers/NotificationProvider.tsx), which evaluates notification eligibility when the authenticated app becomes active without forcing notification logic into Today or Settings components
- notification preference stays part of the synced user settings snapshot through [src/services/settings/notificationPreferenceService.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/settings/notificationPreferenceService.ts), while permission and delivery reality stay in the notification subsystem; this separation keeps user intent distinct from browser capability
- the Settings surface in [src/features/settings/pages/SettingsPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/settings/pages/SettingsPage.tsx) now exposes the actual notification posture: enabled state, permission state, daily cap, supported channels, permission request action, and recent notification records
- the dedicated notification doc in [docs/notification-delivery-rules.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/notification-delivery-rules.md) now records the most important guardrails explicitly: browser/PWA channels only, daily cap of three, operational copy tone, and the current milestone’s intentionally limited scheduling scope

## Phase 3 Milestone 3 Scheduled Notification Orchestration

- notification evaluation now has a shared pure workspace builder in [src/services/notifications/notificationWorkspaceService.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/notifications/notificationWorkspaceService.ts), which matters because both the client and the scheduled Functions path now derive notification meaning from the same source records instead of maintaining two separate rule contexts
- scheduled notification idempotency and run metadata now live in [src/services/notifications/scheduledNotificationRunService.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/notifications/scheduledNotificationRunService.ts); the key design choice is that scheduling attempts are recorded separately from notification logs so duplicate or skipped evaluations remain visible instead of disappearing
- the Functions entry points in [functions/src/index.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/functions/src/index.ts) now include both per-user and scheduled notification evaluation, and the orchestration pipeline in [functions/src/notifications/pipeline.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/functions/src/notifications/pipeline.ts) persists `notificationState`, `notificationLog`, and `notificationRuns` records for scheduled evaluations
- Firestore rules in [firestore.rules](/Users/ayushjaipuriar/Documents/GitHub/forge/firestore.rules) now include the Phase 3 notification collections so the data model stays explicit as scheduled metadata begins to exist
- the scheduling doc in [docs/notification-scheduling-operations.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/notification-scheduling-operations.md) captures the most important honesty boundary: scheduled Functions can evaluate and persist browser-notification candidates, but they do not magically create native background push delivery
- focused tests in [src/tests/services/scheduled-notification-runs.spec.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/tests/services/scheduled-notification-runs.spec.ts) protect the idempotent run-record helpers, while the shared notification-rule tests continue proving that the client and scheduled path are using the same rule semantics
- the Functions workspace now follows a clearer server-build split: [functions/tsconfig.json](/Users/ayushjaipuriar/Documents/GitHub/forge/functions/tsconfig.json) handles typechecking for entrypoints and reachable shared server-safe modules, while [functions/package.json](/Users/ayushjaipuriar/Documents/GitHub/forge/functions/package.json) uses `tsup` to bundle deployable output and rewrite shared path-alias imports into runtime-safe JS
- local verification has now confirmed `npm run typecheck`, `npm run build`, and `npm run lint` inside `functions/`; the remaining caveat is runtime parity, because the local machine used for verification is on Node 22 while Firebase Functions is configured for Node 20

## Phase 3 Milestone 4 Backup and Restore Foundation

- backup and restore now have a real local-first service layer in [src/services/backup/backupService.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/backup/backupService.ts), [src/services/backup/restoreService.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/backup/restoreService.ts), and [src/services/backup/browserDownload.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/backup/browserDownload.ts), which matters because manual export is no longer just “dump some JSON”; it now has versioning, metadata, note export, validation, and partial-restore reporting
- the Phase 3 backup contract in [src/domain/backup/types.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/domain/backup/types.ts) now includes the actual user snapshot plus notification state inside integration exports, which closes an earlier schema mismatch between restore counts and what the payload could carry
- local IndexedDB now persists backup records, restore-job records, and saved export payloads through [src/data/local/forgeDb.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/data/local/forgeDb.ts), [src/data/local/localBackupRepository.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/data/local/localBackupRepository.ts), [src/data/local/localRestoreJobRepository.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/data/local/localRestoreJobRepository.ts), and [src/data/local/localExportPayloadRepository.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/data/local/localExportPayloadRepository.ts); this is important because scheduled backup work in Milestone 5 can now reuse one metadata model instead of inventing a second backup ledger
- the Settings surface in [src/features/settings/pages/SettingsPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/settings/pages/SettingsPage.tsx) now exposes backup JSON export, markdown note export, staged restore loading, restore warnings, and recent backup/restore metadata instead of hiding durability behind future docs only
- restore is intentionally partial-aware: settings, day instances, notification state, and calendar connection posture are restored locally, while analytics, sync diagnostics, health scaffolding, and auth identity are reported honestly as regenerated or provider-owned state rather than being silently spoofed back into place
- restore now also clears any outstanding local sync queue items before completion, which is an important safety rule because stale pre-restore mutations should not be allowed to replay over newly restored local state later
- the restore hook in [src/features/settings/hooks/useApplyRestoreStage.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/settings/hooks/useApplyRestoreStage.ts) now refreshes the real affected workspaces, including the weekly schedule view and Command Center, instead of relying on a partial or mismatched invalidation set
- the Settings backup surface now renders success and failure outcomes for manual export and restore actions, which makes the durability UX more trustworthy than the earlier silent-mutation version
- the operational guide in [docs/backup-and-restore-operations.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/backup-and-restore-operations.md) now records the export contents, staged-restore behavior, schema-version rule, and current limits ahead of scheduled backups

## Phase 3 Milestone 5 Scheduled Backups and Retention

- scheduled backup generation now runs through Firebase Functions in [functions/src/backups/pipeline.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/functions/src/backups/pipeline.ts) and the scheduler entry point in [functions/src/index.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/functions/src/index.ts); the current default cadence is once daily at `03:30 Asia/Kolkata`
- the shared backup builder and retention logic now live in [src/services/backup/backupSerialization.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/backup/backupSerialization.ts), which matters because manual export and scheduled backup generation now share one payload format, one metadata model, and one retention policy instead of drifting apart
- backup operations now have a dedicated snapshot in [src/domain/backup/types.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/domain/backup/types.ts), persisted locally through [src/data/local/localBackupOperationsRepository.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/data/local/localBackupOperationsRepository.ts) and remotely through `users/{uid}/backupOperations/default`; this gives Forge a real notion of backup health, freshness, latest successful backup, and last failure message
- the default retention policy is now explicit and test-protected: keep `7` daily scheduled backup dates, `8` weekly scheduled windows beyond those daily keeps, and `20` manual backups; expired backup metadata is retained with status markers while heavy payload documents are deleted
- [src/services/backup/backupOperationsService.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/backup/backupOperationsService.ts) and [src/services/settings/settingsWorkspaceService.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/settings/settingsWorkspaceService.ts) now surface backup health into Settings, including freshness, retention posture, source (`local` vs `remote`), and the latest failure message when a scheduled run degrades
- [src/services/backup/backupOperationsService.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/backup/backupOperationsService.ts) now also emits backup-domain monitoring events when scheduled protection is observed as `stale` or `degraded`, which makes missed or failed backup coverage visible to future tooling instead of leaving that risk trapped in stored state alone
- those backup monitoring events are now deduplicated by observed health signature rather than firing on every workspace read, which keeps the monitoring stream aligned with state transitions instead of React Query refetch frequency
- the Settings backup workspace now separates provenance for backup health vs recent backup history, which matters because remote backup-operations state can be available even when the recent backup list is still falling back to local metadata
- the Settings surface in [src/features/settings/pages/SettingsPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/settings/pages/SettingsPage.tsx) now distinguishes backup protection from manual export history, which is an important product honesty improvement because clicking export once should not make the system look durably protected
- Firestore rules in [firestore.rules](/Users/ayushjaipuriar/Documents/GitHub/forge/firestore.rules) now include the Phase 3 backup collections for client read visibility: `backups`, `backupPayloads`, and `backupOperations`
- focused retention coverage now exists in [src/tests/domain/backup-retention.spec.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/tests/domain/backup-retention.spec.ts), and local/runtime verification has confirmed root build success plus Functions `typecheck`, `build`, and `lint`; Node 20 parity is also now verified for the Functions build path rather than remaining an assumption
- the main remaining backup architecture risk is payload-body size: full scheduled backup payloads are still stored as single Firestore documents today, so the planned next step is to move heavy payload bodies to Cloud Storage or a chunked manifest model while keeping backup metadata in Firestore

### Current Conflict Strategy and Limits

- the current foundation favors predictable local continuity over sophisticated merge behavior
- for day instances, the practical near-term strategy is whole-record upsert by date until block-level mutation commands exist
- this means explicit field-level merges are intentionally deferred; Milestone 4 closes with documented coalescing plus whole-record upserts rather than pretending merge complexity is already solved
- Firestore adapters are intentionally thin so conflict policy can evolve in the application/domain layer instead of being buried inside integration code

## Layer Boundaries

### Presentation

- route shell
- feature pages
- reusable layout and status components

### Application

- use-case orchestration
- state composition between repositories and UI

### Domain

- routine generation
- scoring
- recommendations
- readiness logic

### Data

- Firestore repositories
- local cache and sync queue adapters
- seed loaders

## Immediate Milestone 0 Notes

- The starter demo app has been replaced with a route-based shell.
- The theme now reflects Forge's dark, disciplined product direction.
- Path aliases, Vitest, and a baseline PWA config are in place.
- Firebase is represented by config boundaries now and will be wired for real flows in Milestone 2.

## Milestone 1 Notes

- The shell now uses explicit status, navigation, and surface patterns that can scale with feature complexity.
- Empty and placeholder states have a deliberate visual pattern, which matters because several Phase 1 sections will stay partially scaffolded for a while.
- The design system now provides enough shared structure to build real screens without drifting into inconsistent per-page styling.
