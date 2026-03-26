# Forge Phase 1 Spec and Implementation Plan

## Document Purpose

This document translates the product requirements in [PRS.md](../PRS.md) into a Phase 1 implementation specification and execution checklist.

It is designed to do two jobs:

1. Define the architecture and scope of Phase 1 clearly enough that implementation decisions stay aligned with the product intent.
2. Break the work into logical milestones with checklists so implementation progress can be tracked cleanly.

This plan follows the clarified constraints for Phase 1:

- Phase 1 must end with real Firebase wiring in place.
- Architecture quality takes priority over the fastest possible vertical slice when tradeoffs appear.
- Testing and documentation must be embedded into every milestone.
- Google Calendar work in Phase 1 is scaffolding only, not full integration.

## Phase 1 Outcome

By the end of Phase 1, Forge should be a production-quality foundational application that supports the core execution loop:

- authenticate with real Firebase Auth using Google Sign-In
- load seeded routine, prep taxonomy, and workout schedule data
- generate and display day instances and block structure
- support daily execution from a mobile-first Today screen
- allow lightweight logging for prep blocks, workouts, sleep, and day-state changes
- compute and display daily scoring and core readiness basics
- work as an installable PWA
- support offline-first behavior for the most critical user actions
- persist core data through Firestore with clean client-side domain and repository boundaries
- include calendar scaffolding that does not force a future rewrite

Phase 1 is not just a visual prototype. It must be architecturally durable and operationally real.

## Product Intent to Preserve

The implementation must preserve these non-negotiable product truths from [PRS.md](../PRS.md):

- Forge is a personal execution OS, not a generic habit tracker.
- Mobile is the primary daily execution surface.
- Desktop is important for planning clarity and future analytics depth.
- The routine is fixed in V1 and configurable through code, not editable through the UI.
- Deep work is the highest-value behavioral unit.
- Low-friction logging is central to retention.
- The app must feel strict but adaptive.
- The UI must feel premium dark, serious, sharp, and disciplined.
- Architecture must remain ready for future analytics, notifications, calendar integration, and health providers.

## Phase 1 Scope

## In Scope

- app shell, routing, layout, and responsive navigation
- design system and premium dark theme
- Firebase project wiring for Auth, Firestore, and Hosting-ready app configuration
- Google Sign-In authentication flow
- seeded routine templates and day-type configuration
- day-instance generation and block-instance modeling
- Today screen core workflow
- Schedule screen operational controls
- Prep screen with seeded taxonomy and progress tracking
- Physical screen with lightweight workout and sleep logging
- Readiness basics
- scoring engine
- rules-based recommendation engine for "What should I do now?"
- offline basics, local cache strategy, and queued writes for critical actions
- PWA baseline
- calendar service boundary and scaffolding
- testing foundation for core domain logic
- implementation documentation, architecture documentation, setup guidance, and environment examples

## Explicitly Out of Scope

- full Command Center analytics UI
- advanced pattern detection dashboards
- full Google Calendar read/write integration
- browser push notification production flows
- export/backup completeness beyond architecture preparation
- health provider integrations
- routine editing UI
- multi-user product flows
- detailed bodybuilding logging
- AI assistant behavior

## Phase 1 Success Criteria

Phase 1 is complete only if all of the following are true:

- a user can sign in with Google through Firebase Auth
- the app can load and render seeded routine and taxonomy structures
- the Today screen supports real day execution with quick actions
- day mode and fallback state can be changed and reflected in recommendations and score
- prep progress, workout status, and sleep logs persist correctly
- core write actions remain usable offline and sync when connection returns
- the app is installable as a PWA on supported browsers
- scoring and recommendation logic are covered by unit tests
- Firebase setup, environment setup, architecture boundaries, and deployment path are documented
- code structure clearly separates UI, domain logic, repositories, and integration adapters

## Architecture Principles

## 1. Domain-First Frontend Architecture

Even though Forge is a frontend-led Firebase application in Phase 1, the code should be structured as if the domain model matters more than the UI layer.

This means:

- business rules live outside components
- repositories abstract persistence details
- services coordinate domain use cases
- presentation state stays separate from domain state where practical
- Firebase-specific code is isolated behind adapters

