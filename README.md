# Forge

Forge is a personal execution OS for disciplined interview preparation, physical training, and recovery-aware daily planning.

Phase 1 now exists across the core domain, UI, persistence, scoring, recommendation, PWA, and calendar-scaffolding layers, and its core environment verification has been completed.

## What Exists

- fixed seeded routine engine with day generation, fallback modes, and operational overrides
- local-first execution flow for Today and Schedule backed by IndexedDB plus queued sync
- persisted prep progress, workout logging, sleep and energy signals, and readiness heuristics
- weighted daily scoring and rules-based next-action recommendations
- installable PWA shell with offline baseline behavior and Hosting configuration
- Phase 2 Command Center with PRS-priority charts, projection framing, and risk/insight panels
- Phase 2 modular pattern-detection engine with confidence-aware warnings, insights, and coach summaries
- Phase 2 disciplined gamification layer with formal streaks, deficit-driven missions, and anti-padding momentum
- Phase 2 operational analytics surfacing across Today, Readiness, and Schedule with shared pressure signals
- Phase 3 Google Calendar integration with primary-calendar read pressure, bounded event caching, and explicit major-block write mirroring

## Setup

```bash
npm install
cp .env.example .env
```

Fill in real Firebase web-app values in `.env` before expecting auth or Firestore-backed sync to work.

## Local Development

```bash
npm run dev
```

Useful scripts:

- `npm run lint`
- `npm run test:run`
- `npm run typecheck`
- `npm run build`
- `npm run preview`

For a production-like PWA check:

```bash
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

## Core Docs

- [Phase 1 Spec & Implementation Plan](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/phase-1-spec-implementation-plan.md)
- [Phase 2 Spec & Implementation Plan](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/phase-2-spec-implementation-plan.md)
- [Phase 3 Spec & Implementation Plan](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/phase-3-spec-implementation-plan.md)
- [Architecture Overview](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/architecture-overview.md)
- [Command Center Visualization System](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/command-center-visualization-system.md)
- [Command Center Metric Definitions](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/command-center-metric-definitions.md)
- [Analytics Insight Rules](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/analytics-insight-rules.md)
- [Analytics Gamification Rules](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/analytics-gamification-rules.md)
- [Analytics Operational Signals](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/analytics-operational-signals.md)
- [Analytics Performance Notes](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/analytics-performance-notes.md)
- [Notification Delivery Rules](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/notification-delivery-rules.md)
- [Notification Scheduling Operations](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/notification-scheduling-operations.md)
- [Backup and Restore Operations](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/backup-and-restore-operations.md)
- [Phase 3 Spec and Implementation Plan](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/phase-3-spec-implementation-plan.md)
- [Firebase Setup](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/firebase-setup.md)
- [Deployment Guide](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/deployment-guide.md)
- [Google Calendar Integration Notes](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/google-calendar-scaffolding.md)
- [Future Extension Notes](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/future-extension-notes.md)
- [Release Readiness Checklist](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/release-readiness-checklist.md)
- [Phase 2 Release Readiness Checklist](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/phase-2-release-readiness-checklist.md)

## Verification Status

The repo currently passes:

- `npm run lint`
- `npm run test:run`
- `npm run typecheck`
- `npm run build`

Desktop Chromium verification has also been completed for the built PWA shell, including manifest visibility, service-worker control, and forced offline reload of the auth shell.
Android Chrome verification has now also been completed on a real `adb`-connected device, including successful shell rendering, visible install surface, and cached-shell reload after the local preview origin was stopped.
Live Firebase verification has also been completed against a real project, including Google sign-in plus creation of `users/{uid}` and `users/{uid}/settings/default`.

## Known Limitations

- Google Calendar now supports primary-calendar pressure plus explicit major-block write mirroring in Phase 3, but long-lived server-managed OAuth and background reconciliation are not complete yet.
- Offline behavior is intentionally shell-first and action-focused. It does not attempt full query-cache persistence for every screen.

## Product Boundary

Forge is not a generic habit tracker, routine editor, or analytics toy. The current codebase intentionally protects these boundaries:

- routines are seeded and config-driven
- operational overrides are allowed; free-form template editing is not
- scoring favors real execution and cannot be padded by low-value completions
- integrations are scaffolded only when they can be introduced without rewiring the core product
