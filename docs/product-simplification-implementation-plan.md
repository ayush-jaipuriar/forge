# Forge Product Simplification Implementation Plan

This document defines the implementation plan for the Forge product simplification stream.

It is a new dedicated roadmap stream.

It is not a minor polish pass on top of the current UI.

It is a coordinated restructuring of Forge around a simpler, more focused product shape.

## Why This Stream Exists

User feedback has been clear:

- the app feels cluttered
- too much is happening at once
- copy is too verbose
- the product intent is not obvious
- too many screens compete for attention
- the app feels more like a system showcase than a focused tool

The goal of this stream is to solve that at the product architecture level, not just at the cosmetic level.

## Locked Decisions

These decisions are now fixed for this implementation plan.

### 1. Stream shape

This is a **dedicated roadmap stream**.

It should be treated as a major product correction, not a minor cleanup.

### 2. Rollout shape

This will be implemented as **one coordinated change**.

That means:

- the new IA should land as one coherent user-facing model
- we should not drag users through a long transition where old and new product structures both exist visibly

### 3. Scope priority

This stream starts with **full IA restructuring from the start**.

That means:

- navigation reset
- route consolidation
- screen hierarchy reset
- product copy reset

### 4. Route strategy

Recommendation:

- remove old top-level routes from the primary IA early
- preserve some underlying implementation pieces temporarily where useful
- but do **not** keep the old route structure visible in the shipped experience

Reason:

- hiding old routes while leaving the IA psychologically intact usually creates a half-reset
- the user problem is confusion at the top-level product model, so the top-level product model has to change decisively

### 5. Plan contents

This implementation plan includes:

- product copy rewrite tasks
- route and IA changes
- screen merger strategy
- analytics and validation checkpoints
- rollout checkpoints for user retesting

## Simplified Target Product

Forge should be experienced as:

- a daily execution tool
- with planning support
- with a lightweight insights layer

Not as:

- a suite of multiple parallel product surfaces
- a systems console
- a product that requires understanding its internal ontology to use it

## Target IA

### New top-level navigation

1. `Today`
2. `Plan`
3. `Insights`
4. `Settings`

### Route mapping

#### Today

Absorbs the most important daily parts of:

- Today
- Physical
- lightweight daily Readiness

#### Plan

Absorbs:

- Schedule
- Prep

#### Insights

Absorbs:

- Command Center
- deeper Readiness

#### Settings

Keeps:

- account
- notifications
- calendar
- backup / restore

Moves advanced diagnostics and platform detail behind explicit progressive disclosure.

### Removed from top-level navigation

- About
- Prep
- Physical
- Readiness
- Command Center as a separate top-level identity

## Core Product Outcome

By the end of this stream, a first-time user should be able to answer:

1. What is Forge?
2. Where do I start?
3. What matters right now?
4. Where do I go if I want to plan?
5. Where do I go if I want deeper patterns?

in under 30 seconds.

## Workstreams

## 1. Product Framing Reset

### Goal

Make the product promise simple, visible, and consistent.

### Outcomes

- Forge no longer leads with broad “personal operating system” framing in the primary UX
- the app’s shell and primary surfaces consistently reinforce one main job
- copy becomes action-first instead of concept-first

### Checklist

- [ ] Rewrite the product positioning used in the shell and key page headers.
- [ ] Rewrite top-level page titles and descriptions to prioritize user action over system explanation.
- [ ] Reduce concept-heavy language like:
  - pressure
  - support layer
  - operational truth
  - capability boundary
  - scaffolding
  unless it is strictly necessary.
- [ ] Update product-facing copy in the README to reflect the simplified product shape.
- [ ] Ensure the simplified product promise is consistent across auth, shell, and primary screens.

### Primary files likely involved

- [README.md](/Users/ayushjaipuriar/Documents/GitHub/forge/README.md)
- [AppShell.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/components/layout/AppShell.tsx)
- [AuthPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/auth/pages/AuthPage.tsx)
- [TodayPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/today/pages/TodayPage.tsx)
- [SchedulePage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/schedule/pages/SchedulePage.tsx)
- [PrepPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/prep/pages/PrepPage.tsx)
- [CommandCenterPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/command-center/pages/CommandCenterPage.tsx)
- [ReadinessPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/readiness/pages/ReadinessPage.tsx)
- [SettingsPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/settings/pages/SettingsPage.tsx)

## 2. Top-Level IA Reset

### Goal

Replace the current wide navigation model with the simplified product structure in one coordinated change.

### Outcomes

- only four primary destinations remain
- the app stops reading like a suite of loosely related workspaces
- primary navigation becomes easier to understand and faster to scan

### Checklist

