# Command Center Metric Definitions

This document locks in the current meaning of the Phase 2 Milestone 5 Command Center charts. These definitions matter because analytics labels drift easily if we only describe them in UI copy.

## Projected Readiness Curve

Files:

- [src/domain/analytics/projections.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/domain/analytics/projections.ts)
- [src/domain/analytics/chartData.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/domain/analytics/chartData.ts)

Definition:

- Uses the current readiness snapshot plus historical analytics facts.
- Each point shows projected readiness percent.
- The dashed target line is currently fixed at `85%`.

Important limitation:

- This is a heuristic pace model, not a predictive ML forecast.

## Prep Hours by Topic

Files:

- [src/domain/prep/selectors.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/domain/prep/selectors.ts)
- [src/domain/analytics/chartData.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/domain/analytics/chartData.ts)

Definition:

- Uses cumulative `hoursSpent` from persisted prep topic progress.
- This is topic-state-driven, not a fully timestamped event history.
- It answers: “Which topics currently carry the most logged prep time?”

Important limitation:

- It is not yet a strict rolling-window topic chart.

## Prep Domain Attention

Files:

- [src/services/analytics/commandCenterWorkspaceService.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services/analytics/commandCenterWorkspaceService.ts)

Definition:

- Approximate prep hours allocated across focused domains inside the selected rolling window.
- Derived from historical day facts and focused prep domains.
- It answers: “Which major prep domains received execution attention in this window?”

Important limitation:

- Domain hours are approximated from focused-domain allocation because Phase 1 did not persist per-topic timestamps for each execution block.

## Sleep vs Performance

Files:

- [src/domain/analytics/chartData.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/domain/analytics/chartData.ts)

Definition:

- Groups days into `sleep target met`, `sleep target missed`, and `sleep not logged`.
- Primary value is average interview-prep score.
- Secondary value is average projected score.

Important limitation:

- This is grouped correlation, not causal proof.
- The chart should only be treated as a meaningful comparison when both `sleep target met` and `sleep target missed` buckets exist. `Sleep not logged` can add context, but it should not stand in for one side of the comparison.

## WFO vs WFH Comparison

Definition:

- Compares only canonical `wfhHighOutput` and `wfoContinuity` day types.
- Primary value is average projected score.
- Secondary value is average completed deep blocks.
- Support value is average completion percent.

Important limitation:

- Weekend and fallback day types are intentionally excluded from this comparison.

## Best-Performing Time Window

Definition:

- Aggregates all time-band outcomes in the current rolling window.
- Primary value is percent completed in the band.
- Secondary value is percent skipped in the band.

It answers:

- Which time band is most execution-reliable?
- Which time band is most prone to skip pressure?

Important limitation:

- This is currently a completion-stability view, not a full cognitive-performance score by time band. It does not yet include score quality, output capture, or deep-work success weighted directly by band.

## Daily Completion Heatmap

Definition:

- Currently uses a 35-day calendar strip ending at the anchor date.
- Each cell intensity represents completion percent for that day.
- Missing history is rendered as an empty cell, not a fake weak day.

Intensity thresholds:

- `0`: no tracked day
- `1`: completion above 0% and below 50%
- `2`: 50% to below 70%
- `3`: 70% to below 85%
- `4`: 85% or higher

## Execution Streak Calendar

Definition:

- Uses the same 35-day calendar surface as the heatmap.
- Strong execution day = `projected score >= 70` and `no prime block miss`.
- Calendar cell emphasis now uses the same rule as streak counting, so visual “strong” days and streak math do not drift apart.
- The formal Milestone 7 streak engine now adds category streaks and break reasons on top of this same threshold instead of maintaining a separate execution-streak definition.

Important limitation:

- The calendar only shows the execution category visually. Deep-work, prep, sleep, workout, and logging streaks are derived separately and surfaced as summary rows rather than separate calendar overlays.

## Momentum Meter

Definition:

- Uses the trailing recent window from the formal gamification engine.
- Weights score quality, strong-day rate, deep-work continuity, output capture, sleep, and workout continuity.
- Applies penalties for prime misses and heavy fallback dependence.

Important limitation:

- Momentum is a discipline-pressure summary, not a vanity score.
- Low-friction actions alone cannot meaningfully inflate it.

## Weekly Pressure Missions

Definition:

- Missions are selected from current deficits and leverage points, not from random achievement prompts.
- Candidate families currently include deep-work consistency, sleep recovery, workout consistency, topic-neglect recovery, weekend utilization, and WFO continuity.
- Progress uses behavior-specific units such as days, sessions, or neglected topics touched.

Important limitation:

- Missions are only surfaced when there is enough history to justify them honestly.
- This is a pressure system, not a badge collector.

## Gym vs Productivity Correlation

Definition:

- Compares `workout completed` days against `workout expected but not completed` days.
- Primary value is average interview-prep score.
- Secondary value is average projected score.

Important limitation:

- Days with no scheduled workout are intentionally excluded.

## Score Trend

Definition:

- Rolling daily projected score trend.
- Secondary marker is earned score.

It answers:

- How much quality is already landed?
- How much of the current day pattern still depends on remaining work?

## Deep Block Completion Trend

Definition:

- Rolling daily completed deep-block count.
- Secondary marker is prep hours for that day.

Important limitation:

- Prep hours are derived from completed prep/deep/review blocks, not separate timer logs.
