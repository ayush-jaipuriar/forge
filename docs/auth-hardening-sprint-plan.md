# Auth Hardening Sprint Plan

## Purpose

This document defines a focused auth-improvement sprint for Forge.

The sprint exists because Sprint 3.1 proved that the app-side `Cross-Origin-Opener-Policy` gap was real and fixable, but it also proved that the remaining Google popup-return console noise is not something we should keep chasing with more header tuning alone.

The next correct step is to change the browser sign-in model itself.

For this sprint:

- Google redirect becomes the **primary** sign-in flow for web and installed PWA use
- the browser/PWA path is optimized first
- the Capacitor/native-shell path is explicitly treated as a follow-on validation concern, not the primary implementation target
- small auth-surface copy and loading-state adjustments are allowed when they improve clarity around the redirect handoff

## Why This Sprint Exists

Forge is now polished enough that auth runtime quality stands out sharply.

The live browser audit showed:

- shell and page hierarchy are materially improved
- the product is production-usable on the web/PWA path
- the remaining auth issue is no longer visual; it is the reliability and cleanliness of the sign-in return path

Popup auth gave us two problems:

1. repeated popup-return console noise after real Google sign-in
2. a browser behavior profile that is less stable than it should be for the production reference runtime

Redirect auth is the more appropriate browser-first model for Forge because:

- it avoids the popup close lifecycle entirely
- it behaves more predictably in installed-PWA contexts
- it aligns better with “return to the app already signed in” expectations

## Decisions Locked For This Sprint

These decisions come from the clarified product direction:

- redirect is the primary Google sign-in flow everywhere Forge can reasonably support it today
- browser/PWA is the first-class target for this sprint
- the sprint is not constrained by preserving the current popup-centered one-click ceremony
- if redirect is the cleanest browser behavior, it is acceptable for Forge to adopt it as the main path
- small follow-on auth copy and loading-state improvements are in scope

## Scope

This sprint is limited to:

- redirect-first Google sign-in for browser/PWA
- redirect-return result handling and error recovery
- session restoration behavior after redirect return
- auth-surface copy and loading-state updates needed to explain redirect transitions honestly
- automated and live verification of the browser/PWA auth path
- a bounded follow-on check of the Capacitor/native-shell path after the web/PWA flow is stable

This sprint explicitly does **not** include:

- a broader auth provider expansion
- Apple sign-in or email/password support
- server-owned long-lived OAuth token management
- a broad rework of route protection beyond what redirect auth requires
- a native-only auth redesign

## Inputs

### Prior References

- [docs/ui-modernization-sprint-3-1-plan.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/ui-modernization-sprint-3-1-plan.md)
- [docs/phase-4-launch-candidate-summary.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/phase-4-launch-candidate-summary.md)
- [docs/production-deployment-and-phone-install-guide.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/production-deployment-and-phone-install-guide.md)

### Primary Implementation Files

- [src/features/auth/providers/AuthSessionProvider.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/auth/providers/AuthSessionProvider.tsx)
- [src/features/auth/pages/AuthPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/auth/pages/AuthPage.tsx)
- [src/features/auth/types/auth.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/auth/types/auth.ts)
- [src/app/router/AppRouter.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/app/router/AppRouter.tsx)
- [src/lib/firebase/client.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/lib/firebase/client.ts)

### Likely Supporting Files

- [src/features/auth/services/bootstrapUserSession.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/auth/services/bootstrapUserSession.ts)
- [src/features/auth/components/AuthStatusScreen.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/auth/components/AuthStatusScreen.tsx)
- [src/tests/auth-page.spec.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/tests/auth-page.spec.tsx)
- [src/tests/app.spec.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/tests/app.spec.tsx)
- [src/tests/settings-page.spec.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/tests/settings-page.spec.tsx)
- [firebase.json](/Users/ayushjaipuriar/Documents/GitHub/forge/firebase.json)
- [vite.config.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/vite.config.ts)

## Sprint Goals

By the end of this sprint:

