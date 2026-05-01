# Forge

Forge is a calm, premium daily planner for people who want more clarity and less drift.

It is built around one practical question:

**What matters today, what should happen next, and what needs adjustment before the day starts slipping?**

Forge is not a generic productivity dashboard. It brings daily execution, weekly planning, recovery signals, prep work, and review into one structured workflow with a warmer, more editorial product feel.

## What Forge Is

Forge is a personal planning application with four primary surfaces:

- `Today` for running the current day with clarity
- `Plan` for shaping the week and tuning upcoming days
- `Insights` for understanding trends, patterns, and pressure
- `Settings` for account, appearance, integrations, and app controls

The current product direction is intentionally simpler and calmer than earlier iterations. The app now prioritizes:

- clear next actions over dense dashboards
- warm, premium visual design over cockpit-style UI
- one coherent planner experience over too many competing surfaces
- cloud-backed authenticated state as the source of truth

## Core Experience

### Today

The daily execution workspace.

It focuses on:

- the day headline and current direction
- the current block or next meaningful action
- execution context and key support signals
- lightweight day adjustments without over-editing

### Plan

The planning workspace.

It focuses on:

- weekly structure
- prep and upcoming work
- day selection and week views
- shaping the plan before the day arrives

### Insights

The review and intelligence workspace.

It focuses on:

- what changed
- why it matters
- what to adjust next
- supporting analytics and evidence below the fold

### Settings

The utility and control workspace.

It focuses on:

- account and sign-in state
- theme and appearance preferences
- integration controls
- app-level actions such as refresh and platform utilities

## Product Highlights

- Google-authenticated personal workspace
- guest/demo mode for quick exploration
- Firebase-backed cloud state for signed-in usage
- installable PWA shell for web and mobile-home-screen use
- daily and weekly planning surfaces with shared design language
- insights surfaces that preserve depth without leading with clutter
- light and dark themes with user-controlled switching
- background platform support through Firebase Hosting, Firestore, Storage, and Functions

## Current Runtime Model

Forge now treats authenticated cloud data as the primary source of truth.

That means:

- signed-in usage is designed around Firebase-backed online state
- guest/demo usage is local and disposable
- browser storage is still used for lightweight local concerns such as shell state, preferences, and temporary caches
- the older local-first/offline-heavy posture is no longer the main product direction

This keeps the day-to-day experience more predictable across devices and reduces sync ambiguity.

## Why This Repo Is Useful

Forge is not just a static UI exercise. It demonstrates:

- product thinking and iterative scope refinement
- frontend architecture across multiple routes and shared systems
- a real design-system modernization pass
- Firebase integration across auth, data, hosting, storage, and functions
- PWA deployment and installability
- automated testing, verification, and release hardening

## Tech Stack

### Frontend

- React 19
- TypeScript
- Vite
- Material UI
- Zustand
- TanStack Query

### Platform

- Firebase Auth
- Firestore
- Cloud Storage
- Firebase Functions
- Firebase Hosting
- PWA support via Vite plugin tooling

### Quality and Tooling

- Vitest
- Testing Library
- ESLint
- TypeScript project builds
- Capacitor foundation for future native-shell exploration

## Architecture at a Glance

- `src/domain`
  Typed business rules, scoring, planning logic, and shared contracts.

- `src/features`
  Route-level product areas such as Today, Plan, Insights, Settings, and Auth.

- `src/services`
  Application services for sync, analytics, notifications, backup, integrations, and app operations.

- `src/data`
  Repository and persistence implementations, including local browser-side support where still needed.

- `src/components`
  Shared layout, shell, and design-system primitives.

- `functions/`
  Firebase Functions for scheduled jobs and platform workflows.

## Routes

Current primary routes:

- `/` -> Today
- `/plan` -> Plan
- `/insights` -> Insights
- `/settings` -> Settings
- `/auth` -> Authentication entry

Legacy routes are redirected to the newer information architecture:

- `/schedule` -> `/plan?view=week`
- `/command-center` -> `/insights?view=weekly`
- `/readiness` -> `/insights?view=readiness`
- `/prep` -> `/plan?view=prep`

## Getting Started

### 1. Install dependencies

```bash
npm install
npm run functions:install
```

### 2. Configure Firebase web environment

```bash
cp .env.example .env
```

Add your real Firebase web app values to `.env`:

```bash
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Forge supports guest/demo exploration without a full signed-in flow, but authenticated usage needs valid Firebase configuration.

### 3. Start the app

```bash
npm run dev
```

Vite will print the local URL, usually something like:

```text
http://127.0.0.1:5173
```

## Recommended Local Workflow

### Fast UI iteration

```bash
npm run dev
```

Use this for day-to-day interface and behavior work.

### Production-like local verification

```bash
npm run build
npm run preview -- --host 127.0.0.1 --port 4180
```

This is the better check for:

- final layout behavior
- auth behavior closer to production
- PWA shell behavior
- release-candidate UI review

## Useful Commands

```bash
npm run dev
npm run lint
npm run typecheck
npm run test:run
npm run coverage
npm run build
npm run preview
npm run launch:verify
npm run functions:verify
```

### Native-shell foundation commands

```bash
npm run native:doctor
npm run native:sync
npm run android:sync
npm run android:assemble
npm run android:install
npm run android:open
npm run android:run
```

## Firebase and Deployment Notes

Forge is currently deployed on Firebase Hosting.

Production URL:

- [forge-510f3.web.app](https://forge-510f3.web.app)

The deploy flow covers:

- Hosting
- Firestore rules and indexes
- Storage rules
- Cloud Functions

If you are setting the project up from scratch, these docs are the best starting points:

- [Firebase setup](docs/firebase-setup.md)
- [Architecture overview](docs/architecture-overview.md)
- [Deployment guide](docs/deployment-guide.md)
- [Phone install guide](docs/production-deployment-and-phone-install-guide.md)

## Core Docs

For deeper product and implementation context, these are the most useful follow-on reads:

- [Architecture overview](docs/architecture-overview.md)
- [Firebase setup](docs/firebase-setup.md)
- [Deployment guide](docs/deployment-guide.md)
- [Notification delivery rules](docs/notification-delivery-rules.md)
- [Calm premium planner redesign plan](docs/calm-premium-planner-visual-redesign-plan.md)

## Project Status

The current codebase reflects a completed visual modernization and simplification pass that:

- merges older dashboard-style surfaces into a more focused planner IA
- introduces warmer dark mode and light mode support
- reduces copy verbosity across the app
- preserves analytics depth while improving clarity
- hardens the release-candidate web/PWA experience

## Development Principles Behind This Version

This version of Forge is shaped by a few strong product choices:

- simplify before expanding
- keep the planner legible on both desktop and mobile
- avoid exposing noisy implementation details to users
- preserve useful depth, but put it behind clearer structure
- optimize the real signed-in experience, not just demo screenshots

## Verification

Before major merges or deploys, the main verification flow is:

```bash
npm run lint
npm run typecheck
npm run test:run
npm run build
npm run functions:verify
```

For full release checks, `npm run launch:verify` runs the complete chain.
