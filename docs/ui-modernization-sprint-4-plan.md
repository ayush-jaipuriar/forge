# UI Modernization Sprint 4 Plan

## Purpose

This document defines Sprint 4 of the Forge UI modernization track.

Sprint 4 extends the modernization work into:

- Prep
- Physical
- Readiness

The sprint keeps the same modernization philosophy established in Sprints 1 through 3:

- stronger page hierarchy
- desktop-composed layouts
- mobile-first honesty rather than squeezed desktop carryover
- production semantics over mockup theater

## Why Sprint 4 Exists

After Sprints 1 through 3.1:

- the shell is materially stronger
- Today and Command Center now carry real focal hierarchy
- Schedule and Settings are structurally more operational
- auth and runtime boundaries are cleaner and more honest

That leaves one major product cluster still behind the new system:

- Prep
- Physical
- Readiness

These surfaces matter because they form Forge’s “personal capability layer”:

- Prep tracks learning depth and domain readiness
- Physical tracks execution support through training and sleep
- Readiness converts coverage, pace, and pressure into an operational signal

If these pages remain on the older layout rhythm, Forge will still feel visually split between “modernized command surfaces” and “legacy support screens.”

## Sprint Direction

This sprint will:

- treat Prep, Physical, and Readiness as equal redesign targets
- implement both desktop and mobile restructuring
- keep work mostly within those three pages
- allow light shared primitive touch-ups where needed
- include shell carryover only if one of these pages exposes a real shell-level mismatch

The sprint will **not**:

- invent new product semantics
- turn health-provider scaffolding into fake live integrations
- reopen broad shell redesign work unless a small adjustment is required to keep these pages coherent

## Inputs

### Prior Modernization References

- [docs/ui-modernization-implementation-plan.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/ui-modernization-implementation-plan.md)
- [docs/ui-modernization-sprint-1-plan.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/ui-modernization-sprint-1-plan.md)
- [docs/ui-modernization-sprint-2-plan.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/ui-modernization-sprint-2-plan.md)
- [docs/ui-modernization-sprint-3-plan.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/ui-modernization-sprint-3-plan.md)
- [docs/ui-modernization-sprint-3-1-plan.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/ui-modernization-sprint-3-1-plan.md)

### Stitch References

There are no direct Stitch mocks for Prep, Physical, or Readiness.

So Sprint 4 should use the closest applicable references:

- shared design language:
  - [stitch 3/forge_ui_ux_redesign_strategy.html](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/forge_ui_ux_redesign_strategy.html)
  - [stitch 3/forge_obsidian/DESIGN.md](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/forge_obsidian/DESIGN.md)
- desktop pane rhythm and hierarchy:
  - [stitch 3/today_execution_console/screen.png](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/today_execution_console/screen.png)
  - [stitch 3/command_center_strategy_room/screen.png](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/command_center_strategy_room/screen.png)
- mobile composition reference:
  - [stitch 3/today_mobile_cockpit/screen.png](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/today_mobile_cockpit/screen.png)

### Current Screen Sources

- [src/features/prep/pages/PrepPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/prep/pages/PrepPage.tsx)
- [src/features/physical/pages/PhysicalPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/physical/pages/PhysicalPage.tsx)
- [src/features/readiness/pages/ReadinessPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/readiness/pages/ReadinessPage.tsx)

## Core Product Interpretation

### Prep

Prep should become a **progress and intelligence workspace**, not just a taxonomy drill-down.

That means:

- domain health should be visible at a glance
- topic editing should still be practical and fast
- the page should show pattern and readiness context, not just controls

### Physical

Physical should feel like a **performance support surface**, not a mini workout tracker.

That means:

- workout execution and sleep logging should feel tightly connected to the day
- weekly training shape should be visible without turning into a gym dashboard
- health-provider messaging must remain clearly scaffold-only

### Readiness

Readiness should feel like a **pressure-and-readiness intelligence page**, not a placeholder status board.

That means:

- the target-date and pace model should be structurally dominant
- domain weakness and intervention signals should be actionable at a glance
- health-provider contribution areas must stay honest about being future seams, not live inputs

## Sprint Goals

By the end of Sprint 4:

- Prep should feel like a real progress/intelligence surface
- Physical should feel integrated into the execution system rather than like a side tracker
- Readiness should feel like a composed operational intelligence page
- desktop and mobile versions of all three pages should follow the modernized system
- health-provider scaffolding should remain explicit and honest

## Recommended Work Order

The pages are equal in importance, but the implementation order should be:

1. shared primitive adjustments
2. Prep
3. Physical
4. Readiness
5. cross-page polish

Why this order:

- Prep establishes the “progress + intelligence” rhythm that Readiness builds on
- Physical then adapts the same rhythm to execution-support inputs
- Readiness closes the sprint by composing strategic pressure from the improved supporting surfaces

## Workstream 0: Shared Primitive Alignment

### Goal

Make only the small shared changes these three pages need before screen-specific redesign begins.

### Why This Matters

