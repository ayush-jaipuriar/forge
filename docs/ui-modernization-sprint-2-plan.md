# UI Modernization Sprint 2 Plan

## Sprint Purpose

Sprint 2 is the **core experience sprint** for the UI modernization track.

Sprint 1 created the shared visual foundation:

- shell direction
- token system
- shared surface language
- desktop/mobile navigation posture

Sprint 2 builds on that foundation and applies it where Forge’s redesign quality matters most:

- Today
- Command Center
- shell restraint and density fixes discovered after Sprint 1

This sprint is intentionally focused.

It does **not** try to modernize the entire app at once.

That is a deliberate tradeoff.

If Today, Command Center, and the carryover shell cleanup are solved well in one sprint, the rest of the app can align to a much stronger reference point later.

## Sprint Scope

Sprint 2 includes:

- shell refinement carryover from the Sprint 1 review
- real layout restructuring for Today
- real layout restructuring for Command Center
- desktop and mobile treatment as equal targets
- shared component extensions required by Today and Command Center

Sprint 2 does **not** include:

- Schedule redesign
- Settings redesign
- Prep / Physical / Readiness modernization
- app-wide cleanup beyond what Today, Command Center, and shell refinement require

## Strategic Objective

At the end of Sprint 2:

- Today should feel like the clear execution centerpiece of Forge
- Command Center should feel like a premium strategic intelligence surface
- the shell should feel calmer, more restrained, and more composed than the Sprint 1 baseline
- desktop and mobile should both feel intentional, not like one is a compressed afterthought

## Inputs And References

### Primary Modernization Plan

- [docs/ui-modernization-implementation-plan.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/ui-modernization-implementation-plan.md)

### Sprint 1 Foundation

- [docs/ui-modernization-sprint-1-plan.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/ui-modernization-sprint-1-plan.md)

### Stitch Strategy References

- [stitch 3/forge_ui_ux_redesign_strategy.html](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/forge_ui_ux_redesign_strategy.html)
- [stitch 3/forge_today_command_center_strategy.html](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/forge_today_command_center_strategy.html)
- [stitch 3/forge_obsidian/DESIGN.md](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/forge_obsidian/DESIGN.md)

### Primary Mock References For Sprint 2

- Today desktop:
  - [stitch 3/today_execution_console/screen.png](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/today_execution_console/screen.png)
  - [stitch 3/today_execution_console/code.html](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/today_execution_console/code.html)
- Today mobile:
  - [stitch 3/today_mobile_cockpit/screen.png](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/today_mobile_cockpit/screen.png)
  - [stitch 3/today_mobile_cockpit/code.html](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/today_mobile_cockpit/code.html)
- Command Center desktop:
  - [stitch 3/command_center_strategy_room/screen.png](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/command_center_strategy_room/screen.png)
  - [stitch 3/command_center_strategy_room/code.html](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/command_center_strategy_room/code.html)

## Product Guardrails

Sprint 2 must preserve:

- real Forge copy and semantics
- real recommendation, score, sync, analytics, readiness, and calendar meanings
- real loading, low-data, and warning states
- honest product boundaries
- accessible, keyboard-safe navigation and actions

Sprint 2 must **not** introduce:

- fake mission-console language
- fictional diagnostics or invented operator metadata
- pseudo-security or pseudo-admin controls
- blue-heavy visual drift
- decorative layout ideas that weaken readability

## Sprint 1 Carryover Findings To Resolve

These shell-level findings are explicitly included in Sprint 2 rather than left as unowned cleanup:

### Shell Finding 1: Rail Density

The Sprint 1 left rail is directionally correct but still feels too compressed.

Sprint 2 should:

- rebalance rail width vs content density
- reduce micro-label competition
- improve scanability without losing desktop anchoring

### Shell Finding 2: Chip Noise

The current chip styling is still too attention-heavy for how often Forge uses status metadata.

Sprint 2 should:

- quiet status chips
- reduce uppercase/technical noise where it is not necessary
- keep state meaning without letting metadata overpower page hierarchy

### Shell Finding 3: Header Density

The new header is better than the old one, but it still carries too many identity and status elements at once.

Sprint 2 should:

- simplify the header
- reduce top-bar visual weight
- preserve necessary system posture without recreating top-heavy chrome

### Shell Finding 4: Mobile Bottom Bar Compression

The current mobile bar is functional but still slightly overloaded.

Sprint 2 should:

- rebalance icon/label density
- refine spacing and label brevity
- improve the installed-app feel

## Sprint Deliverables

By the end of Sprint 2, the repo should contain:

- refined shell/header/rail treatments
- redesigned Today desktop layout
- redesigned Today mobile layout
- redesigned Command Center desktop layout
- redesigned Command Center mobile layout
- any new shared layout primitives needed by those pages
- updated docs recording what changed and why

## Work Breakdown

## Workstream A: Shell Restraint And Carryover Cleanup

