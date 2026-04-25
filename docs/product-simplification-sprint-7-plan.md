# Product Simplification Sprint 7 Plan: Final Release-Candidate Hardening

## Status

Implemented.

Code, copy cleanup, documentation, automated verification, and browser screenshot QA are complete.

## Sprint Goal

Make the simplified Forge product feel release-candidate ready after the IA, route consolidation, page simplification, Settings cleanup, and copy compression work from Sprints 1-6.

The user-facing goal is:

> Forge should feel focused, intentional, and complete across every reachable route, state, and viewport.

## Locked Scope Decisions

These decisions were confirmed before writing this plan.

- Include cleanup of legacy routes and pages, not only the four primary routes.
- Run browser screenshot QA across auth, `Today`, `Plan`, `Insights`, `Settings`, and `About`.
- Include a small JSX/layout formatting and consistency pass.
- Include service-generated user-visible copy, not just page component copy.
- End the sprint with a release-candidate checklist and automated QA evidence.

## Current Problem

The simplification stream has done the main structural work:

- `Today` is the action center.
- `Plan` replaces the old Schedule/Prep split.
- `Insights` replaces Command Center/Readiness as the primary review surface.
- `Settings` is calmer and utility-first.
- Sprint 6 reduced the most visible copy clutter.

The remaining risk is transition residue.

Forge can still feel mid-migration if:

- legacy pages contain old verbose language when reached directly
- service-generated copy leaks jargon back into primary routes
- auth/loading/error states use different tone than the main product
- desktop and mobile screenshots show inconsistent hierarchy
- small JSX/layout inconsistencies make future edits harder
- release readiness relies on memory instead of a repeatable checklist

This sprint should remove those seams.

## Product Quality Bar

Sprint 7 is not a redesign sprint. It is a hardening sprint.

The app should pass a practical product-manager test:

- A new user can explain what Forge is after visiting `Today`, `Plan`, `Insights`, and `Settings`.
- A returning user can find the next action quickly.
- A direct legacy URL does not feel like a different product.
- Mobile and desktop feel like equal first-class targets.
- The app no longer exposes implementation machinery unless the user opens advanced details.

## Scope

### 1. Primary Route Release-Candidate Pass

Routes:

- `/`
- `/plan`
- `/insights`
- `/settings`
- `/about`
- `/auth`

Checklist:

- [x] Review route headers, hero copy, card titles, card descriptions, CTAs, chips, loading states, empty states, and error states.
- [x] Remove remaining unnecessary jargon or repeated explanation.
- [x] Verify each route has one obvious first action or first read.
- [x] Verify mobile top-of-page content is not crowded or misleading.
- [x] Verify desktop layout does not create large accidental voids or awkward wrapping.

### 2. Legacy Route And Direct-URL Cleanup

Routes or pages that may still be reachable directly:

- `/command-center`
- `/schedule`
- `/prep`
- `/physical`
- `/readiness`
- any old route redirected by `AppRouter`

Checklist:

- [x] Confirm old public URLs redirect to the simplified destinations where intended.
- [x] If a legacy page remains reachable internally or during tests, reduce obvious old product-language leaks.
- [x] Avoid large legacy rewrites unless a legacy page is still user-visible.
- [x] Keep compatibility imports/components intact when primary routes reuse them.
- [x] Verify redirects through browser QA.

### 3. Service-Generated User Copy Cleanup

Likely areas:

- analytics summaries
- readiness labels
- recommendation explanations
- calendar summaries
- sync/PWA status models
- settings diagnostics summaries that appear in collapsed labels

Checklist:

- [x] Search for user-visible phrases using old vocabulary: `pressure`, `operational`, `intervention`, `surface`, `runtime`, `diagnostics`, `boundary`, `truth`, `scaffold`.
- [x] Classify each hit as internal-only, advanced-only, or primary user-visible.
- [x] Rewrite primary user-visible copy first.
- [x] Keep domain names/types unchanged where renaming would create unnecessary engineering risk.
- [x] Update tests for changed generated labels or summaries.

### 4. Auth, Loading, Empty, And Error State Polish

Checklist:

- [x] Verify Google redirect return does not show alarming or overly technical text.
- [x] Verify guest mode copy remains short and honest.
- [x] Verify protected-route loading states are brief and consistent.
- [x] Verify error states tell the user what happened without narrating internals.
- [x] Update focused tests for changed state copy.

### 5. Accessibility And Interaction Hardening

Checklist:

- [x] Review button labels and `aria-label` values for clarity.
- [x] Verify icon-only navigation has accessible labels.
- [x] Verify drawers/menus have clear labels and close behavior.
- [x] Verify disabled controls include enough surrounding context.
- [x] Check keyboard-visible controls through accessible role assertions and screenshot QA.
- [x] Preserve visible focus states.

### 6. JSX, Layout, And Copy Consistency Pass

Checklist:

- [x] Fix obvious JSX indentation issues.
- [x] Remove inconsistent capitalization in labels where it affects polish.
- [x] Normalize repeated labels such as `Current`, `Connected`, `Review needed`, `Not logged yet`, and `Unknown`.
- [x] Keep card density consistent without introducing a full design-system refactor.
- [x] Avoid broad formatting-only churn in unrelated files.

### 7. Documentation And Release-Candidate Evidence

Checklist:

- [x] Update this sprint doc with implementation results.
- [x] Update `docs/product-simplification-milestone-breakdown.md` with Sprint 7 status.
- [x] Add a release-candidate checklist section to this doc.
- [x] Record changed files and touched components/functions.
- [x] Record automated verification commands and results.
- [x] Record browser screenshot artifact paths.
- [x] Record any residual risks that should survive into a future backlog.

## Out Of Scope

- New features.
- New Firebase architecture.
- New analytics models.
- Full visual redesign.
- Native-shell parity work.
- Reopening the four-route IA decision.
- Large component extraction unless required to fix a release-candidate issue.
- Renaming domain types, persisted fields, or service APIs solely for vocabulary cleanup.

## Recommended Implementation Sequence

### Step 1: RC Inventory

Checklist:

- [x] Search primary and legacy surfaces for remaining old product terms.
- [x] Inspect current route redirects.
- [x] Identify service-generated copy that appears in primary routes.
- [x] Identify formatting/layout nits from Sprint 6 review.

### Step 2: Primary Route Polish

Checklist:

- [x] Polish `Today`.
- [x] Polish `Plan`.
- [x] Polish `Insights`.
- [x] Polish `Settings`.
- [x] Polish `About`.
- [x] Polish `Auth`.
- [x] Keep each page behaviorally stable.

### Step 3: Legacy And Generated Copy Cleanup

Checklist:

- [x] Clean legacy page copy only where user-visible or directly reachable.
- [x] Clean service-generated labels/summaries that appear on primary routes.
- [x] Keep internal engineering terms in code where they are not user-facing.
- [x] Update affected tests.

### Step 4: Accessibility And Interaction Pass

Checklist:

- [x] Review nav labels and controls.
- [x] Review drawer/menu semantics.
- [x] Review key CTAs and disabled controls.
- [x] Update focused regression tests where copy changed.

### Step 5: Documentation Update

Checklist:

- [x] Update Sprint 7 implementation record.
- [x] Update milestone tracker.
- [x] Add release-candidate checklist and residual-risk notes.

### Step 6: Automated Verification

Checklist:

- [x] Run `npm run typecheck`.
- [x] Run `npm run lint`.
- [x] Run focused route/copy tests as needed.
- [x] Run `npm run test:run`.
- [x] Run `npm run build`.

### Step 7: Browser Screenshot QA

Required desktop captures:

- [x] `/auth`
- [x] `/`
- [x] `/plan`
- [x] `/insights`
- [x] `/settings`
- [x] `/about`

Required mobile/responsive captures:

- [x] `/auth`
- [x] `/`
- [x] `/plan`
- [x] `/insights`
- [x] `/settings`
- [x] `/about`

Legacy/direct URL checks:

- [x] `/command-center` redirects or lands safely.
- [x] `/schedule` redirects or lands safely.
- [x] `/prep` redirects or lands safely.
- [x] `/physical` redirects or lands safely.
- [x] `/readiness` redirects or lands safely.

Screenshot inspection checklist:

