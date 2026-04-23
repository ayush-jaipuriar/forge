# Product Simplification Sprint 5 Plan: Calm Settings Surface

## Status

Planning draft ready for review.

Do not begin implementation until this plan is approved.

## Sprint Goal

Make `Settings` feel calm, useful, and trustworthy instead of like an always-open diagnostics console.

The user-facing goal is:

> Help the user manage account, sync, backup, restore, calendar, and notifications without making them read internal runtime machinery by default.

## Locked Scope Decisions

These decisions were confirmed before writing this plan.

- Focus on `Settings`.
- Allow small cross-app copy cleanup only when repeated verbosity directly supports the Settings simplification goal.
- Hide advanced/runtime details behind progressive disclosure by default.
- It is acceptable to remove or relocate low-value diagnostic copy.
- Treat desktop and mobile as equal implementation milestones.
- Require browser screenshot automation before completion.

## Current Problem

Sprint 1-4 simplified the primary product loop, but `Settings` still carries the older operator-console model.

The current `Settings` page:

- gives too many sections equal visual weight
- exposes diagnostics, capability boundaries, provider scaffolding, and operational truth by default
- uses verbose labels like `System Posture`, `Operational diagnostics`, `Capability boundary`, `Platform Operations`, and `Roadmap truth`
- mixes everyday user actions with rare debugging details
- creates a long page where users must scan through internal details to find backup, restore, calendar, notifications, or cloud refresh actions

The issue is not that these systems are invalid. They are real and useful. The issue is default hierarchy.

## Desired Product Model

`Settings` should answer five questions quickly:

- Is my account and sync okay?
- Can I back up or restore safely?
- Is Calendar connected?
- Are notifications enabled?
- Where are advanced diagnostics if something breaks?

Advanced truth should remain available, but it should not dominate the default experience.

## Target Screen Hierarchy

### Desktop

Recommended desktop hierarchy:

- Header: concise `Settings` title, account/sync status, and cloud refresh action.
- Primary action grid: account/sync, backup/restore, calendar, notifications.
- Main body left: backup/restore and calendar controls.
- Main body right: notification controls and compact integration summaries.
- Advanced section: diagnostics, runtime capabilities, Functions ownership, health/provider roadmap, and low-level calendar truth behind collapsible disclosure.

Desktop should feel like a utility panel with clear action zones, not a support dashboard.

### Mobile

Recommended mobile hierarchy:

- Header: compact status and account identity.
- Sync/cloud refresh.
- Backup/export/restore.
- Calendar.
- Notifications.
- Advanced settings collapsed by default.

Mobile should not force the user through capability or provider scaffolding before reaching common actions.

## In Scope

### 1. Settings Page Architecture

- Keep a single `SettingsPage`.
- Recompose the current sections into default and advanced layers.
- Add a small reusable disclosure primitive if needed.
- Preserve all high-value actions.

Checklist:

- [ ] Create a calmer top-level Settings layout.
- [ ] Separate default utility sections from advanced diagnostics.
- [ ] Keep backup, restore, calendar, notifications, and cloud refresh reachable.
- [ ] Move low-frequency details into collapsible sections.
- [ ] Preserve loading and error behavior.

### 2. Default Utility Layer

Default Settings should focus on direct user actions.

Primary default sections:

- Account & sync
- Backup & restore
- Calendar
- Notifications
- Integrations summary

Checklist:

- [ ] Replace the current verbose hero title with concise Settings copy.
- [ ] Show account/auth and sync status in plain language.
- [ ] Keep `Refresh from cloud` visible.
- [ ] Keep `Export backup JSON`, `Export notes markdown`, `Load restore file`, and `Apply staged restore` visible.
- [ ] Keep Calendar connect/reconnect/read-cache/write-mirror actions visible.
- [ ] Keep notification toggle and permission request visible.

### 3. Advanced Disclosure Layer

Advanced details should be preserved, but collapsed by default.

Candidate advanced groups:

- Diagnostics
- Backup details and retention
- Scheduled restore candidates
- Calendar operational truth
- Runtime capabilities
- Platform operations / Firebase Functions ownership
- Health provider roadmap

Checklist:

- [ ] Add collapsible advanced groups.
- [ ] Keep advanced group labels user-readable.
- [ ] Avoid hiding active errors or required actions.
- [ ] Show critical/warning diagnostics outside disclosure when user action is needed.
- [ ] Keep advanced content keyboard-accessible.

### 4. Copy Reduction

Settings copy should be shorter and less self-explanatory.

Terms to reduce or replace where practical:

- `Runtime truth`
- `Capability boundary`
- `Operational diagnostics`
- `Operational truth`
- `Roadmap truth`
- `Provider seams`
- `Platform Operations`
- `Browser vs Functions ownership`

