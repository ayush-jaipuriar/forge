# UI Modernization Sprint 6 Plan

## Purpose

This document defines Sprint 6 of the Forge UI modernization track.

Sprint 6 is the **remaining product surfaces and state-quality sprint**.

By this point, the major in-app destinations have already had dedicated modernization passes:

- shell and design system
- Today and Command Center
- Schedule and Settings
- Prep, Physical, and Readiness
- cross-app polish and consistency

That means the next highest-value work is not another broad page redesign.

It is the set of surfaces that users still experience, but that have not yet received the same intentional design treatment:

- Auth entry and return
- empty states
- loading states
- error and degraded states
- missing-config and unsupported-environment states
- hosted-origin auth and deployment-adjacent UI truth

## Why Sprint 6 Exists

Forge now feels materially more premium inside the authenticated shell.

But users do not only experience the steady-state happy path.

They also experience:

- signing in
- waiting for restoration
- seeing degraded integrations
- encountering empty analytics or backup states
- landing on unsupported runtime boundaries
- crossing from local verification to deployed-host verification

If those states stay visually under-designed or semantically noisy, the product still feels unfinished at the edges.

Sprint 6 exists to make those edges feel as intentional as the primary working screens.

## Sprint Direction

This sprint will focus on:

- remaining product surfaces that have not had a dedicated modernization pass
- desktop and mobile as equal targets
- empty, loading, error, and degraded-state quality
- hosted-origin auth verification and deployment-surface polish
- small supporting service and test changes where they improve state truthfulness or UI completeness

This sprint will **not**:

- reopen major structural redesign work already settled in Sprints 1 through 5
- introduce fake “recovery”, “operator”, or “system console” semantics
- blur product-honest states into marketing-style reassurance
- expand integrations beyond their real current boundaries

## Inputs

### Modernization Track References

- [docs/ui-modernization-implementation-plan.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/ui-modernization-implementation-plan.md)
- [docs/ui-modernization-sprint-1-plan.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/ui-modernization-sprint-1-plan.md)
- [docs/ui-modernization-sprint-2-plan.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/ui-modernization-sprint-2-plan.md)
- [docs/ui-modernization-sprint-3-plan.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/ui-modernization-sprint-3-plan.md)
- [docs/ui-modernization-sprint-3-1-plan.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/ui-modernization-sprint-3-1-plan.md)
- [docs/ui-modernization-sprint-4-plan.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/ui-modernization-sprint-4-plan.md)
- [docs/ui-modernization-sprint-5-plan.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/ui-modernization-sprint-5-plan.md)

### Auth And Deployment References

- [docs/auth-hardening-sprint-plan.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/auth-hardening-sprint-plan.md)
- [docs/firebase-setup.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/firebase-setup.md)
- [docs/deployment-guide.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/deployment-guide.md)
- [docs/production-deployment-and-phone-install-guide.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/production-deployment-and-phone-install-guide.md)

### Stitch References

Sprint 6 should continue using Stitch as a tone and restraint reference, especially for shell consistency and auth/single-surface calm, without inheriting fictional semantics:

- [stitch 3/forge_ui_ux_redesign_strategy.html](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/forge_ui_ux_redesign_strategy.html)
- [stitch 3/forge_today_command_center_strategy.html](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/forge_today_command_center_strategy.html)
- [stitch 3/forge_obsidian/DESIGN.md](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/forge_obsidian/DESIGN.md)
- [stitch 3/today_execution_console/screen.png](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/today_execution_console/screen.png)
- [stitch 3/settings_system_control/screen.png](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/settings_system_control/screen.png)
- [stitch 3/today_mobile_cockpit/screen.png](/Users/ayushjaipuriar/Documents/GitHub/forge/stitch%203/today_mobile_cockpit/screen.png)

## Core Interpretation

Sprint 6 is about **finishing the product experience around the edges**.

The principle is:

- the happy path already looks much better
- now the non-happy-path and transition-path surfaces need equal care

That means the sprint should make Forge feel:

- complete
- honest
- resilient
- calm under empty or degraded conditions
- professional during sign-in, restoration, and deployment-verified use

## Sprint Goals

By the end of Sprint 6:

- Auth should feel visually consistent with the modernized product
- empty states should feel intentional instead of like placeholders
- loading and restoration states should feel brief, clear, and visually integrated
- error and degraded states should be easier to scan and less text-heavy
- hosted-origin sign-in should be reverified and deployment-surface polish should be documented honestly
- desktop and mobile should both reflect the improved state quality

## Recommended Work Order

1. auth entry and restoration surfaces
2. shared empty/loading/error state system
3. route-level application across remaining surfaces
4. hosted-origin verification and deployment-surface polish
5. sprint-wide consistency and regression sweep

Why this order:

- Auth is the most important remaining dedicated surface
- shared state components should be improved before route-level adoption
- hosted-origin verification should happen after the UI and state model are settled
- final regression and browser verification should validate the whole state system, not isolated partial work

