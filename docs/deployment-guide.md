# Deployment Guide

## Phase 1 Direction

Firebase Hosting is the intended default deployment target.

## Current Status

- production builds now generate a manifest, install icons, and a service worker through `vite-plugin-pwa`
- the app shell is configured for offline recovery with precached assets plus runtime caching for navigations, scripts, styles, and images
- Firebase Hosting configuration now exists in [firebase.json](/Users/ayushjaipuriar/Documents/GitHub/forge/firebase.json) with SPA rewrites and cache headers for the shell, manifest, and service worker
- the shell exposes install, update, and offline/degraded-state messaging directly in the UI instead of relying on browser chrome alone
- direct Android Chrome verification has now been completed on a real `adb`-connected device using the built preview served over `adb reverse`

## Build and Preview

```bash
npm install
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

This gives the closest local equivalent of the deployed Hosting shell, including generated manifest and service-worker assets.

## Firebase Hosting Deployment

```bash
npm run functions:install
npm run launch:verify
firebase deploy --only hosting,firestore:rules,firestore:indexes,storage,functions
```

Current Hosting expectations:

- build output lives in `dist/`
- SPA routes rewrite to `/index.html`
- `sw.js` and `manifest.webmanifest` are intentionally served with `no-cache`
- hashed JS, CSS, font, and image assets are served with long-lived immutable cache headers
- Firestore rules and indexes are expected to deploy from the repo-managed `firestore.rules` and `firestore.indexes.json` files
- Firebase Functions now deploy from the repo-managed `functions/` workspace

## Installability Validation Checklist

- open the built preview or deployed Hosting URL in Chromium
- confirm `manifest.webmanifest` loads and the page title/theme color are correct
- confirm a service worker is registered for the app scope
- confirm install icons load successfully from the manifest
- confirm the shell reloads while offline after one successful online visit
- confirm the in-app PWA status card reflects offline, queued, install, and update states honestly

## Current Limitations

- live authenticated offline verification for Today still depends on real Firebase `.env` values because the built app currently lands on the auth gate without local auth config
- offline resilience currently focuses on cached shell recovery plus local IndexedDB-backed state, not full query-cache persistence for every route

## Latest Device Verification

- verified on a real Android device in Chrome that the built Forge auth shell loads correctly at the preview origin
- verified Chrome surfaced the Android install flow through `Add to home screen`, with both `Install` and `Create shortcut` options visible
- verified that reopening the same URL after stopping the local preview origin still rendered the cached auth shell, which confirms the Android offline shell baseline

## Production Environment Notes

- keep Firebase web config in local environment files and Hosting runtime configuration, never in committed source
- keep `VITE_FIREBASE_APPCHECK_SITE_KEY` out of committed local `.env` examples with real values; use placeholder-only docs and real deployment environment configuration
- service-worker behavior is only meaningful on a built preview or deployed origin, not the raw Vite dev server
- if install/update behavior looks stale during testing, clear the browser’s site data and service-worker registration before rechecking
- local development intentionally skips App Check on `localhost` and `127.0.0.1`; treat enforcement as a deployed-environment rollout step, not a local prerequisite
- the Functions workspace has its own install/build lifecycle; run `npm run functions:install` before first deploy or emulator use

## Phase 4 Launch Operations

- use [docs/phase-4-launch-operations.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/phase-4-launch-operations.md) as the repeatable smoke-test and rollback runbook
- use [docs/phase-4-release-readiness-checklist.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/phase-4-release-readiness-checklist.md) as the launch gate
- `npm run launch:verify` is now the preferred pre-deploy verification path because it exercises the root app plus the Functions workspace together

## Rollback Notes

- Hosting rollback should be treated independently from Functions rollback when the fault is clearly shell-only or server-only
- after any rollback, re-check the Settings diagnostics surface plus the highest-risk smoke tests before treating the system as recovered
- rules rollback should target the specific Firestore or Storage ruleset that regressed rather than broad unrelated deploy changes

## Phase 3 Operational Notes

- browser and installed-PWA notifications are the only supported delivery channels today; scheduled Functions can evaluate and persist candidates, but they do not create native mobile push by themselves
- scheduled backup payloads are now expected to live in Cloud Storage with Firestore metadata as the operational index
- Google Calendar integration currently depends on user-interactive browser OAuth and supports the primary calendar plus explicit major-block mirroring only
- health integration remains scaffold-only in this phase and should not be represented as a live provider ingestion system during deployment or QA signoff

## Phase 4 Configuration Notes

- web build configuration and Functions runtime configuration should be treated as separate layers
- `npm run functions:verify` is now the preferred root-level pre-deploy check for the Functions workspace
- browser popup auth assumptions currently apply to:
  - `localhost`
  - `127.0.0.1`
  - the deployed web origin
- future native-shell callback and permission behavior should be configured as native-shell-specific work, not mixed into the current web `.env`

## Native Shell Notes

- use [docs/phase-4-native-shell-workflow.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/phase-4-native-shell-workflow.md) for local Capacitor and Android shell setup
- the current native shell is a local build/install/launch foundation, not a separate production deployment target yet
- native-shell builds currently bundle the same built web assets and web Firebase config assumptions used by the browser product
- Milestone 5 now makes native support boundaries explicit in-product: auth, Calendar, backup export, and restore import are still browser-constrained inside the shell even though launch/install is real
- do not treat the native shell as evidence that native push, native auth callback completion, or health-provider bridges are production-ready