This reduces rewrite risk when future backend or integration complexity arrives.

## 2. Config-Driven Routine Engine

The routine must be fixed in V1 but maintainable through structured config.

This means:

- routine templates should be seeded in typed config or seed modules
- day types and block definitions should be modeled explicitly
- day generation should derive instances from config plus override state
- UI should operate on generated instances, not on hardcoded JSX rules

## 3. Offline-First for Critical Actions

Phase 1 does not need perfect offline sophistication, but it must be intentionally local-first for the primary user loop.

This means:

- Today screen data should have a cached local representation
- completion actions should update local state immediately
- writes should be queued when offline
- sync state should be visible but subtle
- conflict handling should favor predictable, safe merges for per-day operational data

## 4. Mobile-First Execution, Desktop-Ready Structure

The layout must not treat mobile as a reduced desktop analytics screen.

This means:

- Today screen is designed first around touch-first execution
- navigation and quick actions are optimized for thumb reach and minimal friction
- desktop layouts can expand density, visibility, and context without changing core flows

## 5. Phase Boundary Discipline

Phase 2 and Phase 3 features should influence architecture, not inflate Phase 1 scope.

This means:

- create clean extension points for analytics, notifications, and calendar
- do not build full advanced features early
- do not bury future capability assumptions inside current UI logic

## Proposed High-Level Architecture

## Application Layers

### Presentation Layer

- route layouts
- screens
- reusable UI components
- screen-specific hooks
- visual state and interaction models

### Application Layer

- use-case services
- command handlers for user actions
- orchestration logic for scoring refresh, recommendation refresh, and sync events

### Domain Layer

- entity types
- value objects and enums
- scoring rules
- recommendation rules
- routine/day/block generation logic
- readiness calculations
- validation helpers

### Data Layer

- repository interfaces
- Firebase repository implementations
- local persistence and offline queue adapters
- seed loaders and serializers

### Integration Layer

- Firebase Auth adapter
- Firestore adapter
- service worker and cache integration
- Google Calendar client boundary and placeholder implementation

## Proposed Folder Structure

This is the target structure Phase 1 should build toward.

```text
src/
  app/
    providers/
    router/
    store/
    theme/
  components/
    common/
    layout/
    status/
    charts/
  features/
    auth/
      components/
      hooks/
      services/
    today/
      components/
      hooks/
      services/
    schedule/
      components/
      hooks/
    prep/
      components/
      hooks/
      services/
    physical/
      components/
      hooks/
      services/
    readiness/
      components/
      hooks/
    settings/
      components/
      hooks/
  domain/
    routine/
    execution/
    prep/
    physical/
    readiness/
    scoring/
    recommendation/
    analytics/
    calendar/
    common/
  data/
    repositories/
    firebase/
    local/
    seeds/
    mappers/
  services/
    sync/
    notifications/
    calendar/
  lib/
    firebase/
    query/
    date/
    utils/
  workers/
  tests/
    unit/
    integration/
  types/
  main.tsx
```

## Documentation Targets

Phase 1 should also create and maintain:

- `README.md`
- `docs/architecture-overview.md`
- `docs/firebase-setup.md`
- `docs/google-calendar-scaffolding.md`
- `docs/deployment-guide.md`
- `docs/future-extension-notes.md`

## Core Domain Model for Phase 1

## Primary Entities

- `User`
- `RoutineTemplate`
- `DayTemplate`
- `BlockTemplate`
- `DayInstance`
- `BlockInstance`
- `CompletionLog`
- `PrepTopic`
- `PrepProgress`
- `WorkoutScheduleEntry`
- `WorkoutLog`
- `SleepLog`
- `DailyScore`
- `ReadinessSnapshot`
- `UserSettings`
- `SyncQueueItem`
- `CalendarConnectionState`

## Important Modeling Decisions

### Day Instances vs Templates

Templates define expectation. Instances represent execution reality.

This is important because:

- the same weekday can be reclassified into low-energy or survival mode
- skipped, moved, and completed blocks should not mutate the base template
- analytics later need planned vs actual comparisons

### Scoring as Derived Data

