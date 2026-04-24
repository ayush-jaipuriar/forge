# Product Simplification Sprint 6 Plan: Copy Compression And Framing Reset

## Status

Implemented.

Sprint 6 compressed user-facing product copy across the main app shell and routes, aligned the README with the simplified product story, updated route/copy tests, and completed automated plus browser screenshot QA.

## Sprint Goal

Make Forge easier to understand at a glance by reducing visible copy, replacing internal language with user language, and making the product promise consistent across the app.

The user-facing goal is:

> Forge should feel like a focused daily execution tool, not a product that explains its own machinery.

## Locked Scope Decisions

These decisions were confirmed before writing this plan.

- Cover all main routes: `Today`, `Plan`, `Insights`, `Settings`, auth, shell/header, empty states, loading states, and error states.
- Update top-level docs, including `README.md` and product framing docs, where the user-facing story still reflects the old cluttered model.
- Keep a restrained `execution OS` feeling, but make the app understandable in plain language.
- Allow small layout fixes when copy compression exposes spacing, wrapping, density, or hierarchy issues.
- Require browser screenshot QA for all primary routes.

## Current Problem

Sprints 1-5 reduced the visible product structure, but much of the language still comes from the older operator-console era.

The app still overuses concepts like:

- `operational`
- `pressure`
- `support layer`
- `runtime`
- `diagnostics`
- `scaffold`
- `boundary`
- `truth`
- `surface`
- `command`

Some of these words are accurate inside engineering documentation. They are not always useful in the product UI.

The current issue is not simply "too many words." The deeper issue is that the words often ask users to understand Forge's internal model before they can act.

## Desired Product Model

Forge should repeatedly answer three questions in plain language:

- What should I do now?
- What should I protect or adjust?
- Where can I review patterns and settings?

The product can still feel serious and structured. It should stop sounding like every card is a system diagnostic.

## Copy Principles

### 1. Action Before Explanation

Prefer:

- `Run the day.`
- `Choose a day.`
- `Review the pattern.`
- `Back up or restore.`

Avoid:

- `Execution surface`
- `Operational truth`
- `Intervention layer`
- `Capability boundary`

### 2. One Card, One Job

Each card should carry one clear idea.

Checklist:

- [x] Card title says what the user sees or does.
- [x] Description is one sentence or removed where practical.
- [x] Repeated explanatory copy is removed or shortened.
- [x] Status values remain precise.

### 3. Keep Personality, Reduce Ceremony

Forge should still feel disciplined and structured.

Allowed tone:

- focused
- direct
- quietly opinionated
- useful under pressure

Avoid tone:

- self-explaining
- over-systematized
- dramatic
- portfolio-showcase-first

### 4. Prefer User Words Over System Words

Copy replacement guide:

- `operational signals` -> `signals`
- `pressure` -> `risk`, `constraint`, or `load`
- `support layer` -> `support`
- `runtime` -> `browser`, `app`, or `device`
- `diagnostics` -> `status details` or `details`
- `scaffolded` -> `planned`
- `seam` -> `integration point` or remove
- `truth` -> `status`, `details`, or remove
- `command surface` -> `workspace`, `app`, or remove

## Target Screen Hierarchy

### Shell And Navigation

Goal:

The shell should frame Forge as a daily execution tool without making the header feel like branding theater.

Checklist:

- [x] Replace `Personal Execution OS` where it feels too large or ceremonial.
- [x] Keep `Forge` visible.
- [x] Keep route names plain: `Today`, `Plan`, `Insights`, `Settings`.
- [x] Shorten auth restoration/loading copy.
- [x] Ensure desktop and mobile shell language match.

### Auth

Goal:

Sign-in should feel calm and short.

Checklist:

- [x] Keep only the needed sign-in explanation.
- [x] Avoid describing implementation details of redirect or bootstrap behavior.
- [x] Keep errors actionable and short.
- [x] Preserve Google redirect sign-in behavior.

### Today

Goal:

Today should feel like the center of the product.

Checklist:

- [x] Keep the main headline action-oriented.
- [x] Shorten the current mission and recommendation copy.
- [x] Reduce repeated `signals`, `pressure`, and `support` language.
- [x] Keep agenda actions obvious.
- [x] Keep calendar, prep, and mode support visible but quieter.
- [x] Fix spacing or wrapping issues revealed by copy changes where needed.

### Plan

Goal:

Plan should make weekly adjustment feel simple.

Checklist:

- [x] Shorten Plan header and metric details.
- [x] Reframe prep as planning support, not a separate product language system.
- [x] Reduce repeated `pressure` and `planning constraint` copy.
- [x] Keep day selection and agenda editing clear.
- [x] Keep desktop and mobile scan paths intact.