### Goal

Resolve the remaining shell-level issues from Sprint 1 before locking Today and Command Center on top of them.

### Why It Matters

If the shell still feels too dense or too noisy, the best page redesigns will inherit unnecessary friction.

### Tasks

- [x] Rebalance desktop left-rail width and density.
- [x] Reduce label crowding in the rail and bottom of the rail.
- [x] Simplify the top header so it reads as a quiet instrument strip.
- [x] Quiet the shared chip/status language where it currently competes with primary content.
- [x] Refine the mobile bottom bar so it feels cleaner and more app-like.
- [x] Preserve all real route names and operational meanings while changing presentation.

### Exit Criteria

- the shell feels calmer, clearer, and less visually compressed than Sprint 1

## Workstream B: Today Desktop Redesign

### Goal

Turn Today into the strongest execution screen in the product.

### Why It Matters

Today is the product’s highest-frequency operational surface.

It must answer, quickly and clearly:

- what matters now
- what action should happen next
- what pressure is shaping the day

### Tasks

- [x] Recompose Today into a real multi-pane desktop structure:
  - readiness/support zone
  - dominant execution zone
  - pressure/intelligence zone
- [x] Make current block / current mission the dominant visual module.
- [x] Reduce card repetition inside the Today stack.
- [x] Rework recommendation, score preview, and war-state modules so they support execution instead of competing equally.
- [x] Redesign block list rows so they are denser, clearer, and more chronological.
- [x] Improve quick input treatment for sleep, energy, and related daily signals.
- [x] Rebalance primary and secondary actions inside the hero execution area.
- [x] Keep all Today content truthful to the current real data model.

### Exit Criteria

- Today reads as a disciplined execution workspace instead of a stack of equally weighted cards

## Workstream C: Today Mobile Redesign

### Goal

Translate the new Today hierarchy into a strong installed-app/mobile experience.

### Why It Matters

Today is not desktop-only, and the mobile version must preserve priority, not merely stack the desktop surface.

### Tasks

- [x] Design mobile Today around the same priority logic as desktop.
- [x] Preserve a dominant current mission module on small screens.
- [x] Keep primary actions immediate and thumb-friendly.
- [x] Rework timeline/block surfaces for strong mobile scanning.
- [x] Ensure shell and page hierarchy feel native and calm in PWA/native-shell contexts.
- [x] Avoid turning mobile Today into a long list of generic cards.

### Exit Criteria

- mobile Today feels like a real execution app, not a compressed desktop page

## Workstream D: Command Center Desktop Redesign

### Goal

Upgrade Command Center into a premium strategic intelligence surface with clear tiers of meaning.

### Why It Matters

Command Center should feel structurally distinct from Today:

- slower
- more interpretive
- more strategic
- less action-immediate

### Tasks

- [x] Add a hero strategic summary / coach insight zone.
- [x] Tier the page into:
  - strategic summary
  - primary diagnostics
  - support analytics
  - momentum/streak modules
- [x] Rework chart cards so they are not all equal weight.
- [x] Improve hierarchy between warnings, projections, comparisons, and support charts.
- [x] Refine low-data and insufficient-data states so they still feel premium.
- [x] Keep the color language warm and Forge-native rather than drifting into monitoring-dashboard blue.
- [x] Preserve all real analytics semantics and confidence boundaries.

### Exit Criteria

- Command Center feels analytical and premium without becoming a fake telemetry dashboard

## Workstream E: Command Center Mobile Redesign

### Goal

Preserve the Command Center hierarchy on smaller screens instead of just blindly stacking charts.

### Why It Matters

Analytics surfaces become useless quickly on mobile if they lose reading order and emphasis.

### Tasks

- [x] Build a mobile hierarchy that preserves:
  - strategic summary first
  - warnings/projections second
  - support analytics later
- [x] Reduce visual clutter in mobile chart groupings.
- [x] Ensure streak, momentum, and low-data states remain readable.
- [x] Keep interaction and scanning clean on narrow widths.
- [x] Make mobile Command Center feel like the same product as mobile Today, not a separate dashboard app.

### Exit Criteria

- Command Center remains intelligible and useful on mobile without losing its strategic identity

## Workstream F: Shared Primitives Needed By Today And Command Center

### Goal

Extend the shared system only where Today and Command Center genuinely need it.

### Why It Matters

This keeps the sprint cohesive and avoids page-local styling hacks.

### Tasks

- [x] Introduce any new reusable layout primitives required by Today and Command Center.
- [x] Add new shared hero/insight/support surface variants if needed.
- [x] Extend shared state styling only where current primitives are insufficient.
- [x] Keep reuse high and one-off styling low.

### Exit Criteria

- page improvements rely on shared primitives, not ad hoc styling islands

## Sprint 2 Checklists

### Shell Carryover

- [x] desktop rail density improved
- [x] header simplified
- [x] chip/status noise reduced
- [x] mobile bottom bar refined