## Workstream 0: Auth Surface Modernization

### Goal

Bring Auth into the same visual and interaction standard as the rest of the modernized product.

### Why This Matters

Auth is still one of the most repeatedly encountered product surfaces:

- first visit
- sign-out and return
- configuration failure
- redirect return
- session restoration

If Auth remains visually behind the rest of the product, the app feels inconsistent at the exact moment trust is being established.

### Checklist

- [x] Audit [AuthPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/auth/pages/AuthPage.tsx) on desktop and mobile.
- [x] Tighten the auth card hierarchy so it feels aligned with the modernized shell.
- [x] Keep auth copy concise and calm.
- [x] Ensure missing-config and auth-error variants remain honest without becoming verbose.
- [x] Review sign-in button emphasis and idle/loading/returning states.
- [x] Recheck keyboard and focus flow on the auth screen.

### Primary Files

- [src/features/auth/pages/AuthPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/auth/pages/AuthPage.tsx)
- [src/app/router/AppRouter.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/app/router/AppRouter.tsx)
- [src/features/auth/providers/AuthSessionProvider.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/auth/providers/AuthSessionProvider.tsx)

### Exit Criteria

- Auth feels like part of the same premium product system as the rest of Forge

## Workstream 1: Shared State Surface Modernization

### Goal

Modernize shared empty, loading, and error-state surfaces so they no longer feel like secondary UI leftovers.

### Why This Matters

Most product inconsistency now appears when data is absent, stale, or temporarily unavailable.

Those moments need better:

- hierarchy
- brevity
- state signaling
- recovery/action guidance

### Checklist

- [x] Audit shared state primitives and route-level fallback patterns.
- [x] Modernize empty-state layout and copy where needed.
- [x] Tighten loading-state hierarchy and wording.
- [x] Improve degraded/error-state scanability.
- [x] Ensure action affordances in empty/error states are visually clear.
- [x] Keep state surfaces honest about unsupported or scaffolded capabilities.

### Primary Files

- [src/components/common/EmptyState.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/components/common/EmptyState.tsx)
- [src/components/common/SurfaceCard.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/components/common/SurfaceCard.tsx)
- [src/components/common/SectionHeader.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/components/common/SectionHeader.tsx)
- route-level pages and fallback surfaces as identified during implementation

### Exit Criteria

- empty, loading, and degraded states feel intentionally designed rather than tolerated

## Workstream 2: Remaining Route State Application

### Goal

Apply the improved state system across the routes and product surfaces that still show older fallback behavior.

### Why This Matters

A good shared primitive is only valuable if the routes actually adopt it coherently.

This workstream ensures consistency across:

- Today
- Command Center
- Schedule
- Settings
- Prep
- Physical
- Readiness
- Auth-related transitions

### Checklist

- [x] Identify which routes still use older or inconsistent empty/loading/error patterns.
- [x] Apply updated shared-state patterns where the mismatch is user-visible.
- [x] Compress repeated fallback copy that explains too much.
- [x] Verify mobile layout of those states, not just desktop.
- [x] Keep route-level truthfulness about integrations, data availability, and unsupported runtime behavior.

### Primary Files

- route-level pages under [src/features](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features)
- any supporting hooks/services where state-shape cleanup is needed

### Exit Criteria

- the remaining non-happy-path route states feel visually and semantically aligned across the app

## Workstream 3: Hosted-Origin Auth Verification And Deployment Surface Polish

### Goal

Validate the real deployed sign-in experience and polish any UI truth that only becomes visible on hosted origins.

### Why This Matters

Local verification is necessary but not sufficient.

Hosted origins can differ in:

- redirect behavior
- auth persistence timing
- PWA/install surfaces
- deployment-specific readiness messaging

This sprint should explicitly close that gap rather than treating it as an afterthought.

### Checklist

- [x] Reverify hosted-origin Google sign-in on the deployed Forge URL.
- [x] Confirm that redirect return and session restoration behave as intended on the hosted origin.
- [x] Recheck install/readiness surfaces on the deployed origin for copy and state truthfulness.
- [x] Tighten deployment-surface copy if the hosted experience exposes unnecessary noise.
- [x] Document the hosted-origin verification outcome and any residual caveats.

### Primary Files

- [src/features/auth/providers/AuthSessionProvider.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/auth/providers/AuthSessionProvider.tsx)
- [src/features/pwa/components/PwaStatusCard.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/pwa/components/PwaStatusCard.tsx)
- relevant docs in [docs](/Users/ayushjaipuriar/Documents/GitHub/forge/docs)

### Exit Criteria

- hosted-origin auth and deployment-facing UI surfaces are verified, documented, and visually coherent

## Workstream 4: Supporting Service And Test Alignment

### Goal

Allow small service, hook, and test changes where they improve state accuracy or verification completeness.

### Why This Matters

UI quality depends on state truth.

Sometimes the UI can only be simplified if:

- a hook exposes a cleaner state distinction
- a service stops collapsing too many conditions into one generic string
- tests capture continuity, fallback, and degraded-state behavior more explicitly

### Checklist

- [x] Make small supporting service or hook changes where they materially improve UI state truthfulness.
- [x] Add or update tests for:
  - auth return continuity
  - empty/loading/error semantics
  - route-level fallback behavior
  - hosted-origin or deploy-surface assumptions where practical
- [x] Keep service changes tightly scoped to UI/state quality, not feature expansion.

### Primary Files

- relevant hooks/services under [src/features](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features) and [src/services](/Users/ayushjaipuriar/Documents/GitHub/forge/src/services)
- route and auth tests under [src/tests](/Users/ayushjaipuriar/Documents/GitHub/forge/src/tests)

### Exit Criteria

- state polish is supported by trustworthy tests and minimal state-model cleanup

## Workstream 5: Sprint-Wide Verification And Closeout

### Goal

Close Sprint 6 with both automated and real hosted/local validation.

### Checklist

- [x] Run `npm run lint`
- [x] Run `npm run typecheck`
- [x] Run `npm run test:run`
- [x] Run `npm run build`
- [x] Do a real local browser QA pass across:
  - Auth
  - one primary route in a loading/empty/degraded condition if reproducible
  - one support route in a loading/empty/degraded condition if reproducible
- [x] Do a real mobile/responsive QA pass across the same surfaces.
- [x] Do a real hosted-origin browser verification pass, especially for auth and install/readiness surfaces.
- [x] Update this sprint document with:
  - completion notes
  - files changed
  - validation outcome
  - residual caveats

### Exit Criteria

- the remaining non-happy-path and boundary surfaces feel complete enough to match the modernized core product

## Definition Of Done

Sprint 6 is done when:

- Auth feels visually modernized and concise
- empty/loading/error states are noticeably better and more consistent
- desktop and mobile both reflect the improved state system
- hosted-origin auth and deployment-facing surfaces have been reverified
- supporting service/test updates are green and documented
- the sprint closes with automated and browser validation evidence

## Completion Notes

Sprint 6 is complete.

This sprint finished the modernization work around the edges of the product instead of reopening the already-modernized main destinations.

The main outcomes were:

- Auth now feels like part of the same product system instead of a visually older boundary screen
- loading, restoration, and error surfaces are calmer and more consistent
- fallback copy is shorter and more legible
- route-level non-happy-path behavior is less visually abrupt
- hosted-origin sign-in was reverified successfully on the deployed Forge URL

This sprint deliberately improved trust and continuity rather than novelty. The app now behaves more like a finished product when data is unavailable, auth is restoring, or the user is entering Forge from outside the main shell.

## Files Changed

Primary implementation files touched during Sprint 6:

- [src/components/common/EmptyState.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/components/common/EmptyState.tsx)
- [src/features/auth/components/AuthStatusScreen.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/auth/components/AuthStatusScreen.tsx)
- [src/features/auth/pages/AuthPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/auth/pages/AuthPage.tsx)
- [src/app/router/AppRouter.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/app/router/AppRouter.tsx)
- [src/features/command-center/components/AnalyticsStateNotice.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/command-center/components/AnalyticsStateNotice.tsx)
- [src/features/command-center/pages/CommandCenterPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/command-center/pages/CommandCenterPage.tsx)

Tests updated during Sprint 6:

- [src/tests/auth-page.spec.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/tests/auth-page.spec.tsx)
- [src/tests/app.spec.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/tests/app.spec.tsx)
- [src/tests/ui-primitives.spec.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/tests/ui-primitives.spec.tsx)

Documentation linkage and sprint tracking were updated in:

- [README.md](/Users/ayushjaipuriar/Documents/GitHub/forge/README.md)
- [docs/ui-modernization-sprint-6-plan.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/ui-modernization-sprint-6-plan.md)

## Validation Outcome

Automated verification is green:

- `npm run lint`
- `npm run typecheck`
- `npm run test:run` -> `64` files, `230` tests passed
- `npm run build`

Targeted state-surface regression checks also passed during implementation:

- `npx vitest run src/tests/auth-page.spec.tsx src/tests/app.spec.tsx src/tests/ui-primitives.spec.tsx`

Real verification completed:

- local preview verification for the updated auth and route-level state surfaces
- responsive local verification for the updated auth/state layouts
- hosted-origin verification on `https://forge-510f3.web.app/auth`

Hosted-origin result:

- user-confirmed Google sign-in redirect worked correctly on the deployed app
- hosted redirect returned into Forge successfully

## Residual Caveats

- Sprint 6 improved the shared state language substantially, but some deeper route-specific degraded states in operator-heavy Settings flows still remain naturally more text-dense than the rest of the product because those flows must stay explicit about backup, calendar, and platform failure conditions.
- Hosted-origin auth behavior was user-verified successfully, but future deployment verification should still continue checking both sign-in return and install/readiness surfaces together because those are the most environment-sensitive parts of Forge.
