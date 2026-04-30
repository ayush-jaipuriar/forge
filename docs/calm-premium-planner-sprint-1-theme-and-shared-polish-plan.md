# Calm Premium Planner Sprint 1 Plan: Theme Foundation And Shared Polish

## Status

Implementation in progress.

Code implementation, automated verification, and screenshot QA are complete as of `2026-04-29 17:16 IST`.

## Purpose

Sprint 1 establishes Forge's new visual foundation while touching enough real UI to prove the direction.

The target is a calm premium planner, not a cockpit dashboard. The current product is still too dark, too bordered, too amber-heavy, and too system-diagnostic in tone. This sprint creates the theme architecture, adds user-controlled appearance settings, introduces a complete light mode, softens dark mode, and polishes the first layer of shared components and page hero panels.

## Locked Decisions

- Default theme mode is dark.
- Theme mode must be user-controlled from Settings in this sprint.
- Light mode must be introduced in this sprint, not deferred.
- Dark mode should become warmer, softer, and less cockpit-like.
- Shared component polish includes page-specific hero panels where practical.
- Desktop and mobile are equal implementation and QA targets.
- Screenshot artifacts should be captured for desktop/mobile and light/dark evidence.

## Product Principle

Forge should feel like a focused planning instrument for a real person, not an operations console for a machine.

This means:

- fewer aggressive borders
- less alarm-like amber
- warmer surfaces
- clearer content hierarchy
- more breathing room where it helps comprehension
- less diagnostic language in normal user-facing surfaces
- light mode that feels designed from first principles, not inverted from dark mode

## Relationship To The Broader Roadmap

This sprint combines the original roadmap's Sprint 1 foundation with a bounded slice of Sprint 2 shared-component de-dashboarding.

It does not replace the deeper future page redesign sprints. `Today`, `Plan`, `Insights`, and `Settings` will still get dedicated passes later. Sprint 1 should only create the foundation and apply enough shared/page-hero polish to make the next sprints easier and more coherent.

## Reference Inputs

### Product Roadmap

- `/Users/ayushjaipuriar/Documents/GitHub/forge/docs/calm-premium-planner-visual-redesign-plan.md`
- `/Users/ayushjaipuriar/Documents/GitHub/forge/docs/calm-premium-planner-sprint-0-online-only-plan.md`
- `/Users/ayushjaipuriar/Documents/GitHub/forge/docs/calm-premium-planner-sprint-0-1-direct-read-hardening-plan.md`

### Stitch Mock References

Use these as structure and hierarchy references, not as exact mood references. The old mocks lean more cockpit/command-center than the new calm premium direction.

- `/Users/ayushjaipuriar/Documents/GitHub/forge/stitch 3/forge_obsidian/DESIGN.md`
- `/Users/ayushjaipuriar/Documents/GitHub/forge/stitch 3/today_execution_console/screen.png`
- `/Users/ayushjaipuriar/Documents/GitHub/forge/stitch 3/today_mobile_cockpit/screen.png`
- `/Users/ayushjaipuriar/Documents/GitHub/forge/stitch 3/schedule_operations_board/screen.png`
- `/Users/ayushjaipuriar/Documents/GitHub/forge/stitch 3/settings_system_control/screen.png`
- `/Users/ayushjaipuriar/Documents/GitHub/forge/stitch 3/command_center_strategy_room/screen.png`

### Current Code Entry Points

- `/Users/ayushjaipuriar/Documents/GitHub/forge/src/app/theme/tokens.ts`
- `/Users/ayushjaipuriar/Documents/GitHub/forge/src/app/theme/theme.ts`
- `/Users/ayushjaipuriar/Documents/GitHub/forge/src/app/providers/AppProviders.tsx`
- `/Users/ayushjaipuriar/Documents/GitHub/forge/src/index.css`
- `/Users/ayushjaipuriar/Documents/GitHub/forge/src/components/common/SurfaceCard.tsx`
- `/Users/ayushjaipuriar/Documents/GitHub/forge/src/components/common/MetricTile.tsx`
- `/Users/ayushjaipuriar/Documents/GitHub/forge/src/components/common/SectionHeader.tsx`
- `/Users/ayushjaipuriar/Documents/GitHub/forge/src/components/status/StatusBadge.tsx`
- `/Users/ayushjaipuriar/Documents/GitHub/forge/src/components/status/SyncIndicator.tsx`
- `/Users/ayushjaipuriar/Documents/GitHub/forge/src/components/layout/AppShell.tsx`
- `/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/settings/pages/SettingsPage.tsx`
- `/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/auth/pages/AuthPage.tsx`
- `/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/today/pages/TodayPage.tsx`
- `/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/plan/pages/PlanPage.tsx`
- `/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/insights/pages/InsightsPage.tsx`

