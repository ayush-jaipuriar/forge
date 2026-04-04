# UI Modernization Sprint 1 Plan

## Sprint Purpose

Sprint 1 is the **foundation sprint** for the UI modernization track.

Its job is not to make Forge fully redesigned in one pass.

Its job is to create the shared visual and structural system that the rest of the redesign will depend on:

- theme and tokens
- shell layout
- left rail navigation
- header structure
- shared page framing
- shared surface hierarchy
- responsive shell behavior

This is the recommended first sprint because it creates the highest-leverage improvement with the least rework risk.

If Today or Command Center were redesigned before the shell and system foundations were stable, those screens would likely need a second pass later.

## Sprint Scope

Sprint 1 includes:

- Track 0: Design translation and guardrails
- Track 1: Design system and shell foundation

Sprint 1 does **not** include:

- full Today redesign
- full Command Center redesign
- Schedule screen redesign
- Settings screen redesign
- secondary-screen modernization

Those belong to later sprints after the system foundation is stable.

## Strategic Objective

At the end of Sprint 1, Forge should already feel visibly different even before the major screens are redesigned:

- stronger desktop anchoring
- cleaner shell structure
- less pill-heavy component language
- clearer typography hierarchy
- improved global navigation
- better mobile shell posture

This sprint should make the product feel more premium immediately, while also reducing risk for future UI work.

## Inputs And References

### Primary Modernization Plan

- [docs/ui-modernization-implementation-plan.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/ui-modernization-implementation-plan.md)

### Stitch Strategy References

- [stitch 3/forge_ui_ux_redesign_strategy.html](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/forge_ui_ux_redesign_strategy.html)
- [stitch 3/forge_today_command_center_strategy.html](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/forge_today_command_center_strategy.html)
- [stitch 3/forge_obsidian/DESIGN.md](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/forge_obsidian/DESIGN.md)

### Primary Mock References For Sprint 1

- Shell / navigation inspiration:
  - [stitch 3/today_execution_console/screen.png](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/today_execution_console/screen.png)
  - [stitch 3/command_center_strategy_room/screen.png](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/command_center_strategy_room/screen.png)
- Mobile shell inspiration:
  - [stitch 3/today_mobile_cockpit/screen.png](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/today_mobile_cockpit/screen.png)
- HTML structure cues:
  - [stitch 3/today_execution_console/code.html](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/today_execution_console/code.html)
  - [stitch 3/command_center_strategy_room/code.html](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/command_center_strategy_room/code.html)

## Product Guardrails

Sprint 1 must preserve the following:

- real Forge semantics and labels
- real app navigation meaning
- current product boundaries
- current integration truthfulness
- accessibility and operational clarity

Sprint 1 must **not** introduce:

- fake operator-console copy
- fake “system” semantics
- fictional security/admin controls
- blue-heavy visual drift
- decorative styling that weakens usability

## Sprint Deliverables

By the end of Sprint 1, the repo should contain:

- updated theme tokens and visual constants
- refactored app shell
- desktop left rail navigation
- updated top header structure
- shared page-frame and content-well primitives
- updated shared component styling for buttons, chips, surfaces, and status treatments
- responsive shell behavior for desktop, tablet, and mobile contexts
- updated docs recording the new UI foundation

## Work Breakdown

## Workstream A: Design Translation Layer

### Goal

Translate the Stitch explorations into engineering-safe UI rules.

### Why It Matters

The mockups are strong visually but uneven semantically.

Without an explicit translation step, implementation could drift into:

- over-stylized control-room UI
- inconsistent copy
- one-off custom styling

### Tasks

- [x] Record the Sprint 1 keep/reject rules directly in the implementation notes as work begins.
- [x] Freeze the approved shell direction:
  - left rail
  - compact header
  - darker surface hierarchy
  - less rounded controls
  - stronger panel hierarchy
- [x] Freeze the rejected mock directions:
  - fake system jargon
  - fake operator identity
  - fake admin controls
  - decorative-only visual motifs

### Exit Criteria

- every implementation decision in Sprint 1 can be explained as either:
  - aligned with the approved visual direction
  - or intentionally rejected to preserve product truth

