# UI Modernization Sprint 7 Plan

## Purpose

This document defines Sprint 7 of the Forge UI modernization track.

Sprint 7 is the **release-candidate visual QA, interaction hardening, and micro-polish sprint**.

By this point, Forge has completed:

- shell and design-system modernization
- Today and Command Center redesign
- Schedule and Settings modernization
- Prep, Physical, and Readiness modernization
- cross-app polish and consistency work
- remaining auth and state-surface modernization

That means the next highest-value work is not another structural redesign.

It is the final layer that determines whether the app feels merely redesigned or truly release-ready:

- visual QA hardening
- motion and transition restraint
- forms, toggles, drawers, and button semantics
- desktop/mobile parity under real interaction
- release-readiness evidence for the modernized UI

## Why Sprint 7 Exists

Once a product reaches this stage, the biggest remaining quality gaps usually live in details:

- controls that are technically correct but not fully intuitive
- transitions that feel abrupt, uneven, or absent
- interactive surfaces that are visually modernized but not yet fully polished
- desktop and mobile behaviors that are both good, but not quite equally refined
- release-readiness confidence that exists in scattered checks rather than one coherent pass

Sprint 7 exists to close those gaps deliberately.

This sprint should make Forge feel:

- calmer
- tighter
- more responsive
- more intentional
- more complete under real usage

## Sprint Direction

This sprint will focus on:

- final release-candidate visual QA hardening
- motion and micro-polish where it improves clarity
- desktop and mobile as equal targets
- forms, toggles, drawers, and button semantics
- release-readiness and commit-readiness artifacts folded into the sprint closeout

This sprint will **not**:

- reopen major page layout structures unless a real QA issue forces it
- add decorative motion that weakens the quiet operational tone
- introduce theatrical polish that conflicts with Forge’s seriousness
- expand product scope beyond UI quality and interaction hardening

## Inputs

### Modernization Track References

- [docs/ui-modernization-implementation-plan.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/ui-modernization-implementation-plan.md)
- [docs/ui-modernization-sprint-1-plan.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/ui-modernization-sprint-1-plan.md)
- [docs/ui-modernization-sprint-2-plan.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/ui-modernization-sprint-2-plan.md)
- [docs/ui-modernization-sprint-3-plan.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/ui-modernization-sprint-3-plan.md)
- [docs/ui-modernization-sprint-3-1-plan.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/ui-modernization-sprint-3-1-plan.md)
- [docs/ui-modernization-sprint-4-plan.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/ui-modernization-sprint-4-plan.md)
- [docs/ui-modernization-sprint-5-plan.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/ui-modernization-sprint-5-plan.md)
- [docs/ui-modernization-sprint-6-plan.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/ui-modernization-sprint-6-plan.md)

### Supporting References

- [docs/auth-hardening-sprint-plan.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/auth-hardening-sprint-plan.md)
- [docs/phase-4-launch-operations.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/phase-4-launch-operations.md)
- [docs/phase-4-release-readiness-checklist.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/phase-4-release-readiness-checklist.md)

### Stitch References

Sprint 7 should still use Stitch as a restraint and finish-quality reference, especially around shell calm, page hierarchy, and polished composure:

- [stitch 3/forge_ui_ux_redesign_strategy.html](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/forge_ui_ux_redesign_strategy.html)
- [stitch 3/forge_today_command_center_strategy.html](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/forge_today_command_center_strategy.html)
- [stitch 3/forge_obsidian/DESIGN.md](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/forge_obsidian/DESIGN.md)
- [stitch 3/today_execution_console/screen.png](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/today_execution_console/screen.png)
- [stitch 3/command_center_strategy_room/screen.png](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/command_center_strategy_room/screen.png)
- [stitch 3/settings_system_control/screen.png](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/settings_system_control/screen.png)
- [stitch 3/today_mobile_cockpit/screen.png](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/today_mobile_cockpit/screen.png)

## Core Interpretation

Sprint 7 is about making the modernized UI feel production-ready under real interaction.

That means:

- polish should serve clarity
- motion should serve orientation
- control semantics should serve confidence
- QA should be systematic rather than impressionistic

If Sprint 6 made the edges feel complete, Sprint 7 should make the whole product feel **finished enough to trust visually and behaviorally**.