Scores should be derived from execution state and stored as snapshots only where useful.

This avoids:

- duplicated source of truth
- stale UI logic hidden in components
- difficult score recalculation rules later

### Recommendation Engine as Rule Pipeline

The "What should I do now?" engine should accept a typed context object and return a ranked recommendation result.

This creates a future-safe path for:

- additional rule types
- explanation metadata
- confidence or urgency labels
- optional AI augmentation later without replacing the rule engine

## Firestore Data Strategy

Phase 1 should design for one current user while remaining multi-user capable later.

Recommended shape:

- `users/{userId}`
- `users/{userId}/dayInstances/{dayId}`
- `users/{userId}/prepProgress/{topicId}`
- `users/{userId}/workoutLogs/{logId}`
- `users/{userId}/sleepLogs/{logId}`
- `users/{userId}/scores/{dayId}`
- `users/{userId}/settings/default`
- seed-driven reference collections or bundled seed config for routine and taxonomy

Guiding rules:

- store user-owned operational data under user scope
- keep seed config versioned and typed
- denormalize only for hot-read UI paths that improve Today screen performance
- plan indexes around date queries, day status queries, and topic progress queries

## Phase 1 Milestones

Each milestone below should be treated as a logical implementation section with its own completion checklist, testing work, and documentation updates.

## Milestone 0: Project Foundation and Planning Baseline

### Goal

Create the repo foundation required to implement Forge in a stable, scalable way.

### Why This Comes First

An architecture-first strategy only works if the repo, tooling, coding conventions, and folder boundaries are defined early.

### Deliverables

- Vite React TypeScript app bootstrap
- package baseline
- linting and formatting setup
- test runner setup
- path alias setup
- environment variable strategy
- docs folder baseline

### Checklist

- [ ] Initialize the Vite React TypeScript application.
- [ ] Add and configure MUI, Zustand, TanStack Query, Firebase SDK, and test dependencies.
- [ ] Set up ESLint and formatting rules aligned with TypeScript and React.
- [ ] Configure path aliases for predictable imports.
- [ ] Define environment variable naming and example file strategy.
- [ ] Create the top-level folder structure for app, features, domain, data, services, lib, and tests.
- [ ] Add baseline app providers for query, theme, auth session shell, and router mounting.
- [ ] Add a docs folder with architecture and setup doc placeholders.

### Testing and Documentation

- [ ] Add a smoke test path for the application shell.
- [ ] Document local setup expectations in `README.md`.
- [ ] Document the chosen folder structure and rationale in `docs/architecture-overview.md`.

### Exit Criteria

- project boots locally with clean install
- base structure exists
- foundational docs are in place

## Milestone 1: Design System, Theme, and App Shell

### Goal

Establish the premium dark visual system and the shell that every core flow will rely on.

### Deliverables

- custom MUI theme
- app shell layout
- responsive navigation system
- global status and metric UI primitives
- stateful visual language for war-state and urgency

### Checklist

- [ ] Define the typography scale, spacing scale, radii, elevation rules, and semantic color tokens.
- [ ] Build a custom MUI theme that does not resemble default MUI styling.
- [ ] Create reusable primitives for cards, badges, metric tiles, section headers, and quick action controls.
- [ ] Implement mobile-first navigation with bottom-nav or equivalent pattern.
- [ ] Implement desktop navigation for Today, Schedule, Prep, Physical, Readiness, and Settings.
- [ ] Add app shell regions for top status, content, and persistent navigation.
- [ ] Create reusable sync-state and war-state indicators.
- [ ] Establish loading, empty, and degraded-state patterns consistent with the product tone.

### Testing and Documentation

- [ ] Add component tests for the most important UI primitives where practical.
- [ ] Document theme tokens and design rules in `docs/architecture-overview.md` or a dedicated theme section.
- [ ] Capture visual guardrails so future work does not drift toward playful or generic UI.

### Exit Criteria

- shell is usable on mobile and desktop
- visual direction matches the product brief
- reusable UI primitives exist before screen complexity grows

## Milestone 2: Firebase Wiring and Authentication

### Goal

Connect the application to real Firebase services and establish the authenticated user boundary.