## Non-Goals

- Do not redesign every page deeply.
- Do not rebuild the Today agenda architecture.
- Do not reorganize Settings completely.
- Do not reintroduce offline-first authenticated behavior.
- Do not change Firestore data models for theme preference.
- Do not store theme preference in cloud settings in this sprint.
- Do not chase pixel-perfect parity with the older cockpit-style Stitch mocks.
- Do not add a design system package or large dependency unless the implementation is blocked without it.

## Theme Direction

### Dark Mode

Dark remains the default, but it should feel warmer and calmer.

Change direction:

- move from near-black navy to softer warm charcoal
- reduce high-contrast card borders
- reduce orange/amber as a default emphasis color
- reserve strong accent for primary actions and selected states
- use warm neutral text and softer muted text
- make page backgrounds atmospheric but less dramatic

### Light Mode

Light mode must feel premium and planner-like.

Change direction:

- warm ivory or parchment canvas, not sterile white
- soft paper surfaces with subtle warm-gray borders
- restrained accent use
- high readability for body text
- quiet status chips
- buttons that feel tactile without looking like SaaS defaults

### Persistence

Theme preference should be local and user-controlled.

Reasoning:

- appearance is a device/browser preference
- it should work for guest/demo and authenticated users
- it should not depend on Firestore availability
- it should not create cross-device sync complexity during the visual foundation sprint

## Proposed Implementation Slices

## Slice 1: Theme Mode Architecture

### Goal

Introduce a small, explicit appearance system that can render Forge in `dark` or `light`, defaulting to `dark`.

### Likely Files

- `/Users/ayushjaipuriar/Documents/GitHub/forge/src/app/theme/tokens.ts`
- `/Users/ayushjaipuriar/Documents/GitHub/forge/src/app/theme/theme.ts`
- `/Users/ayushjaipuriar/Documents/GitHub/forge/src/app/providers/AppProviders.tsx`
- new `/Users/ayushjaipuriar/Documents/GitHub/forge/src/app/theme/ThemeModeProvider.tsx`
- new or updated theme tests

### Checklist

- [x] Define `ForgeThemeMode = 'dark' | 'light'`.
- [x] Create a theme mode provider with default `dark`.
- [x] Persist theme mode in local storage with a stable key.
- [x] Handle invalid stored values safely by falling back to `dark`.
- [x] Generate MUI theme from current mode instead of exporting one static theme.
- [x] Keep `CssBaseline enableColorScheme`.
- [x] Set document theme metadata through `data-forge-theme`.
- [x] Avoid hydration or first-paint crashes if local storage is unavailable.
- [x] Add focused tests for default mode, persistence, and mode switching.

### Acceptance Criteria

- App boots in dark mode by default.
- Changing mode updates the MUI theme without reload.
- Reload preserves the selected mode.
- Guest and authenticated users share the same local appearance behavior.

## Slice 2: Semantic Token System

### Goal

Replace one-mode tokens with semantic light/dark token families that shared components can consume.

### Likely Files

- `/Users/ayushjaipuriar/Documents/GitHub/forge/src/app/theme/tokens.ts`
- `/Users/ayushjaipuriar/Documents/GitHub/forge/src/app/theme/theme.ts`
- `/Users/ayushjaipuriar/Documents/GitHub/forge/src/index.css`

### Checklist

- [x] Define semantic colors for `canvas`, `shell`, `paper`, `surface`, `raised`, `borderSubtle`, `borderStrong`, `textPrimary`, `textSecondary`, `textMuted`, `accent`, `accentSoft`, `success`, `warning`, and `critical`.
- [x] Define theme-aware gradients for page background, hero panels, and elevated cards.
- [x] Define theme-aware shadows that are softer in light mode and less black-heavy in dark mode.
- [x] Define radius tokens for `control`, `card`, `hero`, and `panel`.
- [x] Keep old token names temporarily only where needed to reduce churn.
- [x] Replace direct hardcoded use of cold dark values in theme-level components.
- [x] Verify focus outlines are visible in both modes through MUI focus-visible styles and targeted component coverage.
- [x] Verify selected states are visible without overusing amber in the first shared component pass.

