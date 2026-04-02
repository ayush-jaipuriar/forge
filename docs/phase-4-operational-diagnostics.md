# Phase 4 Operational Diagnostics

This document defines what Forge can currently surface in-app for launch support, where those signals come from, and which blind spots still require Firebase Console or browser-level inspection.

## Scope

Phase 4 Milestone 2 does not try to turn Forge into a full observability platform. The goal is narrower and more useful:

- make the most important launch failures visible inside Forge
- make subsystem ownership explicit for support and triage
- keep blind spots honest instead of pretending the browser app can see everything

## In-App Diagnostics Surface

The primary operator-facing summary now lives in [src/features/settings/pages/SettingsPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/settings/pages/SettingsPage.tsx), backed by [src/services/monitoring/operationalDiagnosticsService.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/monitoring/operationalDiagnosticsService.ts).

It currently summarizes five launch-critical areas:

1. Sync replay
2. Scheduled backup protection
3. Notification delivery posture
4. Calendar integration health
5. Recent restore operations

Each diagnostic item includes:

- severity
- human-readable status label
- explanation of the current state
- ownership hint
- last observed timestamp when available

## Monitoring Coverage

Forge currently reports monitoring events through [src/services/monitoring/monitoringService.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/monitoring/monitoringService.ts).

High-value covered paths now include:

- Auth bootstrap and session failures
- App Check initialization issues
- Sync replay degradation and queue failures
- Notification delivery failures
- Scheduled backup stale/degraded state
- Manual backup success and failure
- Local restore success, partial restore, and restore failure
- Server backup payload retrieval failures
- Calendar refresh and mirror-sync failures

## Severity Model

- `healthy`: the subsystem is behaving as expected, or is intentionally disabled without implying broken behavior
- `warning`: the subsystem is usable but degraded, stale, incomplete, or still waiting on operator action
- `critical`: the subsystem has a visible failure or mismatch that should block trust in that surface until resolved

## Ownership Expectations

- Sync replay: Browser queue + Firebase sync
- Scheduled backup protection: Firebase Functions + Storage
- Notification delivery: Browser permission + notification orchestration
- Calendar integration: Browser OAuth + Google Calendar API
- Restore operations: Local operator action
- App Check and auth mismatch: Browser runtime + Firebase configuration

These owner labels are intentionally operational, not organizational. They tell the operator which system boundary to inspect first.

## Blind Spots

Forge still cannot fully surface these conditions in-app:

- raw Firebase Functions runtime logs still require Firebase Console or CLI access
- browser notification acceptance does not guarantee the operating system actually displayed a toast
- provider-side Google Calendar throttling or quota diagnostics are only partially reflected through downstream errors
- browser/PWA offline state explains queue posture, but it does not replace network-layer debugging tools

## Design Constraint

The diagnostics surface is intentionally a summary, not a live event stream. Forge remains a product app first. When a failure needs deeper forensic detail, the next step should be Firebase Console, browser devtools, or deployment logs rather than adding console-like complexity to the product UI.