### Insights

Goal:

Insights should explain patterns without sounding like a dashboard manual.

Checklist:

- [x] Shorten hero, summary, and section descriptions.
- [x] Reduce terms like `diagnostics`, `strategic`, `operating`, and `intervention`.
- [x] Keep chart titles precise.
- [x] Keep empty/stale chart states short.
- [x] Preserve analytics depth while reducing explanatory paragraphs.

### Settings

Goal:

Settings should remain calm after Sprint 5.

Checklist:

- [x] Compress remaining verbose Settings descriptions.
- [x] Rename remaining user-visible operator terms where practical.
- [x] Keep advanced details collapsed.
- [x] Keep backup, restore, calendar, notifications, and cloud refresh clear.
- [x] Avoid undoing Sprint 5 hierarchy.

### Empty, Loading, And Error States

Goal:

State screens should be useful without narrating internals.

Checklist:

- [x] Shorten loading titles and descriptions.
- [x] Keep error titles clear and user-actionable.
- [x] Avoid internal implementation terms unless needed for debugging.
- [x] Keep auth/session restoration copy brief.

## Documentation Scope

Docs should match the simplified product story.

Checklist:

- [x] Update `README.md` product framing.
- [x] Update the product simplification milestone tracker with Sprint 6 status.
- [x] Update this sprint doc with implementation results after completion.
- [x] Avoid broad documentation rewrites unrelated to product framing.

## Visual And Layout Allowance

This is primarily a copy sprint, but copy changes often expose layout issues.

Allowed layout fixes:

- heading size or wrapping fixes
- card spacing reductions
- metric detail compression
- mobile stacking improvements
- obvious button or chip wrapping fixes

Not allowed without a separate decision:

- route restructuring
- new feature behavior
- new chart types
- new design system primitives unless a small helper clearly reduces repeated copy/layout handling

## In Scope

Primary implementation files likely involved:

- `src/components/layout/AppShell.tsx`
- `src/app/router/AppRouter.tsx`
- `src/features/auth/pages/AuthPage.tsx`
- `src/features/auth/components/AuthStatusScreen.tsx`
- `src/features/today/pages/TodayPage.tsx`
- `src/features/plan/pages/PlanPage.tsx`
- `src/features/insights/pages/InsightsPage.tsx`
- `src/features/settings/pages/SettingsPage.tsx`
- `src/components/common/SectionHeader.tsx`
- `src/components/common/EmptyState.tsx`
- `src/components/common/SurfaceCard.tsx`
- `README.md`
- `docs/product-simplification-milestone-breakdown.md`
- `docs/product-simplification-sprint-6-plan.md`

Supporting files may be touched only if tests or state copy require it.

## Out Of Scope

- New product features.
- New sync architecture.
- New route consolidation.
- New analytics rules.
- New backup, calendar, notification, or auth behavior.
- Full visual redesign.
- Native shell capability work.
- Large documentation rewrites unrelated to product framing.

## Recommended Implementation Sequence

### Step 1: Copy Inventory

Find high-friction language across product routes.

Checklist:

- [x] Search primary surfaces for overused internal terms.
- [x] Identify route headers, card titles, descriptions, helper text, loading states, and empty states.
- [x] Mark copy that should stay precise for safety or debugging.

### Step 2: Shell And Auth Compression

Start at the first impression.

Checklist:

- [x] Shorten shell eyebrow/header copy.
- [x] Shorten auth session loading copy.
- [x] Shorten sign-in page copy where implementation details were still visible.
- [x] Update tests that assert shell/auth text.

### Step 3: Primary Routes Copy Pass

Compress route-level copy.

Checklist:

- [x] Update `Today`.
- [x] Update `Plan`.
- [x] Update `Insights`.
- [x] Update `Settings`.
- [x] Keep behavior unchanged.
- [x] Apply small layout fixes where copy changes reveal issues.

### Step 4: State And Shared Primitive Pass

Clean shared states.

Checklist:

- [x] Review loading states.
- [x] Review empty states.
- [x] Review error states.
- [x] Avoid changing shared component APIs unless needed.

### Step 5: Docs Framing Pass

Align project-facing documentation.

Checklist:

- [x] Update `README.md`.
- [x] Update milestone tracker.
- [x] Update this sprint doc with changed files and verification results.

### Step 6: Automated And Browser QA

Validate the sprint like a product pass, not only a text edit.

Checklist:

- [x] Run `npm run typecheck`.
- [x] Run `npm run lint`.
- [x] Run focused route/copy tests as needed.
- [x] Run `npm run test:run`.
- [x] Run `npm run build`.
- [x] Capture desktop screenshots for `Today`, `Plan`, `Insights`, and `Settings`.
- [x] Capture mobile/responsive screenshots for `Today`, `Plan`, `Insights`, and `Settings`.
- [x] Inspect screenshots for wrapping, clipping, excessive blank space, and regressions.
- [x] Store screenshots outside the git worktree or in ignored output only.

## Acceptance Criteria

Sprint 6 is complete when:

- Primary routes use shorter, clearer, user-facing language.
- The product promise is consistent across shell, auth, routes, and README.
- Internal terminology is reduced unless it is needed for precision.
- No core action becomes harder to find.
- Desktop and mobile layouts remain readable after copy compression.
- Automated verification passes.
- Browser screenshots have been captured and inspected for all primary routes.

## Implementation Record

Implemented on April 24, 2026.

### Changed Files

- `README.md`
- `docs/product-simplification-milestone-breakdown.md`
- `docs/product-simplification-sprint-6-plan.md`
- `src/app/router/AppRouter.tsx`
- `src/components/layout/AppShell.tsx`
- `src/features/pwa/components/PwaStatusCard.tsx`
- `src/features/pwa/pwaStatus.ts`
- `src/features/today/pages/TodayPage.tsx`
- `src/features/plan/pages/PlanPage.tsx`
- `src/features/insights/pages/InsightsPage.tsx`
- `src/features/settings/pages/SettingsPage.tsx`
- `src/tests/app.spec.tsx`
- `src/tests/plan-page.spec.tsx`
- `src/tests/settings-page.spec.tsx`
- `src/tests/pwa-status.spec.ts`

### Components And Functions Touched

- `ProtectedLayout` and `PublicOnlyRoute` in `AppRouter.tsx`
- `AppShell`
- `getConnectivityStatusModel`
- `PwaStatusCard`
- `TodayPage`
- `PlanPage`
- `InsightsPage`, including `cleanCopy`, `MomentumCard`, `ReadinessPaceCard`, and `RecoveryBoundary`
- `SettingsPage`, including advanced disclosure labels and utility copy

### Implementation Summary

- Reframed the app shell from ceremonial `Personal Execution OS` language to direct `Daily execution` language.
- Shortened auth/session loading states so route restoration feels calmer.
- Simplified PWA, sync, offline, and install copy while preserving precise status values.
- Compressed `Today` around the current action, agenda, and signals without reintroducing the older support-layer framing.
- Compressed `Plan` around week selection, selected-day editing, prep focus, and calendar load.
- Compressed `Insights` so analytics still have depth but hero and metric copy are less diagnostic-heavy.
- Compressed `Settings` so backup, restore, calendar, notifications, and advanced details read as utility tools rather than platform diagnostics.
- Updated README product framing to match the simplified four-route model: `Today`, `Plan`, `Insights`, and `Settings`.
- Updated regression tests that asserted old copy.

### Verification Results

- `npm run typecheck` passed.
- `npm run lint` passed.
- `npm run test:run -- src/tests/app.spec.tsx src/tests/plan-page.spec.tsx src/tests/settings-page.spec.tsx` passed earlier during the focused route/copy pass.
- `npm run test:run` passed with 70 test files and 264 tests.
- `npm run build` passed and generated the production/PWA bundle.

### Browser Screenshot QA

Screenshots were captured against the authenticated local preview on `http://127.0.0.1:4180` using Chrome DevTools Protocol. The responsive screenshots use a 390px viewport without true mobile emulation so the authenticated browser session remains intact.

Desktop artifacts:

- `/tmp/forge-visual-audit/sprint6-verified2-today-desktop-1440x1000.png`
- `/tmp/forge-visual-audit/sprint6-verified2-plan-desktop-1440x1000.png`
- `/tmp/forge-visual-audit/sprint6-verified2-insights-desktop-1440x1000.png`
- `/tmp/forge-visual-audit/sprint6-verified2-settings-desktop-1440x1000.png`

Mobile/responsive artifacts:

- `/tmp/forge-visual-audit/sprint6-verified2-today-mobile-390x844.png`
- `/tmp/forge-visual-audit/sprint6-verified2-plan-mobile-390x844.png`
- `/tmp/forge-visual-audit/sprint6-verified2-insights-mobile-390x844.png`
- `/tmp/forge-visual-audit/sprint6-verified2-settings-mobile-390x844.png`

All eight route/viewport captures landed on the expected route and rendered the expected marker. Screenshots were inspected for clipping, excessive blank space, stale route state, and obvious wrapping regressions.

## Next Step

Review the simplified product copy in the app and screenshots. The next logical sprint is Sprint 7 final simplification hardening: leftover consistency, route-state polish, accessibility, and release-candidate QA.
