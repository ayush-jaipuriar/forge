# Forge Product Simplification Milestone Breakdown

This document breaks the product simplification stream into smaller, tightly scoped implementation sprints.

It follows the locked delivery decisions:

- dedicated roadmap stream
- one coordinated IA change
- full IA restructuring from the start
- old pages may remain temporarily as internal building blocks, but not as primary navigation destinations
- product copy rewrite is a separate follow-up sprint
- implementation should favor smaller, easier-to-validate sprints
- automated verification should be maximized
- user retesting should be minimized and attached only where it adds the most value

## Delivery Shape

The simplification stream will be delivered through **granular sprints**, but the first user-visible milestone will still establish the new product model immediately:

- `Today`
- `Plan`
- `Insights`
- `Settings`

That is important because the biggest user problem is top-level confusion. If we delay the IA reset, users will continue to experience the product as a cluttered suite even while we clean up internals.

## Sprint Structure

## Sprint 1: IA Reset And Route Consolidation

### Goal

Ship the new four-destination product structure immediately.

### Scope

- top-level navigation reset
- router restructuring
- legacy route redirects
- new `Plan` and `Insights` route shells
- temporary reuse of old pages/components as internal building blocks
- base shell alignment for the new IA

### User-facing outcome

Users now understand the app as:

- Today
- Plan
- Insights
- Settings

instead of eight competing surfaces.

### Validation emphasis

- routing correctness
- nav correctness
- mobile/desktop parity
- no broken user journeys after route consolidation

### Status

Implemented.

Code-level and automated validation are green, and Forge now exposes the simplified four-destination IA in the product shell.

Remaining follow-up from Sprint 1 is lightweight:

- authenticated browser screenshots/visual audit
- a small mobile-nav-specific regression expansion

## Sprint 2: Today Consolidation

### Goal

Make Today the unmistakable center of gravity.

### Scope

- merge the most important daily Physical content into Today
- merge the most important daily Readiness cues into Today
- reduce secondary/support clutter on Today
- rebalance Today hierarchy around:
  - current mission
  - next action
  - main risk
  - agenda

### User-facing outcome

The app now clearly answers:

- what should I do now?

without competing side systems.

### Validation emphasis

- above-the-fold clarity
- mobile usability
- action hierarchy

### Sprint plan

- [Product Simplification Sprint 2 Plan](product-simplification-sprint-2-plan.md)

### Status

Implemented.

Code-level and automated validation are green. `Today` now prioritizes current mission, next action, and agenda, while broad shell-readiness/install surfacing and old support-dashboard labels are removed from normal authenticated flow.

Remaining follow-up from Sprint 2 is lightweight:

- capture rendered desktop/mobile screenshots once local browser automation is reliable
- expand mobile-nav-specific regression coverage in a later hardening pass

## Sprint 3: Plan Consolidation

### Goal

Unify Schedule and Prep into one planning surface.

### Scope

- create merged `Plan` experience
- combine weekly board and prep progress in one coherent structure
- remove “prep as a separate product” feeling
- ensure the page feels like one planning workflow, not two adjacent screens

### User-facing outcome

Planning now reads as one loop:

- weekly structure
- selected-day adjustment
- prep progress and topic pressure

### Validation emphasis

- structural clarity
- prep discoverability without route bloat
- mobile planning flow

### Sprint plan

- [Product Simplification Sprint 3 Plan](product-simplification-sprint-3-plan.md)

### Status

Implemented.

Code-level and automated validation are green. `Plan` now renders as one unified planning workflow instead of a tab wrapper around `Schedule` and `Prep`.

Remaining follow-up from Sprint 3 is lightweight:

- capture rendered desktop/mobile screenshots once local browser automation is reliable
- consider extracting stable Plan subcomponents in a later hardening pass if the page grows further

## Sprint 4: Insights Consolidation

### Goal

Unify Command Center and deeper Readiness into one insights surface.

### Scope

- create merged `Insights` experience
- preserve the best analytics surfaces
- remove lower-value or overly conceptual framing
- make the screen decision-oriented rather than chart-oriented

