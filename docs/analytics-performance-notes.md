# Analytics Performance Notes

This document captures the Phase 2 Milestone 9 hardening posture for analytics performance and supportability.

## Current Strategy

Forge keeps the heavy analytics meaning in shared derivation layers instead of spreading it across React pages.

The main current layers are:

- snapshot generation in [snapshotGeneration.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/analytics/snapshotGeneration.ts)
- shared interpretation in [analyticsInterpretationService.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/analytics/analyticsInterpretationService.ts)
- Command Center workspace assembly in [commandCenterWorkspaceService.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/analytics/commandCenterWorkspaceService.ts)
- compressed cross-screen surfacing in [operationalAnalyticsService.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/analytics/operationalAnalyticsService.ts)

## Milestone 9 Review Outcome

The most obvious expensive derivation path was duplicated interpretation work:

- Command Center and the operational analytics layer were both recomputing rolling correlations, trends, rule evaluation, and gamification state from the same snapshot bundle

That has now been consolidated into:

- [analyticsInterpretationService.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/analytics/analyticsInterpretationService.ts)

Why this matters:

- less duplicate CPU work per analytics load
- lower risk of semantic drift between desktop analytics and operational alerts
- easier future optimization if larger historical datasets begin to hurt responsiveness

## Current Known Limits

- local workspace services still generate analytics bundles on demand rather than using a long-lived in-memory cache
- operational screens may each request their own workspace service, which is acceptable for current scope but may become worth consolidating further if data volume grows sharply
- projection and momentum remain heuristic and explainable, not statistically tuned models
- Functions exist for durable recomputation, but the current local app still derives a meaningful amount in-process for responsiveness

## What To Watch Later

- larger day-instance history windows
- repeated workspace loads during rapid route changes
- Function generation cost once remote snapshots become the default read source
- whether query `staleTime` and invalidation patterns need more deliberate tuning after real usage volume appears