Preferred replacement style:

- `Advanced`
- `Status details`
- `Calendar details`
- `Runtime details`
- `Provider roadmap`
- `Backup details`

Checklist:

- [ ] Rewrite Settings header.
- [ ] Shorten card titles and descriptions.
- [ ] Remove repeated explanatory paragraphs.
- [ ] Keep status values precise.
- [ ] Keep errors specific enough to debug.

### 5. Visual Cleanup

The current Settings page has too many nested cards and rows with similar weight.

Checklist:

- [ ] Reduce nested bordered boxes where possible.
- [ ] Make common actions visually primary.
- [ ] Make advanced content visually secondary.
- [ ] Avoid huge vertical stacks on desktop.
- [ ] Avoid dense row walls on mobile.
- [ ] Keep touch targets usable on mobile.

### 6. Cross-App Copy Cleanup

Only small, directly related cleanup is in scope.

Allowed:

- repeated shell/status copy that appears near Settings or navigation
- duplicated sync/refresh wording if the same concept appears in shell status and Settings
- obvious verbose one-liners discovered while touching shared primitives

Not allowed:

- full product copy rewrite
- Today/Plan/Insights redesign
- large route-level changes outside Settings

Checklist:

- [ ] Identify repeated verbose copy directly related to Settings/sync/runtime.
- [ ] Apply only small, low-risk wording cleanup.
- [ ] Avoid touching unrelated product surfaces.

### 7. Tests And Browser QA

Desktop and mobile validation are required.

Checklist:

- [ ] Update `settings-page.spec.tsx` for collapsed advanced sections.
- [ ] Add assertions for default action availability.
- [ ] Add assertions that advanced diagnostics are reachable.
- [ ] Update `app.spec.tsx` only if route-level Settings expectations need adjustment.
- [ ] Capture desktop screenshot.
- [ ] Capture mobile screenshot.
- [ ] Store screenshots outside the git worktree or in ignored output only.

## Out Of Scope

- New backup or restore behavior.
- New Calendar API behavior.
- New notification delivery rules.
- New health-provider integrations.
- New sync architecture.
- Native shell capability implementation.
- Full product-wide copy rewrite.

## Reference Files

Primary implementation references:

- `src/features/settings/pages/SettingsPage.tsx`
- `src/features/settings/hooks/useSettingsWorkspace.ts`
- `src/features/settings/hooks/useRefreshCloudWorkspace.ts`
- `src/features/settings/hooks/useCreateManualBackup.ts`
- `src/features/settings/hooks/useLoadServerRestoreStage.ts`
- `src/features/settings/hooks/useApplyRestoreStage.ts`
- `src/features/settings/hooks/useConnectCalendarRead.ts`
- `src/features/settings/hooks/useConnectCalendarWrite.ts`
- `src/features/settings/hooks/useRefreshCalendarCache.ts`
- `src/features/settings/hooks/useSyncCalendarMirrors.ts`
- `src/features/settings/hooks/useRequestNotificationPermission.ts`
- `src/features/settings/hooks/useUpdateNotificationPreference.ts`

Shared UI references:

- `src/components/common/SurfaceCard.tsx`
- `src/components/common/SectionHeader.tsx`
- `src/components/common/EmptyState.tsx`
- `src/components/layout/AppShell.tsx`

Service/domain references:

- `src/services/settings/settingsWorkspaceService.ts`
- `src/services/backup/restoreService.ts`
- `src/services/backup/backupService.ts`
- `src/services/calendar/calendarIntegrationService.ts`
- `src/services/health/healthIntegrationService.ts`
- `src/services/monitoring/operationalDiagnosticsService.ts`
- `src/domain/platform/types.ts`
- `src/domain/calendar/presentation.ts`

Test references:

- `src/tests/settings-page.spec.tsx`
- `src/tests/app.spec.tsx`
- `src/tests/services/backup-export.spec.ts`
- `src/tests/services/restore-service.spec.ts`
- `src/tests/services/calendar-integration.spec.ts`
- `src/tests/services/calendar-mirror.spec.ts`
- `src/tests/services/notification-preference.spec.ts`

Documentation references:

- `docs/product-simplification-milestone-breakdown.md`
- `docs/product-simplification-sprint-4-plan.md`
- `docs/phase-4-release-readiness-checklist.md`

## Recommended Implementation Sequence

### Step 1: Inventory Existing Settings Content

Map every current Settings section into one of three categories.

- Default utility
- Advanced detail
- Low-value removable/relocatable copy

Checklist:

- [ ] Inventory backup/restore content.
- [ ] Inventory system/runtime content.
- [ ] Inventory calendar content.
- [ ] Inventory notification content.
- [ ] Inventory platform and health provider content.
- [ ] Mark active errors that must remain visible.

### Step 2: Add Disclosure Primitive

Create or localize a reusable disclosure pattern.

Checklist:

- [ ] Use accessible button semantics.
- [ ] Preserve keyboard operation.
- [ ] Use clear expanded/collapsed labels.
- [ ] Keep default collapsed state for advanced groups.
- [ ] Avoid animation complexity unless simple and stable.

### Step 3: Rebuild Settings Hierarchy

Recompose the page around common user needs.

Checklist:

- [ ] Build concise header.
- [ ] Build status/action summary.
- [ ] Build Backup & Restore section.
- [ ] Build Calendar section.
- [ ] Build Notifications section.
- [ ] Build compact Integrations summary.
- [ ] Move diagnostics/runtime/provider details into advanced groups.

### Step 4: Preserve High-Risk Controls

Make sure simplification does not weaken safety.

Checklist:

- [ ] Restore remains staged before apply.
- [ ] Restore warnings remain visible.
- [ ] Backup errors remain visible.
- [ ] Calendar mutation actions remain explicit.
- [ ] Notification permission remains browser-owned and clear.
- [ ] Cloud refresh remains authenticated-only.

### Step 5: Compress Copy

Shorten without hiding real state.

Checklist:

- [ ] Rewrite section titles.
- [ ] Shorten descriptions.
- [ ] Remove repeated internal explanations.
- [ ] Keep status rows scan-friendly.
- [ ] Keep alert copy action-oriented.

### Step 6: Update Tests

Tests should reflect the new default/advanced split.

Checklist:

- [ ] Assert default Settings actions render.
- [ ] Assert advanced diagnostics are collapsed by default.
- [ ] Assert advanced diagnostics can expand.
- [ ] Assert restore staging path still renders.
- [ ] Assert calendar action buttons remain reachable.
- [ ] Assert notification controls remain reachable.

### Step 7: Run Verification And Browser Audit

Checklist:

- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm run test:run -- src/tests/settings-page.spec.tsx`
- [ ] `npm run test:run`
- [ ] `npm run build`
- [ ] Desktop screenshot audit
- [ ] Mobile screenshot audit
- [ ] Fix observed layout issues
- [ ] Rerun affected checks after fixes

## Acceptance Criteria

The sprint is complete when:

- Settings default view is shorter and calmer.
- Common actions are visible without expanding advanced sections.
- Advanced diagnostics and runtime details are collapsed by default.
- Active warnings/errors remain visible when user action is needed.
- Backup/restore safety behavior is preserved.
- Calendar and notification controls remain clear.
- Health/provider roadmap is honest but not visually dominant.
- Desktop layout uses width intentionally.
- Mobile layout prioritizes common actions before diagnostics.
- Automated tests pass.
- Production build passes.
- Desktop/mobile screenshot audit is complete.
- Documentation records final implementation and QA results.

## Risks And Mitigations

### Risk: Hiding diagnostics reduces trust

Mitigation:

- Collapse diagnostics, do not delete high-value diagnostics.
- Surface critical/warning states outside disclosure when they need user action.

### Risk: Backup/restore safety gets obscured

Mitigation:

- Keep staging and apply controls visible.
- Keep restore warnings and errors visible.
- Avoid changing restore behavior.

### Risk: Calendar controls become less explicit

Mitigation:

- Keep read access and write mirroring as separate actions.
- Keep disconnect visible but secondary.
- Keep operational sync details in advanced disclosure.

### Risk: Settings still feels too long

Mitigation:

- Prioritize default utility sections.
- Collapse advanced groups.
- Cap or summarize long lists.
- Move low-value detail into disclosure or remove it.

## Implementation Progress Checklist

- [ ] Plan approved.
- [ ] Existing Settings content inventoried.
- [ ] Default utility hierarchy implemented.
- [ ] Advanced disclosure implemented.
- [ ] Backup/restore actions preserved.
- [ ] Calendar actions preserved.
- [ ] Notification controls preserved.
- [ ] Diagnostics relocated and still reachable.
- [ ] Runtime/capability details relocated.
- [ ] Health/provider roadmap simplified.
- [ ] Copy compressed.
- [ ] Desktop layout verified.
- [ ] Mobile layout verified.
- [ ] Tests updated.
- [ ] Automated verification passed.
- [ ] Browser screenshot audit passed.
- [ ] Documentation updated with implementation results.

## Post-Implementation Documentation Update Required

After implementation, update this document with:

- files changed
- components/hooks touched
- user-facing behavior changed
- test commands run
- browser QA screenshots and outcome
- known follow-ups
