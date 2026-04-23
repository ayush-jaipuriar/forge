# Product Simplification Sprint 4 Plan: Unified Insights Surface

## Status

Implemented and ready for review.

Sprint 4 has moved `Insights` from a tab wrapper around legacy `Command Center` and `Readiness` pages into one unified analysis surface.

## Sprint Goal

Turn `Insights` from a tab wrapper around `Command Center` and `Readiness` into one coherent analysis surface.

The user-facing goal is:

> Help the user see what is improving, what is slipping, and what to change without splitting analytics and readiness into separate products.

## Locked Scope Decisions

These decisions were confirmed before writing this plan.

- Fully merge `Command Center` and `Readiness` into `Insights`.
- Preserve analytics/dashboard depth.
- Aggressively reduce jargon and old product labels.
- Treat desktop and mobile as equal implementation milestones.
- Include visual cleanup when charts/cards feel cluttered.
- Require browser screenshot automation before marking the sprint complete.

## Current Problem

Sprint 1 simplified navigation, but `Insights` is still transitional.

The current `Insights` page:

- has `Weekly` and `Readiness` tabs
- renders full `CommandCenterPage` or full `ReadinessPage`
- keeps the old mental model alive
- separates analytics from readiness even though users need one interpretation loop
- keeps too much internal/product-system language in visible headings

This creates a user experience where `Insights` is technically one route but still feels like two products.

## Desired Product Model

`Insights` should answer five questions in one scan:

- What is the current pattern?
- Is the target/readiness pace healthy?
- What is improving?
- What is slipping?
- What should I change next?

The page should preserve analytics depth, but the default hierarchy should make interpretation easier than exploration.

## Target Screen Hierarchy

### Desktop

Recommended desktop hierarchy:

- Header: short title, current window, data confidence, compact window controls.
- Summary band: one decision-oriented readout using coach summary, momentum, readiness, and warnings.
- Primary insight grid: readiness pace, daily score trend, deep work trend, and prep distribution.
- Right rail: readiness target posture, active risks, and emerging signals.
- Secondary analytics: comparisons, heatmaps, streaks, missions, and domain balance.
- Readiness detail: domain readiness and recovery-provider boundary, integrated lower on the page.

Desktop should feel like a high-density analysis console, not a card dump. The main analytics area should keep enough depth for portfolio value, while the right rail keeps the page decision-oriented.

### Mobile

Recommended mobile hierarchy:

- Header: compact title and data state.
- Window selector.
- Summary readout.
- Readiness pace and main warning.
- Primary charts.
- Domain readiness.
- Secondary analytics.

Mobile should not render a full desktop dashboard stack unchanged. The sequence should prioritize interpretation before chart depth.

## In Scope

### 1. Insights Page Architecture

- Replace tab-first `InsightsPage` with a unified page.
- Consume `useCommandCenterWorkspace` and `useReadinessWorkspace` directly.
- Keep rolling-window selection.
- Keep route query compatibility for `?view=weekly` and `?view=readiness` without preserving tabs.

Checklist:

- [ ] Remove top-level `Weekly` / `Readiness` tab dependency.
- [ ] Build one unified Insights layout.
- [ ] Keep analytics and readiness loading/error states clear.
- [ ] Preserve rolling window selection.
- [ ] Preserve legacy route compatibility.

### 2. Decision Summary

- Make the top of Insights explain the current pattern in plain language.
- Use analytics coach summary, momentum, projection, readiness pressure, and warnings.
- Remove old labels like `Command Center`, `Strategic Summary`, and `Operating Tier` from the default user-facing copy unless they are genuinely useful.

Checklist:

- [ ] Replace current wrapper hero with a concise Insights hero.
- [ ] Show data state and rolling window.
- [ ] Show current pattern summary.
- [ ] Show readiness/target posture near the summary.
- [ ] Keep warnings visible without making the page feel alarmist.

### 3. Analytics Depth Preservation

- Keep the strongest existing analytics surfaces.
- Make chart grouping more intentional.
- Avoid deleting depth just because the page is being simplified.

