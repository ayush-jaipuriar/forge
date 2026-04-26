# UI Modernization Implementation Plan

## Purpose

This document defines the implementation plan for the Forge UI modernization track.

This is **not** a new roadmap phase.

It is a cross-phase modernization track layered onto the currently shipped product so Forge can evolve visually without destabilizing the working execution, analytics, integration, and launch foundations completed through Phases 1 to 4.

The goal is to move Forge from:

- functionally strong but visually plain
- overly pill-heavy
- weakly anchored on large monitors
- inconsistent in hierarchy between dashboard, execution, and operator surfaces

to:

- premium
- operational
- desktop-composed
- mobile-considered
- visually disciplined
- structurally consistent

## 2026 Visual Direction Update

After the product simplification stream and production user feedback, the next visual track is no longer trying to push Forge further into an operational cockpit aesthetic.

The follow-up direction is documented in:

- [Calm Premium Planner Visual Redesign Plan](calm-premium-planner-visual-redesign-plan.md)

That plan supersedes the earlier cockpit-heavy parts of this modernization direction for future UI work.

The updated target is:

- calm premium planner
- first-class light mode
- warmer, softer dark mode
- aggressive card and chrome reduction
- `Today` as the flagship visual reset
- desktop and mobile screenshot QA in every sprint

## Inputs

This plan is based on the Stitch design exploration in:

- [stitch 3/forge_ui_ux_redesign_strategy.html](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/forge_ui_ux_redesign_strategy.html)
- [stitch 3/forge_today_command_center_strategy.html](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/forge_today_command_center_strategy.html)
- [stitch 3/forge_obsidian/DESIGN.md](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/forge_obsidian/DESIGN.md)

Primary mockup references:

- Today desktop:
  - [stitch 3/today_execution_console/screen.png](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/today_execution_console/screen.png)
- Command Center desktop:
  - [stitch 3/command_center_strategy_room/screen.png](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/command_center_strategy_room/screen.png)
- Schedule desktop:
  - [stitch 3/schedule_operations_board/screen.png](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/schedule_operations_board/screen.png)
- Settings desktop:
  - [stitch 3/settings_system_control/screen.png](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/settings_system_control/screen.png)
- Today mobile:
  - [stitch 3/today_mobile_cockpit/screen.png](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/today_mobile_cockpit/screen.png)

Reference HTML prototypes:

- [stitch 3/today_execution_console/code.html](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/today_execution_console/code.html)
- [stitch 3/command_center_strategy_room/code.html](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/command_center_strategy_room/code.html)
- [stitch 3/schedule_operations_board/code.html](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/schedule_operations_board/code.html)
- [stitch 3/settings_system_control/code.html](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/settings_system_control/code.html)
- [stitch 3/today_mobile_cockpit/code.html](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/today_mobile_cockpit/code.html)

## Core Decision

Forge will pursue **visual parity with the Stitch mocks where practical**, but not blindly.

That means:

- keep the stronger shell, layout, hierarchy, density, and component discipline
- keep the dark + amber premium operating-surface identity
- keep the left-rail desktop anchoring and more intentional pane composition

But do **not** carry forward:

- fictional “system console” language
- fake admin or operator semantics
- invented data or pseudo-military framing
- control-room theatrics that weaken product honesty

The app should look more premium and more composed, but still speak in Forge’s real product language.

## Modernization Principles

### 1. Structure Before Decoration

The modernization should first improve:

- shell layout
- page hierarchy
- module scale
- density
- navigation clarity

before adding visual polish details.

### 2. Product Truth Over Mockup Theater

The mockups are valuable for composition, not for literal copy or fake system metaphors.

Visual ambition is welcome.
Fake semantics are not.

### 3. Desktop And Mobile Move Together

Desktop and mobile should be treated as parallel implementation targets, not a desktop pass with mobile patched later.

Why:

- Forge is already used in browser, installed PWA, and Android shell contexts
- mobile is not a secondary concern in this product

### 4. Highest-Leverage Screens First

