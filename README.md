# Forge

Forge is a personal execution system built for disciplined daily planning, interview preparation, physical training, and recovery-aware decision making.

It is designed to answer a simple question well:

**What should I do next, and how do I stay honest about whether the day is actually working?**

Unlike a generic productivity dashboard, Forge treats routine, prep, training, readiness, and calendar pressure as parts of the same operating surface.

## Why This Project Stands Out

Forge is not just a UI demo. It is a complete product-style build with:

- a multi-surface React application
- local-first persistence with IndexedDB
- typed domain modeling for routines, scoring, prep, readiness, sync, and backup flows
- Firebase-backed auth, hosting, storage, and server-side operational functions
- installable PWA behavior with offline shell support
- guest-mode onboarding with seeded demo data
- structured product documentation, implementation planning, and test coverage

For recruiters and hiring teams, this project demonstrates:

- product thinking, not just feature coding
- frontend architecture and UX systems work
- local persistence and sync design
- practical Firebase platform integration
- release verification discipline

## What Forge Does

Forge helps a user run their day with more structure and less drift.

Core product goals:

- keep the day plan visible and actionable
- make prep progress measurable
- treat physical training and recovery as execution inputs, not separate apps
- show when calendar pressure is starting to distort the routine
- make the next best action clearer

## Main Product Surfaces

### Today

The live execution surface.

It shows:

- current execution context
- the current block
- quick sleep and energy updates
- day-mode posture
- operational alerts
- calendar pressure and support context

### Plan

The planning surface.

It combines:

- weekly structure
- selected-day tuning
- prep progress
- topic pressure
- calendar-aware constraints

### Insights

The pattern and readiness surface.

It combines:

- momentum
- risk
- projections
- analytics charts
- readiness pace
- domain readiness
- continuity and missions

### About

A lightweight in-product page explaining the project and its developer.

### Settings

The utility surface for runtime truth.

It includes:

- auth/runtime posture
- backup and restore status
- notification state
- calendar integration state
- platform capability boundaries
- future-provider scaffolding

## Key Features

- Local-first workspace backed by IndexedDB
- Installable PWA shell
- Google sign-in
- Guest workspace with temporary demo data
- Daily scoring and recommendation system
- Day-mode overrides for real-world pressure
- Prep progress tracking
- Workout and signal logging
- Calendar pressure awareness
- Backup and restore scaffolding
- Firebase Functions for operational jobs

## Tech Stack

### Frontend

- React 19
- TypeScript
- Vite
- Material UI
- Zustand
- TanStack Query

### Persistence and Platform

- IndexedDB via `idb`
- Firebase Auth
- Firestore
- Cloud Storage
- Firebase Functions
- Firebase Hosting

### Quality and Tooling

- Vitest
- Testing Library
- ESLint
- TypeScript project builds
- Capacitor Android foundation

## Architecture Summary

Forge is built around a few clear layers:

- `src/domain`
  Business rules, scoring, readiness, schedule rules, recommendation logic, and typed contracts.

- `src/services`
  Application services for persistence, analytics, calendar integration, notifications, sync, backup, and platform operations.

- `src/data`
  Local repositories and IndexedDB storage access.

- `src/features`
  Product surfaces and their hooks, pages, and feature-level components.

- `functions/`
  Firebase Functions for scheduled or operator-driven background work.

This separation makes the project easier to test, reason about, and extend.

## Guest Mode

Forge supports a guest workspace so anyone can explore the product without signing in.

Guest mode:

- seeds local demo data
- works without cloud sync
- is safe to experiment with
- clears when the guest exits

This is useful for:

- product demos
- recruiter review
- quick evaluation without account setup

## Getting Started

### 1. Install dependencies

```bash
npm install
npm run functions:install
```

### 2. Create your local environment file

```bash
cp .env.example .env
```

Add real Firebase web app values to `.env`.

Important:

- Forge needs valid Firebase config for authenticated flows
- guest mode can still be useful for product exploration

### 3. Start the app locally

```bash
npm run dev
```

Open the URL printed by Vite, usually:

```text
http://127.0.0.1:5173
```

## Recommended Local Test Flow

### Fast development loop

```bash
npm run dev
```

Use this when you are changing UI or product behavior.

### Production-like local check

```bash
npm run build
npm run preview -- --host 127.0.0.1 --port 4181
```

Then open:

```text
http://127.0.0.1:4181
```

Use this when checking:

- PWA shell behavior
- auth behavior closer to production
- final layout and asset output

## Useful Commands