- [ ] Replace the current top-level navigation list with `Today / Plan / Insights / Settings`.
- [ ] Remove `About` from top-level navigation.
- [ ] Remove `Prep`, `Physical`, and `Readiness` as standalone top-level destinations.
- [ ] Remove `Command Center` as a standalone top-level identity and reposition it under `Insights`.
- [ ] Update shell active-route naming to match the simplified IA.
- [ ] Update mobile navigation to match the new IA exactly.
- [ ] Ensure old routes either redirect or are retired cleanly without user-facing dead ends.

### Primary files likely involved

- [navigation.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/app/router/navigation.ts)
- [AppRouter.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/app/router/AppRouter.tsx)
- [AppShell.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/components/layout/AppShell.tsx)

## 3. Today Consolidation

### Goal

Make Today the unmistakable center of gravity for the product.

### Outcomes

- Today becomes more obviously action-first
- physical execution support is integrated instead of separated
- daily readiness context is integrated instead of route-separated
- secondary support information becomes quieter and more compact

### Checklist

- [ ] Keep only the highest-value Today modules above the fold:
  - current mission
  - next action
  - main daily risk
  - agenda / execution list
- [ ] Fold the most useful physical support signals into Today.
- [ ] Fold the most useful daily readiness cues into Today.
- [ ] Reduce visible support/context stacks that compete with the main execution flow.
- [ ] Remove or collapse recommendation history and secondary detail modules that do not change immediate action.
- [ ] Ensure Today still works well on mobile without becoming a stack of equally weighted cards.

### Primary files likely involved

- [TodayPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/today/pages/TodayPage.tsx)
- [PhysicalPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/physical/pages/PhysicalPage.tsx)
- [ReadinessPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/readiness/pages/ReadinessPage.tsx)
- supporting Today components under [src/features/today/components](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/today/components)

## 4. Plan Consolidation

### Goal

Merge planning and prep into one coherent planning surface.

### Outcomes

- the user no longer sees weekly planning and prep progress as separate products
- the product starts to feel like one planning loop instead of multiple loosely related tools

### Recommended structure

Internal sections or tabs:

- `Week`
- `Prep`

### Checklist

- [ ] Create a new Plan route/page as the merged planning destination.
- [ ] Move Schedule’s weekly board and selected-day planning model into Plan.
- [ ] Move Prep’s topic progress and domain focus tools into Plan.
- [ ] Reduce duplicated framing across planning and prep.
- [ ] Reframe prep as support for planning quality, not a separate product identity.
- [ ] Ensure the merged surface has a clear primary entry point and does not become a two-screen collage.

### Primary files likely involved

- [SchedulePage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/schedule/pages/SchedulePage.tsx)
- [PrepPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/prep/pages/PrepPage.tsx)
- new merged route/page likely under `src/features/plan`

## 5. Insights Consolidation

### Goal

Turn analytics and deeper readiness into one interpretive decision surface.

### Outcomes

- users get one clear place for patterns and drift
- the product stops splitting “insight” into multiple top-level abstractions
- analytics become more decision-oriented

### Recommended structure

Internal sections or tabs:

- `Weekly`
- `Readiness`

### Checklist

- [ ] Create a new Insights route/page as the merged analytical destination.
- [ ] Move Command Center’s hero insight and trend surfaces into Insights.
- [ ] Move deeper Readiness content into Insights.
- [ ] Cut low-value or overly decorative analytics that do not help the user decide what to change.
- [ ] Keep the screen focused on:
  - what is improving
  - what is slipping
  - what should change
- [ ] Ensure the merged insights surface is still understandable on mobile.

### Primary files likely involved

- [CommandCenterPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/command-center/pages/CommandCenterPage.tsx)
- [ReadinessPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/readiness/pages/ReadinessPage.tsx)
- new merged route/page likely under `src/features/insights`

## 6. Settings Simplification

### Goal

Make Settings feel like a calm utility surface instead of a product-internal control room.

### Outcomes

- default Settings becomes smaller and easier to understand
- advanced/runtime/operator concerns are still available, but not dominant
- copy is significantly shorter and less system-heavy

### Checklist

- [ ] Reduce default Settings sections to:
  - account
  - notifications
  - calendar
  - backup / restore
- [ ] Move sync/platform/runtime/provider details under an explicit advanced section.
- [ ] Compress Settings copy aggressively.
- [ ] Remove repeated explanatory copy that does not change user action.
- [ ] Keep `Refresh from Cloud` and other recovery tools, but present them more quietly.
- [ ] Preserve honesty without making Settings feel like a diagnostics dashboard.

### Primary files likely involved

- [SettingsPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/settings/pages/SettingsPage.tsx)
- supporting hooks/components in `src/features/settings`

## 7. About Removal And Secondary Placement

### Goal

Remove About from the primary navigation without losing portfolio value.

### Outcomes

