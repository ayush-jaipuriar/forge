# Forge Product Simplification Sprint 1 Plan

This sprint is the first implementation sprint for the dedicated product simplification stream.

It is intentionally structural.

The purpose of Sprint 1 is to change the **shape of the product** before we spend time deeply refining surfaces that will no longer exist in their current form.

## Sprint Goal

Ship the new top-level product model:

- `Today`
- `Plan`
- `Insights`
- `Settings`

This sprint should make Forge feel like one product again at the navigation and route level, even if some deeper surface consolidation still lands in later sprints.

## Why This Sprint Comes First

The strongest user complaint is not yet “a specific component is ugly.”

It is:

- the product feels cluttered
- too many things are happening
- there is no clear sense of what the product is

That is primarily an IA problem.

So Sprint 1 fixes:

- the top-level structure
- the route model
- the shell mental model

before we do deeper consolidation inside each destination.

## Locked Sprint Scope

Sprint 1 includes:

- top-level navigation reset
- router restructuring
- route renaming and redirect behavior
- new primary destination shells for `Plan` and `Insights`
- temporary reuse of existing Schedule / Prep / Command Center / Readiness pages internally where helpful
- shell alignment to the new IA
- automated validation of the new navigation and route model

Sprint 1 does **not** include:

- full Today consolidation
- full Plan consolidation
- full Insights consolidation
- full Settings simplification
- global copy rewrite

Those come in later sprints.

## Primary User Outcome

After Sprint 1, the user should immediately understand that Forge now has four main jobs:

1. run today
2. plan the week and prep
3. inspect trends and drift
4. manage settings

That clarity is the main success condition for this sprint.

## Workstreams

## 1. Navigation Reset

### Goal

Replace the current wide navigation with the simplified four-destination model.

### Checklist

- [x] Replace the current top-level nav items with:
  - [x] `Today`
  - [x] `Plan`
  - [x] `Insights`
  - [x] `Settings`
- [x] Remove `About` from the primary nav.
- [x] Remove `Prep`, `Physical`, and `Readiness` from the primary nav.
- [x] Remove `Command Center` as a first-class primary nav item.
- [x] Update desktop rail labels and active-state handling.
- [x] Update mobile nav to match the new IA exactly.
- [x] Ensure the shell title and active route label reflect the new product model.

### Primary files likely involved

- [navigation.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/app/router/navigation.ts)
- [AppShell.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/components/layout/AppShell.tsx)

## 2. Router Restructuring

### Goal

Replace the current route model with the new user-facing structure.

### Checklist

- [x] Add a first-class `Plan` route.
- [x] Add a first-class `Insights` route.
- [x] Keep `Today` as the index route.
- [x] Keep `Settings` as a primary route.
- [x] Decide whether `About` becomes secondary or hidden from the main app loop.
- [x] Remove old top-level routes from the visible primary product flow.
- [x] Add redirects for old routes:
  - [x] `/command-center` -> `/insights`
  - [x] `/schedule` -> `/plan`
  - [x] `/prep` -> `/plan`
  - [x] `/physical` -> `/`
  - [x] `/readiness` -> `/insights`
- [x] Ensure no broken internal navigation remains.

### Primary files likely involved

- [AppRouter.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/app/router/AppRouter.tsx)

## 3. Plan Route Foundation

### Goal

Create the initial merged planning destination without yet doing the full deep merge.

### Strategy

Sprint 1 should prioritize a coherent route-level user experience, not final-perfect content architecture.

That means the first version of `Plan` may still compose or wrap existing Schedule and Prep building blocks while we prepare deeper consolidation in Sprint 3.

### Checklist

- [x] Create the new `Plan` route/page.
- [x] Ensure it clearly reads as one planning destination.
- [x] Reuse existing Schedule and Prep building blocks where practical.
- [x] Avoid making the first merged version feel like two separate pages stacked together.
- [x] Establish a clear internal structure for future Sprint 3 refinement.
- [x] Ensure mobile navigation and mobile layout make sense for the merged route.

