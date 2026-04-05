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
- a redesigned auth entry surface that uses the Forge mark as a staged background element so guest and Google entry read like one intentional entry gate instead of a plain auth form
- a follow-up auth-entry sizing pass so the panel keeps the staged composition without growing larger than the original entry-card footprint
- a final auth-entry placement pass so the panel sits centered in the composition instead of reading like a low-floating slab on desktop
- removal of the extra dark top overlay behind the auth panel so the Forge-mark stage reads cleanly instead of like a shadow cap above the card
- reduction and downward repositioning of the Forge-mark silhouette so the branded background stays visible without creating a dark cap above the centered auth panel
- a production guest-to-user follow-up in `src/data/local/forgeDb.ts` so local workspace resets clear IndexedDB stores in place instead of deleting the entire database, which is safer for browser + installed-PWA sessions with multiple open connections
- regression coverage in `src/tests/services/forge-db-reset.spec.ts` proving Forge can reopen local storage immediately after a full workspace reset

## Why This Shape

The guest workspace is intentionally local-only.

That means:

- guest sessions do not rely on Firebase Auth to browse the app
- guest data is seeded into local IndexedDB as believable demo history
- guest writes do not enqueue cloud sync work
- signing out of guest mode clears the local workspace instead of preserving it as a real account
- if a real authenticated session starts after guest usage, Forge clears the guest-local workspace before bootstrapping the authenticated user

This keeps the guest experience useful without creating misleading cloud behavior or contaminating real user state.

The reset implementation now clears all local stores in place rather than calling `indexedDB.deleteDatabase()`.
That tradeoff matters because installed PWAs and multi-tab browser sessions can keep extra IndexedDB connections open.
If Forge tries to delete the whole database in that state, the delete can become blocked and the app can appear to load forever afterward.
Clearing stores in place is less dramatic, but much more reliable for a real browser/PWA runtime.

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
