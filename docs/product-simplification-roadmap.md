# Forge Product Simplification Roadmap

This document is a pragmatic but still ambitious simplification roadmap layered onto the current Forge codebase.

It is not a teardown of the engineering work already done.

It is a product reset recommendation for a clearer, more focused version of Forge that:

- addresses poor user feedback on clutter, verbosity, and lack of clarity
- preserves the strongest parts of the current implementation
- reduces cognitive load without discarding the app’s architecture
- balances real user value with portfolio/showcase value

## Executive Summary

The current version of Forge is trying to be too many things at once:

- a daily execution tool
- a weekly planner
- an interview prep workspace
- a physical/recovery tracker
- a readiness model
- a diagnostics and operator console
- a portfolio proof of architectural depth

That combination creates the exact user reaction that surfaced in testing:

- too much happening at once
- too much text
- too many concepts
- weak clarity about what the product is actually for
- weak prioritization of what matters most

The core issue is not simply “visual clutter.”

The core issue is **product clutter**.

Forge currently exposes too much of its internal model and too many secondary ideas at the primary interaction layer.

## Core Product Diagnosis

### 1. The product promise is too broad

Forge currently describes itself as:

- a personal execution system
- a prep tracker
- a physical training support system
- a readiness model
- a calendar pressure system
- a runtime-aware platform surface

Each of those is reasonable on its own.

Together, they make the product feel unfocused.

The user should not need to understand the full worldview of the system to get value from it.

### 2. The app exposes system sophistication instead of user clarity

A lot of the current UX is shaped by the internal model:

- pressure
- readiness
- support layer
- operational truth
- runtime posture
- platform capability boundary
- scaffolding
- diagnostics

These are useful internal concepts.

They are not all useful primary user concepts.

### 3. The information architecture is too wide

Forge currently has too many top-level routes for the amount of focus the product has earned:

- Today
- Command Center
- Schedule
- Prep
- Physical
- Readiness
- About
- Settings

This makes the app feel like a suite, not a focused product.

### 4. The app is trying to satisfy two audiences in the same UI layer

Forge is simultaneously trying to work for:

- real end users who want clarity and action
- recruiters/reviewers who should see depth and ambition

That leads to a conflict:

- users want less explanation and fewer surfaces
- reviewers currently see a lot of architecture and product breadth

The better solution is to keep the depth in the implementation and docs, not in every primary screen.

### 5. Too many screens are “second-order” screens

The current product has multiple screens that are meaningfully downstream of the same core data:

- Today
- Command Center
- Prep
- Physical
- Readiness

These can all be justified individually.

But when they all exist as first-class destinations, the product feels fragmented and over-modeled.

## Product Bugs

These are not only engineering bugs.

They are product bugs: behaviors that create confusion, hesitation, or loss of trust.

### Product Bug 1: Weak first-run clarity

A new user cannot quickly answer:

- what is Forge?
- what should I do first?
- why does this exist?

### Product Bug 2: Too much explanatory copy

Many screens use:

- eyebrow
- title
- descriptive sentence
- supporting explanation
- extra context line
- badge or state chip

That makes the app feel like it is constantly narrating itself.

### Product Bug 3: Primary action is diluted by supporting context

The core question should be:

- what do I do next?

Instead, many screens ask the user to also process:

- readiness
- support
- pressure
- sync
- platform
- planning nuance
- future capability boundaries

### Product Bug 4: Settings is acting like an internal operator console

Settings currently surfaces too much advanced/internal complexity for a normal user flow.

This creates:

- intimidation
- distrust
- the perception of instability
- the feeling that the app is unfinished or overengineered

### Product Bug 5: The product hierarchy is upside down

Too many secondary ideas are given first-class visual and navigational weight.

That makes users wonder whether they are missing something important or using the app incorrectly.

### Product Bug 6: The product is concept-dense instead of outcome-dense

The app often tells the user:

- what the system is modeling

instead of:

- what action the user should take
- what changed
- what matters now

## Product Positioning Recommendation

### Recommended primary product statement

Forge helps you run today clearly:

**what matters now, what is slipping, and what to do next.**

This should become the dominant product promise.

Everything else should support it.

### What Forge should become

Forge should be experienced as:

- a focused daily execution product
- with lightweight planning support
- and a clear insights layer

not as a full “personal operating system” on every screen.

### What stays true

These parts of Forge are still good differentiators:

- daily execution focus
- calendar-aware pressure
- prep as a real input, not a separate app
- physical/recovery as execution support
- local-first plus sync discipline

