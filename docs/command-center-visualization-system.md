# Command Center Visualization System

This document records the first visualization rules for the Phase 2 Command Center. The goal is not to freeze every future chart, but to lock in the principles that make the analytics surface feel like Forge instead of a generic dashboard.

## Purpose

The Command Center is the desktop-heavy analytics cockpit for Forge. It should:

- reveal patterns across days rather than replaying a single day in a larger card
- keep projections, risks, and explanatory signals in one reading flow
- degrade honestly on smaller screens instead of pretending a compressed phone layout is equally effective
- prefer explainable visual primitives over black-box charting abstractions

## Files Added in Milestone 4

- [src/features/command-center/pages/CommandCenterPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/command-center/pages/CommandCenterPage.tsx)
- [src/features/command-center/hooks/useCommandCenterWorkspace.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/command-center/hooks/useCommandCenterWorkspace.ts)
- [src/services/analytics/commandCenterWorkspaceService.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/analytics/commandCenterWorkspaceService.ts)
- [src/features/command-center/chartTheme.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/command-center/chartTheme.ts)
- [src/features/command-center/components/AnalyticsMetricTile.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/command-center/components/AnalyticsMetricTile.tsx)
- [src/features/command-center/components/AnalyticsStateNotice.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/command-center/components/AnalyticsStateNotice.tsx)
- [src/features/command-center/components/ChartCard.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/command-center/components/ChartCard.tsx)
- [src/features/command-center/components/MiniTrendChart.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/command-center/components/MiniTrendChart.tsx)
- [src/features/command-center/components/DistributionBars.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/command-center/components/DistributionBars.tsx)
- [src/features/command-center/components/InsightCard.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/command-center/components/InsightCard.tsx)
- [src/features/command-center/components/WarningCard.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/command-center/components/WarningCard.tsx)
- [src/features/command-center/components/ProjectionPanel.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/command-center/components/ProjectionPanel.tsx)

## Information Architecture

The Milestone 4 layout uses four layers:

1. command header
2. rolling-window controls
3. summary metric strip
4. desktop split between main chart surfaces and right-rail pressure panels

That structure matters because the user should understand:

- what time window they are looking at
- whether the data is trustworthy enough to lean on
- the most important trend cards
- what action pressure those trends imply

## Visual Primitives

### Analytics Metric Tile

Use this for top-level summary numbers only. It should answer:

- what is the signal
- what is the current magnitude
- why does it matter

It is not a chart substitute. If the user needs shape, movement, or comparison, use a chart card instead.

### Chart Card

Chart cards are the default analytics surface container. They own:

- eyebrow, title, and framing description
- tone color
- stale-state chip
- insufficient-data fallback

The chart body should remain simple and readable without tooltips.

### Projection Panel

This card is special because it is not just a chart. It combines:

- projected outcome
- confidence
- summary interpretation
- explicit risks

If the projection is weak, the card must admit that directly.

### Warning Card

Warnings exist to create intervention pressure. They are not generic notifications.

Severity rules:

- `critical`: direct target or prime-block threat
- `warning`: meaningful drift that needs correction
- `info`: low-confidence or early watch condition

### Insight Card

Insights should remain explanatory. They are allowed to be interesting, but not mysterious. Each insight should be supported by visible evidence chips or short proof points.

## Tone System

Milestone 4 establishes five analytics tones in [chartTheme.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/command-center/chartTheme.ts):

- `ember`: primary action and energy
- `gold`: caution, pace pressure, intervention framing
- `steel`: neutral analytical structure
- `success`: positive momentum or stable pattern
- `critical`: hard risk

Rules:

- do not assign arbitrary colors per chart series
- use tone to communicate semantic meaning, not decoration
- preserve dark-surface contrast and avoid neon saturation

## State Honesty Rules

Milestone 4 intentionally formalizes three truth states:

- loading: the system is assembling the workspace
- insufficient data: the structure is ready, but the observation window is too shallow
- stale: the current query result is older than the freshness window

These states should feel premium, but they must never fake certainty.

## Responsive Rule

Desktop is the native mode for Command Center. Mobile may stack panels, but it should not:

- collapse everything into a single scroll of tiny charts
- pretend the surface is equally scannable on a small screen
- remove the explicit trust-state messaging

## Why This Matters

Milestone 5 will add deeper charts and projection surfaces. The Command Center will stay coherent only if later work reuses these primitives and tone rules instead of inventing a fresh layout for every card.

For the actual metric semantics behind the current chart stack, see [docs/command-center-metric-definitions.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/command-center-metric-definitions.md).