- [x] No obvious clipping.
- [x] No accidental large blank content voids.
- [x] No stale route content after navigation.
- [x] No old route names shown as primary destinations.
- [x] No high-visibility jargon leaks on primary routes.
- [x] Mobile bottom navigation does not cover critical first actions.
- [x] Auth state remains understandable.

## Acceptance Criteria

Sprint 7 is complete when:

- Primary routes feel release-candidate ready on desktop and mobile.
- Legacy routes do not reintroduce the old cluttered product model.
- Service-generated user copy no longer leaks high-visibility jargon into primary surfaces.
- Auth/loading/empty/error states use consistent, plain language.
- Navigation, CTAs, and key controls remain accessible and understandable.
- Automated verification passes.
- Browser screenshots are captured and inspected for auth, `Today`, `Plan`, `Insights`, `Settings`, and `About`.
- Release-candidate checklist and residual risks are documented.

## Release-Candidate Checklist

This section must be completed during implementation.

- [x] Primary route QA complete.
- [x] Auth QA complete.
- [x] Legacy route QA complete.
- [x] Desktop screenshot QA complete.
- [x] Mobile/responsive screenshot QA complete.
- [x] Automated test suite green.
- [x] Production build green.
- [x] Documentation updated.
- [x] Residual risks documented.

## Implementation Record

### Implementation Summary

Sprint 7 hardens the simplified Forge product by removing remaining transition residue from primary routes, legacy pages, generated copy, and advanced settings models.

The implementation deliberately avoids broad domain renames. Internal identifiers such as `pressureLevel`, `operationalSignals`, and `runtime` remain where renaming would risk persisted state, service contracts, or unrelated test churn. The user-facing language is cleaned instead.

### Changed Files

- `index.html`
- `src/features/auth/pages/AuthPage.tsx`
- `src/features/about/pages/AboutPage.tsx`
- `src/features/today/pages/TodayPage.tsx`
- `src/features/plan/pages/PlanPage.tsx`
- `src/features/command-center/pages/CommandCenterPage.tsx`
- `src/features/command-center/components/WarningCard.tsx`
- `src/features/schedule/pages/SchedulePage.tsx`
- `src/features/prep/pages/PrepPage.tsx`
- `src/features/readiness/pages/ReadinessPage.tsx`
- `src/features/physical/pages/PhysicalPage.tsx`
- `src/components/layout/AppShell.tsx`
- `src/data/seeds/routine.ts`
- `src/domain/analytics/gamification.ts`
- `src/domain/analytics/insights.ts`
- `src/domain/analytics/projections.ts`
- `src/domain/health/providers.ts`
- `src/domain/platform/capabilities.ts`
- `src/domain/platform/ownership.ts`
- `src/domain/readiness/calculateReadinessSnapshot.ts`
- `src/domain/recommendation/getFallbackModeSuggestion.ts`
- `src/domain/recommendation/getNextActionRecommendation.ts`
- `src/domain/sync/conflicts.ts`
- `src/services/analytics/commandCenterWorkspaceService.ts`
- `src/services/analytics/operationalAnalyticsService.ts`
- `src/services/backup/restoreService.ts`
- `src/services/monitoring/operationalDiagnosticsService.ts`
- `src/tests/app.spec.tsx`
- `src/tests/auth-page.spec.tsx`
- `src/tests/domain/analytics-insights.spec.ts`
- `src/tests/domain/platform-capabilities.spec.ts`
- `src/tests/domain/recommendation.spec.ts`
- `src/tests/physical-page.spec.tsx`
- `src/tests/readiness-page.spec.tsx`
- `src/tests/schedule-page.spec.tsx`
- `src/tests/services/operational-analytics.spec.ts`
- `src/tests/settings-page.spec.tsx`

### Components And Functions Touched

- `AuthPage`
- `AboutPage`
- `TodayPage`
- `PlanPage`
- `CommandCenterPage`
- `WarningCard`
- `SchedulePage`
- `PrepPage`
- `ReadinessPage`
- `PhysicalPage`
- `AppShell`
- `deriveGamificationState`
- `generateInsightNarrative`
- `calculateReadinessSnapshot`
- `deriveOperationalAnalytics`
- `derivePlatformOwnership`
- `deriveCapabilityBoundary`
- `deriveHealthPhaseNotice`
- `getFallbackModeSuggestion`
- `getNextActionRecommendation`
- `getSyncConflictPolicy`
- `applyStagedRestore`
- `index.html` document metadata