Sprint 4 should not reopen the design system broadly.

But if Prep, Physical, and Readiness all need a slightly different:

- metric rhythm
- section density
- stack behavior
- small-screen card treatment

then those should be solved once in shared primitives, not by hand on every page.

### Checklist

- [x] Review whether `MetricTile` still needs a lighter, denser variant for these screens.
- [x] Review whether `SectionHeader` needs a more compact mobile rhythm for intelligence/support pages.
- [x] Review whether `SurfaceCard` needs a quieter support-card mode for scaffolding/info sections.
- [x] Only include shell carryover polish if a visible mismatch appears while implementing these pages.

### Primary Files

- [src/components/common/MetricTile.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/components/common/MetricTile.tsx)
- [src/components/common/SectionHeader.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/components/common/SectionHeader.tsx)
- [src/components/common/SurfaceCard.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/components/common/SurfaceCard.tsx)

### Exit Criteria

- shared primitives support Sprint 4 pages without one-off layout hacks

## Workstream 1: Prep Desktop Redesign

### Goal

Turn Prep into a progress/intelligence workspace instead of a mostly taxonomy-first editor.

### Why This Matters

Prep is not just about updating topics.

It is one of Forge’s clearest signals of learning health and domain readiness, so the page should express:

- where coverage is thin
- where confidence is strong
- what domain is under current focus
- what topic needs action next

### Checklist

- [x] Restructure the desktop layout so domain health, active-domain intelligence, and topic editing have clearer hierarchy.
- [x] Reduce the feeling of “metrics row + navigation card + topic card” as isolated blocks.
- [x] Make the selected domain area feel like the page’s primary focal zone.
- [x] Keep fast topic updates intact:
  - confidence
  - exposure state
  - revisions
  - solved count
  - notes
- [x] Add stronger domain-level context so the page reads as progress intelligence, not just editable metadata.

### Primary Files

- [src/features/prep/pages/PrepPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/prep/pages/PrepPage.tsx)
- [src/features/prep/hooks/usePrepWorkspace.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/prep/hooks/usePrepWorkspace.ts)

### Exit Criteria

- desktop Prep has a dominant focal surface and clearer progress hierarchy

## Workstream 2: Prep Mobile Redesign

### Goal

Make Prep workable and scannable on smaller screens without collapsing into a long generic card list.

### Checklist

- [x] Define a mobile-first reading order for:
  - domain summary
  - current focus / active domain
  - topic controls
  - note editing
- [x] Keep topic updates thumb-friendly and low-friction.
- [x] Avoid forcing horizontal overflow or tiny control clusters.
- [x] Preserve the intelligence framing even when the page stacks vertically.

### Exit Criteria

- mobile Prep feels intentional, not like desktop controls compressed into one column

## Workstream 3: Physical Desktop Redesign

### Goal

Make Physical feel like a performance-support console for the day rather than a simple logging screen.

### Why This Matters

Physical should reinforce that training and sleep support execution quality.

The page should not look like a separate wellness app.

### Checklist

- [x] Restructure the desktop layout so workout execution, sleep input, and weekly shape feel like one connected surface.
- [x] Make the primary daily action area clearer:
  - workout completion state
  - sleep logging state
  - quick adjustment controls
- [x] Reduce the sense that the page is a stack of unrelated cards.
- [x] Keep the health-provider section explicit, quieter, and clearly future-oriented.
- [x] Preserve lightweight operational logging instead of over-expanding the feature into a fitness dashboard.

### Primary Files

- [src/features/physical/pages/PhysicalPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/physical/pages/PhysicalPage.tsx)
- [src/features/physical/hooks/usePhysicalWorkspace.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/physical/hooks/usePhysicalWorkspace.ts)

### Exit Criteria

- desktop Physical feels connected to execution support, not isolated tracking

## Workstream 4: Physical Mobile Redesign

### Goal

Make Physical fast to use on mobile, where logging likely happens most often.

### Checklist

- [x] Make workout status controls clearly tappable without overusing bulky button clusters.
- [x] Keep sleep-duration entry fast and obvious.
- [x] Preserve one-screen clarity for “what needs logging today.”
- [x] Keep the health-provider scaffold visible but visually secondary.

### Exit Criteria

- mobile Physical is fast, clear, and supportive without visual clutter

## Workstream 5: Readiness Desktop Redesign

### Goal

Turn Readiness into a composed pressure-and-readiness intelligence page with a clear operational story.

### Why This Matters

Readiness is where Forge explains whether the current prep trajectory is good enough.

So the page should not feel like a flat list of indicators.

It should clearly communicate:

- target pressure
- pace sufficiency
- vulnerable domains
- intervention-worthy signals

### Checklist

- [x] Restructure the desktop layout around a dominant target/pace hero.
- [x] Make intervention signals and domain weakness more prominent.
- [x] Reduce repetition between metric tiles and smaller support cards where possible.
- [x] Keep “focused domains under execution pressure” meaningfully connected to the rest of the page.
- [x] Keep recovery-signal scaffolding clearly future-facing and non-fake.

