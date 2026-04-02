# Phase 4 Launch Baseline Audit

## Purpose

This document is the Milestone 0 baseline for Phase 4.

Its job is to make three things explicit before launch hardening or native-shell work begins:

1. what Forge can honestly ship today
2. which runtime currently owns each critical responsibility
3. why the next platform steps are launch hardening first, native shell second, and deeper backend extraction third

This is intentionally a baseline audit, not a marketing summary.

## Current Product Posture

Forge now has three completed implementation phases behind it:

- Phase 1: execution engine, local-first workflow, scoring, recommendation, PWA, Firebase auth/bootstrap
- Phase 2: analytics, Command Center, projections, warnings, streaks, missions, momentum, operational signals
- Phase 3: notification foundations, scheduled orchestration, backup and restore, scheduled backups, Calendar read/write mirroring, health scaffolding

What that means in practice:

- Forge is no longer a concept-stage app
- Forge is also not yet a fully launch-hardened cross-platform product

Phase 4 exists to close that gap.

## Launch-Ready Today

These capabilities are currently strong enough to count as real shipped product behavior:

- browser-based authenticated Forge shell
- installed PWA shell with verified desktop and Android installability
- local-first execution model with queued sync
- scheduled notification orchestration with browser and installed-PWA delivery posture
- manual backup export plus scheduled backup durability with Cloud Storage payload storage
- primary Google Calendar read pressure plus explicit major-block write mirroring
- analytics and Command Center depth with shared derivation logic

Why this matters:

- launch planning should start from real strengths, not from a generic “everything is still scaffolding” mindset

## Not Launch-Ready Yet

These are important capabilities or product layers that remain incomplete for a broader launch:

- native mobile shell packaging and validation
- native mobile notification posture beyond browser/PWA delivery
- user-facing remote scheduled-backup picker and full remote restore workflow
- long-lived server-managed Google Calendar OAuth and background reconciliation
- live health-provider ingestion
- stronger platform-owned orchestration boundaries for some privileged or operational flows

Why this matters:

- Phase 4 should not waste time rediscovering known gaps that are already visible from the Phase 3 limits

## Production Posture Audit

### Hosting

Current state:

- Firebase Hosting is repo-managed through [firebase.json](/Users/ayushjaipuriar/Documents/GitHub/forge/firebase.json)
- SPA rewrites are configured
- service worker and manifest are served with `no-cache`
- immutable asset caching is configured for hashed build assets

Current confidence:

- strong for current browser and PWA deployment

Remaining launch pressure:

- deployment docs are present, but Phase 4 should add a stronger launch-runbook and rollback discipline

### Functions

Current state:

- Firebase Functions is now a first-class production path for notifications and backups
- Functions builds are repo-managed from `functions/`
- Node 20 is the declared target
- lint, typecheck, and build verification have already been exercised

Current confidence:

- strong for current scheduled orchestration foundations

Remaining launch pressure:

- more explicit operational diagnostics and service ownership mapping are needed before relying on Functions as a durable platform layer

### Storage

Current state:

- Firebase Storage is now a production dependency because scheduled backup payloads live there
- rules are repo-managed through `storage.rules`
- Firestore remains the operational metadata index

Current confidence:

- good for the current scheduled backup model

Remaining launch pressure:

- remote restore UX is still foundation-only, so Storage-backed durability is stronger than the current end-user recovery flow

### Auth

Current state:

- Firebase Auth with Google sign-in only
- live Firebase verification completed
- auth/bootstrap path is production-real in current browser contexts

Current confidence:

- strong for web

Remaining launch pressure:

- native-shell auth and callback assumptions are not yet validated because there is no native shell yet

### Firestore Rules

Current state:

- rules are repo-managed through [firestore.rules](/Users/ayushjaipuriar/Documents/GitHub/forge/firestore.rules)
- owner-only read/write posture is explicit
- scheduled backup and notification collections are already included

Current confidence:

- strong relative to the current one-user model

Remaining launch pressure:

- Phase 4 should keep rules aligned as platform ownership shifts, especially if more operations become server-owned

### App Check

Current state:

