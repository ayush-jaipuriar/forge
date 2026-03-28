# Notification Delivery Rules

## Purpose

This document records the Phase 3 Milestone 2 notification foundation so the product remains strict, sparse, and honest.

Forge notifications are operational interventions, not engagement spam.

## Supported Channel

Current supported delivery channels:

- browser notifications
- installed-PWA notifications

Explicitly not supported yet:

- native mobile push
- background delivery that depends on a dedicated mobile shell

This matches the current product architecture. Forge is a React plus Vite plus PWA system, so browser and installed-PWA notification delivery are the honest Phase 3 foundation.

## Current Notification Categories

Phase 3 Milestone 2 supports three rule families:

- `missed-critical-block`
- `fallback-mode-suggestion`
- `weekly-summary`

These map directly to the PRS priorities instead of introducing extra reminder noise.

## Rule Semantics

### Missed Critical Block

This notification becomes eligible when:

- the day’s prime block has been skipped
- score pressure is already `slipping` or `critical`
- browser permission is granted
- notifications are enabled
- the daily cap has not been reached

Why:

- this is the clearest “salvage now” intervention in the current product

### Fallback Mode Suggestion

This notification becomes eligible when:

- Forge is already recommending a real mode downgrade through the existing fallback engine
- browser permission is granted
- notifications are enabled
- the daily cap has not been reached

Why:

- fallback should feel like an operational pivot, not something the user only notices if they happen to be staring at Today

### Weekly Summary

This notification becomes eligible when:

- it is Sunday evening
- the current week has not already received a summary notification
- browser permission is granted
- notifications are enabled
- the daily cap has not been reached

Why:

- this gives Forge one bounded review moment without turning weekly summaries into generic email-style digests

## Suppression Rules

Notifications are currently suppressed for these reasons:

- notifications are disabled in settings
- browser permission is not granted
- the browser does not support notifications
- the daily cap has already been reached
- the rule is not actually met
- a duplicate notification for the same source date or week has already been delivered

These suppression reasons are stored intentionally because not delivering is often the correct behavior and should still be inspectable.

## Daily Cap

Forge currently enforces a hard daily cap of `3` delivered notifications.

Why:

- the PRS explicitly requires tight limits
- Forge should create pressure, not interruption fatigue
- once a user has already received three interventions in a day, more reminders are usually a sign that the rules are becoming noisy rather than useful

## Copy Tone

Notification copy should follow these rules:

- sound operational, not motivational
- state the problem or next move clearly
- avoid cheerleading language
- avoid guilt-heavy shaming language
- prefer salvage framing over vague encouragement

Good examples:

- `Prime block missed`
- `Shift into Low Energy mode`
- `Weekly Forge summary is ready`

Bad examples:

- `You got this!`
- `Stay productive!`
- `Time to hustle!`

## Logging and Counters

Forge currently records:

- delivered notifications
- suppressed evaluations when explicitly persisted by the notification state service
- daily delivered and suppressed counters
- last delivered timestamp
- last weekly-summary week key

This matters because notification trust depends on explainability, not just delivery.

## Current Limits

The current foundation is intentionally limited:

- notifications are evaluated while the app is active in the browser or installed PWA
- recurring scheduled delivery and weekly-summary job orchestration are still Milestone 3 work
- notification logs are local-first right now
- native push and broader background delivery remain future work

That means Phase 3 Milestone 2 gives Forge a real delivery foundation, but not yet a full scheduled-notification system.