## Sprint Goals

By the end of Sprint 7:

- the product should pass a release-candidate visual QA pass across desktop and mobile
- motion and transitions should feel intentional, minimal, and consistent
- forms, toggles, drawers, and buttons should feel semantically clear
- interactive states should feel equally polished across major surfaces
- the sprint should close with explicit UI release-readiness and commit-readiness evidence

## Recommended Work Order

1. visual QA audit and issue list
2. forms, toggles, drawers, and button semantics
3. motion and transition polish
4. desktop/mobile parity hardening
5. release-readiness and commit-readiness closeout

Why this order:

- QA should identify the real remaining issues before any polish work begins
- semantics and control clarity are more important than animation
- motion should refine an already-stable interaction model, not hide unclear controls
- release-readiness artifacts should reflect the final post-polish state

## Workstream 0: Visual QA Audit And Hardening

### Goal

Perform a deliberate release-candidate visual QA pass across the modernized product.

### Why This Matters

Even after multiple strong sprints, subtle inconsistencies can remain in:

- spacing
- hierarchy
- control density
- state emphasis
- desktop/mobile parity

This workstream is meant to surface and close those inconsistencies systematically.

### Checklist

- [ ] Audit the major product surfaces on desktop:
  - Auth
  - Today
  - Command Center
  - Schedule
  - Prep
  - Physical
  - Readiness
  - Settings
- [ ] Audit the same surfaces on mobile.
- [ ] Identify any last visual inconsistencies in spacing, hierarchy, tone, or control density.
- [ ] Fix release-candidate-level visual issues without reopening full redesign work.
- [ ] Document the QA findings and what was corrected.

### Exit Criteria

- the UI reads as one coherent release-candidate system across all major surfaces

## Workstream 1: Forms, Toggles, Drawers, And Button Semantics

### Goal

Tighten the semantic clarity and visual polish of the app’s interactive control system.

### Why This Matters

Users build trust through controls more than through layout alone.

If toggles, segmented choices, drawers, and action buttons are inconsistent, the app still feels unfinished no matter how strong the visual system is.

### Checklist

- [ ] Audit button hierarchy across primary, secondary, warning, and quiet actions.
- [ ] Review segmented controls, mode selectors, and toggle groups for semantic clarity.
- [ ] Review drawer behavior and labeling on mobile and narrow layouts.
- [ ] Tighten focus and pressed-state behavior where controls still feel ambiguous.
- [ ] Ensure forms and action surfaces remain concise and accessible.

### Primary Files

- shared controls under [src/components](/Users/ayushjaipuriar/Documents/GitHub/forge/src/components)
- route-level controls in the feature pages under [src/features](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features)
- [src/app/theme/theme.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/app/theme/theme.ts)

### Exit Criteria

- controls feel clearer, more consistent, and more trustworthy under real use

## Workstream 2: Motion And Micro-Polish

### Goal

Add restrained motion and micro-interaction polish where it improves orientation, feedback, and perceived finish.

### Why This Matters

Forge should not be flashy, but it should feel alive enough that:

- route transitions do not feel abrupt
- actions acknowledge themselves clearly
- drawers and shell elements feel intentional
- state transitions feel guided rather than jarring

### Checklist

- [ ] Identify the smallest high-value motion opportunities:
  - route transitions
  - drawer entry/exit
  - control-state changes
  - loading/restoration transitions
- [ ] Keep all motion restrained and purposeful.
- [ ] Avoid decorative animation that competes with product seriousness.
- [ ] Verify reduced-motion friendliness where applicable.
- [ ] Recheck motion parity across desktop and mobile.

### Exit Criteria

- the app feels smoother and more intentional without becoming flashy

## Workstream 3: Desktop And Mobile Parity Hardening

### Goal

Make sure the final modernized UI feels equally deliberate on both desktop and mobile.

### Why This Matters

Many apps reach strong desktop polish but still feel slightly compromised on mobile, or vice versa.

Sprint 7 should explicitly remove that asymmetry.

### Checklist

- [ ] Review major surfaces for any remaining desktop-only polish or mobile-only compromises.
- [ ] Tighten spacing, label behavior, and control density where parity is uneven.
- [ ] Recheck bottom navigation, drawers, and install/readiness surfaces on mobile.
- [ ] Recheck wide-screen composition on desktop and larger laptop widths.
- [ ] Validate that motion, focus, and fallback states feel equally polished on both form factors.

