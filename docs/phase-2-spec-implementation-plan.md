# Forge Phase 2 Spec and Implementation Plan

## Document Purpose

This document translates the Phase 2 intent in [PRS.md](../PRS.md) into a concrete implementation specification and execution checklist.

It is designed to do four jobs:

1. define what Phase 2 actually is, and just as importantly what it is not
2. recommend the right build order so analytics depth does not collapse into UI-first guesswork
3. break the work into trackable milestones with embedded testing and documentation
4. preserve the product tone of Forge as a serious execution OS rather than a generic analytics dashboard

## Phase 2 Clarified Constraints

This Phase 2 plan is based on the product spec in [PRS.md](../PRS.md) plus explicit planning decisions made after Phase 1:

- build analytics foundations before the Command Center UI
- introduce Firebase Functions selectively where durable snapshot generation, projections, or scheduled recomputation materially help
- treat streaks, missions, and momentum as a core milestone, not a cosmetic add-on
- include Firestore rules hardening, App Check, and production monitoring as explicit Phase 2 work
- keep Phase 1 feature-frozen except for bug fixes, validation fixes, and integration-safe hardening

## Phase 2 Scope Extracted from PRS

Phase 2 in [PRS.md](../PRS.md) is explicitly:

- Command Center
- charts
- pattern detection engine
- projections
- streaks / missions / momentum
- advanced warnings and insights

Phase 2 is not the stage for:

- full Google Calendar read/write sync
- notifications as a real delivery channel
- export/backup completion
- broad sync-polish rewrites
- backend replacement with Spring Boot

Those remain Phase 3 concerns even if Phase 2 should leave cleaner seams for them.

## Phase 2 Outcome

By the end of Phase 2, Forge should be a production-grade execution intelligence system built on top of the Phase 1 execution engine.

That means:

- the app can compute durable analytics facts and derived summaries from real user behavior
- the desktop-heavy Command Center is a serious analytics cockpit with charted trends, projections, and risk signals
- pattern detection produces explainable and modular insights rather than ad hoc chart commentary
- streaks, missions, momentum, and advanced warnings are all grounded in actual behavioral data
- readiness and pace forecasting become materially more predictive and less heuristic
- Firestore security, App Check, and monitoring are strong enough that the product can move from prototype-hardening into sustained use

## Product Intent to Preserve

Phase 2 must preserve these product truths from [PRS.md](../PRS.md):

- Forge is still an execution OS first, not an analytics toy
- analytics must reinforce discipline and decision quality, not distract from action
- the tone should stay sharp, serious, and war-room-like rather than cheerful or quant-dashboard generic
- insights should be analytical and coach-like, not preachy, fluffy, or pseudo-AI mystical
- mobile remains the daily execution surface, while desktop becomes the primary depth surface for review and analysis

## In Scope

- analytics fact model and derived summary model
- Command Center information architecture and desktop-heavy analytics UX
- chart data pipelines and reusable chart presentation patterns
- projections for readiness, pace, and probable target-date slippage
- modular pattern detection engine
- insight cards, warnings, bottleneck cards, and risk surfacing
- streaks, weekly missions, readiness levels, momentum meter, and related disciplined gamification
- deeper readiness decomposition and velocity modeling
- Firestore security rules and indexing review
- App Check setup and rollout strategy
- monitoring, error visibility, and operational diagnostics
- analytics test coverage and validation fixtures
- documentation for analytics architecture, rules, and operations

## Explicitly Out of Scope

- full Google Calendar read/write implementation
- real notification delivery flows
- CSV/JSON export completion
- health or wearable integrations
- AI-generated coaching
- multi-user collaboration features
- full backend extraction to Spring Boot
- arbitrary custom report builders

## Success Criteria

Phase 2 is complete only if all of the following are true:

- Command Center exists as a real desktop analytics surface, not a placeholder page
- the app produces chartable analytics datasets from actual persisted execution data
- at least the highest-priority charts from the PRS are implemented with real data
- pattern detection emits explainable insight cards and risk warnings from modular rules
- readiness projection and pace-vs-target logic are materially stronger than the Phase 1 heuristic baseline
- streaks, missions, and momentum are persisted or reproducible from stable derived state
- Firestore rules are no longer effectively test-mode loose
- App Check is configured at least for planned rollout and documented honestly
- monitoring and diagnostics are sufficient to observe analytics failures or broken derivation paths
- the Phase 2 architecture keeps Calendar sync and notifications clearly deferred without blocking them later

