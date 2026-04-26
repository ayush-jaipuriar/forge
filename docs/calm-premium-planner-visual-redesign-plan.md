# Calm Premium Planner Visual Redesign Plan

## Status

Implementation in progress.

Sprint 0 has started to stabilize the authenticated online-only runtime before the visual redesign begins.

## Purpose

This document defines the next Forge visual redesign track after the product simplification stream.

The previous simplification work made the app structurally clearer, but user feedback and visual review show that the interface still feels:

- too cockpit-like
- too dense
- too dark
- too technical
- too card-heavy
- too status-heavy
- too repetitive across pages

The next step is not another copy cleanup sprint.

The next step is a deliberate visual reset toward a **calm premium planner with high-class taste**.

## Locked Direction

These decisions are locked for this plan:

- Visual direction: calm premium planner with an aesthetic, high-class taste.
- Theme direction: introduce a light mode and also soften the existing dark mode.
- Redesign aggressiveness: aggressive on visual hierarchy, card reduction, spacing, page structure, and theme; conservative on data models and business logic.
- Runtime direction: authenticated Forge should move to online-only for now; local persistence should remain only for demo/guest state, appearance preference, PWA shell startup, and explicitly non-authoritative caches.
- Rollout order: `Today` is the flagship redesign sprint and establishes the visual language for the rest of the app.
- QA requirement: each sprint includes automated verification and screenshot QA for desktop and mobile.

## Online-Only Product Pivot

### Why This Belongs In The Visual Redesign Track

The current offline/local-first architecture affects the UI directly.

When local state is stale, queued, degraded, or out of sync, Forge has to show extra sync posture, restore controls, status badges, and defensive copy. That makes the product feel more technical and cockpit-like.

Moving authenticated usage to online-only is not just an engineering simplification. It supports the calm planner direction by removing a large category of user-facing sync complexity.

### Current Offline/Local Architecture

The current app uses:

- IndexedDB via `idb` as the local repository layer.
- Local repositories for settings, day instances, calendar cache, health state, backup state, sync diagnostics, and sync queue.
- React Query hooks that mostly read from local repositories.
- Local-first writes that update IndexedDB first.
- A custom sync queue that later replays writes to Firestore.
- Firestore hydration and `onSnapshot` subscriptions that copy remote data back into IndexedDB.
- PWA service-worker caching that keeps the shell available after a successful online load.

Focused tests currently pass for the intended architecture:

- `src/tests/services/cloud-sync-service.spec.ts`
- `src/tests/sync-provider.spec.tsx`
- `src/tests/domain/sync-queue.spec.ts`
- `src/tests/services/day-execution.spec.ts`
- `src/tests/services/prep-progress.spec.ts`
- `src/tests/services/notification-preference.spec.ts`
- `src/tests/services/forge-db-reset.spec.ts`

Command used during planning:

- `npm run test:run -- src/tests/services/cloud-sync-service.spec.ts src/tests/sync-provider.spec.tsx src/tests/domain/sync-queue.spec.ts src/tests/services/day-execution.spec.ts src/tests/services/prep-progress.spec.ts src/tests/services/notification-preference.spec.ts src/tests/services/forge-db-reset.spec.ts`

Result:

- 7 files passed
- 20 tests passed

### Why It Still Feels Buggy

The tests show that the architecture has coverage, but the design is still fragile for real use.

Key risks found in code review:

- Authenticated reads still primarily come from IndexedDB, so local state can appear as truth even while online.
- Firestore hydrates into local state, but empty remote collections do not necessarily clear stale local records.
- IndexedDB is global to the browser profile, not clearly namespaced per authenticated user.
- Non-guest sign-out clears calendar session artifacts but does not reset the whole local workspace.
- Firestore bootstrap creates initial settings with server timestamps and without the full local `UserSettings` shape, which increases normalization complexity.
- The custom sync queue can enter degraded/failed states that require additional UX and recovery logic.
- Remote snapshots and queued local writes can race unless every timestamp and queue-clearing rule is perfect.
- PWA offline shell support is real, but Firestore offline persistence is not the source of truth; offline data behavior is mostly custom app logic.