### Short Implementation Outline

- establish a single Firebase app/auth/firestore initialization module
- create an auth session provider that owns startup, auth-state observation, and user bootstrap sequencing
- add guarded routes so app screens require a real authenticated session
- connect the auth screen to Google Sign-In and honest error/loading states
- bootstrap the signed-in user document and default settings document on first login
- update tests so route-guard and session behavior remain verifiable without a live Firebase project during CI

### Deliverables

- Firebase app initialization
- environment-driven config
- Google Sign-In flow
- authenticated route handling
- user profile bootstrap logic

### Checklist

- [ ] Add Firebase client initialization with environment-based config.
- [ ] Implement Firebase Auth integration with Google Sign-In only.
- [ ] Create auth provider or session store boundary for authenticated state.
- [ ] Implement guarded routes and unauthenticated entry flow.
- [ ] Define user bootstrap logic for first login and initial settings creation.
- [ ] Add Firestore connectivity validation path for authenticated sessions.
- [ ] Prepare Firebase Hosting compatibility for SPA routing.

### Testing and Documentation

- [ ] Add tests for auth state helpers and route guard behavior where practical.
- [ ] Write `docs/firebase-setup.md` with project setup, Auth provider config, and Firestore setup steps.
- [ ] Update `README.md` with environment variables and local Firebase requirements.

### Exit Criteria

- a real user can authenticate with Google
- Firestore is reachable from the app
- auth state gates the application correctly

## Milestone 3: Seed Data, Routine Engine, and Core Domain Types

### Goal

Create the config-driven core domain model that powers the rest of the application.

### Short Implementation Outline

- expand the current domain types into explicit routine, prep, physical, and execution models
- encode the fixed weekly routine, block templates, prep taxonomy, and workout schedule as typed seed modules
- build a day-instance generator that derives a concrete day plan from weekday and date context
- build fallback transformation helpers so low-energy and survival modes create adjusted instances without mutating templates
- keep time/block metadata structured enough that scoring, recommendations, and persistence can consume it later without remapping
- validate the routine engine with unit tests before wiring it into the screens

### Deliverables

- typed routine configuration
- prep taxonomy seeds
- workout schedule seeds
- day and block generation logic
- domain enums and validation rules

### Checklist

- [ ] Define TypeScript types for day types, block types, completion states, workout states, confidence states, readiness states, and sync states.
- [ ] Implement structured seed modules for weekly routine templates and block definitions.
- [ ] Seed prep taxonomy for DSA, System Design, LLD, Java/Backend, and secondary domains.
- [ ] Seed workout schedule definitions by weekday and day type.
- [ ] Implement day-instance generation logic from template plus date context.
- [ ] Implement block-instance generation with planned timestamps, statuses, and override hooks.
- [ ] Model low-energy and survival fallback transformations without mutating source templates.
- [ ] Add serialization and mapping helpers for local and Firestore persistence.

### Testing and Documentation

- [ ] Add unit tests for routine generation and fallback transformation rules.
- [ ] Document seed structure and routine engine assumptions in `docs/architecture-overview.md`.
- [ ] Record configuration ownership so future routine edits happen through the correct modules.

### Exit Criteria

- the app can derive a valid day plan from seed config
- domain logic is typed and testable
- later screens can consume generated day data without hardcoded routines

## Milestone 4: Data Access Layer, Local Persistence, and Sync Queue Base

### Goal

Create the persistence architecture that supports both real Firebase data and offline-first critical actions.

### Short Implementation Outline

- define repository interfaces for day instances, settings, prep progress, workout logs, sleep logs, and scores
- stand up a local IndexedDB database as the first persistence implementation for critical Phase 1 reads and writes
- add a sync queue model with typed action metadata, retry bookkeeping, and replay ordering
- build a sync provider/orchestrator that can observe online state, surface sync health to the UI, and replay queued writes when the session is authenticated
- route Today and Schedule through persistence-aware workspace hooks so generated day instances become cacheable local data instead of per-render derived values
- keep Firestore adapters thin and focused so local-first behavior remains the primary UX path

### Deliverables

