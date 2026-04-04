# UI Modernization Sprint 5 Plan

## Purpose

This document defines Sprint 5 of the Forge UI modernization track.

Sprint 5 is a **cross-app polish and consistency sprint** rather than another page-specific redesign sprint.

It exists to tighten the whole product after the major structural work completed in Sprints 1 through 4.

## Why Sprint 5 Exists

After Sprints 1 through 4:

- the shell is much stronger
- Today and Command Center now have real hierarchy
- Schedule and Settings are more operational
- Prep, Physical, and Readiness now belong to the same visual system

That means the biggest remaining gaps are no longer structural page rewrites.

They are now cross-app quality issues:

- some sections are still too verbose
- navigation and shell surfaces still carry more noise than they should
- status density is still heavier than ideal in places
- keyboard and focus behavior need a more deliberate pass
- the auth restoration flash during route changes is still visible

If those issues are left unaddressed, Forge will feel “mostly redesigned” rather than truly cohesive.

## Sprint Direction

This sprint will focus on:

- cross-app polish and consistency
- desktop and mobile as equal targets
- navigation, shell restraint, and status density
- copy compression where sections are too verbose
- accessibility and interaction polish
- auth-restoration continuity during route changes

This sprint will **not**:

- reopen broad page redesign work that was already completed cleanly
- invent new product semantics
- replace honest product copy with mockup-style theatrics
- turn the sprint into generic visual tweaking without explicit acceptance criteria

## Inputs

### Prior Modernization References

- [docs/ui-modernization-implementation-plan.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/ui-modernization-implementation-plan.md)
- [docs/ui-modernization-sprint-1-plan.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/ui-modernization-sprint-1-plan.md)
- [docs/ui-modernization-sprint-2-plan.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/ui-modernization-sprint-2-plan.md)
- [docs/ui-modernization-sprint-3-plan.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/ui-modernization-sprint-3-plan.md)
- [docs/ui-modernization-sprint-3-1-plan.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/ui-modernization-sprint-3-1-plan.md)
- [docs/ui-modernization-sprint-4-plan.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/ui-modernization-sprint-4-plan.md)

### Auth And Runtime References

- [docs/auth-hardening-sprint-plan.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/auth-hardening-sprint-plan.md)

### Stitch References

Sprint 5 should continue using Stitch as a restraint and composition reference, not as a source of fictional copy or theatrical semantics:

- [stitch 3/forge_ui_ux_redesign_strategy.html](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/forge_ui_ux_redesign_strategy.html)
- [stitch 3/forge_today_command_center_strategy.html](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/forge_today_command_center_strategy.html)
- [stitch 3/forge_obsidian/DESIGN.md](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/forge_obsidian/DESIGN.md)
- [stitch 3/today_execution_console/screen.png](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/today_execution_console/screen.png)
- [stitch 3/command_center_strategy_room/screen.png](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/command_center_strategy_room/screen.png)
- [stitch 3/settings_system_control/screen.png](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/settings_system_control/screen.png)
- [stitch 3/today_mobile_cockpit/screen.png](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/today_mobile_cockpit/screen.png)

## Core Interpretation

Sprint 5 is about making Forge feel:

- quieter
- more confident
- less repetitive
- more readable
- better behaved

In practical terms, that means:

- less text where text is doing layout work instead of user work
- clearer keyboard and focus behavior
- cleaner shell behavior across breakpoints
- less visual competition from chips, badges, and repeated status copy
- smoother auth return so route changes feel continuous instead of interrupted

## Sprint Goals

By the end of Sprint 5:

- the shell should feel calmer and more deliberate across desktop and mobile
- verbose sections should be trimmed to the minimum copy needed for clarity
- Settings should feel especially cleaner and less copy-heavy
- status chips and support labels should compete less with primary content
- keyboard navigation and focus visibility should feel intentional
- auth restoration should feel less disruptive during route transitions
- the product should feel more cohesive across all major surfaces

## Recommended Work Order

1. shell restraint and navigation polish
2. cross-app copy compression
3. accessibility and interaction polish
4. auth-restoration continuity
5. sprint-wide consistency sweep and verification

Why this order:

- shell restraint affects every screen immediately
- copy compression is easier once shell rhythm is stable
- interaction polish should follow the final control hierarchy
- auth continuity should be validated against the calmer final shell instead of an intermediate one

## Workstream 0: Shell Restraint And Navigation Polish

### Goal

Reduce shell noise and improve navigation clarity across desktop and mobile.

### Why This Matters

The shell now has the right structure, but some parts still carry too much visual or cognitive weight:

- rail labels can still feel cramped
- status clusters can still compete with page content
- mobile navigation still needs stronger “installed app” confidence

### Checklist

- [x] Review desktop left-rail density and label clarity.
- [x] Reduce status/badge competition in the shell header.
- [x] Review mobile nav balance:
  - icon clarity
  - active-state visibility
  - label discipline
- [x] Tighten spacing and restraint where shell elements still feel louder than page content.

