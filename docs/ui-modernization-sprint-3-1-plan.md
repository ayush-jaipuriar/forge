# UI Modernization Sprint 3.1 Plan

## Purpose

This document defines a short hardening sprint that follows Sprint 3.

Sprint 3.1 is **not** a new redesign wave.

It is a tightly scoped polish pass focused on the highest-value issues found during the live authenticated browser audit completed on April 4, 2026.

The intent is to:

- preserve the structural gains from Sprints 1 to 3
- remove the most visible shell and hierarchy friction
- fix one real runtime-auth noise issue that surfaced during the browser audit
- avoid reopening unrelated page redesign work

## Why A 3.1 Sprint Exists

The modernization track is working.

The live browser audit confirmed that:

- Today is materially stronger
- Schedule is much more operational
- Settings is much clearer
- the left-rail shell is directionally right

But it also exposed a few issues that are too visible to leave floating until a later sprint:

1. the global PWA/platform surface still sits too high and too large on key screens
2. the desktop rail still depends too much on icon recall
3. Command Center still makes users traverse too much framing before the real analytics surface begins
4. browser-auth return still emits repeated popup-related console noise

This sprint exists to tighten those areas before the modernization track expands further.

## Scope

Sprint 3.1 is limited to:

- global shell restraint improvements
- Command Center above-the-fold tightening
- auth popup console-noise hardening

Sprint 3.1 explicitly does **not** include:

- Prep redesign
- Physical redesign
- Readiness redesign
- another broad Schedule pass
- another broad Settings pass
- a new visual-system rewrite

## Inputs

### Prior Sprint References

- [docs/ui-modernization-sprint-1-plan.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/ui-modernization-sprint-1-plan.md)
- [docs/ui-modernization-sprint-2-plan.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/ui-modernization-sprint-2-plan.md)
- [docs/ui-modernization-sprint-3-plan.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/ui-modernization-sprint-3-plan.md)

### Stitch References Still Relevant

- [stitch 3/today_execution_console/screen.png](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/today_execution_console/screen.png)
- [stitch 3/command_center_strategy_room/screen.png](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/command_center_strategy_room/screen.png)
- [stitch 3/settings_system_control/screen.png](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/settings_system_control/screen.png)
- [stitch 3/forge_ui_ux_redesign_strategy.html](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/forge_ui_ux_redesign_strategy.html)

### Live Audit References

- [output/playwright/.playwright-cli/page-2026-04-04T11-29-57-280Z.png](/Users/ayushjaipuriar/Documents/GitHub/forge/output/playwright/.playwright-cli/page-2026-04-04T11-29-57-280Z.png)
- [output/playwright/.playwright-cli/page-2026-04-04T11-30-19-458Z.png](/Users/ayushjaipuriar/Documents/GitHub/forge/output/playwright/.playwright-cli/page-2026-04-04T11-30-19-458Z.png)
- [output/playwright/.playwright-cli/page-2026-04-04T11-30-42-714Z.png](/Users/ayushjaipuriar/Documents/GitHub/forge/output/playwright/.playwright-cli/page-2026-04-04T11-30-42-714Z.png)
- [output/playwright/.playwright-cli/page-2026-04-04T11-31-02-840Z.png](/Users/ayushjaipuriar/Documents/GitHub/forge/output/playwright/.playwright-cli/page-2026-04-04T11-31-02-840Z.png)

## Sprint Goals

By the end of Sprint 3.1:

- the shell should feel calmer and more premium above the fold
- the desktop rail should be easier to scan without relying on hover/tooltips
- Command Center should get to its analytical value faster
- Google popup auth should stop polluting the console with avoidable browser-noise after sign-in

## Workstream 1: Global Shell Restraint

### Goal

Reduce the amount of non-page-specific chrome competing with page-level hierarchy.

### Why This Matters

When the global shell consumes too much space, every page starts to feel like it begins late.

That is especially costly now because the modernization track has invested heavily in stronger page heroes and pane structures.

### Checklist

- [x] Audit the current `PwaStatusCard` placement in the shell.
- [x] Decide whether the surface should:
  - collapse by default on some routes
  - become more compact
  - appear only when its state is meaningfully actionable
- [x] Reduce the visual and spatial dominance of the global platform/PWA surface without hiding important runtime truth.
- [x] Preserve install/update/offline honesty while letting flagship page content start earlier.
- [x] Re-check Today, Command Center, Schedule, and Settings hierarchy after the change.

### Primary Files