This means offline support is not fake, but it is too expensive for the current product stage.

### Recommendation

Switch authenticated Forge to **online-only mode for now**.

Recommended target:

- Firestore is the source of truth for authenticated users.
- Authenticated route data loads from Firestore or live Firestore subscriptions.
- Authenticated writes write directly to Firestore.
- If the browser is offline, mutating controls are disabled with a calm message.
- IndexedDB is no longer treated as authoritative for authenticated user data.
- IndexedDB can remain for demo workspace, appearance preference, PWA shell metadata, backup staging, and explicitly temporary UI state.
- PWA service worker can still cache the app shell, but the product should clearly say that data actions require a connection.

Do not spend another sprint trying to perfect offline-first sync before the visual reset.

The offline-first path can be revisited later if:

- the product has stronger usage validation
- core Firestore-backed flows are stable
- there is a clear product requirement for offline mutation
- conflict resolution can be designed intentionally instead of patched around queues

### Online-Only Acceptance Criteria

- Authenticated users do not rely on local IndexedDB as source of truth.
- If offline, authenticated users see a calm read/connection state instead of stale confidence.
- Primary mutation buttons are disabled or clearly queued only if an explicit queue is intentionally retained.
- Cross-device updates appear from Firestore without manual refresh.
- Sign-out/sign-in cannot leak stale local workspace state across users.
- Settings no longer foregrounds offline queue/degraded sync concepts in normal use.
- Demo workspace remains local-only and clearly labelled as demo/local.

## Product Diagnosis

Forge is currently more understandable than it was before simplification, but it still looks like an internal operations console.

That creates a mismatch:

- The product promise is daily clarity.
- The UI mood is still command-center pressure.

Users are not only reacting to text. They are reacting to the visual density of the system.

### What Currently Does Not Work

- Too many bordered dark panels compete for attention.
- Too many small uppercase amber labels make every section feel equally technical.
- Amber is overused for brand, active state, buttons, warnings, labels, and borders.
- `Today` repeats the current block in the hero, main card, and agenda.
- The shell has too much persistent chrome for a four-route product.
- Mobile stacks desktop cards instead of becoming a focused handheld planner.
- `Insights` leads with alarm language and feels punitive.
- `Settings` still reads like an admin surface rather than a user utility page.
- The dark theme is visually heavy and cold, even with warmer amber accents.
- There is no light mode, which makes the app feel narrower and more niche than it needs to be.

## Target Experience

Forge should feel like:

- a focused daily planner
- a premium personal operating notebook
- calm but decisive
- warm, intentional, and spacious
- serious without being militarized
- intelligent without showing machinery
- useful within 10 seconds of opening

Forge should not feel like:

- a control room
- a diagnostics console
- a terminal dashboard
- a dense enterprise admin panel
- a pseudo-military execution system
- a portfolio demo trying to show every capability at once

## Design Principles

### 1. One Primary Thing Per Screen

Every primary route should answer one question first:

- `Today`: what should I do now?
- `Plan`: how should this week be shaped?
- `Insights`: what should I learn or adjust?
- `Settings`: what do I need to manage?

Secondary information should support the first answer, not compete with it.

### 2. Calm Before Density

The default view should feel calm. Depth can still exist, but it should be progressively revealed.

Use density only where the user is intentionally scanning a list, timeline, or history.

### 3. Cards Must Earn Their Border

Cards should indicate meaningful grouping or emphasis.

Do not put every section in a bordered panel by default.

Use alternatives:

- whitespace
- section dividers
- quiet rows
- inset groups
- timeline lines
- soft background blocks
- disclosure panels

### 4. Amber Is Reserved

Amber should primarily mean:

- primary action
- selected route
- current item
- rare high-priority emphasis

Amber should not be used on every label, border, chip, and caption.

### 5. Light And Dark Are Equal Citizens

Light mode is not an afterthought.

Dark mode should become warmer and softer, but light mode should establish the premium planner personality:

- warm paper
- soft ink
- restrained copper
- quiet slate
- generous spacing
- subtle surface depth

### 6. Mobile Is A Planner, Not A Shrunken Dashboard

Mobile should prioritize:

- one current action
- one next block
- one supporting signal
- minimal chrome
- thumb-safe actions

Avoid stacking every desktop module unchanged.

### 7. Preserve Product Honesty

The redesign should not invent fake data, fake AI, fake integrations, or decorative complexity.

It should make the real app feel better.

## Visual System Direction

### Light Mode Target

Light mode should become the primary expression of the calm premium planner direction.

Suggested palette:

- `paper`: warm ivory, not pure white
- `canvas`: muted stone
- `surface`: soft cream
- `raised`: warm off-white
- `ink`: deep charcoal
- `muted`: warm slate
- `accent`: desaturated copper
- `success`: muted sage
- `warning`: muted ochre
- `error`: softened clay red

Key qualities:

- low-glare
- editorial
- high contrast where needed
- subtle physicality
- no sterile SaaS white

### Dark Mode Target

Dark mode should remain available but become:

- warmer
- softer
- less black
- less blue-cockpit
- less border-heavy
- less amber-saturated

Suggested direction:

- background: espresso charcoal / warm graphite
- panels: warm slate, not navy-black
- text: warm cream, not stark white
- borders: softer and lower opacity
- accent: copper used sparingly

### Typography Direction

Current typography is serviceable, but it still feels dashboard-like.

Recommended target:

- keep a high-quality sans-serif dashboard-friendly family
- reduce overuse of uppercase labels
- increase optical spacing in body sections
- use larger, calmer titles with less aggressive tracking
- use tabular numerals only where numbers matter

Candidates:

- `Sora` is already available and can remain if tuned well.
- Consider replacing fallback-heavy `Plus Jakarta Sans` / `Inter` usage with a more deliberate stack using available project fonts first.
- Avoid serif fonts for the app UI.

### Component Shape Direction

Current radius is tight and technical.

Recommended:

- page hero containers: 18-24px
- major cards: 16-20px
- small tiles: 12-14px
- buttons: 12-14px
- chips: 999px only for small status pills, not every control

The goal is premium softness, not bubbly SaaS.

### Motion Direction

Motion should feel composed, not flashy.

Recommended:

- subtle page entrance
- soft stagger for major modules
- tactile button active states
- reduced-motion support preserved
- no perpetual decorative motion in primary productivity surfaces

## Information Architecture Impact

The four-route IA remains:

- `Today`
- `Plan`
- `Insights`
- `Settings`

Do not re-expand navigation.

The redesign should simplify each route's hierarchy within the existing IA.

## Proposed New Screen Hierarchy

### Today

Primary question:

> What should I do now?

Recommended hierarchy:

1. Current action card
2. Today's timeline
3. Supporting signals
4. Secondary detail

Changes:

- Merge hero and current execution into one `Now` module.
- Remove repeated `Deep Block 1` displays.
- Put one primary CTA in the current action module.
- Treat `Mark current block complete` as the main completion action, not a separate competing CTA beside a generic recommendation button.
- Convert signals into a small contextual strip or side note.
- Convert agenda into a calmer timeline with less card nesting.

### Plan

Primary question:

> How should this week be shaped?

Recommended hierarchy:

1. Week overview strip
2. Selected-day detail
3. Prep focus
4. Calendar constraints

Changes:

- Replace seven dense day cards with a lighter week strip.
- Make selected day the main object after the overview.
- Use a calendar-like rhythm instead of mini dashboards.
- Keep prep visible but not equal to every weekly metric.

### Insights