### Primary Files

- [src/features/readiness/pages/ReadinessPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/readiness/pages/ReadinessPage.tsx)
- [src/features/readiness/hooks/useReadinessWorkspace.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/readiness/hooks/useReadinessWorkspace.ts)

### Exit Criteria

- desktop Readiness reads as a strategic intelligence page, not a support appendix

## Workstream 6: Readiness Mobile Redesign

### Goal

Make Readiness readable and meaningful on mobile without turning it into a dense wall of support cards.

### Checklist

- [x] Keep the target/pace summary near the top and clearly dominant.
- [x] Stack intervention and domain signals in an order that preserves urgency.
- [x] Ensure mobile readability for domain-state summaries.
- [x] Keep scaffolding copy concise and secondary.

### Exit Criteria

- mobile Readiness preserves urgency and clarity on small screens

## Workstream 7: Sprint-Wide Polish And Verification

### Goal

Close the sprint with the same standard of discipline used in prior modernization passes.

### Checklist

- [x] Run `npm run typecheck`
- [x] Run `npm run lint`
- [x] Run `npm run test:run`
- [x] Run `npm run build`
- [x] Add or update screen-level tests where layout or content grouping contracts changed materially.
- [x] Do a real local browser QA pass across:
  - Prep
  - Physical
  - Readiness
- [x] If possible, do a mobile or responsive audit for these screens as well.
- [x] Update this sprint document with:
  - completion notes
  - files changed
  - validation outcome
  - residual caveats

### Likely Test Files

- [src/tests/ui-primitives.spec.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/tests/ui-primitives.spec.tsx)
- screen-specific tests to be added if needed during implementation

### Exit Criteria

- the three pages feel visually part of the same modernized product
- automated verification is green
- manual review confirms the screens are structurally improved on desktop and mobile

## Definition Of Done

Sprint 4 is done when:

- Prep reads as a progress/intelligence page
- Physical reads as an execution-support page
- Readiness reads as a pressure-and-readiness intelligence page
- desktop and mobile layouts are both intentionally redesigned
- health-provider scaffolding stays honest
- any needed shared primitive updates are complete
- verification is green and documented

## Completion Notes

Sprint 4 is complete.

The redesign work focused on turning the remaining support pages into first-class modernized surfaces instead of leaving them on the older stacked-card rhythm:

- Prep now reads as a progress/intelligence workspace with a clear three-part structure:
  - domain pressure rail
  - active-domain intelligence
  - topic action panel
- Physical now reads as an execution-support console rather than a workout tracker:
  - daily training console
  - fast sleep logging
  - weekly training shape
- Readiness now reads as a pressure-and-readiness intelligence page:
  - dominant target/pace hero
  - intervention layer
  - domain readiness matrix

### Files Changed

- [src/components/common/MetricTile.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/components/common/MetricTile.tsx)
- [src/features/prep/pages/PrepPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/prep/pages/PrepPage.tsx)
- [src/features/physical/pages/PhysicalPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/physical/pages/PhysicalPage.tsx)
- [src/features/readiness/pages/ReadinessPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/readiness/pages/ReadinessPage.tsx)
- [src/tests/prep-page.spec.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/tests/prep-page.spec.tsx)
- [src/tests/physical-page.spec.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/tests/physical-page.spec.tsx)
- [src/tests/readiness-page.spec.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/tests/readiness-page.spec.tsx)

### Validation Outcome

Automated verification:

- `npm run lint`
- `npm run typecheck`
- `npm run test:run` → `64` files, `227` tests passed
- `npm run build`

Live browser QA artifacts:

- desktop:
  - [Prep desktop](/Users/ayushjaipuriar/Documents/GitHub/forge/output/playwright/sprint-4-audit/prep-desktop.png)
  - [Physical desktop](/Users/ayushjaipuriar/Documents/GitHub/forge/output/playwright/sprint-4-audit/physical-desktop.png)
  - [Readiness desktop](/Users/ayushjaipuriar/Documents/GitHub/forge/output/playwright/sprint-4-audit/readiness-desktop.png)
- mobile:
  - [Prep mobile](/Users/ayushjaipuriar/Documents/GitHub/forge/output/playwright/sprint-4-audit/prep-mobile.png)
  - [Physical mobile](/Users/ayushjaipuriar/Documents/GitHub/forge/output/playwright/sprint-4-audit/physical-mobile.png)
  - [Readiness mobile](/Users/ayushjaipuriar/Documents/GitHub/forge/output/playwright/sprint-4-audit/readiness-mobile.png)

### Residual Caveats

- During live route changes in the audit browser, the auth restoration shell can still appear briefly before the steady-state page settles. That did not block use and the steady-state screenshots above reflect the actual final layouts.
- The Sprint 4 pages are visually and structurally in the modernized system, but they still inherit the product’s real seeded data sparsity. In low-data states, some modules intentionally read as honest placeholders rather than highly animated dashboards.