### Exit Criteria

- desktop and mobile feel like equally intentional versions of the same product

## Workstream 4: Release-Readiness And Commit-Readiness Closeout

### Goal

Fold release-candidate evidence and commit safety directly into the sprint rather than treating them as a separate afterthought.

### Why This Matters

At this stage, UI work is not complete just because the screens look good.

It must also be:

- verified
- documented
- safe to commit
- honest about residual caveats

### Checklist

- [ ] Run `npm run lint`
- [ ] Run `npm run typecheck`
- [ ] Run `npm run test:run`
- [ ] Run `npm run build`
- [ ] Perform real local browser QA on desktop and mobile.
- [ ] Perform any necessary hosted/deployed UI verification for release confidence.
- [ ] Update this sprint document with:
  - completion notes
  - files changed
  - validation outcome
  - residual caveats
- [ ] Do a commit-readiness sweep:
  - `git status`
  - `git diff --cached`
  - sensitive/untracked file review
  - artifact cleanup review

### Exit Criteria

- Sprint 7 closes with both UI release-readiness evidence and commit-readiness clarity

## Definition Of Done

Sprint 7 is done when:

- release-candidate visual QA issues are materially reduced or closed
- forms, toggles, drawers, and buttons feel semantically polished
- motion and micro-polish improve clarity without adding noise
- desktop and mobile both feel equally refined
- release-readiness and commit-readiness evidence are documented
- the sprint closes with automated and real-browser validation

## Progress Update

### 2026-04-04 Layout Hardening Pass

This pass addressed a real release-candidate issue discovered during local desktop QA: several pages still behaved like they had a permanent thin sidebar, which left large empty regions on the main canvas once the primary content ended.

What changed:

- `Today` was rebalanced so the page no longer ends with `Calendar Pressure` and `Support Layer` hanging in a narrow trailing rail. The execution timeline now owns a full-width section, and the lower supporting cards sit in a balanced grid.
- `Schedule` was restructured so the `Weekly Board` and `Selected Day` share the top split, while `Planning Pressure`, `Expectation Layer`, `Calendar Context`, and `Major Blocks` now use wider lower sections instead of one long right-side inspector.
- `Settings` was reflowed from one oversized main column plus an endless sidebar into a sequence of balanced two-up sections, and copy was compressed while touching those surfaces so the page reads with less visual and textual drag.

Files touched in this pass:

- [src/features/today/pages/TodayPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/today/pages/TodayPage.tsx)
- [src/features/schedule/pages/SchedulePage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/schedule/pages/SchedulePage.tsx)
- [src/features/settings/pages/SettingsPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/settings/pages/SettingsPage.tsx)

Automated validation after the layout pass:

- `npm run lint`
- `npm run typecheck`
- `npm run test:run`
- `npm run build`

Remaining step for this specific pass:

- recheck the updated desktop rendering in the local preview, especially `Today`, `Schedule`, and `Settings`, to confirm the layout now fills the page more naturally and the Settings copy feels calmer in practice

### 2026-04-04 Today Composition Follow-Up

The first layout rebalance fixed the dangling right-rail problem on `Schedule` and `Settings`, but it exposed a different composition issue on `Today`: moving the agenda into a fully separate full-width section made the center execution column end too early when recommendation content was absent, which created a visible dead zone before the timeline began.

What changed:

- the `Execution Timeline` was moved back into the main execution column so the center of gravity stays alive even when the recommendation card is not present
- the lower full-width support grid still carries `Calendar Pressure`, `Support Layer`, and `Recommendation History`, so the page keeps the improved lower balance without reviving the old skinny trailing stack problem

Files touched:

- [src/features/today/pages/TodayPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/today/pages/TodayPage.tsx)

Validation after the follow-up:

- `npm run lint`
- `npm run typecheck`
- `npm run test:run`
- `npm run build`

Automation verification note:

- automated browser verification was attempted against both copied authenticated Chrome profiles and real-browser-assisted flows
- code/build validation is green, but copied-profile browser automation still settles on the auth-restoration screen instead of the steady-state page, so the rendered visual verification boundary remains partially limited by local browser/session tooling rather than by app compile or test failures