Primary question:

> What should I adjust?

Recommended hierarchy:

1. Calm summary
2. Top three insights
3. Trend / chart area
4. Detailed analysis

Changes:

- Stop leading with alarm-like headlines such as `Review needed now`.
- Use a more measured headline such as `Readiness pace needs attention`.
- Show `Why it matters` and `What to change` before raw charts.
- Reduce metric tiles in the first viewport.

### Settings

Primary question:

> What do I need to manage?

Recommended hierarchy:

1. Account and sync summary
2. Backup and restore
3. Calendar
4. Notifications
5. Appearance
6. Advanced details

Changes:

- Add appearance/theme selection.
- Move platform/runtime details further down.
- Reduce leading status badges.
- Keep recovery tools prominent but not visually alarming.

### Auth

Primary question:

> How do I enter Forge?

Recommended hierarchy:

1. Brand and product promise
2. Google sign-in
3. Demo workspace link

Changes:

- Make the card lighter and warmer in light mode.
- Reduce decorative background intensity.
- Keep demo text minimal.

## Sprint Breakdown

## Sprint 0: Authenticated Online-Only State Pivot

Detailed sprint plan:

- `docs/calm-premium-planner-sprint-0-online-only-plan.md`

Current status:

- Implementation pass complete for authenticated direct Firestore writes, offline write blocking, legacy queue quarantine, local workspace cleanup, and offline-disabled primary controls.
- Automated verification is green.
- Remaining source-of-truth follow-up is now split into Sprint 0.1:
  - `docs/calm-premium-planner-sprint-0-1-direct-read-hardening-plan.md`
  - Direct-read hardening is implemented and automated verification is green.
  - Dedicated Firestore read-error UI and Firestore-safe day-instance serialization were added during the hardening pass.
  - Authenticated desktop smoke QA passed for `Today`, `Plan`, and `Settings` in the signed-in Chrome session.
  - Remaining Sprint 0.1 follow-up is authenticated mobile and cross-device browser QA from an automation session that can establish auth cleanly.

### Goal

Remove the fragile local-first/offline-first architecture from authenticated product usage before the visual redesign depends on cleaner app states.

### Scope

- Make Firestore the authenticated source of truth.
- Stop treating IndexedDB as authoritative for authenticated settings and day instances.
- Keep local/demo mode working for the demo workspace.
- Keep appearance preference local.
- Keep PWA shell caching, but make data actions online-only.
- Remove or hide normal-user sync queue/degraded-state UI once it is no longer relevant.

### Relevant Files

- `src/services/sync/cloudSyncService.ts`
- `src/services/sync/SyncProvider.tsx`
- `src/services/sync/persistSyncableChange.ts`
- `src/services/sync/syncOrchestrator.ts`
- `src/services/routine/dayExecutionService.ts`
- `src/services/settings/settingsSyncPersistence.ts`
- `src/services/routine/routinePersistenceService.ts`
- `src/features/today/hooks/*`
- `src/features/plan/pages/PlanPage.tsx`
- `src/features/settings/pages/SettingsPage.tsx`
- `src/data/firebase/firestoreDayInstanceRepository.ts`
- `src/data/firebase/firestoreSettingsRepository.ts`
- `src/data/local/*`
- sync and persistence tests

### Implementation Checklist

- [ ] Define `authenticatedOnlineOnly` behavior explicitly in code and docs.
- [ ] Add a small source-of-truth service boundary for authenticated reads/writes.
- [ ] Route authenticated `Today`, `Plan`, `Insights`, and `Settings` data through Firestore-backed reads or live subscriptions.
- [ ] Keep guest/demo workspace on local repositories.
- [ ] Disable authenticated write actions when `navigator.onLine === false`.
- [ ] Replace queue/degraded-state UI with a calm online-required state for authenticated users.
- [ ] Reset or ignore stale authenticated local data on sign-out/sign-in.
- [ ] Keep local theme preference independent from auth data.
- [ ] Preserve manual backup/export behavior if it depends on a loaded online snapshot.
- [ ] Remove or quarantine sync queue behavior from authenticated primary mutations.
- [ ] Update docs to state that offline shell is supported but authenticated data requires connection.

