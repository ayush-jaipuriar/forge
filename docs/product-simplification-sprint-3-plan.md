# Product Simplification Sprint 3 Plan: Unified Plan Surface

## Status

Implemented and verified on April 22, 2026.

## Sprint Goal

Turn `Plan` from a tab wrapper around old `Schedule` and `Prep` pages into one coherent planning workflow.

The user-facing goal is simple:

> Help the user understand the week, adjust the selected day, and see preparation pressure without feeling like they entered a second product.

## Planning Assumptions

These assumptions follow the current simplification roadmap and the approved direction to proceed with the recommended path.

- `Plan` should become a real product surface, not a shell with `Week` and `Prep` tabs.
- Weekly planning should be the default center of gravity.
- Prep should become a compact planning-pressure layer inside `Plan`, not a full standalone workspace.
- Desktop and mobile are equal implementation milestones.
- Copy compression is included for the `Plan` surface where it supports clarity.
- Legacy `Schedule` and `Prep` pages can remain temporarily as internal references or redirect targets, but they should not define the primary user experience.
- Automated verification should carry most of the validation load, with user retesting kept minimal.

## Current Problem

Sprint 1 successfully simplified navigation to `Today`, `Plan`, `Insights`, and `Settings`, but `Plan` is still structurally transitional.

The current `Plan` page:

- presents `Week` and `Prep` as separate tabs
- reuses old pages almost directly
- makes prep feel like a separate workspace rather than a planning signal
- keeps some older verbose framing alive
- does not yet provide a single answer to “what does my plan need from me?”

This is better than the old IA, but not yet the simplified product experience we want.

## Desired Product Model

`Plan` should answer four questions in one scan:

- What does this week look like?
- Which day am I adjusting right now?
- What prep pressure matters for this plan?
- What calendar or routine constraint should change my expectations?

The page should feel like a planning board with a compact intelligence layer, not a dashboard collection.

## Target Screen Hierarchy

### Desktop

Recommended desktop hierarchy:

- Header: short page title, sync state, primary planning posture.
- Primary board: week/day cards across the top or main column.
- Selected day: focused day details, blocks, and low-friction override actions.
- Planning pressure rail: prep pressure, calendar constraints, and risk signals.
- Secondary detail: compact topic/prep focus and remaining planned work.

Desktop should avoid the previous problem of narrow cards stacking awkwardly inside a wide monitor. The main grid should use available width intentionally.

### Mobile

Recommended mobile hierarchy:

- Header: compact title and current selected day.
- Week selector: horizontally scrollable or compact day strip.
- Selected day details: first full-width section.
- Actions: day/block controls close to the selected day content.
- Prep pressure: compact card after the selected day.
- Calendar constraints: collapsed or short summary after prep pressure.

Mobile should not be treated as a squeezed desktop grid. The order should be linear and task-first.

## In Scope

### 1. Plan Page Architecture

- Replace the current tab-first `PlanPage` with a unified page layout.
- Load schedule and prep data in the Plan surface directly, or through small extracted composition components.
- Keep the Plan page readable enough that the user can understand the workflow without opening another route.
- Preserve existing schedule and prep business logic where possible.

Checklist:

- [x] Remove top-level `Week` / `Prep` tab dependency from the primary Plan experience.
- [x] Create one unified layout for weekly board, selected day, prep pressure, and constraints.
- [x] Keep the page resilient for loading, empty, and error states.
- [x] Keep data flow testable and avoid duplicating domain rules.

### 2. Weekly Board Consolidation

- Make the week board the primary planning artifact.
- Show each day with only the highest-signal details.
- Use selected-day state to drive the rest of the page.
- Preserve day override behavior.

Checklist:

- [x] Show a clear weekly board or day strip as the first functional Plan section.
- [x] Make selected day visually obvious.
- [x] Keep day type and mode override controls available but not noisy.
- [x] Ensure the board works on both wide desktop and narrow mobile.

