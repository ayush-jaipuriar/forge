# Deployment Guide

## Phase 1 Direction

Firebase Hosting is the intended default deployment target.

## Current Status

- production builds now generate a manifest, install icons, and a service worker through `vite-plugin-pwa`
- the app shell is configured for offline recovery with precached assets plus runtime caching for navigations, scripts, styles, and images
- Firebase Hosting configuration now exists in [firebase.json](/Users/ayushjaipuriar/Documents/GitHub/forge/firebase.json) with SPA rewrites and cache headers for the shell, manifest, and service worker
- the shell exposes install, update, and offline/degraded-state messaging directly in the UI instead of relying on browser chrome alone

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
firebase deploy --only hosting
```

Current Hosting expectations:

- build output lives in `dist/`
- SPA routes rewrite to `/index.html`
- `sw.js` and `manifest.webmanifest` are intentionally served with `no-cache`
- hashed JS, CSS, font, and image assets are served with long-lived immutable cache headers

## Installability Validation Checklist

- open the built preview or deployed Hosting URL in Chromium
- confirm `manifest.webmanifest` loads and the page title/theme color are correct
- confirm a service worker is registered for the app scope
- confirm install icons load successfully from the manifest
- confirm the shell reloads while offline after one successful online visit
- confirm the in-app PWA status card reflects offline, queued, install, and update states honestly

## Current Limitations

- direct Android Chrome verification has not been completed in this repo session because no Android device was connected over `adb` and no local Android emulator was available; desktop Chromium verification is complete, and the shell was also spot-checked in a mobile-sized viewport
- live authenticated offline verification for Today still depends on real Firebase `.env` values because the built app currently lands on the auth gate without local auth config
- offline resilience currently focuses on cached shell recovery plus local IndexedDB-backed state, not full query-cache persistence for every route

## Production Environment Notes

- keep Firebase web config in local environment files and Hosting runtime configuration, never in committed source
- service-worker behavior is only meaningful on a built preview or deployed origin, not the raw Vite dev server
- if install/update behavior looks stale during testing, clear the browser’s site data and service-worker registration before rechecking