## Recommended Build Strategy

## 1. Analytics Foundation Before UI

Recommendation:

- do not start by drawing all Command Center charts
- start by defining analytics facts, rollups, projections, and rule outputs first

Why:

- chart-first delivery often hardcodes business meaning inside components
- if analytics semantics are weak, every chart becomes brittle and every “insight” becomes hand-wavy
- Command Center quality depends more on data truthfulness than on visual polish

## 2. Hybrid Derivation Model

Recommendation:

- keep immediate exploratory calculations available in the client for fast interaction
- introduce Firebase Functions for durable analytics snapshots, projections, and scheduled recomputation

Why:

- some analytics should feel instant when the user opens Command Center
- but heavier derived summaries, longitudinal projections, and reusable warning snapshots should not depend entirely on the browser
- Functions let Phase 2 remain inside the Firebase ecosystem without prematurely introducing a separate backend stack

Use Functions for:

- nightly or scheduled analytics snapshot recomputation
- derived weekly and rolling-window summaries
- target-date pace projections
- precomputed Command Center cards where recomputation cost is meaningful

Keep in client:

- local filters
- lightweight derived comparisons
- chart toggles and view composition
- immediate, low-cost view-model shaping from snapshot data

## 3. Security and Operations as Real Product Work

Recommendation:

- treat Firestore rules, App Check, and monitoring as first-class milestones

Why:

- Phase 2 increases data value and product seriousness
- analytics systems silently rot when derivation paths fail and no one sees the failure
- moving from Firestore test-mode habits to a stable product requires operational hardening, not just more UI

## Architecture Principles

## 1. Facts First, Insights Second

Pattern detection rules should consume normalized analytics facts and summaries, not raw UI state.

This means:

- derive stable facts from day instances, settings, workouts, prep progress, and scores
- compute rollups over defined windows such as 7, 14, 30, and 90 days
- build insight rules against those rollups
- keep chart views thin and declarative

## 2. Deterministic Derivation

Analytics should be reproducible from persisted source records plus documented derivation rules.

This means:

- avoid hidden hand-edited summary docs without a traceable derivation path
- keep rule keys, snapshot versions, and time-window definitions explicit
- version important derived outputs so future rule changes do not create silent semantic drift

## 3. Explainable Insight Rules

Every advanced warning or insight should be explainable in human terms.

This means:

- rule outputs should include `ruleKey`, severity, summary, supporting metrics, and affected window
- cards should be inspectable and testable
- avoid black-box scoring for Phase 2

## 4. Analytics as a Separate Domain Layer

Do not bury analytics inside the Command Center page.

This means:

- add dedicated domain modules for analytics facts, projections, insight rules, missions, and streak logic
- keep chart config separate from derivation logic
- let Today, Readiness, and Command Center all consume the same analytics outputs

## 5. Phase Boundary Discipline

Leave phase-3 seams visible but do not leak phase-3 implementation scope into Phase 2.

This means:

- Calendar data may appear only as a future input boundary or placeholder source in analytics context
- notification rules may be defined conceptually, but actual delivery infrastructure stays deferred
- export remains documented, not fully implemented

## Proposed High-Level Architecture

## Application Layers

### Presentation Layer

- Command Center route and desktop analytics layouts
- reusable chart wrappers
- analytics cards, insight cards, bottleneck cards, projection panels
- streak, momentum, and mission presentation components

### Application Layer

- analytics workspace loaders
- snapshot refresh orchestration
- window/filter management
- cross-screen consumers for Today, Readiness, and Command Center warnings

### Domain Layer

- analytics fact extraction
- aggregation and rollup logic
- projection models
- insight/pattern rule engine
- streak and mission derivation
- readiness velocity and target-slip logic

### Data Layer

- repositories for analytics snapshots and metadata
- Firestore reads for derived summaries
- local caches for recent analytics
- mappers from source records into analytics facts