- repository interfaces
- Firestore repository implementations
- IndexedDB or equivalent local persistence layer
- queued write model
- sync orchestrator foundation

### Checklist

- [x] Define repository interfaces for day instances, prep progress, workout logs, sleep logs, scores, and settings.
- [ ] Implement Firestore repository adapters for core Phase 1 entities.
- [x] Implement local persistence adapters for cached day state and pending writes.
- [x] Define a sync queue item model with action type, payload, retry state, and timestamps.
- [ ] Implement optimistic local updates for critical actions.
- [x] Create a sync orchestrator that can replay queued actions when connectivity returns.
- [ ] Design conflict-safe update behavior for day execution data.
- [x] Expose subtle sync status to the UI through a shared state boundary.

### Testing and Documentation

- [ ] Add unit tests for queue serialization, replay ordering, and conflict helper utilities.
- [x] Document offline assumptions and sync flow in `docs/architecture-overview.md`.
- [ ] Add notes about tradeoffs and limits of Phase 1 conflict resolution.

### Exit Criteria

- critical writes have a defined local-first path
- repositories are no longer coupled directly to screen components
- offline support has a real implementation foundation

## Milestone 5: Today Screen and Daily Execution Flow

### Goal

Build the most important user surface in the product and make the daily execution loop real.

### Deliverables

- Today screen layout
- current block and agenda presentation
- quick actions for block completion and skip flows
- day mode selector
- war-state indicator
- fallback mode suggestion entry point

### Checklist

- [ ] Build the Today screen as a mobile-first, long-form, scrollable execution surface.
- [ ] Render today's agenda from generated day-instance and block-instance data.
- [ ] Surface top priorities, current block, daily score preview, and workout card.
- [ ] Add quick interactions for block done, skipped, moved, and note capture where needed.
- [ ] Add a visible day mode selector for ideal, normal, low-energy, and survival states.
- [ ] Show war-state labels and status transitions based on computed score and execution state.
- [ ] Add fallback mode suggestion UX when the schedule degrades.
- [ ] Add sleep and energy quick status inputs in a low-friction way.
- [ ] Ensure the full Today flow works responsively on mobile and desktop.

### Testing and Documentation

- [ ] Add component or integration tests for the primary Today interactions.
- [ ] Document the Today interaction model and action flows in the architecture doc.
- [ ] Record the intended mobile-first behavior so later desktop polish does not distort priorities.

### Exit Criteria

- the user can run the day from the Today screen
- the main execution loop feels fast and low-friction
- state transitions are visible and meaningful

## Milestone 6: Schedule Screen and Operational Overrides

### Goal

Expose routine visibility and limited operational control without turning Forge into a routine editor.

### Deliverables

- weekly schedule view
- per-day detail cards
- block-level operational overrides
- day-type override support

### Checklist

- [ ] Build a week-view schedule screen with strong day-type visibility.
- [ ] Show day templates, major blocks, and focused intent by weekday.
- [ ] Allow manual day-type override within V1 rules.
- [ ] Allow block actions for skip, move-later, and fallback activation.
- [ ] Show limited operational changes without exposing full routine editing.
- [ ] Prepare visual placeholders for future calendar mirror status.

### Testing and Documentation

- [ ] Add tests for override rule helpers and allowed state transitions.
- [ ] Document the line between operational overrides and forbidden routine editing.

### Exit Criteria

- schedule behavior matches V1 guardrails
- users can adapt the day without editing the system itself

## Milestone 7: Prep, Physical, and Readiness Core Flows

### Goal

Implement the supporting product surfaces that complete the Phase 1 execution system.

### Deliverables

- Prep screen with seeded taxonomy navigation
- progress and confidence tracking
- Physical screen with workout and sleep logging
- basic Readiness screen with target-date framing

### Checklist

- [ ] Build the Prep screen with top-level domains and topic drill-down.
- [ ] Support confidence updates, revision counts, solved counts where relevant, and notes hooks.
- [ ] Display readiness contribution cues for major prep domains.
- [ ] Build the Physical screen with scheduled workout state, quick completion, skip, reschedule, and note support.
- [ ] Add fast manual sleep logging with target-met derivation.
- [ ] Build the Readiness screen with seeded target date of May 31, 2026 and major domain readiness states.
- [ ] Show current pace vs target in a basic but honest way.