### Primary files likely involved

- new merged route/page likely under `src/features/plan`
- [SchedulePage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/schedule/pages/SchedulePage.tsx)
- [PrepPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/prep/pages/PrepPage.tsx)

## 4. Insights Route Foundation

### Goal

Create the initial merged insights destination without yet doing the full deep merge.

### Strategy

Like Plan, Sprint 1 should establish the new product destination immediately, even if the deeper rationalization of Command Center and Readiness happens in Sprint 4.

### Checklist

- [x] Create the new `Insights` route/page.
- [x] Ensure it clearly reads as one analytical destination.
- [x] Reuse existing Command Center and Readiness building blocks where practical.
- [x] Avoid making the first merged version feel like two unrelated screens in one route.
- [x] Establish a clear internal structure for future Sprint 4 refinement.
- [x] Ensure mobile layout and navigation are still understandable.

### Primary files likely involved

- new merged route/page likely under `src/features/insights`
- [CommandCenterPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/command-center/pages/CommandCenterPage.tsx)
- [ReadinessPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/readiness/pages/ReadinessPage.tsx)

## 5. Secondary Route Handling

### Goal

Remove route clutter without breaking flows.

### Checklist

- [x] Decide where `About` remains accessible from.
- [x] Keep old route access graceful through redirects or secondary placement.
- [x] Ensure bookmarks and old navigation assumptions do not produce dead ends.
- [x] Avoid exposing the old IA labels in the new shell after redirects land.

### Primary files likely involved

- [AppRouter.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/app/router/AppRouter.tsx)
- [AppShell.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/components/layout/AppShell.tsx)
- [AboutPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/about/pages/AboutPage.tsx)

## 6. Shell Consistency Pass

### Goal

Make the shell feel consistent with the simplified product model.

### Checklist

- [x] Update active route labels in the header.
- [x] Ensure shell chrome does not keep referencing the old product taxonomy.
- [x] Remove any nav-specific density or label behavior that becomes awkward under the new IA.
- [x] Ensure desktop and mobile shell behavior remain aligned.

### Primary files likely involved

- [AppShell.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/components/layout/AppShell.tsx)

## 7. Automated Validation

### Goal

Verify the IA reset aggressively through automation so user retesting can stay lightweight.

### Checklist

- [x] Update route-level tests for the new IA.
- [x] Add or update tests for redirects.
- [x] Add or update tests for desktop nav.
- [ ] Add or update tests for mobile nav.
- [x] Add or update tests for active route labeling.
- [x] Run:
  - [x] `npm run lint`
  - [x] `npm run typecheck`
  - [x] `npm run test:run`
  - [x] `npm run build`
- [ ] Run browser automation for the new top-level route model.
- [ ] Capture screenshots of:
  - [ ] Today
  - [ ] Plan
  - [ ] Insights
  - [ ] Settings
  on desktop and mobile where practical.

## 8. Lightweight User Verification

### Goal

Confirm the core IA confusion has improved without making user testing a heavy dependency.

### Checklist

- [ ] Ask users only the core IA questions after Sprint 1:
  - [ ] What is this app mainly for?
  - [ ] Where would you go to plan?
  - [ ] Where would you go for trends/insights?
  - [ ] Does the app feel less cluttered at first glance?

This should be treated as a lightweight checkpoint, not a full research phase.

## Acceptance Criteria

Sprint 1 is complete when:

- the app shows only four primary destinations
- old route clutter is removed from the visible IA
- `Plan` and `Insights` exist as first-class user-facing destinations
- redirects and route transitions are clean
- desktop and mobile nav are aligned to the new product model
- automated checks are green
- browser QA confirms the new IA holds up visually and functionally

## Implementation Notes To Keep In Mind

### 1. This sprint is structural, not final

The merged pages in Sprint 1 do not need to be the final refined versions.

