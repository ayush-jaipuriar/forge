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

### Current Conflict Strategy and Limits

- the current foundation favors predictable local continuity over sophisticated merge behavior
- for day instances, the practical near-term strategy is whole-record upsert by date until block-level mutation commands exist
- this means explicit conflict helpers and field-level merges are still a remaining Milestone 4 task, not a solved problem
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