### Testing and Documentation

- [ ] Add tests for prep progress calculations, workout state helpers, and readiness utility functions.
- [ ] Document the readiness model assumptions and known simplifications for Phase 1.

### Exit Criteria

- prep and physical tracking are both first-class enough to support the scoring model
- readiness basics are visible and useful

## Milestone 8: Scoring Engine and Recommendation Engine

### Goal

Implement the strict behavioral logic that differentiates Forge from a normal tracker.

### Deliverables

- master score calculation
- subscore calculation
- war-state mapping
- rules-based next-action recommendation engine
- explanation metadata for user-facing reasoning

### Checklist

- [ ] Implement the master daily score model with weighted categories from the product spec.
- [ ] Implement subscores for interview prep, physical, discipline, consistency, and master score.
- [ ] Ensure the prime morning deep block carries the strongest score weight.
- [ ] Normalize expectations fairly across WFH, WFO, weekend, low-energy, and survival contexts.
- [ ] Prevent low-value completion from masking deep-work failure.
- [ ] Implement a recommendation engine that accepts current time, day type, completion state, energy, workout state, schedule pressure, conflict state, and fallback state.
- [ ] Return recommendation results with action label, rationale, urgency, and optional alternative path.
- [ ] Surface the recommendation through the Today screen's "What should I do now?" interaction.

### Testing and Documentation

- [ ] Add thorough unit tests for scoring rules and edge cases.
- [ ] Add thorough unit tests for recommendation priorities and fallback behavior.
- [ ] Document rule precedence and score philosophy so future changes remain intentional.

### Exit Criteria

- scoring behavior reflects product philosophy rather than checklist inflation
- recommendations feel strict, useful, and explainable

## Milestone 9: PWA, Offline UX, and Hosting Readiness

### Goal

Ship the application as a credible installable web app with resilient loading and offline baseline behavior.

### Deliverables

- manifest
- icons and install metadata
- service worker baseline
- offline loading strategy
- Firebase Hosting readiness

### Checklist

- [ ] Configure app manifest, icons, naming, and display properties for installability.
- [ ] Add service worker support and cache strategy for core shell assets.
- [ ] Ensure Today screen and recent cached data can render offline.
- [ ] Add installability UX and offline/degraded-state handling.
- [ ] Verify browser behavior on Android Chrome and desktop Chromium browsers.
- [ ] Prepare Hosting configuration and SPA routing behavior.
- [ ] Validate that offline queue replay works correctly after reconnection.

### Testing and Documentation

- [ ] Document PWA setup and deployment steps in `docs/deployment-guide.md`.
- [ ] Add test coverage for critical offline helpers where realistic.
- [ ] Record installability and offline limitations clearly.

### Exit Criteria

- app is installable
- primary execution flow remains resilient under intermittent connectivity
- deployment path is documented

## Milestone 10: Calendar Scaffolding and Future Boundaries

### Goal

Prepare the app for future Calendar integration without prematurely implementing the full feature.

### Deliverables

- calendar domain types
- service boundary
- placeholder connection state
- schedule pressure integration hooks

### Checklist

- [ ] Define calendar domain models for external events, mirrored blocks, and collision summaries.
- [ ] Create calendar service interfaces and placeholder adapters.
- [ ] Add settings-level placeholder connection status and feature-flag framing.
- [ ] Thread calendar conflict inputs into recommendation-engine context shape.
- [ ] Prepare event metadata conventions such as `[FORGE] <block title>` without enabling full sync.
- [ ] Document how future read and write flows should plug into the current architecture.

### Testing and Documentation

- [ ] Add tests for calendar context shaping if it affects recommendation inputs.
- [ ] Write `docs/google-calendar-scaffolding.md` to explain current boundaries and next integration step.

### Exit Criteria

- future Calendar work can be added without reworking current domain boundaries

## Milestone 11: Hardening, QA, and Release Readiness

### Goal

Stabilize the Phase 1 system so it is implementation-complete, documented, and ready for real use.

### Deliverables