### QA Checklist

- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm run test:run`
- [ ] `npm run build`
- [ ] Browser QA: authenticated online load.
- [ ] Browser QA: cross-device/live Firestore update where practical.
- [ ] Browser QA: offline authenticated state disables mutation and avoids stale confidence.
- [ ] Browser QA: guest/demo workspace still works locally.
- [ ] Browser QA: sign-out/sign-in does not show stale previous workspace state.

### Acceptance Criteria

- Authenticated Forge is online-only and honest about requiring connection.
- Firestore is the source of truth for authenticated user state.
- Local repositories no longer create cross-device confusion in the primary product path.
- The UI can remove normal-user sync/degraded/offline queue clutter in later visual sprints.

## Sprint 1: Visual System Foundation And Theme Architecture

### Goal

Create the design-token and theme foundation for a calm premium planner with light mode and softened dark mode.

### Scope

- Introduce color-mode state.
- Add light mode tokens.
- Soften dark mode tokens.
- Add shared semantic tokens for surface hierarchy.
- Add an appearance control in Settings.
- Preserve current functionality and data flows.

### Relevant Files

- `src/app/theme/tokens.ts`
- `src/app/theme/theme.ts`
- `src/app/providers/AppProviders.tsx`
- `src/features/settings/pages/SettingsPage.tsx`
- `src/components/common/SurfaceCard.tsx`
- `src/components/common/MetricTile.tsx`
- `src/index.css`
- settings tests

### Implementation Checklist

- [ ] Define semantic tokens for `canvas`, `paper`, `surface`, `raised`, `border`, `accent`, and `muted`.
- [ ] Add light mode palette.
- [ ] Replace overly cold dark tokens with warmer dark tokens.
- [ ] Add theme-mode persistence.
- [ ] Add Settings appearance section.
- [ ] Ensure PWA/browser reload preserves selected theme.
- [ ] Reduce global amber use in theme defaults.
- [ ] Preserve visible focus states in both themes.
- [ ] Verify contrast for primary text, secondary text, buttons, and chips.

### QA Checklist

- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm run test:run`
- [ ] `npm run build`
- [ ] Screenshot QA: Settings light desktop/mobile.
- [ ] Screenshot QA: Settings dark desktop/mobile.
- [ ] Screenshot QA: Auth light/dark.

### Acceptance Criteria

- Light mode exists and feels intentional, not inverted.
- Dark mode feels warmer and less cockpit-like.
- Theme selection persists.
- Existing routes remain functional.

## Sprint 2: Shared Component De-Dashboarding

### Goal

Reduce the system-wide card/border/dashboard feeling before redesigning individual pages deeply.

### Scope

- Redesign `SurfaceCard`.
- Add lighter primitives for sections, rows, timelines, and quiet groups.
- Reduce uppercase label defaults.
- Normalize button, chip, and metric treatments.

### Relevant Files

- `src/components/common/SurfaceCard.tsx`
- `src/components/common/MetricTile.tsx`
- `src/components/common/SectionHeader.tsx`
- `src/components/common/EmptyState.tsx`
- `src/components/status/StatusBadge.tsx`
- `src/components/status/SyncIndicator.tsx`
- `src/app/theme/theme.ts`
- `src/app/theme/tokens.ts`

### Implementation Checklist

- [ ] Add a `surface` variant for quiet sections.
- [ ] Add a `feature` or `hero` variant for high-emphasis modules.
- [ ] Add a `plain` variant for low-emphasis groups without heavy borders.
- [ ] Reduce default card shadow and border strength.
- [ ] Make metric tiles calmer and less boxed-in.
- [ ] Reduce uppercase label usage in shared primitives.
- [ ] Ensure buttons have tactile hover/active states in both themes.
- [ ] Ensure chips are not visually louder than their content.

