# Firebase Setup

## Phase 1 Intent

Firebase will be wired for real in Phase 1, with Google Sign-In as the only authentication provider and Firestore as the primary persisted store.

## Environment Variables

The project expects the following variables:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

## Beginner Verification Walkthrough

Use this sequence when you want to verify or re-verify the Milestone 2 Firebase wiring for this repo.

### 1. Create a Firebase project

In the Firebase console:

- create a new project
- you may disable Google Analytics for this app if you do not need it right now

Why this matters:

- Firebase groups Auth, Firestore, Hosting, and app config under one project
- the web config values used by Forge come from this project

### 2. Register the web app

In the Firebase project:

- open Project settings
- in the General tab, create a Web app if one does not exist yet
- give it any sensible dev name such as `forge-web`
- copy the web app config values

You will need these exact values in local `.env`:

- `apiKey`
- `authDomain`
- `projectId`
- `storageBucket`
- `messagingSenderId`
- `appId`

Why this matters:

- Forge reads these values from Vite environment variables at startup
- if even one value is missing, the app intentionally disables Firebase flows instead of failing later in a confusing way

### 3. Create the local `.env`

From the repo root:

```bash
cp .env.example .env
```

Then replace the placeholder values in `.env` with the real Firebase web config from the console.

This repo expects:

```bash
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Why this matters:

- Vite exposes only `VITE_`-prefixed variables to browser code
- these values are read by [config.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/lib/firebase/config.ts) and then used by [client.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/lib/firebase/client.ts)

### 4. Enable Google sign-in

In the Firebase console:

- go to Authentication
- click Get started if Auth is not enabled yet
- open Sign-in method
- enable Google
- choose the project support email when prompted
- save

Recommended domain checks for local development:

- confirm `localhost` is authorized
- add `127.0.0.1` as an authorized domain if you plan to use `npm run preview -- --host 127.0.0.1 --port 4173`

Why this matters:

- Forge uses Google popup sign-in only
- if Google is not enabled, the sign-in button may appear but the auth flow will fail
- popup-based auth is sensitive to origin/domain mismatches

### 5. Create Firestore

In the Firebase console:

- open Firestore Database
- click Create database

If your goal is only to verify this private dev app quickly, the simplest path is:

- start in Test mode temporarily

Tradeoff:

- Test mode is easy for first verification
- it is not appropriate for a real deployed app

If you already want a safer setup, we should add repo-managed Firestore rules right after verification.

Why this matters:

- Forge bootstraps user and settings documents on first sign-in
- without Firestore enabled, auth can succeed but the session bootstrap will fail

### 6. Start the app fresh

If a dev server is already running, stop it and restart after adding `.env`.

For normal development:

```bash
npm run dev
```

For a production-like auth and PWA check:

```bash
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

Why this matters:

- Vite reads environment variables at startup, not live while the server is already running
- restarting avoids chasing stale-config bugs

### 7. Verify the auth gate behavior

Open Forge in the browser and go to the auth screen.

You should now see:

- no missing Firebase config warning
- an enabled `Continue with Google` button

Why this matters:

- this is the fastest signal that your local config was loaded correctly
- if the button is still disabled, the app is still not seeing complete Firebase config

### 8. Sign in with Google

Click `Continue with Google` and complete the popup flow.

Expected outcome:

- the popup succeeds
- the app moves from `/auth` into the authenticated shell

Why this matters:

- this verifies the Authentication product itself, not just local config parsing
- it also exercises the session observer path used by the app

### 9. Verify bootstrap documents in Firestore

After the first successful sign-in, open Firestore in the console and check for:

- `users/{uid}`
- `users/{uid}/settings/default`

The bootstrap logic lives in [bootstrapUserSession.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/src/features/auth/services/bootstrapUserSession.ts).

Why this matters:

- this is the proof that auth and Firestore are both connected correctly
- the app depends on the default settings document existing for later local-first sync flows

### 10. Trigger a real persisted write from the app

After sign-in, do one or two small actions in Forge, for example:

- change the day mode on Today
- update a daily signal like energy or sleep
- mark a block complete or skipped

Then check Firestore for additional persisted state. The most important write paths are:

- `users/{uid}/settings/default`
- `users/{uid}/dayInstances/{dayId}`

Why this matters:

- bootstrap only proves the app can create initial documents
- this step proves the local-first queue can eventually reach Firestore too

### 11. What counts as Milestone 2 complete

For this repo, Milestone 2 is operationally complete when all of these are true:

- Google popup sign-in succeeds
- first-login bootstrap creates `users/{uid}`
- first-login bootstrap creates `users/{uid}/settings/default`
- a real post-login user action results in Firestore writes for settings or day instances

## What This Repo Writes

The current Firebase write surface is intentionally small:

- bootstrap user document: `users/{uid}`
- bootstrap settings document: `users/{uid}/settings/default`
- synced settings updates: `users/{uid}/settings/default`
- synced day execution snapshot: `users/{uid}/dayInstances/{dayId}`

This is useful when inspecting Firestore because you know exactly which paths should appear.

## Common Beginner Pitfalls

- you added values to `.env` but forgot to restart the dev server
- Google sign-in is not enabled in Firebase Authentication
- `127.0.0.1` is not authorized while preview is running on `127.0.0.1:4173`
- Firestore was never created, so auth succeeds but bootstrap fails
- one of the `VITE_FIREBASE_*` values was copied incorrectly

## Next Implementation Step

Milestone 2 now wires:

- Firebase app initialization
- Firebase Auth session observation
- Google Sign-In via popup
- Firestore bootstrap flows for the first signed-in user

## Auth Flow

1. Forge initializes Firebase from environment variables.
2. The auth session provider subscribes to `onAuthStateChanged`.
3. When a user is present, Forge bootstraps:
   - `users/{uid}`
   - `users/{uid}/settings/default`
4. Protected routes render only after the authenticated session is ready.

## Local Verification Note

Without real Firebase project values in `.env`, the app will honestly show a configuration warning on the sign-in screen instead of pretending auth is available.

## Current Verification Status

Milestone 2 has now been verified against a real Firebase project:

- Google Sign-In popup succeeded
- first-login bootstrap created `users/{uid}`
- first-login bootstrap created `users/{uid}/settings/default`

The main remaining Firebase follow-up is not a Milestone 2 blocker anymore. It is a hardening task:

- confirm additional queued post-login writes such as `dayInstances/{dayId}` under normal daily use and then tighten Firestore rules from temporary test-mode defaults
