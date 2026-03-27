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