### Integration Layer

- Firebase Functions for scheduled or on-demand snapshot generation
- Firestore rules and index definitions
- App Check integration
- monitoring/logging boundaries

## Proposed Folder Expansion

```text
src/
  features/
    command-center/
      components/
      hooks/
      pages/
      services/
    streaks/
      components/
      hooks/
    missions/
      components/
      hooks/
  domain/
    analytics/
      facts/
      rollups/
      insights/
      projections/
      charts/
      types.ts
    streaks/
    missions/
    warnings/
  data/
    firebase/
      firestoreAnalyticsSnapshotRepository.ts
      firestoreStreakRepository.ts
    mappers/
      analytics/
  services/
    analytics/
      snapshotRefreshService.ts
      commandCenterWorkspaceService.ts
      readinessProjectionService.ts
    monitoring/
    security/
functions/
  src/
    analytics/
      generateDailySummary.ts
      generateWeeklySummary.ts
      generateProjectionSnapshot.ts
    triggers/
    scheduled/
```

## Phase 2 Data Model Direction

Phase 2 should expand the Firestore schema intentionally rather than continue placing all derived intelligence inside one generic settings document.

## Primary Source Records Already Available

- `users/{uid}`
- `users/{uid}/settings/default`
- `users/{uid}/dayInstances/{dayId}`

## New Derived Collections and Documents

Recommended additions:

- `users/{uid}/analyticsSnapshots/daily-{date}`
- `users/{uid}/analyticsSnapshots/weekly-{isoWeek}`
- `users/{uid}/analyticsSnapshots/rolling-7d`
- `users/{uid}/analyticsSnapshots/rolling-30d`
- `users/{uid}/projections/default`
- `users/{uid}/streaks/default`
- `users/{uid}/missions/{missionId}`
- `users/{uid}/insights/{insightId}` or a bounded `current` snapshot doc depending on storage tradeoffs
- `users/{uid}/analyticsMetadata/default`

## Derived Fact Categories

Each derivation path should aim to produce reusable facts such as:

- deep block completion counts
- missed block distribution by time band
- prep minutes by domain and topic
- output-captured counts
- workout adherence by weekday and day type
- sleep duration distributions
- WFH vs WFO completion comparisons
- low-energy and survival-mode activation rates
- streak continuity and break causes
- score distributions and variance
- readiness pace and target-date slip

## Snapshot Versioning

Every durable analytics snapshot should include:

- `snapshotVersion`
- `generatedAt`
- `sourceWindow`
- `sourceRange`
- `ruleVersion`

Why:

- Phase 2 changes business meaning more than Phase 1 did
- versioning helps us migrate insight logic without corrupting historical interpretation

## Security and Hardening Direction

Phase 2 should move away from temporary permissive Firestore assumptions and toward a real deployable stance.

Recommended hardening targets:

- user-scoped Firestore rules for all source and derived collections
- explicit index review for any new analytics query patterns
- App Check enabled with a rollout plan that does not block local development
- production error logging and analytics-function observability
- failure visibility for snapshot generation, stale projections, and broken insight pipelines

## Milestones

## Milestone 0: Phase 2 Foundation and Contracts

### Goal

Define the analytics contracts, derivation boundaries, and schema expansions before building the Command Center UI.

### Deliverables

- analytics domain model
- snapshot shape definitions
- projection contract
- insight rule contract
- streak and mission contract

### Checklist

- [ ] Define analytics fact types and rolling-window conventions.
- [ ] Define snapshot document shapes for daily, weekly, and rolling summaries.
- [ ] Define projection output types including pace, confidence framing, and target-slip metadata.
- [ ] Define insight rule output types with `ruleKey`, severity, evidence, and display copy boundaries.
- [ ] Define streak, mission, and momentum types as stable derived-state contracts.
- [ ] Add schema notes and indexing considerations for new analytics collections.

### Testing and Documentation

- [ ] Add analytics fixture strategy notes for deterministic test data.
- [ ] Document schema and derivation contracts in architecture docs.

### Exit Criteria

- analytics semantics are clear enough that UI implementation can proceed without inventing data meaning ad hoc