## Workstream B: Theme And Token Evolution

### Goal

Upgrade the global design tokens so the shell and future screens can inherit the new visual language consistently.

### Why It Matters

If the token system stays unchanged, shell improvements will be hardcoded and later screens will drift.

### Likely Areas

- app theme provider
- shared style constants
- component overrides

### Tasks

- [x] Refine the global color palette while staying inside Forge’s dark + amber family.
- [x] Create clearer surface tiers:
  - page background
  - shell background
  - standard card
  - elevated card
  - diagnostics/support card
- [x] Reduce oversized rounded-pill defaults.
- [x] Introduce a more deliberate radius system:
  - tiny
  - small
  - medium
  - large
- [x] Tighten typography hierarchy for:
  - page eyebrow
  - page title
  - section title
  - body text
  - supporting captions
  - metric/timestamp mono styling
- [x] Standardize status colors for:
  - success / healthy
  - warning / stale
  - degraded / error
  - planned / future
  - selected / active

### Exit Criteria

- the updated theme can support the shell redesign without one-off visual hacks

## Workstream C: Shell Architecture

### Goal

Refactor the app shell from the current top-heavy capsule layout into a structured left-rail and compact-header framework.

### Why It Matters

This is the highest-impact visual change in the whole modernization plan.

It immediately improves:

- desktop composition
- navigation clarity
- page anchoring
- perceived product maturity

### Likely Areas

- app shell layout
- navigation configuration
- shell header
- route wrapper components

### Tasks

- [x] Introduce desktop left rail navigation.
- [x] Preserve real route names and app structure while changing visual treatment.
- [x] Redesign the top header into a compact system/status bar.
- [x] Create a stronger main content frame with controlled max width and pane logic.
- [x] Support an optional utility/right-rail region for future screens.
- [x] Ensure shell works for:
  - browser desktop
  - tablet
  - mobile / installed app
- [x] Remove current shell visual patterns that feel too pill-heavy or too floating.

### Exit Criteria

- Forge has a new shell that feels premium and structurally anchored even before full page redesigns begin

## Workstream D: Shared Component Modernization

### Goal

Upgrade the most visible shared UI primitives so the new shell does not sit on top of legacy visual language.

### Why It Matters

If the shell changes but buttons, chips, cards, and status surfaces stay old, the app will feel visually split.

### Likely Areas

- shared buttons
- chips
- alerts
- section headers
- surface cards
- nav items
- status indicators

### Tasks

- [x] Redesign button hierarchy to better match the new shell.
- [x] Reduce overly rounded chips and navigation pills.
- [x] Rework shared cards into clearer visual tiers.
- [x] Tighten section header styling to feel more editorial and premium.
- [x] Update alert/status treatments so they fit the new system.
- [x] Ensure the new primitives still work across Settings, Today, Command Center, and support screens even before those pages are fully redesigned.

### Exit Criteria

- the main shared components no longer clash with the new shell language

## Workstream E: Responsive Shell And Mobile Support

### Goal

Make the new shell feel intentional on mobile and tablet, not only on desktop.

### Why It Matters

The user explicitly wants desktop and mobile treated as equal implementation concerns.

### Tasks

- [x] Define tablet behavior for the left rail.
- [x] Define mobile behavior for shell navigation.
- [x] Ensure header behavior is clean on narrow widths.
- [x] Ensure spacing and density do not collapse awkwardly on smaller screens.
- [x] Preserve the installed-app feel for mobile/PWA contexts.

### Exit Criteria

- the shell redesign feels deliberate on both desktop and mobile

## Sprint 1 Checklists

### Planning And Translation

- [x] Stitch reference set reviewed during implementation
- [x] keep/reject design guardrails recorded in docs
- [x] shell and token direction agreed in code and docs

### Theme And Tokens

- [x] colors updated
- [x] surface tiers updated
- [x] radii updated
- [x] typography hierarchy updated
- [x] status colors standardized

### Shell

- [x] left rail implemented
- [x] header redesigned
- [x] content frame updated
- [x] desktop anchoring improved
- [x] responsive shell behavior implemented

