# UI Modernization Sprint 3 Plan

## Sprint Purpose

Sprint 3 is the **operations and control surfaces sprint** for the UI modernization track.

Sprint 1 established the shared shell and token direction.

Sprint 2 modernized the highest-frequency execution and analytics surfaces:

- Today
- Command Center

Sprint 3 now applies that matured visual language to the next two screens that most strongly affect product trust and daily usability:

- Schedule
- Settings

This sprint also absorbs the most important Sprint 2 carryover findings so the product does not split into:

- modernized flagship pages
- partially modernized support pages
- unresolved shell inconsistencies

That is the main strategic reason to do this sprint now.

## Sprint Scope

Sprint 3 includes:

- real Schedule redesign for desktop and mobile
- real Settings redesign for desktop and mobile
- targeted shell and shared-primitive refinements required to keep Schedule and Settings coherent with Sprint 2
- light touch-ups to related shared calendar, diagnostics, and settings-facing primitives where needed

Sprint 3 does **not** include:

- full Prep modernization
- full Physical modernization
- full Readiness modernization
- broad app-wide cleanup beyond what Schedule, Settings, and shared shell coherence require

## Strategic Objective

At the end of Sprint 3:

- Schedule should feel like a serious weekly operations board instead of a stacked card/calendar hybrid
- Settings should feel like a calm system control surface instead of a long operational form stack
- desktop and mobile should both feel intentionally designed, not like desktop-first pages compressed later
- the shell should resolve the most visible Sprint 2 friction points without reopening the overall modernization direction

## Inputs And References

### Primary Modernization Plan

- [docs/ui-modernization-implementation-plan.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/ui-modernization-implementation-plan.md)

### Prior Sprints

- [docs/ui-modernization-sprint-1-plan.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/ui-modernization-sprint-1-plan.md)
- [docs/ui-modernization-sprint-2-plan.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/ui-modernization-sprint-2-plan.md)

### Stitch Strategy References

- [stitch 3/forge_ui_ux_redesign_strategy.html](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/forge_ui_ux_redesign_strategy.html)
- [stitch 3/forge_today_command_center_strategy.html](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/forge_today_command_center_strategy.html)
- [stitch 3/forge_obsidian/DESIGN.md](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/forge_obsidian/DESIGN.md)

### Primary Mock References For Sprint 3

- Schedule desktop:
  - [stitch 3/schedule_operations_board/screen.png](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/schedule_operations_board/screen.png)
  - [stitch 3/schedule_operations_board/code.html](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/schedule_operations_board/code.html)
- Settings desktop:
  - [stitch 3/settings_system_control/screen.png](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/settings_system_control/screen.png)
  - [stitch 3/settings_system_control/code.html](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/settings_system_control/code.html)
- Mobile reference carryover:
  - [stitch 3/today_mobile_cockpit/screen.png](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/today_mobile_cockpit/screen.png)
  - [stitch 3/today_mobile_cockpit/code.html](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/today_mobile_cockpit/code.html)

## Product Guardrails

Sprint 3 must preserve:

- real Forge copy and semantics
- real calendar, sync, backup, restore, platform, and diagnostics boundaries
- truthful unsupported / planned / scaffolded language
- real route names and user actions
- honest low-data and degraded-state behavior
- keyboard-safe navigation and accessible actions

Sprint 3 must **not** introduce:

- fake control-room copy
- fictional admin-console fields
- theatrical “system console” metaphors
- decorative complexity that hurts scanability
- blue-heavy drift away from Forge’s dark + amber identity

## Sprint 2 Carryover Findings To Resolve In Sprint 3

These findings are not large enough to justify a separate polish sprint, but they matter enough to fold into Sprint 3 while touching shared shell and page structure.

### Carryover 1: Earlier Desktop Breakpoint Activation

Today and Command Center currently hold their strongest desktop compositions too late in the breakpoint scale.

Sprint 3 should:

- activate key multi-pane layouts earlier where it materially improves laptop-sized usability
- apply the same lesson to Schedule and Settings so they do not wait until `xl` to become “real desktop” pages

### Carryover 2: Better Rail Discoverability

The current desktop rail is cleaner than Sprint 1, but it now relies too heavily on icon recognition.

Sprint 3 should:

- improve route discoverability
- preserve desktop calm
- avoid undoing the stronger anchored-shell direction

### Carryover 3: Calmer Metadata Density