They need to establish:

- the correct product model
- the correct route model
- a stable foundation for deeper consolidation

### 2. Avoid fake merging

Do not just paste two full screens together.

Even the first merged version should show basic product discipline and a clear internal hierarchy.

### 3. Keep copy work minimal in this sprint

Some route labels and shell naming will naturally change here.

But full copy compression belongs to its dedicated later sprint.

## Recommended Next Step After This Plan

The next action should be:

1. approve this Sprint 1 plan
2. implement the IA reset and route consolidation
3. verify the new four-destination model through automation and lightweight user feedback

## Sprint 1 Closeout

### Status

Sprint 1 implementation is complete at the code and automated validation level.

The new top-level Forge model is now:

- `Today`
- `Plan`
- `Insights`
- `Settings`

### What Changed

- Replaced the old eight-destination primary navigation with four primary destinations in [navigation.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/app/router/navigation.ts).
- Added new merged destination shells:
  - [PlanPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/plan/pages/PlanPage.tsx)
  - [InsightsPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/insights/pages/InsightsPage.tsx)
- Rewired routing and legacy redirects in [AppRouter.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/app/router/AppRouter.tsx).
- Updated the shell so header labels and navigation semantics follow the new product model in [AppShell.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/components/layout/AppShell.tsx).
- Added embedded-mode reuse for the old route surfaces so they can survive as internal building blocks during consolidation:
  - [SchedulePage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/schedule/pages/SchedulePage.tsx)
  - [PrepPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/prep/pages/PrepPage.tsx)
  - [CommandCenterPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/command-center/pages/CommandCenterPage.tsx)
  - [ReadinessPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/readiness/pages/ReadinessPage.tsx)
- Updated route and IA regression coverage in [app.spec.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/tests/app.spec.tsx).

### Validation Result

Automated verification is green:

- `npm run lint`
- `npm run typecheck`
- `npm run test:run` -> `69` files, `260` tests passed
- `npm run build`

### Remaining Follow-up From Sprint 1

- Browser automation/screenshots for the authenticated shell are still pending.
- Mobile-nav-specific regression assertions should be expanded in a follow-up test pass.
- Lightweight user validation should happen against the simplified IA before Sprint 2 refinement starts.

### 2026-04-22 Authenticated Shell Audit Attempt

An authenticated local preview audit was attempted against `http://127.0.0.1:4180` after the IA reset.

What was confirmed:

- the local preview served the current production build
- the authenticated Chrome session showed the simplified four-destination shell:
  - `Today`
  - `Plan`
  - `Insights`
  - `Settings`
- the old top-level route labels were no longer visible in the primary rail
- `Today` still carries the most visible clutter burden, which is expected because Sprint 1 intentionally changed IA before doing the deeper `Today` consolidation

Audit limitation:

- direct desktop control through the Computer Use connector was denied for Chrome
- Playwright's attached context was not connected to the user's authenticated Chrome profile
- macOS screenshot capture from the terminal failed with `could not create image from display`

Product audit finding:

- Sprint 1 succeeded at reducing top-level IA confusion.
- The next clarity bottleneck is now inside `Today`: it still exposes shell readiness, hero framing, execution state, support context, quick signals, mode override, score pressure, and agenda content too early.
- That is exactly the right target for Sprint 2, because `Today` now has to become the unmistakable center of gravity for the simplified product.

### Why This Sprint Matters

This sprint intentionally changed structure before polish.

That tradeoff matters because the user feedback problem was not primarily “a component is ugly.” It was “the product feels like too many products at once.”

After Sprint 1, Forge now communicates a simpler mental model first. Sprint 2 can now focus on making `Today` the unmistakable center of gravity instead of trying to solve clarity problems inside a crowded IA.

### Likely Next Step

The next best move is:

1. run a lightweight browser/authenticated visual audit for the four-destination shell
2. then plan and implement Sprint 2: `Today` consolidation