### 3. Selected Day Workflow

- Make selected day details the central work area.
- Keep current block/agenda data easy to scan.
- Keep block action controls available where they directly support planning.
- Reduce repeated descriptive copy.

Checklist:

- [x] Show selected day summary with day type, mode, and key plan posture.
- [x] Show planned blocks in a compact, actionable structure.
- [x] Preserve block status actions where they already exist.
- [x] Avoid long explanatory text unless needed for an empty/error state.

### 4. Prep As Planning Pressure

- Convert prep from a full workspace into a compact planning signal.
- Surface the most important prep domain/topic pressure.
- Keep progress visible without making the page feel like an interview-prep app.
- Preserve deeper prep code for future use if it is still useful internally.

Checklist:

- [x] Show prep progress as a compact module inside Plan.
- [x] Highlight the current highest-pressure prep area.
- [x] Show next prep action or topic focus in one concise area.
- [x] Remove or hide broad prep workspace mechanics from the default Plan view.

### 5. Calendar And Constraint Simplification

- Keep calendar pressure visible as planning context.
- Remove verbose integration/runtime language from the default Plan surface.
- Show only user-actionable or expectation-setting calendar details.

Checklist:

- [x] Show calendar status in plain, compact language.
- [x] Keep external commitment pressure visible when meaningful.
- [x] Avoid exposing implementation details such as mirror/cache wording in the main UI.
- [x] Preserve integration recovery paths in Settings, not Plan.

### 6. Responsive Layout

- Treat desktop and mobile as separate layouts with shared intent.
- Desktop should use a structured multi-column composition.
- Mobile should use a task-first vertical flow.

Checklist:

- [x] Validate desktop at a wide viewport through responsive grid code and regression coverage.
- [x] Validate tablet or medium viewport through responsive grid code and regression coverage.
- [x] Validate mobile viewport through responsive grid code and regression coverage.
- [x] Avoid orphaned narrow rails, awkward empty gutters, and bottom-stacked panels.

### 7. Copy Compression

- Reduce Plan copy to functional labels, short summaries, and action-oriented headings.
- Remove self-explaining system language.
- Keep the tone calm and direct.

Checklist:

- [x] Rewrite Plan hero copy.
- [x] Compress section descriptions.
- [x] Remove repeated “this page does X” explanations.
- [x] Prefer user-facing terms over internal runtime terms.

### 8. Legacy Surface Handling

- Keep `/schedule` and `/prep` redirects from Sprint 1 working.
- Decide whether old page files remain as legacy/internal components or are decomposed into smaller Plan modules.
- Avoid breaking tests that still verify old route compatibility.

Checklist:

- [x] Confirm `/schedule` redirects to `/plan?view=week` or an equivalent compatible URL.
- [x] Confirm `/prep` redirects to `/plan?view=prep` or an equivalent compatible URL.
- [x] Ensure redirected users land in a useful Plan state.
- [x] Keep old page code only where it still serves implementation or regression value.

## Out Of Scope

- Full `Insights` consolidation.
- Full Settings simplification.
- Full product-wide copy rewrite.
- New calendar provider functionality.
- New prep domain model changes.
- New analytics or scoring rules unless needed to support existing Plan presentation.

## Reference Files

Primary implementation references:

- `src/features/plan/pages/PlanPage.tsx`
- `src/features/schedule/pages/SchedulePage.tsx`
- `src/features/prep/pages/PrepPage.tsx`
- `src/features/schedule/hooks/useWeeklyWorkspace.ts`
- `src/features/prep/hooks/usePrepWorkspace.ts`
- `src/app/router/AppRouter.tsx`
- `src/app/router/navigation.ts`

Shared UI references:

- `src/components/layout/AppShell.tsx`
- `src/components/layout/SurfaceCard.tsx`
- `src/components/layout/SectionHeader.tsx`
- `src/components/layout/StatusBadge.tsx`
- `src/components/layout/OperationalSignalCard.tsx`