## Milestone 1: Firestore Rules, App Check, and Monitoring Hardening

### Goal

Establish an operationally credible Firebase posture before increasing data sensitivity and product complexity.

### Deliverables

- Firestore rules
- index definitions
- App Check rollout notes
- monitoring baseline

### Checklist

- [ ] Add repo-managed Firestore rules covering source and derived user-scoped documents.
- [ ] Review and document Firestore indexes needed for analytics reads.
- [ ] Define local-dev-safe App Check strategy and production rollout plan.
- [ ] Add monitoring or logging boundaries for analytics failures and auth/data access failures.
- [ ] Document operational runbooks for stale snapshots, failed functions, and broken rules.

### Testing and Documentation

- [ ] Add rules validation or emulator-based checks where feasible.
- [ ] Update Firebase setup and deployment docs with hardening steps.

### Exit Criteria

- Phase 2 can grow without relying on test-mode assumptions or invisible failures

## Milestone 2: Analytics Fact Extraction and Rollup Engine

### Goal

Turn Phase 1 execution data into reusable analytics facts and rollups.

### Deliverables

- fact extractors
- aggregation helpers
- rolling-window rollups
- chart-ready summary selectors

### Checklist

- [ ] Extract analytics facts from day instances, settings, prep progress, workout logs, sleep logs, and scores.
- [ ] Implement reusable rollups for 7, 14, 30, and 90-day windows.
- [ ] Add weekday, day-type, time-band, and domain-based grouping helpers.
- [ ] Compute base KPIs for prep, physical, discipline, streak continuity, and completion quality.
- [ ] Add chart-ready selectors so chart components do not understand raw Firestore documents.

### Testing and Documentation

- [ ] Add deterministic unit tests for fact extraction and rollups.
- [ ] Document window semantics and grouping rules.

### Exit Criteria

- the app can compute truthful analytics summaries without embedding business logic inside charts

## Milestone 3: Firebase Functions Snapshot Pipeline

### Goal

Introduce durable analytics snapshots and projection recomputation where client-only derivation would become brittle or too expensive.

### Deliverables

- Functions workspace
- snapshot generation functions
- projection generation functions
- invocation and refresh strategy

### Checklist

- [ ] Add Firebase Functions project structure without overcommitting to a separate backend architecture.
- [ ] Implement a daily summary generator from canonical source records.
- [ ] Implement weekly and rolling-window snapshot generation.
- [ ] Implement projection snapshot generation for readiness pace and target-date slip.
- [ ] Define on-demand versus scheduled refresh behavior.
- [ ] Persist snapshot metadata including generation version and timestamp.

### Testing and Documentation

- [ ] Add tests for function-level derivation helpers.
- [ ] Document when snapshots are refreshed and what can remain client-derived.

### Exit Criteria

- durable analytics and projections no longer depend solely on the active client session

## Milestone 4: Command Center Shell and Visualization System

### Goal

Create the desktop-heavy analytics cockpit shell and reusable visualization primitives.

### Deliverables

- Command Center route/page
- analytics layout system
- chart card primitives
- insight card patterns
- risk card patterns

### Checklist

- [ ] Add the real Command Center route to the app shell and navigation.
- [ ] Build a desktop-first layout with responsive degradation rather than mobile-primary compression.
- [ ] Create chart card, metric tile, insight card, warning card, and projection panel primitives.
- [ ] Define chart theming and visual language aligned with Forge’s dark command-center identity.
- [ ] Add loading, stale-data, and insufficient-data states that still feel premium and honest.

### Testing and Documentation

- [ ] Add smoke-style route tests for Command Center rendering and core empty states.
- [ ] Document the visualization system and chart style rules.

### Exit Criteria

- Command Center exists as a credible surface ready to consume real analytics

## Milestone 5: Core Charts and Projection Surfaces

### Goal

Implement the highest-priority charts and pace projections from the PRS.

### Deliverables

- readiness projection chart
- prep hours by topic chart
- sleep vs performance correlation view
- WFO vs WFH comparison view
- deep block and score trend charts
- heatmap and streak calendar

### Checklist

