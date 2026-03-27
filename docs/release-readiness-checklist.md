# Release Readiness Checklist

Use this as the final operator-facing QA and release gate for Phase 1.

## Code Health

- [ ] `npm run lint`
- [ ] `npm run test:run`
- [ ] `npm run typecheck`
- [ ] `npm run build`

## Primary Product Flows

- [ ] auth gate renders honestly when Firebase config is missing
- [ ] authenticated app shell loads after sign-in
- [ ] Today supports mode changes, block status updates, block notes, and daily signals
- [ ] Schedule supports sanctioned day-type overrides and fallback activation
- [ ] Prep, Physical, and Readiness render persisted or derived real data rather than placeholders
- [ ] score preview and next-action recommendation update when execution state changes

## Local-First and Sync Flows

- [ ] queued local writes remain visible while offline or unauthenticated
- [ ] reconnecting replays outstanding queue items successfully
- [ ] failed sync items remain replayable instead of being treated as settled
- [ ] current known conflict strategy is still documented as coarse whole-record upsert behavior

## Platform and Deployment

- [ ] built preview exposes manifest, service worker, and install icons
- [ ] shell reloads offline after one successful online visit
- [ ] Hosting rewrite and cache-header behavior remain aligned with `firebase.json`
- [ ] desktop Chromium installability has been verified
- [x] Android Chrome installability has been verified on a real device or emulator

## Documentation

- [ ] `README.md` reflects current setup and known limitations
- [ ] `docs/architecture-overview.md` matches the implemented boundaries
- [ ] `docs/firebase-setup.md` reflects the current auth/bootstrap reality
- [ ] `docs/deployment-guide.md` reflects current PWA and Hosting behavior
- [ ] `docs/google-calendar-scaffolding.md` explains the real Phase 1 seam and Phase 2 next step
- [ ] unresolved limitations are documented honestly

## Release Blockers Still Open Today

- [x] live Firebase verification with real `.env` values