But they should become background structure, not foreground complexity.

## Proposed New Sitemap

This is the recommended aggressive-but-sane top-level simplification.

### New top-level navigation

1. `Today`
2. `Plan`
3. `Insights`
4. `Settings`

### Route mapping

#### Today

Primary daily action surface.

Absorbs the most important daily parts of:

- Today
- Physical
- parts of Readiness

#### Plan

Planning and adjustment surface.

Absorbs:

- Schedule
- Prep

with planning-first structure rather than separate route identity.

#### Insights

Interpretive and historical surface.

Absorbs:

- Command Center
- deeper Readiness views

This becomes the place for patterns, drift, momentum, and weekly adjustment.

#### Settings

Quiet account and integration surface.

Advanced diagnostics become hidden behind an explicit advanced/operator section.

### Navigation changes

Remove from primary nav:

- About
- Prep
- Physical
- Readiness
- Command Center as a separate label

Secondary placement:

- `About` should move to footer, profile menu, or external portfolio/docs entry
- advanced/operator views should sit under Settings

## Proposed New Screen Hierarchy

## 1. Today

### Purpose

Answer only:

- what should I do now?
- what is today’s main risk?
- what is the next best action?

### Core content

- current mission / current block
- next recommended action
- today’s main risk or blocker
- agenda / block list
- one compact daily support module

### Secondary content

- quick signals
- one short calendar pressure summary only if relevant
- one short execution support summary

### Remove or demote

- deep recommendation history
- large support/context stacks
- score subcomponent breakdowns
- excessive diagnostics
- any non-urgent runtime/sync noise

## 2. Plan

### Purpose

Help the user adjust the week and maintain coverage.

### Core content

- week view
- selected-day detail
- prep focus / topic pressure
- override decisions

### Structure

Tabs or internal sections:

- `Week`
- `Prep`

### Product rule

This screen should feel like:

- “how I keep the plan on track”

not:

- “multiple planning products stitched together”

## 3. Insights

### Purpose

Show patterns that matter for adjustment.

### Core content

- what is improving
- what is degrading
- what needs adjustment this week
- one or two trend groups

### Structure

Tabs or internal sections:

- `Weekly`
- `Readiness`

### Product rule

This screen should answer:

- “what do I change next?”

not:

- “what interesting analytics exist?”

## 4. Settings

### Purpose

Support account, integrations, recovery, and only essential operational controls.

### Default user sections

- account
- notifications
- calendar
- backup / restore

### Advanced section

Collapsed by default:

- sync diagnostics
- runtime/platform detail
- provider scaffolding
- advanced recovery information

## Screen-by-Screen Reduction Audit

## Today

### Current problem

Today is the most important surface, but it still contains too many parallel ideas.

### What to keep

- current execution block
- recommendation / next action
- block actions
- agenda
- one compact support signal area

### What to merge

- quick signals + mode override + execution context into one compact “Today context” module
- calendar pressure + support layer into one compact “Today support” module

### What to hide or demote

- recommendation history
- repeated score micro-breakdowns
- non-essential support explanations
- lower-value descriptive copy

### Desired outcome

A user should understand the page in 5–10 seconds.

## Command Center

### Current problem

It is visually capable but still too heavy and too concept-rich for its value.

### What to keep

- hero insight
- key warning/risk
- one or two trend families
- momentum / drift summary

### What to remove or reduce

- extra framing copy
- too many metric tiles
- overly dense chart groupings
- analytics that are interesting but not decision-driving

### Direction

Rename and reposition under `Insights`.

It should feel like a weekly decision surface, not a dashboard room.

## Schedule

### Current problem

Valuable, but too separate from prep and too structurally independent for its job.

### What to keep

- week board
- selected-day inspector
- override actions
- calendar pressure visibility

### What to change

Merge into `Plan`.

The selected-day detail should stop behaving like a near-separate screen inside the screen.

## Prep

### Current problem

Prep is meaningful, but as a standalone route it overstates its separateness from planning.

### What to keep

- topic progress
- confidence / exposure
- domain pressure

### What to change

Fold into `Plan`.

Use prep as planning support, not as a separate product area.

### Copy change

Reduce language about “readiness balance,” “domain reading,” and “prep map” unless it helps a decision immediately.

## Physical

### Current problem

It is thoughtfully designed, but users are unlikely to see why it deserves a separate destination.

### What to keep

- workout state
- short sleep log
- physical support summary

### What to change

Merge daily physical support into `Today`.