### Acceptance Criteria

- Theme files expose a clear semantic vocabulary.
- Light mode does not depend on dark-mode color inversion.
- Dark mode reads warmer and less severe.

## Slice 3: Settings Appearance Control

### Goal

Add an obvious, low-noise Settings control for theme selection.

### Likely Files

- `/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/settings/pages/SettingsPage.tsx`
- `/Users/ayushjaipuriar/Documents/GitHub/forge/src/tests/settings-page.spec.tsx`
- theme provider files from Slice 1

### UX Direction

Add an `Appearance` section that answers one user question:

How should Forge look on this device?

Recommended controls:

- segmented control or toggle group with `Dark` and `Light`
- short helper copy: `Saved on this device.`
- avoid technical wording such as local storage, browser cache, or sync boundary

### Checklist

- [x] Add an `Appearance` section near the top of Settings, before advanced/system sections.
- [x] Show `Dark` and `Light` options with clear selected state.
- [x] Keep copy short and user-oriented.
- [x] Ensure keyboard focus and screen-reader semantics are correct.
- [x] Ensure switching theme does not trigger data refetch or auth reset.
- [x] Add Settings test coverage for visible appearance controls.
- [x] Add provider test coverage for persistence if not covered elsewhere.

### Acceptance Criteria

- User can switch themes from Settings.
- Theme switching is immediate.
- Theme preference survives reload.
- Settings does not become more verbose.

## Slice 4: Shared Component Polish

### Goal

Make the shared primitives support calm premium layouts before page-specific redesign begins.

### Likely Files

- `/Users/ayushjaipuriar/Documents/GitHub/forge/src/components/common/SurfaceCard.tsx`
- `/Users/ayushjaipuriar/Documents/GitHub/forge/src/components/common/MetricTile.tsx`
- `/Users/ayushjaipuriar/Documents/GitHub/forge/src/components/common/SectionHeader.tsx`
- `/Users/ayushjaipuriar/Documents/GitHub/forge/src/components/common/EmptyState.tsx`
- `/Users/ayushjaipuriar/Documents/GitHub/forge/src/components/status/StatusBadge.tsx`
- `/Users/ayushjaipuriar/Documents/GitHub/forge/src/components/status/SyncIndicator.tsx`
- `/Users/ayushjaipuriar/Documents/GitHub/forge/src/app/theme/theme.ts`

### Proposed Primitive Variants

- `SurfaceCard variant="default"` for normal content.
- `SurfaceCard variant="quiet"` for lower-emphasis sections.
- `SurfaceCard variant="hero"` for page hero panels.
- `SurfaceCard variant="plain"` for grouped content that should not look like another dashboard card.

If introducing a variant API creates too much churn, implement the equivalent with conservative props such as `tone` and `emphasis`.

### Checklist

- [x] Add shared surface variants or equivalent emphasis props.
- [x] Reduce default border contrast.
- [x] Reduce default shadow heaviness.
- [x] Tune card padding for mobile and desktop.
- [x] Make hero surfaces wider, calmer, and more editorial.
- [x] Ensure buttons have tactile hover/active/focus states in both modes.
- [x] Ensure chips and badges are quieter than primary content.
- [x] Reduce uppercase label intensity in shared primitives where practical without forcing a full typography sweep.
- [x] Keep existing component call sites working while variants are adopted gradually.
- [x] Add or update tests where component semantics change.

### Acceptance Criteria

- Shared surfaces no longer all feel like the same bordered dashboard card.
- Components work in light and dark mode without one-off page hacks.
- Future page sprints can use shared variants instead of inventing local styling.

## Slice 5: Page Hero Panel First Pass

### Goal

Apply the new shared hero treatment to primary page headers without doing full page redesigns.

### Likely Files

- `/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/today/pages/TodayPage.tsx`
- `/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/plan/pages/PlanPage.tsx`
- `/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/insights/pages/InsightsPage.tsx`
- `/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/settings/pages/SettingsPage.tsx`
- `/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/auth/pages/AuthPage.tsx`