### Primary Files

- [src/components/layout/AppShell.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/components/layout/AppShell.tsx)
- [src/app/theme/theme.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/app/theme/theme.ts)
- [src/components/status/StatusBadge.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/components/status/StatusBadge.tsx)
- [src/components/status/SyncIndicator.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/components/status/SyncIndicator.tsx)

### Exit Criteria

- the shell feels calmer, clearer, and more consistent on desktop and mobile

## Workstream 1: Cross-App Copy Compression

### Goal

Reduce unnecessary verbosity across screens while preserving product honesty.

### Why This Matters

Forge uses explanatory copy to stay truthful, but some surfaces are now explaining too much inside the UI itself.

That weakens:

- scanability
- hierarchy
- perceived polish

This is especially true in:

- Settings
- support sections
- health scaffolding surfaces
- explanatory subcopy under already-clear headings

### Checklist

- [x] Audit major surfaces for text that explains more than the UI needs in the moment.
- [x] Shorten verbose descriptions while preserving truthfulness.
- [x] Give Settings a dedicated verbosity pass.
- [x] Keep scaffolding copy honest but more concise.
- [x] Trim repeated explanatory language where titles, metrics, and grouping already carry the meaning.

### Primary Files

- [src/features/settings/pages/SettingsPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/settings/pages/SettingsPage.tsx)
- [src/features/today/pages/TodayPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/command-center/pages/CommandCenterPage.tsx)
- [src/features/command-center/pages/CommandCenterPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/command-center/pages/CommandCenterPage.tsx)
- [src/features/prep/pages/PrepPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/prep/pages/PrepPage.tsx)
- [src/features/physical/pages/PhysicalPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/physical/pages/PhysicalPage.tsx)
- [src/features/readiness/pages/ReadinessPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/readiness/pages/ReadinessPage.tsx)

### Exit Criteria

- copy is tighter, clearer, and less repetitive without becoming vague or dishonest

## Workstream 2: Accessibility And Interaction Polish

### Goal

Improve keyboard flow, focus visibility, and control semantics across the modernized app.

### Why This Matters

A UI can look polished and still feel unfinished if:

- focus states are weak
- tab order feels accidental
- grouped controls are hard to understand with keyboard navigation
- interaction semantics are visually strong but operationally fuzzy

Sprint 5 should move the modernization from visual quality into interaction quality.

### Checklist

- [x] Audit keyboard flow on major surfaces:
  - Today
  - Command Center
  - Schedule
  - Settings
  - Prep
  - Physical
  - Readiness
- [x] Strengthen focus-visible styling where needed.
- [x] Clarify button/toggle semantics where grouped controls still feel ambiguous.
- [x] Review drawer, bottom navigation, and quick-action focus order on mobile.
- [x] Add or update tests for focusable controls and interaction semantics where appropriate.

### Primary Files

- [src/app/theme/theme.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/app/theme/theme.ts)
- [src/components/layout/AppShell.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/components/common/SurfaceCard.tsx)
- screen-level pages and tests as needed during audit

### Exit Criteria

- keyboard flow feels intentional and focus states are clearly visible across the modernized product

## Workstream 3: Auth-Restoration Continuity

### Goal

Reduce or eliminate the brief auth-restoration flash during route changes.

### Why This Matters

The current auth behavior is truthful and functional, but the brief restoration shell can interrupt perceived continuity.

This matters more now because:

- the UI shell is more refined
- route transitions are more visually deliberate
- any interruption feels proportionally louder

### Checklist

- [x] Reproduce the auth-restoration flash under normal route changes.
- [x] Identify whether the flash is caused by:
  - router loading behavior
  - auth-state hydration timing
  - redirect-result restoration timing
- [x] Prefer continuity-preserving fixes over hiding legitimate loading states.
- [x] Keep auth loading honest if a full elimination is not safe.
- [x] Re-verify both desktop and mobile route transitions after the fix.

### Primary Files

- [src/features/auth/providers/AuthSessionProvider.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/auth/providers/AuthSessionProvider.tsx)
- [src/app/router/AppRouter.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/app/router/AppRouter.tsx)
- [src/features/auth/pages/AuthPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/auth/pages/AuthPage.tsx)
- [src/lib/firebase/client.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/lib/firebase/client.ts)

### Exit Criteria

- route transitions no longer feel needlessly interrupted by auth restoration

## Workstream 4: Sprint-Wide Consistency Sweep And Verification

### Goal

Close Sprint 5 with a full polish-standard verification pass.

### Checklist

- [x] Run `npm run typecheck`
- [x] Run `npm run lint`
- [x] Run `npm run test:run`
- [x] Run `npm run build`
- [x] Add or update tests for:
  - shell behavior
  - focus-visible behavior
  - interaction semantics
  - auth restoration continuity where practical
- [x] Do a real local browser QA pass across the modernized shell and at least:
  - Today
  - Command Center
  - Settings
  - one support page
