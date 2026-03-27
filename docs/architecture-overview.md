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