- QA pass across primary flows
- docs completion pass
- environment example file
- architecture cleanup
- release checklist

### Checklist

- [ ] Run a full quality pass across auth, Today, Schedule, Prep, Physical, Readiness, offline, and installability flows.
- [ ] Clean up folder placement, naming, and boundary violations discovered during implementation.
- [ ] Add `.env.example` with safe placeholders only.
- [ ] Finalize `README.md` with setup, scripts, and local development instructions.
- [ ] Finalize architecture, Firebase setup, deployment, and future extension docs.
- [ ] Review edge cases around low-energy days, survival mode, skipped deep work, and queued sync recovery.
- [ ] Confirm no Phase 2 or Phase 3 scope accidentally leaked into Phase 1 complexity.

### Testing and Documentation

- [ ] Run and verify the full test suite for Phase 1 logic and key UI confidence points.
- [ ] Add a known limitations section so unresolved Phase 1 constraints are visible and honest.

### Exit Criteria

- documentation is complete enough for future implementation continuity
- core flows are stable
- the codebase is ready to move into deeper analytics work later

## Cross-Cutting Engineering Standards

These rules apply across every milestone:

- domain logic should not live inside screen components
- repository boundaries should be used for persistence access
- all important user-facing logic should use typed inputs and outputs
- UI state and server state should remain intentionally separated
- accessibility should be considered for core actions and navigation
- no placeholder metrics that imply analytics without real logic behind them
- manual data entry must stay low-friction
- visual polish should not come at the cost of execution speed

## Testing Strategy for Phase 1

## Must-Have Automated Coverage

- scoring engine
- recommendation engine
- routine generation and fallback transformation
- sync queue helpers
- core readiness utilities
- key interaction confidence tests for Today and auth boundaries

## Preferred Testing Split

- unit tests for domain rules and utilities
- component tests for key UI primitives and critical screens where practical
- light integration tests for primary authenticated execution flow

## Documentation Strategy for Phase 1

Documentation should be written incrementally with implementation, not after implementation.

Required docs by the end of Phase 1:

- `README.md`
- `docs/architecture-overview.md`
- `docs/firebase-setup.md`
- `docs/google-calendar-scaffolding.md`
- `docs/deployment-guide.md`
- `docs/future-extension-notes.md`

Each milestone should update the docs that it materially affects.

## Risks and Mitigations

## Risk: UI-first implementation drift

If screens are built before domain rules and repositories are stabilized, the app will become tightly coupled and hard to evolve.

Mitigation:

- complete domain and repository planning before feature-rich screens
- review milestone exit criteria before moving on

## Risk: Offline complexity expanding too early

Offline behavior can consume large amounts of time if treated as a full sync platform in Phase 1.

Mitigation:

- support only critical offline actions
- keep conflict handling simple and well-documented

## Risk: MUI default look leaking through

If theme work is treated as cosmetic instead of structural, the product will fail the brand intent.

Mitigation:

- define theme tokens early
- build shared primitives before full screens

## Risk: Routine-editing creep

If operational overrides become an editing system, the V1 product focus weakens.

Mitigation:

- keep schedule controls explicitly scoped to override actions only
- encode guardrails in both UI and domain rules

## Risk: Fake analytics temptation

The product spec explicitly rejects shallow metrics.

Mitigation:

- only surface metrics backed by real Phase 1 logic
- leave richer analytics to Phase 2 scaffolding

## Definition of Done for Phase 1

Phase 1 is done when:

- the app architecture matches the boundaries described in this document
- Firebase Auth and Firestore are wired and used in real flows
- the routine, day, prep, workout, sleep, scoring, and recommendation models all work together
- the Today screen supports real daily execution with minimal friction
- the app installs as a PWA and supports offline baseline behavior
- tests cover the most important behavioral logic
- documentation is sufficient for setup, continuation, and future extension

## Suggested Implementation Order Inside Phase 1

The milestones above should generally be executed in this order:

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
12. Milestone 11

This order favors architectural stability first, then the core execution loop, then platform hardening and future-ready boundaries.

## Progress Tracking

Use this section as the live implementation tracker.

### Overall Status