- [x] Do a real mobile/responsive QA pass across the same surfaces.
- [x] Update this sprint document with:
  - completion notes
  - files changed
  - validation outcome
  - residual caveats

### Exit Criteria

- the product feels more cohesive, quieter, and better behaved across the app

## Definition Of Done

Sprint 5 is done when:

- shell restraint is improved across desktop and mobile
- verbose copy is materially reduced without losing clarity
- Settings is noticeably cleaner and less text-heavy
- focus states and keyboard flow are meaningfully improved
- auth restoration continuity is improved and documented
- verification is green and documented

## Completion Notes

Sprint 5 is complete.

This sprint tightened the product at the system level rather than through another major page rewrite.

The most important practical outcomes were:

- the shell became calmer and more readable across desktop and mobile
- support copy was shortened across the app, with the biggest cleanup on Settings
- status surfaces now compete less with primary content
- focus-visible behavior is much clearer and more consistent
- auth restoration now preserves an already-known user instead of briefly dropping the app back into a louder restoration shell during normal route changes

The sprint intentionally favored restraint over novelty. The product semantics stayed honest, but the UI now explains less and lets structure carry more of the meaning.

## Files Changed

Primary implementation files touched during Sprint 5:

- [src/app/theme/theme.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/app/theme/theme.ts)
- [src/components/layout/AppShell.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/components/layout/AppShell.tsx)
- [src/components/status/StatusBadge.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/components/status/StatusBadge.tsx)
- [src/components/status/SyncIndicator.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/components/status/SyncIndicator.tsx)
- [src/features/pwa/components/PwaStatusCard.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/pwa/components/PwaStatusCard.tsx)
- [src/features/auth/providers/AuthSessionProvider.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/auth/providers/AuthSessionProvider.tsx)
- [src/app/router/AppRouter.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/app/router/AppRouter.tsx)
- [src/features/settings/pages/SettingsPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/settings/pages/SettingsPage.tsx)
- [src/features/today/pages/TodayPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/today/pages/TodayPage.tsx)
- [src/features/command-center/pages/CommandCenterPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/command-center/pages/CommandCenterPage.tsx)
- [src/features/prep/pages/PrepPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/prep/pages/PrepPage.tsx)
- [src/features/physical/pages/PhysicalPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/physical/pages/PhysicalPage.tsx)
- [src/features/readiness/pages/ReadinessPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/readiness/pages/ReadinessPage.tsx)
- [src/tests/app.spec.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/tests/app.spec.tsx)
- [src/tests/auth-session-provider.spec.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/tests/auth-session-provider.spec.tsx)

Documentation linkage and sprint tracking were updated in:

- [README.md](/Users/ayushjaipuriar/Documents/GitHub/forge/README.md)
- [docs/ui-modernization-sprint-5-plan.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/ui-modernization-sprint-5-plan.md)

## Validation Outcome

Automated verification is green:

- `npm run lint`
- `npm run typecheck`
- `npm run test:run` -> `64` files, `228` tests passed
- `npm run build`

Real browser QA was completed against the current preview build on `http://127.0.0.1:4177` with an authenticated session.

Desktop audit artifacts:

- [Today desktop](/Users/ayushjaipuriar/Documents/GitHub/forge/output/playwright/sprint-5-audit/today-desktop.png)
- [Command Center desktop](/Users/ayushjaipuriar/Documents/GitHub/forge/output/playwright/sprint-5-audit/command-center-desktop.png)
- [Settings desktop](/Users/ayushjaipuriar/Documents/GitHub/forge/output/playwright/sprint-5-audit/settings-desktop.png)
- [Prep desktop](/Users/ayushjaipuriar/Documents/GitHub/forge/output/playwright/sprint-5-audit/prep-desktop.png)

Mobile audit artifacts:

- [Today mobile](/Users/ayushjaipuriar/Documents/GitHub/forge/output/playwright/sprint-5-audit/today-mobile.png)
- [Command Center mobile](/Users/ayushjaipuriar/Documents/GitHub/forge/output/playwright/sprint-5-audit/command-center-mobile.png)
- [Settings mobile](/Users/ayushjaipuriar/Documents/GitHub/forge/output/playwright/sprint-5-audit/settings-mobile.png)
- [Prep mobile](/Users/ayushjaipuriar/Documents/GitHub/forge/output/playwright/sprint-5-audit/prep-mobile.png)

The live audit confirmed that:

- compressed copy is visible in the real build
- shell readiness now reads as a compact support strip instead of a verbose interruption
- desktop and mobile navigation feel calmer and more legible
- the app no longer dropped back into a full restoration shell during ordinary authenticated route changes in this local verification pass

## Residual Caveats

- The shell-readiness strip still occupies above-the-fold space on supported routes because install/runtime posture remains a first-class product concern. It is now much quieter, but not fully hidden.
- Auth continuity was verified locally on the preview build. Hosted-origin redirect continuity should still be rechecked as part of the next live deployment verification cycle.
