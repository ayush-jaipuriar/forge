# Guest Workspace Implementation Notes

## What Changed

Forge now supports a temporary guest workspace that lets visitors explore the product with seeded demo data before signing in.

This iteration touched:

- `src/features/auth/providers/AuthSessionProvider.tsx`
- `src/features/auth/pages/AuthPage.tsx`
- `src/app/router/AppRouter.tsx`
- `src/components/layout/AppShell.tsx`
- `src/features/auth/services/bootstrapGuestSession.ts`
- `src/services/sync/persistSyncableChange.ts`
- guest-aware mutation services and hooks across `Today`, `Schedule`, `Prep`, `Physical`, and `Settings`
- auth and service regression tests
- a shared in-app guest CTA in the shell so temporary sessions are explained after sign-in too

## Why This Shape

The guest workspace is intentionally local-only.

That means:

- guest sessions do not rely on Firebase Auth to browse the app
- guest data is seeded into local IndexedDB as believable demo history
- guest writes do not enqueue cloud sync work
- signing out of guest mode clears the local workspace instead of preserving it as a real account
- if a real authenticated session starts after guest usage, Forge resets the guest-local workspace before bootstrapping the authenticated user

This keeps the guest experience useful without creating misleading cloud behavior or contaminating real user state.

Forge now also surfaces a shared guest CTA inside the authenticated shell so visitors can:

- understand that the workspace is temporary
- keep exploring without friction
- upgrade into a real Google-backed session when they decide the product is useful

## Seeded Guest Data

The guest bootstrap currently seeds:

- a default settings document
- roughly four weeks of day instances
- daily sleep and energy signals
- workout log examples
- prep progress snapshots across multiple domains
- execution-note history on selected completed blocks

## Validation

The guest workspace implementation passes:

- `npm run lint`
- `npm run typecheck`
- `npm run test:run`
- `npm run build`

## Next Steps

- optionally add a small in-product guest notice in Settings if we want the local-only boundary to be even more explicit
- optionally add a dedicated guest-to-real-account transition CTA if guest mode becomes part of the hosted onboarding path