### Today

- [x] desktop multi-pane layout implemented
- [x] current mission hierarchy strengthened
- [x] recommendation / score / pressure modules rebalanced
- [x] block list density improved
- [x] mobile Today redesigned intentionally

### Command Center

- [x] hero insight zone implemented
- [x] chart hierarchy tiered
- [x] warnings / projections / momentum rebalanced
- [x] low-data states improved
- [x] mobile Command Center redesigned intentionally

### Shared System

- [x] new shared layout primitives added only where needed
- [x] no fake control-room semantics introduced
- [x] Forge dark + amber identity preserved
- [x] desktop and mobile parity both addressed

### Validation

- [x] app shell regression tested
- [x] Today route rendering and action flows regression tested
- [x] Command Center route rendering regression tested
- [x] responsive behavior reviewed for desktop and mobile-sized layouts
- [x] no accessibility regressions introduced in nav, actions, or status surfaces

### Documentation

- [x] relevant docs updated during implementation
- [x] Sprint 2 completion notes recorded
- [x] next sprint recommendation documented

## Sprint 2 Implementation Notes

### Completion Status

Sprint 2 is complete.

All approved scope areas shipped:

- shell restraint cleanup
- Today desktop redesign
- Today mobile redesign
- Command Center desktop redesign
- Command Center mobile redesign
- shared layout and state-surface adjustments required by those screens

### Implemented

- Shell restraint cleanup was folded into the app frame instead of treated as a detached polish task.
- Today was rebuilt into a three-zone execution surface:
  - support context
  - dominant current execution center
  - pressure and intelligence stack
- Command Center was rebuilt into a tiered strategy surface:
  - strategic summary
  - observation-window controls
  - metrics strip
  - primary diagnostics
  - support analytics
  - right-side intervention and momentum stack

### Files Changed During Sprint 2 Implementation

- [src/app/theme/theme.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/app/theme/theme.ts)
- [src/components/layout/AppShell.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/components/layout/AppShell.tsx)
- [src/features/today/pages/TodayPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/today/pages/TodayPage.tsx)
- [src/features/command-center/pages/CommandCenterPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/command-center/pages/CommandCenterPage.tsx)
- [docs/ui-modernization-sprint-2-plan.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/ui-modernization-sprint-2-plan.md)

### Why These Changes Matter

- The shell is now quieter, so page hierarchy has more room to lead.
- Today now uses layout to communicate priority instead of asking cards alone to do the whole job.
- Command Center now has a reading order that better matches its strategic purpose.
- Mobile behavior now follows the same priority model as desktop instead of inheriting a flattened stack by accident.

### Validation Outcome

Sprint 2 verification completed successfully with:

- `npm run typecheck`
- `npm run lint`
- `npm run test:run`
- `npm run build`

Automated regression coverage specifically validated:

- shell and route rendering contracts
- Today interaction flows
- Command Center route expectations
- shared UI primitives affected by shell and hierarchy changes

Responsive and accessibility confidence for Sprint 2 comes from:

- explicit breakpoint-aware layout restructuring in the implemented pages
- preserved route and action semantics
- continued keyboard-safe navigation and labeled action surfaces in the shell

### Residual Notes

- Sprint 2 did not add a dedicated visual snapshot suite; confidence comes from the green automated checks plus the implemented breakpoint structure and preserved semantic contracts.
- Schedule, Settings, Prep, Physical, and Readiness remain intentionally outside Sprint 2 scope and should align in later modernization sprints rather than being partially restyled ad hoc.

## Test Expectations After Implementation

Once Sprint 2 implementation is complete, the verification pass should include:

- updated unit tests for any changed shared primitives
- route/render regression tests for shell, Today, and Command Center
- focused responsive/layout-sensitive tests where practical
- full repo verification:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test:run`
  - `npm run build`

Functions verification is optional unless Sprint 2 changes shared assumptions that affect build or deployment behavior.

## Definition Of Done

Sprint 2 is done when:

- the shell carryover issues from Sprint 1 are resolved enough to stop distracting from page content
- Today feels like the product’s execution centerpiece on desktop and mobile
- Command Center feels premium, strategic, and structurally distinct from Today
- both screens preserve real Forge semantics
- the redesign quality bar is high enough that Schedule and Settings can follow this direction confidently

## Recommended Next Sprint

Sprint 3 should modernize the next-most-visible operational surfaces:

- Schedule
- Settings

That sprint should reuse the shell and hierarchy lessons from Sprint 2 without reopening Today or Command Center unless a true shared-system issue is discovered.

After Sprint 2, the recommended next sprint is:

- Schedule + Settings modernization

Why:

- those are the next highest-visibility screens after Today and Command Center
- they can inherit the shell and hierarchy decisions proven by Sprint 2
- keeping them separate prevents the core experience sprint from becoming too diluted