### Direction

The page hero should do less and communicate more.

For Sprint 1:

- keep each page's existing information architecture mostly intact
- apply new `hero` surface styling
- reduce alarm-like badges where practical
- shorten obvious copy if it is repeated nearby
- ensure hero actions wrap well on mobile
- avoid pulling more modules into the hero unless the page already does so cleanly

### Checklist

- [x] Apply hero treatment to `Today`.
- [x] Apply hero treatment to `Plan`.
- [x] Apply hero treatment to `Insights`.
- [x] Apply hero treatment to `Settings`.
- [x] Apply auth card/page treatment for light and dark mode.
- [x] Keep all hero panels readable on mobile at the component/layout level.
- [x] Keep primary actions obvious without making every badge loud.
- [x] Avoid full page restructuring in this sprint unless a hero panel is broken without it.
- [x] Capture before/after screenshot notes in the sprint doc.

### Acceptance Criteria

- Primary route heroes feel coherent across the app.
- Light and dark hero panels feel intentionally designed.
- Hero treatment creates enough visual improvement to validate the new design language.

## Slice 6: QA And Screenshot Evidence

### Goal

Prove that Sprint 1 works technically and visually across the main surfaces.

### Automated Verification Checklist

- [x] `npm run typecheck`
- [x] `npm run lint`
- [x] `npm run test:run`
- [x] `npm run build`
- [x] `git diff --check`

### Browser QA Checklist

- [x] Auth signed-out page, dark desktop.
- [x] Auth signed-out page, light desktop.
- [x] Auth signed-out page, dark mobile.
- [x] Auth signed-out page, light mobile.
- [x] Settings appearance control, dark desktop.
- [x] Settings appearance control, light desktop.
- [x] Settings appearance control, dark mobile.
- [x] Settings appearance control, light mobile.
- [x] Today hero, dark desktop.
- [x] Today hero, light desktop.
- [x] Today hero, dark mobile.
- [x] Today hero, light mobile.
- [x] Plan hero, dark/light desktop.
- [x] Plan hero, dark/light mobile.
- [x] Insights hero, dark/light desktop.
- [x] Insights hero, dark/light mobile.
- [x] Theme persists after reload.
- [x] Theme switching does not sign the user out.
- [x] Guest/demo still works in both themes for the primary navigation and local appearance control.

### Screenshot Artifact Plan

Store Sprint 1 visual QA artifacts under:

- `/Users/ayushjaipuriar/Documents/GitHub/forge/output/playwright/calm-premium-planner-sprint-1/`

Expected screenshots:

- `auth-dark-desktop.png`
- `auth-light-desktop.png`
- `auth-dark-mobile.png`
- `auth-light-mobile.png`
- `settings-dark-desktop.png`
- `settings-light-desktop.png`
- `settings-dark-mobile.png`
- `settings-light-mobile.png`
- `today-dark-desktop.png`
- `today-light-desktop.png`
- `today-dark-mobile.png`
- `today-light-mobile.png`
- `plan-dark-desktop.png`
- `plan-light-desktop.png`
- `insights-dark-desktop.png`
- `insights-light-desktop.png`

Captured artifacts:

- `/Users/ayushjaipuriar/Documents/GitHub/forge/output/playwright/calm-premium-planner-sprint-1/auth-dark-desktop.png`
- `/Users/ayushjaipuriar/Documents/GitHub/forge/output/playwright/calm-premium-planner-sprint-1/auth-light-desktop.png`
- `/Users/ayushjaipuriar/Documents/GitHub/forge/output/playwright/calm-premium-planner-sprint-1/auth-dark-mobile.png`
- `/Users/ayushjaipuriar/Documents/GitHub/forge/output/playwright/calm-premium-planner-sprint-1/auth-light-mobile.png`
- `/Users/ayushjaipuriar/Documents/GitHub/forge/output/playwright/calm-premium-planner-sprint-1/settings-dark-desktop.png`
- `/Users/ayushjaipuriar/Documents/GitHub/forge/output/playwright/calm-premium-planner-sprint-1/settings-light-desktop.png`
- `/Users/ayushjaipuriar/Documents/GitHub/forge/output/playwright/calm-premium-planner-sprint-1/settings-dark-mobile.png`
- `/Users/ayushjaipuriar/Documents/GitHub/forge/output/playwright/calm-premium-planner-sprint-1/settings-light-mobile.png`
- `/Users/ayushjaipuriar/Documents/GitHub/forge/output/playwright/calm-premium-planner-sprint-1/today-dark-desktop.png`
- `/Users/ayushjaipuriar/Documents/GitHub/forge/output/playwright/calm-premium-planner-sprint-1/today-light-desktop.png`
- `/Users/ayushjaipuriar/Documents/GitHub/forge/output/playwright/calm-premium-planner-sprint-1/today-dark-mobile.png`
- `/Users/ayushjaipuriar/Documents/GitHub/forge/output/playwright/calm-premium-planner-sprint-1/today-light-mobile.png`
- `/Users/ayushjaipuriar/Documents/GitHub/forge/output/playwright/calm-premium-planner-sprint-1/plan-dark-desktop.png`
- `/Users/ayushjaipuriar/Documents/GitHub/forge/output/playwright/calm-premium-planner-sprint-1/plan-light-desktop.png`
- `/Users/ayushjaipuriar/Documents/GitHub/forge/output/playwright/calm-premium-planner-sprint-1/plan-dark-mobile.png`
- `/Users/ayushjaipuriar/Documents/GitHub/forge/output/playwright/calm-premium-planner-sprint-1/plan-light-mobile.png`
- `/Users/ayushjaipuriar/Documents/GitHub/forge/output/playwright/calm-premium-planner-sprint-1/insights-dark-desktop.png`
- `/Users/ayushjaipuriar/Documents/GitHub/forge/output/playwright/calm-premium-planner-sprint-1/insights-light-desktop.png`
- `/Users/ayushjaipuriar/Documents/GitHub/forge/output/playwright/calm-premium-planner-sprint-1/insights-dark-mobile.png`
- `/Users/ayushjaipuriar/Documents/GitHub/forge/output/playwright/calm-premium-planner-sprint-1/insights-light-mobile.png`

If authenticated browser automation is blocked by login constraints, record the limitation and use the signed-in Chrome session for desktop smoke QA, then keep mobile authenticated screenshots as a follow-up rather than fabricating evidence.

## Risk Register

### Risk 1: Light Mode Looks Like Generic SaaS

Mitigation:

- use warm canvas and paper tones
- keep typography confident
- avoid blue-gray defaults
- tune shadows and borders manually

### Risk 2: Theme Work Becomes A Full App Rewrite

Mitigation:

- keep token compatibility where needed
- adopt shared variants gradually
- do not force every page to be perfect in Sprint 1

### Risk 3: Settings Gets More Verbose

Mitigation:

- add a compact Appearance section
- avoid technical storage/sync copy
- defer deeper Settings information architecture cleanup to its dedicated sprint

### Risk 4: Hero Polish Becomes Page Redesign

Mitigation:

- only polish hero surfaces and obvious repeated copy
- defer Today agenda architecture to the Today sprint
- defer Plan weekly model polish to the Plan sprint
- defer Insights density polish to the Insights sprint

### Risk 5: Browser QA Is Auth-Limited

Mitigation:

- use signed-out automation for Auth and demo screenshots
- use signed-in Chrome session for authenticated desktop smoke QA when needed
- explicitly document any mobile authenticated limitation

## Implementation Order

1. Theme mode provider and persistence.
2. Light/dark token families.
3. MUI theme factory.
4. Settings Appearance control.
5. Shared component variants and theme-aware polish.
6. Page hero treatment adoption.
7. Tests and screenshot QA.
8. Documentation update with completed checklist and remaining limitations.

## Definition Of Done

- [x] Sprint 1 code is implemented.
- [x] Theme defaults to dark.
- [x] User can switch between dark and light in Settings.
- [x] Selected theme persists across reload.
- [x] Light mode is visually complete enough for primary routes at the first-pass shared/hero layer.
- [x] Dark mode is warmer and softer than the current cockpit style.
- [x] Shared surfaces/buttons/chips support the new visual language.
- [x] Primary route hero panels use the new treatment where practical.
- [x] Desktop and mobile receive equal QA attention.
- [x] Screenshot artifacts are captured or limitations are documented.
- [x] Automated verification passes.
- [x] This plan document is updated with implementation notes and verification results.

## Implementation Notes

Updated on `2026-04-29 17:16 IST`.

### Files Changed