The first implementation wave should focus on:

- shell
- navigation
- Today
- Command Center

Why:

- these create the strongest immediate improvement to perceived product quality
- they establish the reusable visual grammar the remaining screens should inherit

### 5. Reuse Over One-Off Styling

The modernization should be implemented through:

- MUI theme evolution
- shared layout primitives
- reusable page wrappers
- shared status and card patterns

not through isolated screen-by-screen hardcoded styling.

## What To Keep From Stitch

High-confidence design directions to preserve:

- left rail navigation
- tighter top shell header
- stronger desktop anchoring
- asymmetrical pane-based page composition
- more varied module scale
- reduced pill/capsule overuse
- more disciplined color application
- premium typography hierarchy
- stronger emphasis on the “current mission” on Today
- hero-insight-led Command Center structure
- cleaner, more structured Schedule board
- more operator-style Settings structure

## What To Reject From Stitch

Do not implement these literally:

- fake labels like `SYSTEM_READY`, `PRIORITY_ALPHA`, `OPERATOR_42`, `SESSION_TOKEN`
- fake infrastructure controls like `FACTORY RESET` or invented admin/security fields
- excessive blue as a secondary visual identity
- over-stylized sci-fi or military-console framing
- decorative textures that reduce readability
- absolute “no borders ever” or “no divider ever” rules

## Target Outcomes

This modernization should produce:

- a more premium and coherent first impression
- a more intentional desktop experience on large monitors
- better action hierarchy on Today
- better analytical hierarchy in Command Center
- a stronger shared shell across all product surfaces
- mobile screens that feel like a real installed app, not a squeezed desktop web app

## Recommended Execution Order

The recommended sequence is:

1. design-system and shell foundations
2. Today and Command Center
3. Schedule and Settings
4. Prep, Physical, and Readiness
5. app-wide polish and cleanup

That order maximizes visible impact while reducing rework.

---

## Track 0: Design Translation And Guardrails

### Goal

Translate the Stitch exploration into a usable engineering design language before changing major UI surfaces.

### Deliverables

- a design-translation memo inside the repo
- approved “keep vs reject” UI rules
- implementation-safe token direction

### Checklist

- [ ] Review the Stitch mockups and strategy docs as implementation references, not direct production specs.
- [ ] Freeze the approved visual principles:
  - left rail
  - stronger shell hierarchy
  - reduced pill overuse
  - premium dark + amber discipline
  - pane-based desktop layout
- [ ] Freeze the rejected directions:
  - fictional operator copy
  - fake infrastructure semantics
  - blue-heavy visual drift
  - theatrical console language
- [ ] Document which mockups are the primary reference for each screen.
- [ ] Confirm that current product copy and semantics remain the default unless a real cleanup is needed.

### Primary References

- [stitch 3/forge_ui_ux_redesign_strategy.html](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/forge_ui_ux_redesign_strategy.html)
- [stitch 3/forge_today_command_center_strategy.html](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/forge_today_command_center_strategy.html)
- [stitch 3/forge_obsidian/DESIGN.md](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/forge_obsidian/DESIGN.md)

### Exit Criteria

- the team has a clear translation layer between visual inspiration and production UI implementation

---

## Track 1: Design System And Shell Foundation

### Goal

Replace the current “soft card + pill-heavy” shell language with a stronger shared visual system and navigation structure.

### Deliverables

- updated MUI theme/tokens
- new shell layout primitives
- left-rail desktop navigation
- mobile-aware shell structure

### Checklist

- [ ] Evolve the MUI theme tokens for:
  - color
  - spacing
  - radii
  - typography
  - border styles
  - status colors
- [ ] Reduce default rounded-pill styling across:
  - tabs
  - chips
  - buttons
  - nav items
- [ ] Introduce a left navigation rail for desktop and large-tablet layouts.
- [ ] Refactor the top shell header into a smaller, more technical, more structured bar.
- [ ] Create shared layout primitives for:
  - page frame
  - left rail
  - header bar
  - main content well
  - optional right utility pane