### User-facing outcome

Insights now answers:

- what is improving?
- what is slipping?
- what should I change?

### Validation emphasis

- decision clarity
- chart reduction discipline
- mobile readability of analytics and readiness content

### Sprint plan

- [Product Simplification Sprint 4 Plan](product-simplification-sprint-4-plan.md)

### Status

Implemented.

Code-level and browser validation are green for the unified `Insights` route. `Insights` now merges analytics and readiness into one decision-oriented surface while preserving chart depth and legacy route compatibility.

Remaining follow-up from Sprint 4 is lightweight:

- consider extracting stable Insights subcomponents if the page grows further
- continue copy compression in the dedicated copy simplification sprint

## Sprint 5: Settings Simplification

### Goal

Make Settings feel calm and utility-first.

### Scope

- reduce default settings surface
- move advanced/operator/runtime details behind progressive disclosure
- preserve recovery and integration tools
- simplify layout and density

### User-facing outcome

Settings becomes:

- smaller
- calmer
- easier to trust

### Validation emphasis

- shorter default view
- advanced toggle/disclosure behavior
- preservation of recovery and sync actions

### Sprint plan

- [Product Simplification Sprint 5 Plan](product-simplification-sprint-5-plan.md)

### Status

Planning draft ready for review.

## Sprint 6: Product Copy Compression And Framing Reset

### Goal

Reduce verbosity and make the product promise clearer.

### Scope

- rewrite shell framing
- rewrite page headers and descriptions
- compress card copy
- reduce system-language in user-facing surfaces
- align README and top-level product presentation to the simplified product

### User-facing outcome

Forge feels more direct, clearer, and less self-explanatory in a bad way.

### Validation emphasis

- copy reduction
- consistency of product framing
- fewer competing concepts

## Sprint 7: Final Simplification Hardening

### Goal

Clean up remaining rough edges after the merged product structure is in place.

### Scope

- leftover UI consistency issues
- empty/loading/error state alignment under the simplified IA
- final redirect cleanup
- final accessibility and interaction polish specific to merged flows
- release-readiness checks for the simplification stream

### User-facing outcome

The simplified product feels intentional and complete, not mid-transition.

### Validation emphasis

- automated browser QA
- regression coverage
- final route and state correctness

## Why This Breakdown

This sequence is deliberate.

### Why Sprint 1 includes Plan and Insights immediately

Because the user confusion is primarily structural.

If we only simplify Today first while leaving the old route structure alive, the app will still feel like a cluttered suite.

### Why copy is separated

Copy compression is important, but if we do it too early while routes and screen boundaries are still shifting, we will rewrite the same language twice.

So:

- first simplify structure
- then simplify language against the new structure

### Why Settings comes after the main surface mergers

Settings should reflect the simplified product model.

If we simplify it too early, we risk aligning it to an IA that no longer exists one or two sprints later.

## Automated Validation Strategy

Automation should be maximized in every sprint.

### Standard verification per sprint

- `npm run lint`
- `npm run typecheck`
- `npm run test:run`
- `npm run build`

### Browser QA expectations per sprint

Use automated browser testing and screenshots where practical to verify:

- top-level navigation
- redirects
- desktop/mobile layout
- core route flows
- merged surface behavior

### User testing expectation

Keep user testing lightweight.

Recommended user checkpoints:

- after Sprint 1: “Do users now understand what the app is?”
- after Sprint 4: “Do users understand where to act, plan, and inspect?”
- after Sprint 7: “Does the product now feel focused?”

## Definition Of Stream Success

This simplification stream is successful when:

- the product is easier to explain
- the app has a smaller and clearer IA
- users no longer describe the app as cluttered or overloaded
- the main workflow is obvious
- architecture depth remains present, but not exposed as user burden

## Recommended Next Step

The immediate next step is Sprint 1:

- IA reset
- route consolidation
- new four-destination nav
- redirects
- base `Plan` and `Insights` route shells

That is the highest-leverage first sprint because it changes the product model before we spend more time refining the old one.