Only keep a deeper view if the product later proves this deserves its own module.

### Product rule

Physical should feel like execution support, not a separate subsystem.

## Readiness

### Current problem

Readiness is one abstraction too far forward in the current product.

### What to keep

- simple pace/risk summary
- domain weakness visibility
- one intervention view

### What to change

Split it:

- daily readiness cues move into `Today`
- weekly readiness trends move into `Insights`

### What to remove

- scaffold-heavy or model-heavy framing on the default path

## About

### Current problem

This should not be a primary navigation item in a product already struggling with focus.

### Recommendation

Remove from primary nav.

Keep it:

- in footer
- under profile/account menu
- or externally in docs/portfolio

## Settings

### Current problem

Settings is doing too much and talking too much.

### What to keep in default view

- sign-in/account
- notification toggle
- calendar connection
- backup / restore

### What to move under advanced

- operational diagnostics
- runtime/platform posture
- provider scaffolding
- detailed capability boundaries
- advanced sync explanations

### Copy rule

Settings should become:

- short
- calm
- utility-first

not a tour of the system’s internal honesty model.

## Copy Simplification Rules

These should become product-wide standards.

### Rule 1

Every card gets:

- one clear title
- one short consequence or explanation

not a paragraph.

### Rule 2

If a user does not need a concept to act, hide it.

### Rule 3

Use user-language first.

Prefer:

- “What needs attention”
- “What changed”
- “What to do next”

over:

- “operational truth”
- “support layer”
- “capability boundary”
- “intervention layer”
- “scaffolding”

### Rule 4

Advanced explanations should be:

- collapsed
- tooltip-level
- or documentation-level

not default page content.

### Rule 5

Reduce visible copy volume by roughly 40–60% across primary screens.

## UX and TPM Recommendations

## 1. Re-establish a primary KPI for the product

Recommended primary KPI:

- time to understand the product’s purpose

Secondary KPIs:

- time to identify next action on Today
- number of top-level screens a user needs in a normal session
- percentage of users who use secondary views intentionally vs accidentally

## 2. Distinguish system architecture from product architecture

The codebase can stay rich and well-layered.

The product should not expose that richness by default.

### TPM implication

Future delivery should separate:

- internal/system complexity
- user-facing complexity

as two different concerns.

## 3. Introduce progressive disclosure as a product rule

This is the main operational fix.

Show:

- the next thing
- the most important signal
- the one key supporting context

Hide:

- secondary analysis
- model details
- operator truth
- future boundaries

until explicitly requested.

## 4. Treat “focus” as a product requirement

Not every valid model deserves its own first-class route.

That should become an explicit roadmap gate for future work.

## 5. Preserve showcase value through docs and quality, not breadth in nav

Forge can still demonstrate:

- architecture
- sync depth
- platform thinking
- product systems thinking

without showing all of it in the primary IA.

## Recommended Implementation Sequence

## Phase A: Product framing reset

- rewrite product copy at shell and README level
- define Forge around the daily-execution job
- stop leading with “personal execution OS” language in primary UX

## Phase B: IA reduction

- move to `Today / Plan / Insights / Settings`
- remove `About` from main nav
- merge secondary routes conceptually

## Phase C: Today-first simplification

- reduce Today to action-first essentials
- merge or collapse secondary support modules
- demote low-value context

## Phase D: Settings simplification

- split default vs advanced
- compress copy heavily
- remove system-tour behavior

## Phase E: Plan and Insights consolidation

- merge Schedule + Prep
- merge Command Center + Readiness
- remove duplicate concepts across surfaces

## Recommendation on Existing UI Modernization Work

The UI modernization work was not wasted.

What should be preserved:

- improved shell quality
- improved visual hierarchy
- better desktop/mobile layout discipline
- calmer status surfaces

What should change next:

- fewer concepts
- fewer first-class routes
- less copy
- less visible systemness

## Final Recommendation

Forge should become a focused product with a clear center of gravity.

Right now it feels like:

- a daily tool
- plus a planning tool
- plus a diagnostics layer
- plus a portfolio system

The simplification strategy is to make the user experience feel like one product again.

The highest-value move is not more feature work.

It is:

- merging surfaces
- hiding complexity
- compressing copy
- promoting one primary workflow above all others

## Suggested Next Step

The best next step after this document is:

1. approve a simplified target IA
2. choose whether to implement it in one major simplification track or in phased route consolidation
3. start with `Today` and top-level navigation first, because that is where the user confusion is being created most strongly
