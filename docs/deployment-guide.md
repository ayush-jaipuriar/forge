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
npm run build
npm run functions:install
firebase deploy --only hosting,firestore:rules,firestore:indexes,functions
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