- the product feels less fragmented
- portfolio/showcase value remains accessible, but outside the primary task flow

### Checklist

- [ ] Remove About from top-level navigation.
- [ ] Move About to footer, profile menu, or secondary access path.
- [ ] Keep the page itself if useful for portfolio/reviewer context.
- [ ] Ensure its new access path does not distract from the core product flow.

### Primary files likely involved

- [navigation.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/app/router/navigation.ts)
- [AppRouter.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/app/router/AppRouter.tsx)
- [AboutPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/about/pages/AboutPage.tsx)

## 8. Cross-App Copy Compression

### Goal

Reduce the visible text burden across the entire app.

### Outcomes

- less reading before action
- fewer competing explanations
- stronger product confidence

### Checklist

- [ ] Reduce visible body copy volume on primary screens by roughly 40–60%.
- [ ] Replace system-language with user-language where possible.
- [ ] Ensure cards have one point, not three layers of explanation.
- [ ] Remove repeated explanatory patterns across merged surfaces.
- [ ] Audit titles, subtitles, helper text, and empty states for unnecessary narration.

### Primary files likely involved

- core pages
- shared primitives like:
  - [SectionHeader.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/components/common/SectionHeader.tsx)
  - [EmptyState.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/components/common/EmptyState.tsx)
  - [SurfaceCard.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/components/common/SurfaceCard.tsx)

## 9. Redirects, Legacy Routes, And Compatibility

### Goal

Deliver the new IA without leaving broken navigation paths behind.

### Outcomes

- old routes do not strand users
- external links and bookmarks fail gracefully
- the coordinated reset still feels reliable

### Checklist

- [ ] Decide which old routes redirect to their new destination.
- [ ] Decide which old routes are removed completely.
- [ ] Keep legacy compatibility only where it reduces user friction.
- [ ] Avoid keeping old route labels alive in the visible product model.

### Recommendation

Use redirects like:

- `/command-center` -> `/insights`
- `/schedule` -> `/plan`
- `/prep` -> `/plan`
- `/physical` -> `/`
- `/readiness` -> `/insights`

`/about` should move to a non-primary path rather than remain part of the main loop.

## 10. Validation And User Retesting

### Goal

Make simplification measurable, not just aesthetic.

### Checklist

- [ ] Capture before/after screenshots of the old and new IA.
- [ ] Run automated regression checks:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test:run`
  - `npm run build`
- [ ] Do real browser QA on desktop and mobile.
- [ ] Retest with users after the coordinated simplification lands.
- [ ] Ask the same core product questions:
  - what is this?
  - what should I do first?
  - where do I plan?
  - where do I see patterns?
- [ ] Compare confusion feedback before vs after.

### Recommended success criteria

- new users can explain Forge’s purpose in one sentence
- users can identify the main daily action surface immediately
- users no longer describe the app as cluttered or “too much”
- route-level confusion drops materially in retesting

## Delivery Phasing Within The Coordinated Change

Even though the user-facing rollout should feel like one coordinated change, implementation still needs internal sequencing.

### Internal sequence

1. shared product framing and navigation changes
2. Today consolidation
3. Plan consolidation
4. Insights consolidation
5. Settings simplification
6. route redirects and cleanup
7. QA and user retesting

This keeps implementation order stable while still delivering one coherent new product shape.

## Tradeoffs And Risks

### Risk 1: Temporary development complexity

Merging surfaces will temporarily make implementation more complex.

Accepted because:

- the current product complexity is already hurting user perception

### Risk 2: Reduced surface count may appear to reduce breadth

This may make the app look less broad at first glance.

Accepted because:

- clarity is more valuable than visible breadth
- engineering depth remains evident in the code, docs, and experience quality

### Risk 3: Merged surfaces can become overloaded if done poorly

The simplification only works if merged screens are restructured properly.

That means:

- fewer concepts
- stronger hierarchy
- less narration

not just placing two old screens into one route.

## Definition Of Done

This stream is complete when:

- Forge has only four primary destinations:
  - Today
  - Plan
  - Insights
  - Settings
- About is removed from primary navigation
- Today clearly owns the primary daily action job
- Schedule and Prep are merged coherently into Plan
- Command Center and deeper Readiness are merged coherently into Insights
- Settings is materially shorter, calmer, and more utility-first
- primary-screen copy is significantly reduced
- redirects/legacy behavior are handled cleanly
- automated checks are green
- desktop/mobile QA is complete
- user retesting confirms improved clarity and reduced clutter

## Recommended Next Step

The next implementation step after this plan should be:

1. approve the simplification stream
2. start a dedicated implementation sprint for:
   - navigation reset
   - Today consolidation
   - Settings simplification

That is the highest-leverage first milestone because it changes:

- what users think Forge is
- where they start
- how much clutter they see immediately
