# forge

Life OS.

## Planning Docs

- [Phase 1 Spec & Implementation Plan](docs/phase-1-spec-implementation-plan.md)

## Foundation Status

The project now includes the Milestone 0 and Milestone 1 foundation:

- Vite + React + TypeScript baseline
- custom MUI design system aligned to Forge's dark execution-first direction
- route-based application shell
- shared UI primitives for sections, surfaces, metrics, empty states, and status indicators
- Zustand and TanStack Query setup boundaries
- Firebase config boundary and environment template
- Vitest and Testing Library setup
- baseline PWA configuration

## Current Auth State

Milestone 2 auth wiring is now implemented in code:

- protected app routes
- Firebase Auth session provider
- Google Sign-In entry flow
- first-login Firestore bootstrap for user and settings docs

Real sign-in still requires you to populate `.env` with your Firebase project values.

## Scripts

- `npm run dev`
- `npm run build`
- `npm run typecheck`
- `npm run lint`
- `npm run test:run`

## Environment

Create a local `.env` file from `.env.example` and fill in Firebase values before Milestone 2 wiring work.