- [ ] Create shared card tiers:
  - hero surface
  - standard surface
  - support surface
  - diagnostics/status surface
- [ ] Make shell behavior responsive for:
  - desktop
  - tablet
  - mobile / installed app

### Primary References

- [stitch 3/today_execution_console/screen.png](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/today_execution_console/screen.png)
- [stitch 3/command_center_strategy_room/screen.png](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/command_center_strategy_room/screen.png)
- [stitch 3/today_mobile_cockpit/screen.png](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/today_mobile_cockpit/screen.png)

### Likely Code Areas

- app shell components
- nav components
- shared layout wrappers
- theme/provider configuration
- status chip and button primitives

### Exit Criteria

- the app has a new shell language that can support the rest of the redesign consistently

---

## Track 2: Today Surface Redesign

### Goal

Turn Today into the clear execution centerpiece of Forge.

### Deliverables

- redesigned Today desktop layout
- redesigned Today mobile layout
- improved current block hierarchy
- stronger pressure and readiness composition

### Checklist

- [ ] Recompose Today into a multi-pane desktop layout:
  - readiness/support zone
  - central execution stack
  - pressure/intelligence zone
- [ ] Make the current block / current mission the dominant visual element.
- [ ] Redesign recommendation, score preview, and war-state modules so they support action rather than compete with it.
- [ ] Rework block list cards to be denser, more structured, and less repetitive.
- [ ] Improve quick input surfaces for sleep, energy, and related signals.
- [ ] Align block action buttons with the new button hierarchy.
- [ ] Redesign the mobile Today screen using the same priority logic, not a miniaturized desktop.
- [ ] Preserve real Forge copy and semantics while translating the visual structure from Stitch.

### Primary References

- [stitch 3/today_execution_console/screen.png](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/today_execution_console/screen.png)
- [stitch 3/today_execution_console/code.html](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/today_execution_console/code.html)
- [stitch 3/today_mobile_cockpit/screen.png](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/today_mobile_cockpit/screen.png)
- [stitch 3/today_mobile_cockpit/code.html](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/today_mobile_cockpit/code.html)

### Exit Criteria

- Today feels like the strongest, clearest, most action-oriented screen in the product on both desktop and mobile

---

## Track 3: Command Center Redesign

### Goal

Upgrade Command Center from a correct analytics screen into a premium strategic intelligence surface.

### Deliverables

- redesigned Command Center hero insight area
- improved chart hierarchy
- clearer separation between warnings, projections, charts, and momentum
- desktop and mobile analytical layouts

### Checklist

- [ ] Add a hero strategic summary / coach insight zone at the top of the page.
- [ ] Tier the page into:
  - strategic summary
  - primary diagnostics
  - support analytics
  - momentum/streak modules
- [ ] Rework chart cards so they are not all the same visual weight.
- [ ] Refine low-data and insufficient-data states so they still feel premium.
- [ ] Reduce visual clutter and avoid dashboard-template sameness.
- [ ] Keep color discipline warm and Forge-native; do not let the screen drift into blue-heavy “monitoring dashboard” territory.
- [ ] Build a mobile/tighter-screen version that preserves insight hierarchy rather than simply stacking charts blindly.

### Primary References

- [stitch 3/command_center_strategy_room/screen.png](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/command_center_strategy_room/screen.png)
- [stitch 3/command_center_strategy_room/code.html](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/command_center_strategy_room/code.html)

### Exit Criteria

- Command Center feels analytical, premium, and structurally distinct from Today while still belonging to the same product

---

## Track 4: Schedule And Settings Modernization

### Goal

Bring the planning and operator surfaces up to the new shell and hierarchy standard.

### Deliverables

- redesigned Schedule board
- redesigned Settings control surface
- desktop/mobile-consistent support screens

### Checklist

