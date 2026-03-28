# Analytics Insight Rules

This document locks in the current Phase 2 Milestone 6 insight engine. Its job is to keep the rule layer explainable, stable, and coach-like as later milestones add streaks, missions, and deeper operational warnings.

## Core Files

- [insights.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/domain/analytics/insights.ts)
- [types.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/domain/analytics/types.ts)
- [commandCenterWorkspaceService.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/analytics/commandCenterWorkspaceService.ts)
- [CommandCenterPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/command-center/pages/CommandCenterPage.tsx)

## Purpose

- Turn rolling analytics facts into explainable warnings and insights.
- Keep Command Center guidance modular instead of embedding interpretation directly in React components.
- Provide one reusable output contract for warning cards, insight cards, and the coach-summary opener.

## Output Contract

Each rule emits the shared `AnalyticsInsight` shape:

- `ruleKey`: stable identifier for the rule family
- `severity`: `info`, `warning`, or `critical`
- `confidence`: `low`, `medium`, or `high`
- `title`: short operator-facing headline
- `summary`: plain-language explanation of the detected pattern
- `supportingEvidence`: labeled evidence points with optional positive, negative, or neutral direction
- `sourceWindow`: rolling window that produced the pattern

The same rule outputs are then mapped into:

- warning cards for non-`info` risks
- insight cards for lower-severity guidance
- one coach summary that surfaces the highest-priority actionable signal

## Implemented Rule Families

The current rule engine covers:

- sleep versus prep quality
- gym versus mental performance
- topic neglect
- weekend utilization
- most-missed time window
- best-performing time window
- pace prediction
- WFO versus WFH differences
- deep-block completion trend
- readiness progression pace
- behind-target warning
- low-energy success patterns

These rules were chosen because Milestone 5 already made their underlying evidence stable enough to reason on honestly.

## Severity and Confidence Semantics

Severity answers: how operationally urgent is this pattern?

- `critical`: immediate target-risk or meaningful execution slippage
- `warning`: actionable weakness or imbalance that should influence planning soon
- `info`: useful pattern, reinforcement, or low-urgency observation

Confidence answers: how much sample support exists for this pattern?

- `low`: narrow sample or weak comparison base
- `medium`: decent evidence, still directional
- `high`: relatively stronger repeated pattern inside the current window

Important boundary:

- confidence is not model certainty
- it is evidence strength based on the current rolling sample

## Rule Ordering and Precedence

The engine sorts outputs by:

1. severity
2. confidence

This means:

- urgent risks appear before softer observations
- stronger-supported signals beat weaker-supported ones inside the same severity level

The sorting strategy is intentionally simple and visible so later milestones can extend it without hiding business meaning.

## Coach Summary Behavior

The coach summary is not a separate AI system. It is a compression layer over the current rule outputs.

- if meaningful insights exist, the summary is built from the highest-priority insight after sorting
- if history is too shallow, the summary falls back to an honest insufficient-pattern state
- the summary should feel like an operator brief, not motivational fluff

## Copy Tone Guidance

All rule copy should stay within these constraints:

- analytical, plain, and direct
- evidence-backed rather than preachy
- pressure-oriented when risk is real
- never mystical, pseudo-AI, or self-congratulatory

Good rule copy explains what changed and why it matters.
Weak rule copy sounds like generic encouragement or overclaims causality.

## Current Limits

- the engine is heuristic and evidence-based, not predictive AI
- time-band reasoning is still execution-reliability-focused rather than true cognitive scoring by band
- prep-domain balance remains an approximation because Phase 1 did not persist timestamped per-topic execution events
- confidence only reflects current sample support, not long-term statistical validity

Those limits are acceptable for Milestone 6 as long as the UI continues to state them honestly.
