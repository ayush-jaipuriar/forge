# Analytics Gamification Rules

This document locks in the Phase 2 Milestone 7 discipline layer: streaks, momentum, missions, and the anti-gamification guardrails that keep Forge serious.

## Core Files

- [gamification.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/domain/analytics/gamification.ts)
- [commandCenterWorkspaceService.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/analytics/commandCenterWorkspaceService.ts)
- [CommandCenterPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/command-center/pages/CommandCenterPage.tsx)

## Principle

This layer exists to deepen discipline, not to entertain.

- streaks should expose continuity and break causes
- momentum should summarize recent execution quality
- missions should apply weekly pressure to the biggest real deficits

If a rule makes it easy to “win” through low-value actions, it is a bad Forge rule.

## Formal Streak Categories

The current engine derives:

- execution
- deep work
- prep
- workout
- sleep
- logging

Each category has:

- relevance rules
- success rules
- break reasons

This matters because a sleep streak should not break for the same reason as a deep-work streak, and workout streaks should not be penalized on days with no scheduled workout.

## Momentum Guardrails

Momentum is intentionally not based on raw completion count.

It currently weights:

- projected score quality
- strong-day rate
- deep-work continuity
- output capture
- sleep consistency
- workout continuity

It currently penalizes:

- prime-block misses
- heavy fallback dependence

That design keeps the score anchored to meaningful behavior instead of rewarding administrative activity.

## Weekly Mission Selection

Weekly missions are chosen from deficits and leverage points such as:

- behind-target pressure
- deep-work softness
- sleep drag
- workout inconsistency
- prep-domain neglect
- weak weekend utilization
- WFO continuity gaps

Missions are not random prompts and they are not “daily challenges.”

## Anti-Gamification Rules

- low-value tasks must not inflate momentum meaningfully
- logging alone must not create a false “surging” posture
- missions should prefer what is weak, not what is easy
- streaks should ignore irrelevant days instead of manufacturing breaks
- posture labels should sound operational, not playful

## Current Limits

- momentum is still heuristic and explainable, not a statistically validated model
- missions are reproducible derived state, not yet separately persisted mission records
- the Command Center currently carries this layer first; Milestone 8 will push the highest-value signals back into operational screens