- [ ] Redesign Schedule around the stronger operations-board structure from Stitch.
- [ ] Improve weekly column readability and active-day emphasis.
- [ ] Refine filters, tags, and support modules so they feel like part of the new shell language.
- [ ] Redesign Settings into a more coherent operator surface while preserving real Forge semantics.
- [ ] Remove any temptation toward fictional admin-console patterns.
- [ ] Make diagnostics, backup/restore, notifications, platform posture, Calendar, and health sections clearer and more scannable.
- [ ] Ensure both screens have strong mobile adaptations, not just desktop compositions.

### Primary References

- [stitch 3/schedule_operations_board/screen.png](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/schedule_operations_board/screen.png)
- [stitch 3/schedule_operations_board/code.html](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/schedule_operations_board/code.html)
- [stitch 3/settings_system_control/screen.png](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/settings_system_control/screen.png)
- [stitch 3/settings_system_control/code.html](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/settings_system_control/code.html)

### Exit Criteria

- Schedule and Settings visually match the new quality bar without losing product truth

---

## Track 5: Prep, Physical, And Readiness Alignment

### Goal

Bring the remaining product surfaces into the new shell and component system without inventing new layout logic for each one.

### Deliverables

- aligned secondary screens
- consistent headers, cards, actions, and state treatments
- mobile-aware refinements

### Checklist

- [ ] Apply the updated shell, typography, and card system to Prep.
- [ ] Apply the updated shell, typography, and card system to Physical.
- [ ] Apply the updated shell, typography, and card system to Readiness.
- [ ] Make sure these pages inherit the new shared patterns rather than becoming bespoke redesigns.
- [ ] Check that health, readiness, and prep semantics remain honest and are not over-stylized.
- [ ] Confirm mobile and tablet versions feel intentional, not merely compressed.

### Visual Guidance

These screens should inherit the new system rather than chase separate Stitch directions.

Use:

- Today for action hierarchy cues
- Command Center for information-density cues
- Schedule/Settings for support-surface structure cues

### Exit Criteria

- every major app surface shares one coherent system while still keeping its functional personality

---

## Track 6: System-Wide Cleanup And Quality Pass

### Goal

Close the modernization with consistency, accessibility, and implementation honesty.

### Deliverables

- final cleanup pass
- design debt reduction
- regression-safe launch-quality UI state

### Checklist

- [ ] Review all status colors and semantic states for consistency.
- [ ] Review all spacing, radii, and typography usage for token drift.
- [ ] Remove remaining pill-heavy legacy components that clash with the new system.
- [ ] Run accessibility checks on:
  - contrast
  - focus states
  - labels
  - screen-reader status messaging
- [ ] Review desktop layouts on large monitors for composition balance.
- [ ] Review mobile layouts for installable-app quality.
- [ ] Review loading, empty, and error states for premium consistency.
- [ ] Confirm that no screen drifted into fictional UI semantics.

### Exit Criteria

- Forge has one coherent, premium, production-quality visual language across its working product surface

---

## Suggested Implementation Order Inside The Codebase

If this is executed incrementally, the recommended order is:

1. theme + tokens + shell primitives
2. nav rail + header
3. Today desktop + Today mobile
4. Command Center desktop + Command Center mobile
5. Schedule + Settings
6. Prep + Physical + Readiness
7. cleanup and consistency pass

## Validation Expectations

Each track should be validated with:

- desktop review on a large monitor
- mobile review in responsive mode and installed-PWA posture where applicable
- regression check against existing functionality
- visual comparison against the relevant Stitch reference files

Where practical, implementation reviews should ask:

- Did we preserve the shell/layout quality from the mock?
- Did we preserve real Forge semantics?
- Did we reduce visual repetition and pill fatigue?
- Does the screen feel better on large desktop?
- Does the mobile version feel intentionally designed?

## Completion Standard

This UI modernization track should only be considered complete when:

- the shell feels premium and anchored
- Today feels like the execution centerpiece
- Command Center feels like a serious intelligence surface
- Schedule and Settings feel upgraded, not left behind
- mobile and desktop both feel first-class
- the product looks more refined without becoming less honest