- [x] Milestone 0 complete
- [x] Milestone 1 complete
- [ ] Milestone 2 complete
- [x] Milestone 3 complete
- [ ] Milestone 4 complete
- [ ] Milestone 5 complete
- [ ] Milestone 6 complete
- [ ] Milestone 7 complete
- [ ] Milestone 8 complete
- [ ] Milestone 9 complete
- [ ] Milestone 10 complete
- [ ] Milestone 11 complete

### Current Iteration Notes

- Created the Vite + React + TypeScript project foundation and aligned the toolchain to a PWA-compatible Vite 7 setup.
- Replaced the starter demo UI with a real route-based Forge shell, theme system, shared providers, and initial feature page placeholders.
- Added baseline docs for architecture, Firebase setup, deployment, calendar scaffolding, and future extension notes.
- Added `.env.example`, path aliases, Vitest setup, a smoke-style shell test, and baseline PWA configuration.
- Expanded the design system with a loaded Sora variable font, shared `SectionHeader`, `SurfaceCard`, `MetricTile`, `EmptyState`, `StatusBadge`, and `SyncIndicator` primitives.
- Refined the shell with desktop signal strips, mobile drawer navigation, shared surface patterns, and a more consistent page-level visual language.
- Added primitive-focused UI tests and verified the milestone with `npm run lint`, `npm run test:run`, `npm run typecheck`, and `npm run build`.
- Added the Milestone 2 auth foundation: Firebase app/init boundaries, session provider, guarded routes, Google Sign-In wiring, and first-login Firestore bootstrap for user/settings docs.
- Added auth-focused tests for authenticated rendering, unauthenticated routing, and sign-in interaction wiring.
- Local verification passed with `npm run lint`, `npm run test:run`, `npm run typecheck`, and `npm run build`.
- Milestone 2 still needs live verification with real `.env` Firebase credentials before it should be marked complete in the tracker.
- Added the Milestone 3 domain foundation: shared routine/prep/physical types, typed seed modules for routine/taxonomy/workout schedule, and a `generateDayInstance` routine engine with fallback-mode transformations.
- Added routine-engine tests covering base weekday generation plus low-energy and survival-mode transformations.
- Added serialization helpers, weekly snapshot helpers, block selectors, and wired generated day data into the Today and Schedule screens.
- Extended seed-derived consumption into Prep and Physical so those screens now reflect taxonomy shape, daily prep focus, and workout schedule reality instead of placeholder copy.
- Local verification passed again with `npm run lint`, `npm run test:run`, `npm run typecheck`, and `npm run build`.
- Milestone 3 is now complete from the Phase 1 checklist perspective: templates, seed data, generation logic, fallback transformations, helper mapping, and initial UI consumption are all in place.
- Added the Milestone 4 persistence foundation: repository interfaces, IndexedDB-backed local repositories, a typed sync queue model, Firestore replay adapters for day instances and settings, and a sync orchestrator/provider pair that can flush queued writes when an authenticated session is online.
- Routed Today and Schedule through persistence-aware workspace hooks so generated day instances are cached locally instead of being regenerated on each render.
- Added IndexedDB test support with `fake-indexeddb`, plus initial sync-queue tests for typed queue-item creation.
- Converted day mode override into the first real local-first mutation path: Today now writes the override into persisted local settings, enqueues a settings sync action, and invalidates Today/Schedule workspace queries so the regenerated day model reflects the persisted override immediately.
- Added a focused service test for the day-mode override flow so settings persistence and queued sync behavior stay verifiable.
- Tightened the review findings in the mutation path: outstanding sync state now includes failed items, failed items remain replayable, optimistic day-mode updates roll back safely on error, and singleton settings writes are coalesced to the latest snapshot instead of stacking duplicate queue entries.
- Local verification passed for the persistence foundation with `npm run lint`, `npm run test:run`, `npm run typecheck`, and `npm run build`.
- Milestone 4 is not complete yet: optimistic mutation flows, broader Firestore adapters, and explicit conflict-resolution helpers still need to be layered on top of the new repository/sync base.
- Next implementation step: continue Milestone 4 by routing real day-mode and execution-state mutations through the local repositories and sync queue so critical actions become genuinely local-first.