- browser/PWA Google sign-in should use redirect as the primary path
- a returning signed-in user should land back in Forge without being asked to sign in again
- redirect return should feel intentional, not like a broken page refresh
- auth loading states should tell the truth about what Forge is doing
- avoidable popup-return console noise should no longer be part of the primary web/PWA path
- the Capacitor/native-shell path should be checked and documented honestly after the browser change

## Workstream 1: Redirect-First Auth Architecture

### Goal

Replace the popup-centered browser auth path with a redirect-first flow that restores the same authenticated application boundary.

### Why This Matters

This is the architectural heart of the sprint.

The current provider already handles:

- checking
- authenticated
- unauthenticated
- missing config
- error

That means we do **not** need to redesign routing from scratch. We need to change how the provider initiates sign-in and how it resolves the return path.

### Checklist

- [ ] Audit the current provider lifecycle around `setPersistence`, `signInWithPopup`, and `onAuthStateChanged`.
- [ ] Replace the primary browser sign-in initiation with `signInWithRedirect`.
- [ ] Decide whether Forge should still keep popup auth anywhere in code as:
  - a non-default fallback
  - a native-shell-only fallback later
  - or not at all for this sprint
- [ ] Ensure redirect initiation does not leave the provider in a misleading permanent `checking` state before navigation leaves the app.
- [ ] Preserve the existing bootstrap flow after Firebase reports the signed-in user.
- [ ] Keep sign-out behavior unchanged unless redirect handling requires a small state cleanup improvement.

### Primary Files

- [src/features/auth/providers/AuthSessionProvider.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/auth/providers/AuthSessionProvider.tsx)
- [src/lib/firebase/client.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/lib/firebase/client.ts)

### Exit Criteria

- browser/PWA sign-in starts through redirect, not popup
- the provider still reaches `authenticated` only after bootstrap succeeds
- the primary auth path no longer relies on popup close behavior

## Workstream 2: Redirect Return And Session Restoration

### Goal

Make redirect return feel stable, explicit, and trustworthy.

### Why This Matters

Changing sign-in initiation is only half the job.

Redirect auth introduces a different lifecycle:

- user clicks sign-in
- browser leaves the app
- browser returns to the app
- Firebase restores auth state
- Forge boots the user workspace

If we do not structure this carefully, users can experience flicker, redundant states, or confusing return copy.

### Checklist

- [ ] Add explicit redirect-result handling where it belongs in the auth lifecycle.
- [ ] Decide whether redirect result should be handled:
  - proactively on provider mount
  - implicitly through `onAuthStateChanged`
  - or with a hybrid approach for better error handling
- [ ] Ensure a returning signed-in user is routed straight into the protected app once Firebase state is restored.
- [ ] Prevent accidental “show auth page, then bounce into app” flicker during redirect return.
- [ ] Ensure errors from redirect return are surfaced as readable auth errors rather than silent failures.
- [ ] Confirm the browser remembers the signed-in session and does not ask the user to log in every visit when Firebase persistence is healthy.

### Primary Files

- [src/features/auth/providers/AuthSessionProvider.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/auth/providers/AuthSessionProvider.tsx)
- [src/app/router/AppRouter.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/app/router/AppRouter.tsx)
- [src/features/auth/services/bootstrapUserSession.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/auth/services/bootstrapUserSession.ts)

### Exit Criteria

- redirect return behaves like a real app handoff, not a broken refresh
- authenticated users return directly into Forge once Firebase state resolves
- redirect errors are readable and bounded

## Workstream 3: Auth Surface Copy And Loading-State Honesty

### Goal

Update the auth UX so it tells the truth about redirect-based sign-in and return-state preparation.

### Why This Matters

When a flow changes from popup to redirect, even subtle copy becomes misleading if it still implies an in-place handoff.

The user should understand:

- when Forge is handing them off to Google
- when Forge is restoring the session
- when Forge is bootstrapping the workspace

This reduces confusion and makes the redirect flow feel deliberate instead of jarring.

### Checklist

- [ ] Review `AuthPage` button label and supporting copy for redirect truthfulness.
- [ ] Review `AuthStatusScreen` copy for redirect-return states.
- [ ] Decide whether Forge needs a slightly different message for:
  - sending the user to Google
  - returning from Google
  - restoring the authenticated workspace