Shared chips and page-level metadata still carry a little too much visual weight.

Sprint 3 should:

- further quiet metadata where it is not the main story
- keep status meaning legible without letting chips dominate the page hierarchy

### Carryover 4: Tighter Framing Of Strategic Chrome

Sprint 2 showed that high-value pages can still feel slightly preamble-heavy before the core content starts.

Sprint 3 should:

- avoid stacking too much framing chrome above the primary Schedule board
- avoid turning Settings into a long preface before the control surfaces begin
- apply the “get to the primary surface sooner” lesson

## Sprint Deliverables

By the end of Sprint 3, the repo should contain:

- redesigned Schedule desktop layout
- redesigned Schedule mobile layout
- redesigned Settings desktop layout
- redesigned Settings mobile layout
- targeted shell/discoverability refinements that support those pages
- any shared primitive refinements needed by calendar/status/settings surfaces
- updated sprint documentation recording what changed, why, and what the next sprint should cover

## Work Breakdown

## Workstream A: Shell And Shared-System Carryover Refinement

### Goal

Apply the minimum shell and shared-system refinements needed so Schedule and Settings inherit a calmer, more discoverable frame than the Sprint 2 baseline.

### Why It Matters

If Schedule and Settings are modernized on top of unresolved shell friction, the modernization track will drift into inconsistent page quality.

### Tasks

- [ ] Adjust shared breakpoint logic where real desktop layouts are activating too late.
- [ ] Improve desktop rail discoverability without reverting to the old top-heavy shell.
- [ ] Further quiet shared chip/status density where metadata still competes with primary content.
- [ ] Tighten page-framing patterns so primary surfaces begin sooner.
- [ ] Keep all changes compatible with the established Sprint 1 and Sprint 2 direction.

### Exit Criteria

- Schedule and Settings inherit a shell that feels more readable, discoverable, and compositionally calm than the current Sprint 2 baseline

## Workstream B: Schedule Desktop Redesign

### Goal

Turn Schedule into a weekly operations board with stronger planning hierarchy and clearer weekly scanability.

### Why It Matters

Schedule is where Forge stops being only “today-focused” and becomes a system for anticipating pressure, weekly shape, and block flow.

The page should answer:

- what this week really looks like
- where the pressure sits
- which days are constrained or flexible
- what needs intervention before drift becomes expensive

### Tasks

- [ ] Recompose Schedule into a desktop layout that feels like a true weekly board rather than a stack of calendar-adjacent cards.
- [ ] Clarify the hierarchy between week overview, selected-day detail, and calendar-pressure/context surfaces.
- [ ] Strengthen day-column or board-style composition where it improves scanability.
- [ ] Reduce repetitive card framing inside the weekly view.
- [ ] Keep calendar pressure, sync posture, and schedule truthfulness visible without overwhelming the board.
- [ ] Preserve all real scheduling semantics and current workflow behaviors.

### Exit Criteria

- Schedule reads as a premium operational planning surface instead of a generic calendar page

## Workstream C: Schedule Mobile Redesign

### Goal

Translate Schedule into a mobile weekly planning experience that remains useful and navigable on small screens.

### Why It Matters

Schedule can easily become useless on mobile if it loses weekly structure and devolves into an endless list.

### Tasks

- [ ] Create a mobile-first hierarchy that preserves the idea of a weekly board rather than collapsing into a flat stack.
- [ ] Rebalance summary vs detail for small screens.
- [ ] Make week navigation and selected-day context thumb-friendly.
- [ ] Keep pressure, conflicts, and sync posture readable without noise.
- [ ] Preserve parity with the desktop story while adapting interaction density honestly.

### Exit Criteria

- mobile Schedule feels intentionally designed and operational, not like desktop content mechanically stacked

## Workstream D: Settings Desktop Redesign

### Goal

Turn Settings into a calm system control surface with clearer grouping, operator trust, and better discoverability of critical controls.

### Why It Matters

Settings now contains a lot of serious product truth:

- sync posture
- notifications
- backup and restore
- platform status
- calendar state
- health scaffolding
- diagnostics

That deserves stronger information architecture than a long sequence of cards.

### Tasks

- [ ] Recompose Settings into a clearer desktop hierarchy with stronger grouping between system posture, integrations, recovery, and platform controls.
- [ ] Reduce the feeling of a long operator form stack.
- [ ] Make the most important control/diagnostic surfaces easier to find at a glance.
- [ ] Preserve real risk and warning states without making the page feel alarm-heavy.
- [ ] Keep all settings copy truthful to current shipped capabilities and limits.
- [ ] Maintain accessibility and action clarity for critical flows like backup, restore, calendar, and sign-out adjacent controls.