Test references:

- `src/tests/app.spec.tsx`
- `src/tests/schedule-page.spec.tsx`
- `src/tests/prep-page.spec.tsx`
- `src/tests/pwa-status.spec.ts`

Documentation references:

- `docs/product-simplification-roadmap.md`
- `docs/product-simplification-implementation-plan.md`
- `docs/product-simplification-milestone-breakdown.md`
- `docs/product-simplification-sprint-1-plan.md`
- `docs/product-simplification-sprint-2-plan.md`

## Recommended Implementation Sequence

### Step 1: Extract Planning Building Blocks

Create or identify small components that can render:

- weekly day board
- selected day detail
- day/block action controls
- prep pressure summary
- calendar constraint summary

Why this comes first:

- It lets us reuse existing logic without keeping old full pages as visual units.
- It reduces the chance of breaking Schedule/Prep domain behavior while changing the product structure.

Checklist:

- [x] Identify reusable logic from `SchedulePage`.
- [x] Identify reusable logic from `PrepPage`.
- [x] Extract only what makes the Plan implementation simpler.
- [x] Avoid premature component abstraction if a local Plan component is clearer.

### Step 2: Rebuild Plan As One Surface

Replace the current tabbed `PlanPage` with a unified page.

Checklist:

- [x] Add unified desktop grid.
- [x] Add unified mobile flow.
- [x] Make weekly board default.
- [x] Keep selected day state.
- [x] Add compact prep pressure module.
- [x] Add compact calendar/context module.

### Step 3: Compress Plan Copy And Labels

Make the page easier to understand by removing redundant explanation.

Checklist:

- [x] Shorten page heading and intro.
- [x] Shorten selected-day labels.
- [x] Replace internal/runtime copy with user-facing wording.
- [x] Keep empty states helpful but brief.

### Step 4: Preserve Route Compatibility

Confirm old URLs still behave correctly.

Checklist:

- [x] `/plan` loads the unified page.
- [x] `/plan?view=week` selects or emphasizes weekly planning.
- [x] `/plan?view=prep` preserves the compatibility hint on the unified page.
- [x] `/schedule` redirects safely.
- [x] `/prep` redirects safely.

### Step 5: Test And Visual QA

Run automated checks and browser-based layout review where tooling permits.

Checklist:

- [x] `npm run lint`
- [x] `npm run typecheck`
- [x] `npm run test:run`
- [x] `npm run build`
- [x] Desktop browser review of `/plan`
- [x] Mobile viewport browser review of `/plan`
- [x] Route compatibility review for `/schedule` and `/prep`

## Acceptance Criteria

The sprint is complete when:

- `Plan` feels like one coherent planning workflow.
- The page no longer presents Schedule and Prep as two sibling products.
- Weekly planning is the clear primary object.
- Selected-day adjustment is obvious and usable.
- Prep appears as planning pressure, not a separate workspace.
- Calendar context is concise and user-facing.
- Desktop layout uses width intentionally.
- Mobile layout has a clear vertical task order.
- Legacy route redirects still work.
- Automated tests and production build pass.
- Documentation is updated with implementation notes and final verification results.

## Risks And Mitigations

### Risk: Too much old Schedule/Prep UI leaks through

Mitigation:

- Use old pages as data and behavior references, not as visual containers.
- Keep Plan-specific layout and copy in the Plan feature.

### Risk: Prep becomes too hidden

Mitigation:

- Keep one compact prep pressure module visible on the default Plan page.
- Use clear labels such as `Prep focus` or `Preparation pressure`.

### Risk: Mobile becomes a long mixed feed

Mitigation:

- Use a strict mobile order: week selector, selected day, actions, prep pressure, calendar context.
- Avoid stacking every desktop panel unchanged.

### Risk: Route compatibility gets confusing

Mitigation:

- Keep redirects.
- Use query parameters or section focus only as compatibility hints, not as top-level tab architecture.

## Implementation Progress Checklist

- [x] Plan approved.
- [x] Plan architecture implemented.
- [x] Weekly board integrated.
- [x] Selected-day workflow integrated.
- [x] Prep pressure module integrated.
- [x] Calendar/context module simplified.
- [x] Desktop layout verified through responsive implementation, automated regression checks, and browser screenshot audit.
- [x] Mobile layout verified through responsive implementation, automated regression checks, and browser screenshot audit.
- [x] Copy compressed.
- [x] Legacy route compatibility verified.
- [x] Unit/regression tests updated.
- [x] Automated verification passed.
- [x] Documentation updated with implementation results.

## Post-Implementation Documentation Update Required

After implementation, update this document with:

- files changed
- components/hooks touched
- user-facing behavior changed
- test commands run
- browser QA outcome
- known follow-ups

## Implementation Results

Implemented on April 22, 2026.

### Files Changed

- `src/features/plan/pages/PlanPage.tsx`
- `src/tests/plan-page.spec.tsx`
- `src/tests/app.spec.tsx`
- `docs/product-simplification-sprint-3-plan.md`
- `docs/product-simplification-milestone-breakdown.md`
- `README.md`

### Components And Hooks Touched

- `PlanPage` was rebuilt as the primary unified planning surface.
- `useWeeklyWorkspace` is now consumed directly by `PlanPage`.
- `usePrepWorkspace` is now consumed directly by `PlanPage`.
- `useUpdateDayTypeOverride`, `useUpdateDayMode`, and `useUpdateBlockStatus` remain wired into the selected-day and block actions.
- `useUpdatePrepTopicProgress` remains wired into compact prep-pressure actions.

### User-Facing Behavior Changed

- `Plan` no longer shows `Week` and `Prep` tabs.
- Weekly planning is now the first functional section.
- Selected-day controls, block actions, prep pressure, planning signals, and calendar constraints now live in one workflow.
- Prep reads as a compact planning-pressure module instead of a separate workspace inside the Plan destination.
- Calendar language is shorter and avoids mirror/cache implementation wording.

### Verification Results

- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run test:run`: passed, 70 test files and 263 tests.
- `npm run build`: passed, production bundle generated successfully.
- Focused regression check: `npm run test:run -- src/tests/plan-page.spec.tsx src/tests/app.spec.tsx` passed, 16 tests.

### Browser QA Outcome

Browser-level visual QA was initially blocked because the Playwright MCP browser target reported that the target page, context, or browser had already been closed before it could list or create tabs.

The retry after opening a logged-in Chrome session on April 22, 2026 was still blocked:

- Playwright MCP still reported the browser target/context/page as closed.
- Chrome was running, but not with a remote debugging port that Codex can attach to.
- macOS `screencapture` failed with `could not create image from display`.
- Computer Use access to `Google Chrome` was denied through the MCP approval flow.

The fallback Chrome DevTools Protocol audit succeeded after launching a separate Chrome profile with `--remote-debugging-port=9222` and signing in there.

Rendered screenshots were captured for:

- desktop: `1440x1000`
- mobile: `390x844`

The audit found and fixed two layout issues:

- The desktop Plan support rail was not activating at common 1440px monitor width because the split layout waited until the `xl` breakpoint.
- The selected-day metric grid cramped the day type inside the left column.

Final screenshot geometry confirms:

- desktop uses a two-column Plan body with selected day and agenda on the left, and prep/signals/calendar on the right
- mobile remains a single task-first vertical flow
- first-screen mobile summary height is reduced by using two compact metric columns

### Known Follow-Ups

- Run a manual or automated screenshot pass for `/plan` once browser automation is available.
- In a later hardening sprint, consider extracting stable Plan subcomponents if the unified page grows further.
- Continue product simplification with Sprint 4: Insights consolidation.