### 2026-04-04 Today Rendered Verification And Final Layout Correction

This follow-up replaced code-only reasoning with a real authenticated Playwright audit of the Today page.

What the automation showed:

- the previous “fix” still rendered incorrectly on desktop because `Calendar Pressure` and `Support Layer` were being placed above the main execution surface
- the problem was not the content itself, but the browser’s grid auto-placement behavior
- rendered position inspection showed the execution center starting much lower than intended, while the support cards were being surfaced first

What changed:

- [src/features/today/pages/TodayPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/today/pages/TodayPage.tsx) was simplified into a more deterministic desktop structure:
  - main execution column first
  - supporting operator sidebar second
  - lower support grid explicitly placed after the main row
- the final correction uses explicit desktop grid row placement for the lower support section so the browser cannot promote it ahead of the execution surface
- [src/tests/setup.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/tests/setup.ts) was updated so Vitest exposes `self` correctly and the suite no longer ends with the fake-indexeddb / Firebase unhandled error noise that surfaced during this same hardening pass

Rendered evidence:

- [today-final-verified.png](/Users/ayushjaipuriar/Documents/GitHub/forge/output/playwright/sprint-7-rc-audit/today-final-verified.png)

Validation after the final correction:

- `npm run lint`
- `npm run typecheck`
- `npm run test:run` → `65` files, `231` tests passed
- `npm run build`

### 2026-04-04 Cross-App Automated QA Continuation

After the Today layout correction, the release-candidate audit continued as a real authenticated screenshot pass across the remaining modernized surfaces instead of stopping at the first fixed page.

What this continuation was meant to verify:

- that `Today` no longer had the broken mid-page void once rendered in the real shell
- that `Schedule` still read as a balanced weekly operations board after the layout rebalance
- that `Settings` had become materially calmer after the copy and structure compression work
- that cross-app polish decisions were holding up as a system rather than only in isolated pages

What the automated screenshots showed:

- `Today` was structurally corrected: the execution hero, agenda, and right-side pressure stack now read in the correct order with the lower support grid sitting after the main execution band instead of surfacing early
- `Schedule` remained balanced and did not regress into the earlier thin-sidebar composition
- `Settings` was still the naturally densest route in the app, but the operator surface read more cleanly after shortening explanatory copy, removing low-value secondary rationale in platform rows, and tightening several status labels

What changed from this continuation:

- [src/features/settings/pages/SettingsPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/settings/pages/SettingsPage.tsx)
  - compressed the page-level intro copy
  - shortened recovery and restore wording where the second sentence was restating the visible state
  - tightened several operational summaries to reduce “summary + explanation + chip” redundancy
  - removed low-value rationale meta from the Functions ownership rows, since those rows already expose owner and status directly
  - shortened health-provider support labels so the future-provider section reads as a compact support matrix rather than a long prose list

Rendered evidence from the continued audit:

- [today-desktop.png](/Users/ayushjaipuriar/Documents/GitHub/forge/output/playwright/qa-sprint7/today-desktop.png)
- [schedule-desktop.png](/Users/ayushjaipuriar/Documents/GitHub/forge/output/playwright/qa-sprint7/schedule-desktop.png)
- [settings-desktop.png](/Users/ayushjaipuriar/Documents/GitHub/forge/output/playwright/qa-sprint7/settings-desktop.png)
- [today-mobile.png](/Users/ayushjaipuriar/Documents/GitHub/forge/output/playwright/qa-sprint7/today-mobile.png)
- [schedule-mobile.png](/Users/ayushjaipuriar/Documents/GitHub/forge/output/playwright/qa-sprint7/schedule-mobile.png)
- [settings-mobile.png](/Users/ayushjaipuriar/Documents/GitHub/forge/output/playwright/qa-sprint7/settings-mobile.png)

Validation after the continuation:

- `npm run lint`
- `npm run typecheck`
- `npm run test:run` → `65` files, `231` tests passed
- `npm run build`

Residual caveat:

- `Settings` remains intentionally denser than the rest of the product because it is the operator truth surface for runtime, recovery, provider posture, and platform ownership. The goal of this pass was to remove low-value wording and poor composition, not to make Settings artificially sparse by hiding operational truth.
