# Phase 4 Configuration Safety Checklist

Use this as the Milestone 1 operator checklist for production configuration and secret handling.

The goal is simple:

- know which configuration belongs where
- never let browser, Functions, and future native-shell assumptions bleed into each other
- keep secrets out of git and out of placeholder docs

## Configuration Classes

### 1. Browser Web Build Configuration

Current owner:

- Vite environment variables in local `.env`
- deployed web environment values configured outside committed source

Current variables:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- optional: `VITE_FIREBASE_APPCHECK_SITE_KEY`

Rules:

- [ ] only `VITE_` values that the browser truly needs are placed in `.env`
- [ ] `.env` values are never committed
- [ ] `.env.example` remains placeholder-only
- [ ] App Check site key is treated as deployed-environment configuration, not a committed real value

### 2. Firebase Functions Runtime Configuration

Current owner:

- Firebase runtime-managed configuration
- Functions workspace scripts and deployment settings

Rules:

- [ ] do not copy `FIREBASE_CONFIG` into local committed files
- [ ] use [functions/.env.example](/Users/ayushjaipuriar/Documents/GitHub/forge/functions/.env.example) only as a placeholder reminder, not as a secret store
- [ ] prefer Firebase-managed runtime config for deployed Functions
- [ ] if local emulator-only variables are introduced later, document them explicitly before use

### 3. Hosting and Storage Configuration

Current owner:

- [firebase.json](/Users/ayushjaipuriar/Documents/GitHub/forge/firebase.json)
- repo-managed Firestore and Storage rules

Rules:

- [ ] Hosting rewrite and cache-header behavior stays repo-managed
- [ ] Firestore rules and indexes stay repo-managed
- [ ] Storage rules stay repo-managed
- [ ] backup payload storage assumptions remain aligned with Firebase Storage, not hidden console-only behavior

### 4. OAuth and Origin Boundaries

Current owner:

- Firebase Auth Google sign-in for browser/PWA
- Google Calendar browser popup flow

Current approved origins:

- `localhost`
- `127.0.0.1`
- deployed web/Hosting origin

Rules:

- [ ] browser and PWA redirect assumptions are documented as browser-origin-dependent
- [ ] native shell is not treated as auth-ready until its callback/origin model is explicitly implemented
- [ ] Calendar OAuth is still documented as browser-interactive, not long-lived server-managed OAuth

### 5. Native Shell Configuration Boundary

Current Phase 4 posture:

- Capacitor is the planned native shell direction
- native shell config is not yet implemented

Rules:

- [ ] do not invent native secrets or callback values in web `.env`
- [ ] native build config should live in native-shell-specific files once the shell exists
- [ ] browser auth and browser OAuth settings should not be described as automatically valid for native shell builds

## Git Safety Checks

- [ ] `git status` reviewed before staging
- [ ] `git diff --cached` reviewed before commit
- [ ] no `.env`, `.env.*`, `.bak`, `.backup`, `.pem`, `.key`, `.p12`, or service-account JSON files are staged
- [ ] placeholder-only docs do not contain real tokens, keys, or callback URLs
- [ ] new platform config files are ignored or templated correctly before commit

## Verification Commands

Use these commands when validating the current configuration surface:

```bash
npm run lint
npm run typecheck
npm run test:run
npm run build
npm run functions:verify
```

## Milestone 1 Result Standard

Milestone 1 is only complete when:

- local, deployed, Functions, and future native-shell config boundaries are written down clearly
- secret-handling rules are explicit and practical
- the repo has a repeatable verification path for both the app and the Functions workspace