### Exit Criteria

- Settings feels like a premium control surface instead of a vertically stacked diagnostics page

## Workstream E: Settings Mobile Redesign

### Goal

Create a mobile Settings experience that remains understandable and trustworthy, especially for critical operations.

### Why It Matters

On mobile, Settings can become dense and stressful very quickly if hierarchy and grouping are not explicit.

### Tasks

- [ ] Rework Settings mobile hierarchy around grouped operational sections.
- [ ] Keep backup, restore, calendar, notification, and platform controls easy to reach.
- [ ] Reduce perceived density without hiding important state.
- [ ] Ensure destructive or high-stakes actions remain explicit and safe on small screens.
- [ ] Keep mobile Settings consistent with the same product tone as the desktop operator surface.

### Exit Criteria

- mobile Settings feels deliberate, readable, and safe for real operations

## Workstream F: Shared Calendar / Diagnostics / Settings-Facing Primitive Alignment

### Goal

Allow light-touch updates to related shared primitives where Schedule and Settings need them to feel coherent.

### Why It Matters

These surfaces rely heavily on shared state and integration modules.

Refusing all shared touch-ups would force page-local styling hacks and weaken the modernization track.

### Tasks

- [ ] Refine shared calendar-status surfaces where needed by Schedule or Settings.
- [ ] Refine shared diagnostics or platform-state surfaces where needed by Settings.
- [ ] Keep reuse high and page-local exceptions low.
- [ ] Avoid turning this into a hidden whole-app cleanup pass.

### Exit Criteria

- Schedule and Settings improvements remain system-driven rather than page-specific styling islands

## Sprint 3 Checklists

### Shell Carryover

- [ ] desktop breakpoint activation improved where needed
- [ ] rail discoverability improved
- [ ] chip/status density further calmed
- [ ] page framing tightened so primary surfaces begin sooner

### Schedule

- [ ] desktop weekly-board hierarchy implemented
- [ ] selected-day / week-overview relationship clarified
- [ ] schedule pressure and sync posture integrated cleanly
- [ ] mobile Schedule redesigned intentionally

### Settings

- [ ] desktop operator/control hierarchy implemented
- [ ] major control groups restructured cleanly
- [ ] warning / degraded / planned states rebalanced
- [ ] mobile Settings redesigned intentionally

### Shared System

- [ ] shared calendar/diagnostics/settings primitives touched only where needed
- [ ] no fake control-room semantics introduced
- [ ] Forge dark + amber identity preserved
- [ ] desktop and mobile parity both addressed

### Validation

- [ ] app shell regression tested after Sprint 3 shell carryovers
- [ ] Schedule route rendering and interaction flows regression tested
- [ ] Settings route rendering and high-stakes control flows regression tested
- [ ] responsive behavior reviewed for desktop and mobile-sized layouts
- [ ] no accessibility regressions introduced in nav, actions, or operational status surfaces

### Documentation

- [ ] relevant docs updated during implementation
- [ ] Sprint 3 completion notes recorded
- [ ] next sprint recommendation documented

## Test Expectations After Implementation

Once Sprint 3 implementation is complete, the verification pass should include:

- updated unit tests for any changed shared primitives
- route/render regression tests for shell, Schedule, and Settings
- focused interaction tests for high-stakes control surfaces where practical
- full repo verification:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test:run`
  - `npm run build`

Functions verification is optional unless Sprint 3 changes shared assumptions that affect Functions build or deployment behavior.

## Definition Of Done

Sprint 3 is done when:

- Schedule feels structurally distinct, weekly, and operational on desktop and mobile
- Settings feels calmer, more grouped, and more trustworthy on desktop and mobile
- the most visible Sprint 2 shell carryovers are resolved enough that they no longer distract from the redesigned surfaces
- both screens preserve real Forge semantics and operational truth
- the modernization track is ready to move into the remaining support surfaces with a stable pattern library

## Recommended Next Sprint

Sprint 4 should modernize the remaining support surfaces:

- Prep
- Physical
- Readiness

That sprint should focus on aligning those pages to the now-established shell, execution, analytics, scheduling, and control-surface language rather than reopening core shell architecture again.