### User-Facing Copy Changes

- Browser metadata now uses the title `Forge` and describes Forge as a focused daily execution app.
- Auth now says `demo workspace` instead of `guest workspace` and removes extra explanation.
- About now frames Forge as a focused daily execution app instead of an execution OS.
- Insights legacy copy now uses `Insights`, `focus`, `review`, and `risk` instead of old `Command Center`, `pressure`, and `intervention` language.
- Readiness legacy copy now says `review` and `attention` instead of `intervention`.
- Schedule legacy copy now says `load`, `plan`, and `routine source` instead of `pressure`, `operational plan`, and `source of truth`.
- Physical and Prep legacy copy now removes `surface`, `seam`, `scaffolded`, and `operational` where those words were visible to users.
- Generated analytics, recommendation, backup, sync, health-provider, and platform copy now uses calmer plain-language labels.

### Accessibility And Interaction Changes

- Existing accessible navigation labels and drawer labels were preserved.
- Icon-only navigation still has text labels in shell configuration.
- Disabled/advanced controls keep surrounding context, but the surrounding text is less technical.
- JSX indentation was cleaned in `AppShell`, `TodayPage`, `PlanPage`, and `PhysicalPage` to reduce future layout-edit mistakes.

### Automated Verification

Final verification:

- [x] `npm run typecheck`
- [x] `npm run lint`
- [x] `npm run test:run -- src/tests/app.spec.tsx src/tests/domain/analytics-insights.spec.ts src/tests/domain/recommendation.spec.ts src/tests/services/operational-analytics.spec.ts src/tests/readiness-page.spec.tsx src/tests/settings-page.spec.tsx`
- [x] `npm run test:run` passed with 70 files and 264 tests.
- [x] `npm run build`
- [x] `git diff --check`

### Browser Screenshot Artifacts

Browser QA passed with no failures. The report is recorded at:

- `output/playwright/sprint7-rc/sprint7-browser-qa-report.json`

Desktop screenshots:

- `output/playwright/sprint7-rc/auth-desktop-1440x1000.png`
- `output/playwright/sprint7-rc/today-desktop-1440x1000.png`
- `output/playwright/sprint7-rc/plan-desktop-1440x1000.png`
- `output/playwright/sprint7-rc/insights-desktop-1440x1000.png`
- `output/playwright/sprint7-rc/settings-desktop-1440x1000.png`
- `output/playwright/sprint7-rc/about-desktop-1440x1000.png`

Mobile/responsive screenshots:

- `output/playwright/sprint7-rc/auth-mobile-390x844.png`
- `output/playwright/sprint7-rc/today-mobile-390x844.png`
- `output/playwright/sprint7-rc/plan-mobile-390x844.png`
- `output/playwright/sprint7-rc/insights-mobile-390x844.png`
- `output/playwright/sprint7-rc/settings-mobile-390x844.png`
- `output/playwright/sprint7-rc/about-mobile-390x844.png`

Legacy redirect screenshots:

- `output/playwright/sprint7-rc/legacy-command-center-redirect-desktop-1440x1000.png`
- `output/playwright/sprint7-rc/legacy-readiness-redirect-desktop-1440x1000.png`
- `output/playwright/sprint7-rc/legacy-schedule-redirect-desktop-1440x1000.png`
- `output/playwright/sprint7-rc/legacy-prep-redirect-desktop-1440x1000.png`
- `output/playwright/sprint7-rc/legacy-physical-redirect-desktop-1440x1000.png`

### Residual Risks

- Internal domain identifiers still use older vocabulary in a few places. This is intentional for release-candidate safety and can become a future technical-debt refactor if it becomes confusing for contributors.
- Legacy page modules still exist because primary routes reuse some of them and direct route compatibility remains useful. They are polished enough not to feel like a different product, but deletion/extraction can be a later cleanup.
- Browser QA used responsive viewport emulation in Chrome, not physical mobile hardware. Native shell/mobile-device parity should remain a separate future validation track.

## Next Step

Review the Sprint 7 artifacts and decide whether to commit this release-candidate hardening batch.