### QA Checklist

- [ ] Component regression tests remain green.
- [ ] Primary pages still render without layout breakage.
- [ ] Light/dark screenshots show visual consistency.

### Acceptance Criteria

- Shared primitives support calmer layouts without one-off styling.
- Pages can mix emphasis levels instead of rendering every module as the same card.

## Sprint 3: Today Flagship Redesign

### Goal

Make `Today` the flagship expression of the new calm premium planner direction.

### Scope

- Merge hero and current execution.
- Remove repeated current-block hierarchy.
- Rebuild agenda as a calmer timeline.
- Reposition signals as contextual support.
- Optimize mobile as a first-class Today experience.

### Relevant Files

- `src/features/today/pages/TodayPage.tsx`
- `src/features/today/components/FallbackModeSuggestionCard.tsx`
- `src/components/common/SurfaceCard.tsx`
- Today tests
- app route/browser QA scripts or screenshot workflow

### Implementation Checklist

- [ ] Create a single top `Now` module.
- [ ] Show one current block title once in the first viewport.
- [ ] Put primary action and completion action in a clear hierarchy.
- [ ] Convert agenda items into a timeline/list, not repeated large cards.
- [ ] Move signals into a compact support panel.
- [ ] Reduce chip count in the first viewport.
- [ ] Add mobile-specific ordering for `Now`, next action, agenda, and signals.
- [ ] Add sufficient bottom padding for mobile nav.
- [ ] Verify empty/loading/error states match the new visual language.

### QA Checklist

- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm run test:run -- src/tests/app.spec.tsx`
- [ ] `npm run test:run`
- [ ] `npm run build`
- [ ] Screenshot QA: Today light desktop.
- [ ] Screenshot QA: Today light mobile.
- [ ] Screenshot QA: Today dark desktop.
- [ ] Screenshot QA: Today dark mobile.

### Acceptance Criteria

- A user can understand the current action within 5 seconds.
- Current block is not repeated across competing modules.
- Mobile top screen feels intentionally designed, not stacked.
- Today becomes the visual north star for later pages.

## Sprint 4: Shell And Navigation Calm Pass

### Goal

Reduce persistent chrome and make navigation feel premium, quiet, and proportional to a four-route product.

### Scope

- Rework desktop shell density.
- Rework mobile top bar and bottom nav.
- Reduce status chip prominence.
- Add theme-aware shell styling.
- Preserve route compatibility and accessibility.

### Relevant Files

- `src/components/layout/AppShell.tsx`
- `src/app/router/navigation.ts`
- `src/components/status/SyncIndicator.tsx`
- `src/components/status/StatusBadge.tsx`
- shell/navigation tests

### Implementation Checklist

- [ ] Reduce desktop left rail visual weight.
- [ ] Reconsider whether About belongs in the persistent rail or secondary menu.
- [ ] Make active nav state quieter and less blocky.
- [ ] Reduce top status badges to compact, optional indicators.
- [ ] Ensure mobile header does not dominate first viewport.
- [ ] Ensure bottom nav does not overlap key CTAs.
- [ ] Add clear keyboard focus and aria labels.
- [ ] Confirm legacy redirects still land correctly.

### QA Checklist

- [ ] Desktop screenshot QA for all primary routes.
- [ ] Mobile screenshot QA for all primary routes.
- [ ] Keyboard navigation smoke test.
- [ ] Route redirect browser QA.

### Acceptance Criteria

- The shell feels like a calm product frame, not a system console.
- Navigation is obvious but not visually louder than page content.

## Sprint 5: Plan Redesign

### Goal

Turn `Plan` into a calm weekly planning surface instead of a row of dense mini dashboards.

### Scope

- Replace dense seven-card board with a lighter weekly rhythm view.
- Emphasize selected-day detail.
- Make prep focus and calendar constraints secondary but discoverable.
- Preserve all existing planning actions.

### Relevant Files

- `src/features/plan/pages/PlanPage.tsx`
- `src/features/schedule/pages/SchedulePage.tsx`
- `src/features/prep/pages/PrepPage.tsx`
- plan/schedule/prep tests

### Implementation Checklist

- [ ] Replace week cards with compact day strip or calendar rhythm.
- [ ] Make selected day the primary working area.
- [ ] Reduce repeated labels and chips in day summaries.
- [ ] Move prep focus below selected-day planning on mobile.
- [ ] Keep constraints visible without making them the page mood.
- [ ] Validate empty and low-data states.

### QA Checklist

- [ ] Plan tests updated and passing.
- [ ] Legacy `/schedule` and `/prep` redirect checks.
- [ ] Screenshot QA: Plan light/dark desktop.
- [ ] Screenshot QA: Plan light/dark mobile.

### Acceptance Criteria

- Plan reads as one calm weekly workflow.
- The user can quickly select a day and understand what to adjust.

## Sprint 6: Insights Redesign

### Goal

Make `Insights` feel like a helpful reflection surface, not an alarm dashboard.

### Scope

- Calm the leading summary.
- Prioritize top insights before charts.
- Reduce first-viewport metric density.
- Make charts and detailed analysis feel optional but valuable.

### Relevant Files

- `src/features/insights/pages/InsightsPage.tsx`
- `src/features/command-center/pages/CommandCenterPage.tsx`
- `src/features/command-center/components/*`
- analytics/insights tests

### Implementation Checklist

- [ ] Replace alarm-like hero hierarchy.
- [ ] Add `What changed`, `Why it matters`, and `What to adjust` framing.
- [ ] Limit first viewport to the top 2-3 most useful signals.
- [ ] Move raw metrics below insight summary.
- [ ] Improve chart visual treatment for light and dark themes.
- [ ] Preserve analytics depth below the fold.

### QA Checklist

- [ ] Insights tests updated and passing.
- [ ] Legacy `/command-center` and `/readiness` redirect checks.
- [ ] Screenshot QA: Insights light/dark desktop.
- [ ] Screenshot QA: Insights light/dark mobile.

### Acceptance Criteria

- Insights feels constructive, not punitive.
- The user understands the recommended adjustment before reading charts.

## Sprint 7: Settings And Auth Premium Utility Pass

### Goal

Make Settings and Auth feel calm, trustworthy, and user-oriented.

### Scope

- Reorganize Settings around user tasks.
- Finalize Appearance controls.
- Calm advanced/platform sections.
- Refresh Auth visual treatment in both themes.

### Relevant Files

- `src/features/settings/pages/SettingsPage.tsx`
- `src/features/auth/pages/AuthPage.tsx`
- platform capability/status models
- settings/auth tests

### Implementation Checklist

- [ ] Lead Settings with user tasks, not system state.
- [ ] Keep Backup and Calendar easy to find.
- [ ] Move runtime/platform detail further into advanced disclosure.
- [ ] Ensure Appearance controls are clear and persistent.
- [ ] Make Auth card warmer and simpler in light mode.
- [ ] Preserve Google sign-in and demo workspace behavior.
- [ ] Reduce decorative auth background intensity.

### QA Checklist

- [ ] Auth tests passing.
- [ ] Settings tests passing.
- [ ] Browser QA for signed-out auth in light/dark.
- [ ] Browser QA for authenticated Settings in light/dark.

### Acceptance Criteria

- Settings feels like utility management, not admin diagnostics.
- Auth feels polished enough for first impression use.

## Sprint 8: Cross-App Visual QA And Release Candidate

### Goal

Close visual seams after all primary routes are redesigned.

### Scope

- Cross-route consistency pass.
- Light/dark parity pass.
- Mobile polish.
- Empty/loading/error state polish.
- Accessibility and screenshot QA.
- Production deployment readiness.

### Relevant Files

- all primary route pages
- shared components
- theme files
- tests
- docs

### Implementation Checklist

- [ ] Audit all primary routes in light mode.
- [ ] Audit all primary routes in dark mode.
- [ ] Audit mobile first viewport for all primary routes.
- [ ] Remove remaining cockpit/system visual language.
- [ ] Verify no primary CTA is hidden behind bottom nav.
- [ ] Verify loading states are skeleton-like or calm, not spinner-heavy.
- [ ] Verify error and empty states are helpful and plain.
- [ ] Update final visual QA docs.

### QA Checklist

- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm run test:run`
- [ ] `npm run build`
- [ ] Browser QA: all primary routes, light desktop.
- [ ] Browser QA: all primary routes, light mobile.
- [ ] Browser QA: all primary routes, dark desktop.
- [ ] Browser QA: all primary routes, dark mobile.
- [ ] Browser QA: auth signed-out, light/dark.
- [ ] Browser QA: legacy redirects.

### Acceptance Criteria

- Forge no longer visually reads as a cockpit.
- Light mode feels first-class.
- Dark mode feels warm and premium.
- Today, Plan, Insights, and Settings feel like one coherent product.
- Product depth remains available without dominating the primary UX.

## Visual Acceptance Rubric

Each sprint should be judged against this rubric:

- Clarity: can the user identify the main action or read within 5 seconds?
- Calm: does the page avoid unnecessary urgency and chrome?
- Taste: does the page feel intentional and premium rather than generic?
- Hierarchy: is there a clear first, second, and third read?
- Restraint: are cards, borders, chips, labels, and amber accents used sparingly?
- Mobile parity: does mobile feel designed rather than stacked?
- Light/dark parity: do both modes feel complete?
- Accessibility: are contrast, focus, labels, and touch targets acceptable?

## Automation Requirements

Every implementation sprint must include:

- unit/component tests where behavior or labels change
- full suite before completion unless the sprint is explicitly docs-only
- production build before completion
- browser screenshots for changed primary routes
- desktop and mobile screenshots
- light and dark screenshots after theme mode exists
- route redirect checks when shell or router behavior changes

Suggested screenshot location:

- `output/playwright/calm-premium-planner-sprint-{n}/`

These artifacts should remain ignored by git.

## Out Of Scope

- New data models.
- New Firebase architecture.
- New analytics logic.
- New health provider integrations.
- New native shell work.
- Re-expanding navigation.
- Rewriting the app from scratch.
- Introducing fake AI, fake integrations, or decorative data.

## Key Risks

### Risk 1: Light mode becomes a plain SaaS theme

Mitigation:

- Use warm paper/stone tokens.
- Avoid pure white.
- Avoid generic blue accents.
- Keep Forge's copper identity, but restrained.

### Risk 2: Dark mode remains cockpit-like

Mitigation:

- Warm the base colors.
- Lower border contrast.
- Reduce amber label frequency.
- Remove unnecessary status chips.

### Risk 3: Theme work creates broad regressions

Mitigation:

- Start with token architecture.
- Keep data/business logic unchanged.
- Test route-by-route.

### Risk 4: Redesign becomes another visual-only pass without product clarity

Mitigation:

- Start with `Today`.
- Enforce one-primary-question hierarchy per route.
- Use visual acceptance criteria in every sprint.

## Recommended Immediate Next Step

Begin with Sprint 0 after this plan is approved:

- authenticated online-only state pivot
- Firestore source-of-truth cleanup
- removal or quarantine of fragile offline queue UX from authenticated primary flow

Then move to Sprint 1:

- theme architecture
- light mode
- softened dark mode
- appearance setting
- shared token foundation

Do not start with individual page restyling before the online-only state pivot and theme foundations exist, or the redesign will keep inheriting stale sync states and one-off visual patches.