```bash
npm run dev
npm run lint
npm run typecheck
npm run test:run
npm run build
npm run preview
npm run launch:verify
npm run functions:verify
```

### Android / native shell support

```bash
npm run native:doctor
npm run android:sync
npm run android:assemble
npm run android:install
```

## Verification

The main pre-deploy verification path is:

```bash
npm run launch:verify
```

That runs:

- lint
- typecheck
- tests
- production build
- Functions verification

## Deployment

Forge is deployed on Firebase Hosting.

### Hosting-only deploy

Use this when only the frontend/PWA shell changed:

```bash
npm run build
firebase deploy --project forge-510f3 --only hosting
```

### Full deploy

Use this when rules, storage, or functions changed too:

```bash
npm run launch:verify
firebase deploy --project forge-510f3 --only hosting,firestore:rules,firestore:indexes,storage,functions
```

Live site:

```text
https://forge-510f3.web.app
```

## How To Evaluate The Product Quickly

If you are new to Forge, this is the fastest useful walkthrough:

1. Open the app and sign in, or enter guest mode.
2. Go to `Today` to understand the live execution model.
3. Open `Command Center` to see the analytics and pressure layer.
4. Open `Schedule` to see the weekly routine board.
5. Open `Prep`, `Physical`, and `Readiness` to understand how execution, training, and recovery connect.
6. Open `Settings` to inspect runtime truth and platform boundaries.
7. Open `About` for project context and developer links.

## Current Product Boundaries

Forge is intentionally **not**:

- a generic habit tracker
- a free-form calendar replacement
- a template-driven dashboard toy
- a social productivity app

The current product philosophy is:

- routines are seeded and structured
- overrides are allowed when reality changes
- metrics should support honest execution, not vanity tracking
- integrations should exist only when they add real operational value

## Current Limitations

- browser and installed-PWA notifications are supported more directly than native mobile push
- health integrations are scaffolded, not fully live provider sync
- native shell foundations exist, but full native capability parity is still incomplete
- calendar support is intentionally bounded and not a complete long-lived server-managed integration system yet
- offline support is strongest at the shell and local workspace level, not full cloud-state parity across every screen

## Developer

Built by **Ayush Jaipuriar**  
**Developer at TransUnion**

- LinkedIn: [Ayush Jaipuriar](https://www.linkedin.com/in/ayush-jaipuriar/)
- Portfolio: [Personal Portfolio](https://ayush-jaipuriar.github.io/Personal-Portfolio/about)

## Core Project Docs

If you want deeper technical or delivery context, start here:

- [Architecture Overview](docs/architecture-overview.md)
- [Forge Senior Engineering Study Guide](docs/forge-senior-study-guide.md)
- [Firebase Setup](docs/firebase-setup.md)
- [Deployment Guide](docs/deployment-guide.md)
- [Production Deployment And Phone Install Guide](docs/production-deployment-and-phone-install-guide.md)
- [UI Modernization Implementation Plan](docs/ui-modernization-implementation-plan.md)
- [Product Simplification Roadmap](docs/product-simplification-roadmap.md)
- [Product Simplification Implementation Plan](docs/product-simplification-implementation-plan.md)
- [Product Simplification Milestone Breakdown](docs/product-simplification-milestone-breakdown.md)
- [Product Simplification Sprint 1 Plan](docs/product-simplification-sprint-1-plan.md)
- [Product Simplification Sprint 2 Plan](docs/product-simplification-sprint-2-plan.md)
- [Product Simplification Sprint 3 Plan](docs/product-simplification-sprint-3-plan.md)
- [Product Simplification Sprint 4 Plan](docs/product-simplification-sprint-4-plan.md)
- [Product Simplification Sprint 5 Plan](docs/product-simplification-sprint-5-plan.md)
- [Auth Hardening Sprint Plan](docs/auth-hardening-sprint-plan.md)
- [Cross-Device Sync Hydration Sprint Plan](docs/cross-device-sync-hydration-sprint-plan.md)
- [Settings Sync Hardening Sprint Plan](docs/settings-sync-hardening-sprint-plan.md)
- [Guest Workspace Implementation Notes](docs/guest-workspace-implementation-notes.md)
- [Phase 4 Native Shell Workflow](docs/phase-4-native-shell-workflow.md)
- [Phase 4 Launch Operations](docs/phase-4-launch-operations.md)

## Final Note

Forge is a serious product project: part planner, part execution console, part operating surface.

It was built to show that productivity software can be structured, opinionated, and honest without becoming noisy or generic.