- [ ] Implement projected readiness curve.
- [ ] Implement prep hours by topic and major domain.
- [ ] Implement sleep vs performance correlation chart.
- [ ] Implement WFO vs WFH performance comparison.
- [ ] Implement best-performing time-window analysis view.
- [ ] Implement daily completion heatmap.
- [ ] Implement deep block completion trend.
- [ ] Implement gym vs productivity correlation chart.
- [ ] Implement streak calendar.
- [ ] Implement score trend chart.

### Testing and Documentation

- [ ] Add chart-data tests for each chart family.
- [ ] Document metric definitions so chart labels stay semantically stable.

### Exit Criteria

- the PRS-priority chart stack is represented with real data and honest states

## Milestone 6: Pattern Detection and Insight Engine

### Goal

Build the modular analytics rule engine that turns rollups into useful warnings and insights.

### Deliverables

- insight rule registry
- bottleneck detection
- risk warnings
- coach-like summaries

### Checklist

- [ ] Implement critical rules for sleep/performance, gym/performance, topic neglect, weekend utilization, missed-block time windows, and pace slippage.
- [ ] Implement useful rules for WFO vs WFH differences, deep block trends, readiness pace, and low-energy success patterns.
- [ ] Add severity levels, confidence framing, and evidence payloads to each rule output.
- [ ] Surface behind-target and underweight-domain warnings.
- [ ] Ensure all insights can be rendered as cards, warnings, or summaries from one shared output contract.

### Testing and Documentation

- [ ] Add unit tests for every insight rule family.
- [ ] Document rule precedence, evidence semantics, and copy tone guidance.

### Exit Criteria

- Forge can explain why it thinks the user is behind, drifting, or improving

## Milestone 7: Streaks, Missions, Momentum, and Disciplined Gamification

### Goal

Implement the mature gamification layer defined in the PRS without making the product childish.

### Deliverables

- streak engine
- weekly mission system
- momentum meter
- readiness level or rank framing
- badge/state framework

### Checklist

- [ ] Define streak categories and break conditions grounded in actual behavior.
- [ ] Implement weekly missions derived from current deficits and product priorities.
- [ ] Add a momentum meter based on recent execution quality, not simple raw completion count.
- [ ] Add disciplined rank/level framing that communicates progress without toy-like gamification.
- [ ] Surface this layer in Command Center and selectively on Today/Readiness where it adds pressure rather than clutter.

### Testing and Documentation

- [ ] Add rule tests for streak continuity, break causes, mission selection, and momentum derivation.
- [ ] Document anti-gamification guardrails so low-value tasks cannot cheaply inflate momentum.

### Exit Criteria

- gamification deepens discipline rather than diluting product seriousness

## Milestone 8: Advanced Warnings and Cross-Screen Operational Surfacing

### Goal

Push the most important analytics back into operational surfaces so insights change behavior instead of living only in Command Center.

### Deliverables

- Today warnings
- Readiness risk panels
- Schedule pressure indicators
- cross-screen analytics summaries

### Checklist

- [ ] Surface behind-target risk on Readiness.
- [ ] Surface major drift or streak-break risk on Today without overwhelming execution flow.
- [ ] Surface WFO/WFH and weekend utilization pressure where it affects planning decisions.
- [ ] Add “you are behind” and “protect this window” style alerts with serious tone.
- [ ] Ensure Command Center remains the source of depth while operational screens receive only the highest-value signals.

### Testing and Documentation

- [ ] Add integration tests for shared warning consumers where feasible.
- [ ] Document which warnings are global versus Command-Center-only.

### Exit Criteria

- analytics outputs shape daily decisions rather than existing as passive reports

## Milestone 9: Phase 2 QA, Performance, and Release Hardening

### Goal

Stabilize the analytics system so it is performant, explainable, and ready for sustained use.

### Deliverables

- analytics QA pass
- performance review
- docs closeout
- release checklist

### Checklist

- [ ] Run a full quality pass across Command Center, projections, streaks, missions, and warnings.
- [ ] Review analytics performance on realistic data windows and identify expensive derivation paths.
- [ ] Confirm stale snapshot and insufficient-data states are honest and understandable.
- [ ] Finalize architecture and operations documentation for analytics and Functions.
- [ ] Add known limitations for Phase 2 honestly, especially where projections remain heuristic.
- [ ] Confirm no Phase 3 integration scope leaked into Phase 2 implementation.