- [ ] Keep the UI compact and serious; do not over-explain or add ceremony just because redirect exists.
- [ ] Update any capability or settings copy that still claims popup auth is the primary supported browser path.

### Primary Files

- [src/features/auth/pages/AuthPage.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/auth/pages/AuthPage.tsx)
- [src/features/auth/components/AuthStatusScreen.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/auth/components/AuthStatusScreen.tsx)
- [src/tests/settings-page.spec.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/tests/settings-page.spec.tsx)

### Exit Criteria

- UI copy matches the real redirect behavior
- no important auth surface still describes popup as the primary browser model

## Workstream 4: Browser/PWA Verification

### Goal

Prove that redirect-first auth behaves cleanly in the production reference runtime.

### Why This Matters

This sprint is explicitly web/PWA-first.

That means success is not “the code compiles.” Success is:

- auth works in a real browser
- auth survives a real redirect round-trip
- app return feels intentional
- prior popup-return console noise is no longer part of the primary path

### Checklist

- [ ] Extend automated auth tests for redirect-first behavior and provider state transitions.
- [ ] Run the full repo verification suite:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test:run`
  - `npm run build`
- [ ] Run a real local browser verification using the built or previewed app.
- [ ] Verify a full Google redirect round-trip with a real account.
- [ ] Verify that a signed-in revisit restores the session without re-prompting for login.
- [ ] Check browser console output after redirect return and record whether remaining noise exists.

### Primary Files

- [src/tests/auth-page.spec.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/tests/auth-page.spec.tsx)
- [src/tests/app.spec.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/tests/app.spec.tsx)
- [src/features/auth/providers/AuthSessionProvider.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/auth/providers/AuthSessionProvider.tsx)

### Exit Criteria

- automated verification is green
- real browser redirect auth is confirmed
- signed-in revisit behavior is confirmed

## Workstream 5: Capacitor/Native Follow-On Check

### Goal

Check the native-shell impact honestly after the browser/PWA path is stable.

### Why This Matters

The user explicitly chose to optimize browser/PWA first, then evaluate Capacitor/native.

That means the native-shell work here is not a redesign. It is a truthfulness checkpoint:

- does redirect still behave acceptably inside the wrapped shell?
- if not, should the shell eventually use a different auth path?

### Checklist

- [ ] Review whether Capacitor/native-shell uses the same browser redirect flow without obvious breakage.
- [ ] If practical, run a local native-shell smoke validation after the browser/PWA change.
- [ ] Document any limitation honestly instead of pretending the shell path is fully solved if it is not.
- [ ] Decide whether the native path should remain:
  - acceptable as-is
  - a bounded caveat
  - or a later dedicated sprint topic

### Primary Files

- [docs/phase-4-native-shell-workflow.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/phase-4-native-shell-workflow.md)
- [src/features/auth/providers/AuthSessionProvider.tsx](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/auth/providers/AuthSessionProvider.tsx)

### Exit Criteria

- browser/PWA path is the solved primary path
- native-shell impact is checked and documented honestly

## Validation Plan

This sprint should end with:

- unit and integration coverage for the auth provider and auth page transitions
- regression validation for route gating where auth state changes
- full repo verification:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test:run`
  - `npm run build`
- real local browser/PWA-style verification with:
  - initial unauthenticated visit
  - redirect sign-in
  - return to Forge
  - signed-in revisit
  - sign-out
- a bounded native-shell follow-on check if feasible

## Definition Of Done

This sprint is done when:

- redirect is the primary Google sign-in path for browser/PWA
- returning users are restored into the app without needless re-login
- the auth UI tells the truth about redirect behavior
- popup-return console noise is no longer part of the primary supported web/PWA auth path
- automated verification is green
- the native-shell impact is checked and documented honestly

## Implementation Notes Placeholder

To be filled in during implementation:

- files changed
- provider strategy actually chosen
- test additions
- live verification outcome
- native-shell follow-on result