- `/Users/ayushjaipuriar/Documents/GitHub/forge/src/app/theme/tokens.ts`: added mode-aware semantic token families and compatibility exports.
- `/Users/ayushjaipuriar/Documents/GitHub/forge/src/app/theme/theme.ts`: converted the static MUI theme into a `createForgeTheme(mode)` factory while preserving the legacy `forgeTheme` export.
- `/Users/ayushjaipuriar/Documents/GitHub/forge/src/app/theme/ThemeModeProvider.tsx`: added local appearance persistence, default dark mode, and document theme metadata.
- `/Users/ayushjaipuriar/Documents/GitHub/forge/src/app/theme/themeModeContext.ts`: separated the theme-mode hook/context to satisfy Fast Refresh lint rules.
- `/Users/ayushjaipuriar/Documents/GitHub/forge/src/app/providers/AppProviders.tsx`: wrapped the app with the theme-mode provider.
- `/Users/ayushjaipuriar/Documents/GitHub/forge/src/index.css`: removed the hard-coded dark body background and allowed both color schemes.
- `/Users/ayushjaipuriar/Documents/GitHub/forge/src/components/common/SurfaceCard.tsx`: added `default`, `hero`, `quiet`, and `plain` variants.
- `/Users/ayushjaipuriar/Documents/GitHub/forge/src/components/common/MetricTile.tsx`: moved visual treatment to theme-aware values.
- `/Users/ayushjaipuriar/Documents/GitHub/forge/src/components/common/EmptyState.tsx`: moved empty-state surface and type colors to theme-aware values.
- `/Users/ayushjaipuriar/Documents/GitHub/forge/src/components/common/OperationalSignalCard.tsx`: moved status-card styling to theme-aware values.
- `/Users/ayushjaipuriar/Documents/GitHub/forge/src/components/status/StatusBadge.tsx`: made badge tones work in light and dark mode.
- `/Users/ayushjaipuriar/Documents/GitHub/forge/src/components/status/SyncIndicator.tsx`: made sync indicator tones work in light and dark mode.
- `/Users/ayushjaipuriar/Documents/GitHub/forge/src/components/layout/AppShell.tsx`: moved shell, nav, and mobile-nav styling to theme-aware values.
- `/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/auth/pages/AuthPage.tsx`: made the signed-out/auth experience theme-aware and compatible with light mode.
- `/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/settings/pages/SettingsPage.tsx`: added Appearance controls and converted nearby surfaces to theme-aware styling.
- `/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/today/pages/TodayPage.tsx`: adopted the new hero surface treatment for the Today hero/current execution areas.
- `/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/plan/pages/PlanPage.tsx`: adopted the new hero treatment and theme-aware supporting plan surfaces.
- `/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/insights/pages/InsightsPage.tsx`: adopted the new hero treatment for the main Insights surface.
- `/Users/ayushjaipuriar/Documents/GitHub/forge/src/tests/settings-page.spec.tsx`: added Appearance-control coverage.
- `/Users/ayushjaipuriar/Documents/GitHub/forge/src/tests/theme-mode-provider.spec.tsx`: added theme provider persistence/default/fallback coverage.
- `/Users/ayushjaipuriar/Documents/GitHub/forge/src/tests/setup.ts`: hardened IndexedDB globals for Firebase-backed tests.

### Verification Results

- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm run test:run`: passed, `74` files and `278` tests.
- `npm run build`: passed.
- `git diff --check`: passed.

### Remaining Notes

- Browser screenshot QA was completed through Playwright against the local production preview on `127.0.0.1:4180`.
- The in-app browser successfully navigated and inspected the app, but screenshot capture timed out there, so screenshot artifacts were captured through terminal Playwright instead.
- Guest-mode Settings can still show a data-workspace loading card in this Playwright profile, but the local Appearance control now renders above that dependency so theme switching remains available.
- Some deeper page internals still use older cockpit-era local styling where that styling sits outside the shared components touched in Sprint 1. Those are intentionally left for the dedicated page redesign sprints so this foundation sprint does not become a full rewrite.

## Next Step

Run browser QA, capture the planned screenshots under `/Users/ayushjaipuriar/Documents/GitHub/forge/output/playwright/calm-premium-planner-sprint-1/`, fix any obvious visual regressions, then update this document with the final screenshot evidence.