### Testing and Documentation

- [ ] Run and verify the full test suite including Phase 2 logic.
- [ ] Add a Phase 2 release-readiness checklist or expand the existing one.

### Exit Criteria

- Phase 2 is implementation-complete, understandable, and operationally supportable

## Testing Strategy for Phase 2

- heavy unit coverage for fact extraction, rollups, projections, streak rules, missions, and insights
- contract-style tests for snapshot schemas and versioning
- route-level confidence tests for Command Center empty, loading, and data-rich states
- function-level tests for snapshot generation logic
- emulator-backed checks for Firestore rules and function integration where feasible

## Documentation Strategy for Phase 2

Required docs by the end of Phase 2:

- updated architecture overview with analytics and Functions boundaries
- Firebase setup and deployment updates for rules, App Check, and Functions
- Command Center or analytics usage notes if operator behavior needs explanation
- documented metric definitions and known limitations
- updated future-extension notes distinguishing Phase 2 completion from Phase 3 integrations

## Risks and Mitigations

## Risk 1: Command Center becomes a pretty dashboard without behavioral value

Mitigation:

- tie Command Center charts directly to warnings, missions, and recommendations
- ship insight rules alongside charts instead of treating them as future garnish

## Risk 2: Analytics semantics drift between client and Functions

Mitigation:

- share domain derivation helpers where possible
- version snapshots and keep rule keys explicit

## Risk 3: Overbuilding a backend too early

Mitigation:

- use Firebase Functions only for durable recomputation and scheduled summaries
- keep product logic in shared domain helpers rather than burying it in infrastructure-specific code

## Risk 4: Gamification cheapens the tone

Mitigation:

- constrain streaks, missions, momentum, and ranks with anti-padding rules
- avoid celebratory toy patterns and keep visual language disciplined

## Risk 5: Phase 3 leaks into Phase 2

Mitigation:

- keep calendar, notifications, and export as explicit deferred sections
- add placeholder seams only when they reduce future rewrite risk

## Definition of Done for Phase 2

Phase 2 is done when:

- the analytics engine, Command Center, projections, pattern detection, and disciplined gamification are all real and coherent
- derived summaries and warnings are grounded in reproducible source data
- Firebase operational posture is hardened enough for sustained use
- tests protect the most important derivation logic
- documentation is sufficient for continuation and future Phase 3 integration

## Suggested Implementation Order Inside Phase 2

1. Milestone 0
2. Milestone 1
3. Milestone 2
4. Milestone 3
5. Milestone 4
6. Milestone 5
7. Milestone 6
8. Milestone 7
9. Milestone 8
10. Milestone 9

This order intentionally favors truthfulness and system durability before visual richness.

## Progress Tracking

Use this section as the live implementation tracker for Phase 2.

### Overall Status

- [ ] Milestone 0 complete
- [ ] Milestone 1 complete
- [ ] Milestone 2 complete
- [ ] Milestone 3 complete
- [ ] Milestone 4 complete
- [ ] Milestone 5 complete
- [ ] Milestone 6 complete
- [ ] Milestone 7 complete
- [ ] Milestone 8 complete
- [ ] Milestone 9 complete

### Current Iteration Notes

- Created the Phase 2 specification and implementation plan after re-reading the PRS and explicitly preserving the roadmap boundary: Phase 2 covers Command Center, charts, pattern detection, projections, streaks, missions, momentum, and advanced warnings, while full Calendar sync, notifications, export, and sync-polish remain Phase 3 work.
- Recommended an architecture-first build order so the analytics fact model, snapshot contracts, and projection semantics exist before the Command Center UI starts consuming them.
- Recommended introducing Firebase Functions selectively for durable analytics snapshots and projection recomputation, while keeping lightweight view derivations in the client for responsiveness.
- Elevated Firestore rules, App Check, and monitoring into explicit milestones because Phase 2 increases both data value and operational complexity enough that hardening can no longer be treated as side work.