- App Check rollout posture is documented
- localhost intentionally stays relaxed
- deployed-environment enforcement remains the real rollout target

Current confidence:

- acceptable and honest

Remaining launch pressure:

- App Check should become part of a more formal launch configuration checklist instead of living only as an implementation note

## Ownership Map

This is the most important Milestone 0 output.

Phase 4 should extract only where ownership is wrong.

### Browser Application Owns

- local-first interaction flow
- Today, Schedule, Prep, Physical, Readiness, and Command Center presentation
- IndexedDB-backed local persistence and fast operational state
- PWA install/update/offline shell behavior
- browser notification permission and active-session delivery
- user-driven Calendar connect, read refresh, and explicit mirror sync actions
- local health scaffolding presentation

Why this ownership is currently correct:

- these flows need low-latency interaction and visible user control

### PWA Runtime Owns

- installability
- cached shell recovery
- service-worker-managed static/runtime caching
- update detection and offline messaging

Why this ownership is currently correct:

- these are shell/runtime concerns rather than business-domain concerns

### Firebase Functions Owns

- scheduled notification evaluation
- scheduled backup generation
- scheduled retention cleanup and backup metadata lifecycle

Why this ownership is currently correct:

- these flows are time-based orchestration and do not belong to an active browser session

### Shared Domain Logic Owns

- scoring semantics
- analytics interpretation
- notification rule meaning
- backup payload structure
- Calendar collision and mirror policy
- health normalization contracts

Why this ownership is currently correct:

- these rules should stay portable across browser, PWA, native shell, and server workflows

### Ownership Under Pressure

These areas are not wrong today, but are the most likely Phase 4 extraction candidates:

- remote restore selection and recovery orchestration
- richer diagnostics aggregation for launch support
- future integration token or provider state management
- native-shell capability interpretation where browser assumptions stop being sufficient

## Native Shell Decision Record

### Chosen Direction

Use Capacitor as the first native shell layer for Forge.

### Why Capacitor Wins for Phase 4

- the existing web product is already deep and real
- a React Native rewrite would slow launch hardening dramatically
- Capacitor unlocks native packaging and native bridge capability while preserving domain and UI investment
- it creates a real path toward native notifications, native shell auth handling, and future health bridges

### Why Not React Native in Phase 4

- too much duplication pressure
- too much platform rewrite risk
- weak fit for the current architecture-first launch objective

### What Capacitor Does Not Solve by Itself

- full native UX parity
- native push infrastructure
- health-provider ingestion
- server-side integration token management

That is acceptable because Phase 4 needs a native shell foundation, not a total platform rewrite.

## Feature Freeze Rule

Phases 1 through 3 are now functionally frozen except for:

- bug fixes
- release hardening
- integration-safe fixes
- platform-boundary corrections required by Phase 4

Why this matters:

- without this rule, launch phases often turn into accidental feature creep

## Phase 4 Validation Matrix

The expected validation surfaces for Phase 4 are:

### Browser Desktop

- auth
- Today execution
- Schedule overrides
- Command Center
- backup export/restore
- Calendar read/write
- Settings and diagnostics posture

### Browser Mobile

- auth
- Today execution
- Settings operational surfaces
- backup export posture
- Calendar visibility and truthfulness

### Installed PWA

- install/update/offline shell
- active-session notification capability
- local-first execution continuity
- degraded-state visibility

### Android Native Shell

- local build and launch
- shell boot reliability
- auth assumptions
- offline startup expectations
- Calendar and backup surface behavior inside the shell

### Functions and Server Workflows

- scheduled notifications
- scheduled backups
- retention cleanup
- build/typecheck/lint parity
- deploy-time configuration assumptions

## Key Phase 4 Risks

The largest Phase 4 risks today are:

- confusing “PWA-complete” with “mobile-complete”
- allowing browser-only assumptions to leak into native-shell work
- extracting too much backend responsibility too early
- under-documenting launch and recovery operations

## Milestone 0 Conclusion

Forge is ready to enter Phase 4.

The product already has enough real depth that Phase 4 should focus on:

- launch confidence
- shell expansion
- ownership correction

not on inventing another wave of product depth.
