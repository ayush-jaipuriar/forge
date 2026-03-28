# Analytics Operational Signals

This document locks in the Phase 2 Milestone 8 rule for pushing analytics back into operational screens.

## Principle

Command Center remains the depth surface.

- Today should receive only signals that change immediate execution.
- Readiness should receive only signals that change pace judgment or study breadth decisions.
- Schedule should receive only signals that change planning and protection decisions across the week.

If a signal needs chart context to make sense, it probably belongs in Command Center instead of an operational page.

## Shared Source

The shared operational layer lives in:

- [operationalAnalyticsService.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/analytics/operationalAnalyticsService.ts)

It reuses the same analytics snapshot, insight, projection, and gamification foundations as Command Center so screens do not drift into competing interpretations.

## Global Versus Screen-Specific Signals

### Global

Global operational signals are cross-screen truths that should be consistent everywhere:

- projection pace risk
- coach-summary posture
- active high-priority weekly missions
- momentum posture

### Today

Today should surface:

- behind-target pressure
- protect-this-window pressure
- streak-break risk only when it is immediately relevant
- the current highest-value mission if it changes today’s behavior

Today should not surface:

- broad historical correlations that do not change immediate action
- long lists of secondary insights

### Readiness

Readiness should surface:

- pace intervention risk
- readiness-breadth or domain-neglect pressure
- operating posture and momentum context
- the top mission if it changes readiness interpretation

Readiness should not surface:

- micro execution reminders
- detailed schedule-day protection prompts

### Schedule

Schedule should surface:

- week-level planning pressure
- high-leverage day protection tags
- weekend and WFO continuity pressure where it affects planning decisions
- fallback-mode honesty on affected dates

Schedule should not surface:

- deep analytical explanations better suited to Command Center
- per-block coaching that belongs on Today

## Tone Guardrails

- serious
- direct
- specific
- operational

Signals should sound like pressure and decision support, not like notifications from a productivity toy.

## Current Limits

- operational signals currently reuse the 30-day rolling analytics frame
- the same shared warnings are intentionally compressed for operational use rather than re-explained in full
- Milestone 8 pushes the highest-value signals back into screens, but Command Center remains the source of depth