### Shared Components

- [x] buttons updated
- [x] chips/tabs updated
- [x] surface cards updated
- [x] section headers updated
- [x] status/alert treatments updated

### Validation

- [ ] desktop shell reviewed on large monitor width
- [ ] tablet shell reviewed
- [ ] mobile shell reviewed
- [ ] navigation regression tested
- [ ] no fake control-room semantics introduced

### Documentation

- [x] relevant docs updated during implementation
- [x] Sprint 1 completion notes recorded
- [x] next sprint recommendation documented

## Sprint 1 Implementation Notes

### Keep / Translate Decisions Applied

- Keep the Stitch shell composition:
  - fixed desktop left rail
  - compact top header
  - stronger content well and desktop anchoring
  - sharper panel hierarchy
  - mobile bottom-bar plus drawer posture
- Keep the dark + amber Forge identity while tightening the palette and reducing visual softness.
- Keep the editorial hierarchy shift:
  - stronger title rhythm
  - smaller technical overlines
  - mono treatment for supporting operational readouts only

### Rejected Directions

- Rejected fake system-console semantics and fictional operator language.
- Rejected blue-heavy drift from the Command Center mock language.
- Rejected decorative-only search, security, or admin shell elements that do not exist in the real product.
- Rejected the more theatrical mockup metaphors in favor of real Forge labels and states.

### Files Updated In Sprint 1

- [src/app/theme/tokens.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/app/theme/tokens.ts)
- [src/app/theme/theme.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/app/theme/theme.ts)
- [index.html](/Users/ayushjaipuriar/Documents/GitHub/forge/index.html)
- [src/components/layout/AppShell.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/components/layout/AppShell.tsx)
- [src/components/common/SectionHeader.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/components/common/SectionHeader.tsx)
- [src/components/common/SurfaceCard.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/components/common/SurfaceCard.tsx)
- [src/components/common/MetricTile.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/components/common/MetricTile.tsx)
- [src/components/common/OperationalSignalCard.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/components/common/OperationalSignalCard.tsx)
- [src/components/common/EmptyState.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/components/common/EmptyState.tsx)
- [src/components/status/StatusBadge.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/components/status/StatusBadge.tsx)
- [src/components/status/SyncIndicator.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/components/status/SyncIndicator.tsx)
- [docs/ui-modernization-sprint-1-plan.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/ui-modernization-sprint-1-plan.md)

### Why These Changes Were Chosen

- The token and typography changes remove the old oversized-pill feel across the app without forcing immediate page-by-page rewrites.
- The new shell changes the product’s desktop composition first, which is the highest-leverage improvement for perceived polish.
- The shared primitive updates keep the shell from sitting on top of legacy-looking cards, chips, and metric panels.
- The mobile shell keeps the same identity through hierarchy and framing instead of inventing a separate visual language.

### Next Sprint Recommendation

- Proceed to the Today + Command Center redesign sprint next.
- Those pages now have a stable shell and token foundation, so the next pass can focus on composition and hierarchy instead of rebuilding the frame again.

## Test Expectations After Implementation

Once Sprint 1 implementation is complete, the verification pass should include:

- unit tests where shared components or hooks change materially
- regression tests for app shell and navigation behavior
- route rendering tests affected by shell changes
- layout-sensitive UI tests where practical
- full repo verification:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test:run`
  - `npm run build`

If the Functions workspace is untouched, Functions verification is optional for this sprint.
If any shared app shell or deployment-facing structure changes affect build assumptions, include:

- `npm run functions:verify`

## Definition Of Done

Sprint 1 is done when:

- Forge has a new visual foundation
- the shell feels materially more premium
- desktop composition is clearly improved
- mobile shell posture is intentionally handled
- the app still uses real product semantics
- the redesign is strong enough that Today and Command Center can be built on top of it without redoing the shell again

## Recommended Next Sprint

After Sprint 1, the recommended next sprint is:

- Today + Command Center redesign

Why:

- they are the highest-visibility screens
- they benefit the most from the new shell
- they establish the rest of the app’s redesign quality bar