- [src/components/layout/AppShell.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/components/layout/AppShell.tsx)
- [src/features/pwa/components/PwaStatusCard.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/pwa/components/PwaStatusCard.tsx)
- [src/features/pwa/pwaStatus.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/pwa/pwaStatus.ts)

### Exit Criteria

- the shell still tells the truth about install/offline/update posture
- page-specific heroes start sooner and feel more dominant

## Workstream 2: Desktop Rail Discoverability

### Goal

Make the left rail easier to scan without losing the compact premium shell direction.

### Why This Matters

The current rail is technically clean, but in a real browser it still asks users to remember too many icons.

That is a discoverability tax.

### Checklist

- [x] Revisit active and inactive rail labeling.
- [x] Decide whether the best fix is:
  - always-visible compact labels
  - a wider rail
  - sectional grouping
  - selective labels for highest-value routes
- [x] Preserve the refined rail feel rather than reverting to a bulky sidebar.
- [x] Re-check the rail against the Stitch target:
  - anchored
  - calm
  - premium
  - immediately understandable
- [x] Validate that the active state still reads clearly after the adjustment.

### Primary Files

- [src/components/layout/AppShell.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/components/layout/AppShell.tsx)
- [src/app/router/navigation.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/app/router/navigation.ts)

### Exit Criteria

- desktop navigation can be understood without relying primarily on hover tooltips
- the rail still feels compact and intentional

## Workstream 3: Command Center Above-The-Fold Tightening

### Goal

Reduce preamble and get the user into the analytical value of the page faster.

### Why This Matters

Command Center is supposed to feel strategic and immediately useful.

If the page spends too much vertical space on framing before the core diagnostics, it feels slower and less confident than the design direction intends.

### Checklist

- [x] Revisit the stacking order of:
  - hero framing
  - strategic summary
  - observation window controls
  - top metrics strip
  - primary diagnostics
- [x] Determine whether some surfaces should be:
  - compressed
  - merged
  - moved into side support space
  - visually subordinated
- [x] Preserve the strong strategic summary while reducing the sense of preamble.
- [x] Keep Forge semantics and analytical honesty intact.
- [x] Re-check the screen against the live audit screenshot and Stitch direction after the change.

### Primary Files

- [src/features/command-center/pages/CommandCenterPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/command-center/pages/CommandCenterPage.tsx)
- [src/features/command-center/components/AnalyticsMetricTile.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/command-center/components/AnalyticsMetricTile.tsx)
- [src/components/common/SectionHeader.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/components/common/SectionHeader.tsx)

### Exit Criteria

- the first meaningful analytics panels arrive sooner
- the page still reads as premium and strategic, not rushed

## Workstream 4: Popup Auth Console-Noise Hardening

### Goal

Reduce or eliminate repeated popup-auth console errors that appeared during the live signed-in browser audit.

### Why This Matters

The app remained usable, but production-quality UI work should not ignore real runtime browser noise when it appears consistently on a core sign-in path.

This is also a trust issue: a polished interface should not quietly normalize noisy auth return behavior.

### Checklist

- [x] Trace the repeated `Cross-Origin-Opener-Policy` popup-return console errors from the Firebase popup flow.
- [x] Determine whether the issue is:
  - expected browser behavior that needs containment
  - a hosting/header mismatch
  - a popup-close timing path that can be hardened
  - a Firebase-auth integration detail that needs a safer fallback
- [x] Fix the issue if the app controls the cause.
- [x] If the browser still emits unavoidable provider noise, document that truth clearly and avoid mischaracterizing it as solved.
- [x] Re-run a real sign-in verification if the auth path changes materially.

### Primary Files

- [src/features/auth/providers/AuthSessionProvider.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/auth/providers/AuthSessionProvider.tsx)
- [src/lib/firebase/client.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/lib/firebase/client.ts)
- [firebase.json](/Users/ayushjaipuriar/Documents/GitHub/forge/firebase.json)
- [vite.config.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/vite.config.ts)

### Exit Criteria

- popup-auth return no longer produces avoidable repeated console noise
- or the remaining browser noise is proven to be external/unavoidable and documented honestly

## Validation Plan

Sprint 3.1 verification should include:

- existing automated repo checks:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test:run`
  - `npm run build`
- focused regression coverage updates where shell or Command Center contracts change
- another local live browser audit on the key authenticated routes:
  - Today
  - Command Center
  - Schedule
  - Settings
- targeted auth verification if popup-flow code or hosting policy changes

## Definition Of Done

Sprint 3.1 is done when:

- the global shell no longer visually delays every important page
- the left rail is more self-explanatory in real use
- Command Center reaches its analytical core sooner
- popup-auth console noise is either fixed or honestly bounded and documented
- all automated verification passes again

## Recommended Next Step After This Sprint

If Sprint 3.1 lands cleanly, the modernization track should move into the remaining support surfaces:

- Prep
- Physical
- Readiness

That next sprint should build on the calmer shell and refined hierarchy rather than reopening the same shell issues again.

## Sprint 3.1 Implementation Notes

### Completion Status

Sprint 3.1 is complete.

### Implemented

- The global shell runtime surface was rebalanced so healthy installability prompts no longer dominate every flagship screen.
- The desktop rail was widened slightly and now exposes compact labels for all routes instead of depending on active-state labeling plus tooltips.
- Command Center now merges the observation-window control cluster and metric strip into the hero layer so the page reaches strategic content sooner.
- Hosting and local preview now send `Cross-Origin-Opener-Policy: same-origin-allow-popups` to better support popup-auth return behavior.
- Popup-auth console noise was re-tested in a real signed-in browser after the header change and documented honestly.

### Files Changed During Sprint 3.1 Implementation

- [src/components/layout/AppShell.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/components/layout/AppShell.tsx)
- [src/features/pwa/components/PwaStatusCard.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/pwa/components/PwaStatusCard.tsx)
- [src/features/pwa/pwaStatus.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/pwa/pwaStatus.ts)
- [src/features/command-center/pages/CommandCenterPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/command-center/pages/CommandCenterPage.tsx)
- [src/tests/pwa-status.spec.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/tests/pwa-status.spec.ts)
- [firebase.json](/Users/ayushjaipuriar/Documents/GitHub/forge/firebase.json)
- [vite.config.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/vite.config.ts)
- [.gitignore](/Users/ayushjaipuriar/Documents/GitHub/forge/.gitignore)
- [docs/ui-modernization-sprint-3-1-plan.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/ui-modernization-sprint-3-1-plan.md)

### Why These Changes Matter

- The shell now supports page hierarchy instead of competing with it.
- Navigation is easier to understand in a real browser at a glance.
- Command Center feels more immediate and strategic above the fold.
- The popup-auth runtime issue is now narrowed to remaining Firebase/browser behavior rather than an unconfigured hosting/header boundary.

### Validation Outcome

Sprint 3.1 verification completed successfully with:

- `npm run typecheck`
- `npm run lint`
- `npm run test:run`
- `npm run build`

Additional live browser validation was completed against the local preview build with authenticated navigation through:

- Today
- Command Center
- Schedule
- Settings

Supporting post-polish artifacts:

- [output/playwright/.playwright-cli/page-2026-04-04T12-12-52-790Z.png](/Users/ayushjaipuriar/Documents/GitHub/forge/output/playwright/.playwright-cli/page-2026-04-04T12-12-52-790Z.png)
- [output/playwright/.playwright-cli/page-2026-04-04T12-13-14-607Z.png](/Users/ayushjaipuriar/Documents/GitHub/forge/output/playwright/.playwright-cli/page-2026-04-04T12-13-14-607Z.png)
- [output/playwright/.playwright-cli/page-2026-04-04T12-14-42-049Z.png](/Users/ayushjaipuriar/Documents/GitHub/forge/output/playwright/.playwright-cli/page-2026-04-04T12-14-42-049Z.png)

### Residual Notes

- The popup-auth console noise was reduced in scope and the missing COOP header issue was fixed, but repeated `window.closed` COOP messages still appeared after a real Google popup sign-in cycle.
- That remaining console noise is now treated as a bounded provider/browser integration caveat rather than an unresolved hosting misconfiguration.
- Mobile live-audit reliability remains lower than desktop because the Playwright CLI persistent-session viewport controls were unstable during this session, so desktop confidence is higher than mobile confidence for this sprint.
- Playwright browser-profile directories and session-state files are now treated as local-only automation artifacts and ignored through [`.gitignore`](/Users/ayushjaipuriar/Documents/GitHub/forge/.gitignore) so they do not pollute source control.

### Focused Auth-Hardening Investigation Outcome

- The app-side hosting and preview header gap was real and is now fixed:
  - `Cross-Origin-Opener-Policy: same-origin-allow-popups` is sent from both local preview and Firebase Hosting.
- The remaining popup-return console noise still appears after a real sign-in cycle even with the corrected header posture.
- That means the current residual issue is most likely tied to Firebase popup-auth/browser behavior rather than a missing local app configuration.
- The most credible deeper follow-up is to evaluate whether Forge should keep popup auth as the default browser model or add a redirect-first/fallback path in a future focused auth sprint.