Primary analytics to preserve:

- readiness/projection curve
- daily score trend
- deep work trend
- prep hours by topic
- sleep/performance comparison
- WFO/WFH comparison
- time-window execution reliability
- prep domain attention
- workout/productivity comparison
- completion heatmap
- streak calendar
- weekly missions

Checklist:

- [ ] Preserve primary charts.
- [ ] Preserve supporting comparison charts.
- [ ] Preserve streaks and missions.
- [ ] Preserve chart empty/stale states.
- [ ] Group charts by decision value rather than historical feature boundary.

### 4. Readiness Integration

- Fold readiness into Insights as target pace and domain readiness, not a separate tab.
- Keep target date, days remaining, coverage, required pace, domain states, and intervention signals.
- Keep health-provider/recovery scaffolding honest and lower priority.

Checklist:

- [ ] Show readiness target posture in the main Insights hierarchy.
- [ ] Show domain readiness in a compact integrated section.
- [ ] Surface readiness intervention signals near analytics warnings.
- [ ] Move health-provider scaffolding lower and keep it concise.
- [ ] Avoid pretending provider data is connected when it is only scaffolded.

### 5. Copy And Label Reduction

- Remove or reduce internal terms.
- Use product-facing labels that explain what the user can learn.
- Keep analytics precise without sounding like a system log.

Terms to reduce or replace where practical:

- `Command Center`
- `Operating Tier`
- `Strategic Summary`
- `Primary Diagnostics`
- `Support Analytics`
- `Risk Stack`
- `Insight Stack`
- `Intervention Layer`
- `Recovery Signal Scaffolding`

Checklist:

- [ ] Rewrite Insights header.
- [ ] Rewrite major section headings.
- [ ] Shorten chart descriptions.
- [ ] Remove repeated explanation.
- [ ] Keep empty/error copy clear but brief.

### 6. Visual Cleanup

- Reduce card-on-card clutter.
- Use fewer large bordered containers where simple layout is enough.
- Keep charts readable.
- Keep the most important cards visually dominant.

Checklist:

- [ ] Review whether nested `SurfaceCard` use creates clutter.
- [ ] Tighten chart grouping and spacing.
- [ ] Ensure primary charts have stronger hierarchy than secondary charts.
- [ ] Avoid huge vertical gaps or narrow stacked panels on desktop.
- [ ] Avoid overly long chart walls on mobile where possible.

### 7. Responsive And Browser QA

- Desktop and mobile must both be verified.
- Browser screenshot audit is required before completion.
- Use the Chrome DevTools Protocol fallback if the normal Playwright MCP connector cannot attach.

Checklist:

- [ ] Capture desktop screenshot at a common monitor width.
- [ ] Capture mobile screenshot at a phone viewport.
- [ ] Inspect layout geometry and screenshots.
- [ ] Fix observed desktop/mobile layout issues.
- [ ] Store final screenshots outside the git worktree or in ignored output only.

## Out Of Scope

- Settings simplification.
- Full product-wide copy rewrite.
- New analytics rules.
- New readiness scoring model.
- New health-provider integration.
- New charting library.
- Native shell-specific redesign.

## Reference Files

Primary implementation references:

- `src/features/insights/pages/InsightsPage.tsx`
- `src/features/command-center/pages/CommandCenterPage.tsx`
- `src/features/readiness/pages/ReadinessPage.tsx`
- `src/features/command-center/hooks/useCommandCenterWorkspace.ts`
- `src/features/readiness/hooks/useReadinessWorkspace.ts`
- `src/services/analytics/commandCenterWorkspaceService.ts`
- `src/services/readiness/readinessPersistenceService.ts`

Chart and analytics component references:

- `src/features/command-center/components/AnalyticsMetricTile.tsx`
- `src/features/command-center/components/AnalyticsStateNotice.tsx`
- `src/features/command-center/components/ChartCard.tsx`
- `src/features/command-center/components/ComparisonBars.tsx`
- `src/features/command-center/components/CurveChart.tsx`
- `src/features/command-center/components/DistributionBars.tsx`
- `src/features/command-center/components/HeatmapCalendar.tsx`
- `src/features/command-center/components/InsightCard.tsx`
- `src/features/command-center/components/MiniTrendChart.tsx`
- `src/features/command-center/components/MissionCard.tsx`
- `src/features/command-center/components/MomentumPanel.tsx`
- `src/features/command-center/components/ProjectionPanel.tsx`
- `src/features/command-center/components/StreakSummaryList.tsx`
- `src/features/command-center/components/WarningCard.tsx`

Shared UI references:

- `src/components/common/SurfaceCard.tsx`
- `src/components/common/SectionHeader.tsx`
- `src/components/common/MetricTile.tsx`
- `src/components/common/OperationalSignalCard.tsx`
- `src/components/common/EmptyState.tsx`

Test references:

- `src/tests/app.spec.tsx`
- `src/tests/readiness-page.spec.tsx`
- existing command-center or analytics tests under `src/tests`
- new `src/tests/insights-page.spec.tsx`

Documentation references:

- `docs/product-simplification-roadmap.md`
- `docs/product-simplification-implementation-plan.md`
- `docs/product-simplification-milestone-breakdown.md`
- `docs/product-simplification-sprint-3-plan.md`

## Recommended Implementation Sequence

### Step 1: Map Existing Data Into One Insights Model

Use existing hooks and data as the source of truth.

Checklist:

- [ ] Load command-center workspace from `useCommandCenterWorkspace`.
- [ ] Load readiness workspace from `useReadinessWorkspace`.
- [ ] Preserve rolling-window selector state.
- [ ] Derive summary metrics locally in `InsightsPage` only where simple.
- [ ] Avoid changing analytics/readiness domain rules.

### Step 2: Build Unified Insights Shell

Replace tabs with one page.

Checklist:

- [ ] Add unified hero/summary band.
- [ ] Add primary analytics section.
- [ ] Add readiness target posture section.
- [ ] Add risks/signals rail.
- [ ] Add secondary analytics section.
- [ ] Add domain readiness section.

### Step 3: Preserve Analytics Depth With Better Grouping

Recompose existing chart components in a cleaner hierarchy.

Checklist:

- [ ] Group projection, score, deep work, and prep topic hours as primary charts.
- [ ] Group comparisons and heatmaps as supporting analysis.
- [ ] Group streaks and missions as continuity.
- [ ] Keep stale/empty chart state behavior.

### Step 4: Integrate Readiness Detail

Bring readiness into the page without duplicating dashboard clutter.

Checklist:

- [ ] Add target date, days remaining, pressure, coverage, and required pace.
- [ ] Add domain readiness cards or rows.
- [ ] Add readiness operational signals near warnings.
- [ ] Add concise health-provider boundary section lower on page.

### Step 5: Compress Copy And Remove Old Product Language

Make Insights feel understandable without removing depth.

Checklist:

- [ ] Replace old section labels.
- [ ] Shorten chart descriptions.
- [ ] Remove repeated conceptual framing.
- [ ] Use direct labels like `Pattern`, `Pace`, `Risk`, `Trends`, `Domain readiness`.

### Step 6: Update Tests

Add coverage for the new unified behavior.

Checklist:

- [ ] Add `insights-page.spec.tsx`.
- [ ] Update `app.spec.tsx` for no Insights tabs.
- [ ] Verify legacy `/command-center` redirect.
- [ ] Verify legacy `/readiness` redirect.
- [ ] Verify readiness and analytics content render together.

### Step 7: Run Verification And Browser Audit

Checklist:

- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm run test:run`
- [ ] `npm run build`
- [ ] Desktop screenshot audit
- [ ] Mobile screenshot audit
- [ ] Fix any observed layout issues
- [ ] Rerun affected checks after fixes

## Acceptance Criteria

The sprint is complete when:

- `Insights` no longer has `Weekly` and `Readiness` tabs.
- Analytics and readiness render together in one coherent workflow.
- Analytics depth is preserved.
- Old product labels and jargon are reduced.
- Readiness target posture is visible without requiring a separate route.
- Domain readiness is visible but not overbearing.
- Health-provider scaffolding is honest and lower priority.
- Desktop layout uses width intentionally.
- Mobile layout prioritizes interpretation before chart depth.
- Legacy redirects still work.
- Automated tests and production build pass.
- Desktop/mobile screenshot audit is complete.
- Documentation records final implementation and QA results.

## Risks And Mitigations

### Risk: Simplification removes too much analytics value

Mitigation:

- Preserve existing chart components and data.
- Change grouping and hierarchy before removing analytics surfaces.

### Risk: Insights becomes a very long dashboard

Mitigation:

- Put interpretation first.
- Use primary/supporting/continuity/readiness sections.
- Keep mobile ordering strict.

### Risk: Readiness feels bolted on

Mitigation:

- Place target posture near the top.
- Merge readiness signals with warnings.
- Put domain readiness in the main Insights story, not a final appendix.

### Risk: Jargon removal makes analytics less precise

Mitigation:

- Keep technical precision inside values, chart labels, and empty states.
- Rewrite headings and descriptions, not data semantics.

## Implementation Progress Checklist

- [x] Plan approved.
- [x] Unified Insights architecture implemented.
- [x] Tabs removed from primary Insights experience.
- [x] Analytics depth preserved.
- [x] Readiness target posture integrated.
- [x] Domain readiness integrated.
- [x] Health-provider boundary simplified.
- [x] Copy compressed.
- [x] Visual clutter reduced.
- [x] Desktop layout verified.
- [x] Mobile layout verified.
- [x] Legacy route compatibility verified.
- [x] Unit/regression tests updated.
- [x] Automated verification passed.
- [x] Browser screenshot audit passed.
- [x] Documentation updated with implementation results.

## Implementation Results

### Files Changed

- `src/features/insights/pages/InsightsPage.tsx`
- `src/tests/app.spec.tsx`
- `docs/product-simplification-sprint-4-plan.md`
- `docs/product-simplification-milestone-breakdown.md`
- `README.md`

### Components And Hooks Touched

- `InsightsPage` now consumes `useCommandCenterWorkspace` and `useReadinessWorkspace` directly.
- Existing command-center chart components are reused for analytics depth.
- Existing readiness data is integrated through target pace, domain readiness, readiness operational signals, and health-provider boundary copy.
- The old `CommandCenterPage` and `ReadinessPage` remain available as legacy/reference surfaces, but are no longer embedded by the primary `Insights` route.

### User-Facing Behavior Changed

- `Insights` no longer shows `Weekly` and `Readiness` tabs.
- `/command-center` and `/readiness` still redirect into `/insights` with query compatibility.
- Analytics and readiness now render together in one hierarchy.
- The default screen emphasizes current pattern, momentum, readiness pace, active risks, primary charts, explanations, domain readiness, and continuity.
- Mobile gets a dedicated ordering: summary, readiness pace, compact risks, then primary charts.
- Risk panels are capped to avoid turning the page into a wall of alerts.

### Verification Commands

- `npm run lint`
- `npm run typecheck`
- `npm run test:run -- src/tests/app.spec.tsx`
- `npm run test:run`
- `npm run build`

Final full-suite verification passed during the implementation pass.

### Browser QA Screenshots

Screenshots were captured from the authenticated local preview through the Chrome DevTools Protocol fallback and stored outside the git worktree:

- `/tmp/forge-visual-audit/insights-desktop-1440x1000-sprint4-final.png`
- `/tmp/forge-visual-audit/insights-mobile-390x844-sprint4-final.png`

Outcome:

- Desktop uses a clear main analytics column and right decision rail.
- Mobile keeps the sequence understandable and avoids the prior issue where important charts were buried after the full right rail.
- No visual-audit artifacts were written into the repository.

### Known Follow-Ups

- The remaining analytics page is still long by nature because depth was intentionally preserved.
- A later polish pass can extract stable Insights subcomponents if `InsightsPage` becomes difficult to maintain.
- Product copy can be compressed further in the dedicated copy simplification sprint.
