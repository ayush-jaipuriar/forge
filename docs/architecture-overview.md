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
