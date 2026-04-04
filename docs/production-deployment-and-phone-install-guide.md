# Forge Production Deployment And Phone Install Guide

This guide explains the real, current end-to-end path for taking Forge from your local repo to a live, usable product and then installing it on your phone.

It is written for the current Phase 4 launch-candidate posture of the repo.

## Short Answer

Yes, Forge is ready to use in production on the **web and installed PWA** path.

That is the recommended production path right now.

Forge is also verified as an **Android native-shell foundation** through Capacitor, and you can install that on your own Android phone or emulator. But the honest support boundary today is:

- web production: **ready**
- installed PWA on phone: **ready**
- Android native shell sideload for personal/pilot use: **ready**
- Play Store / fully native mobile product: **not the claimed production posture yet**

Why:

- the launch checklist is green
- the full repo verification is green
- Firebase Hosting + Functions + Firestore + Storage deployment is documented and verified
- Android shell build, install, and launch have been verified locally

But:

- native mobile push is not shipped
- native auth callback completion is not shipped
- native health bridges are not shipped
- the native shell is still a wrapper around the web product, not a fully separate native platform

So if your goal is:

- **use Forge for real now**: deploy the web app and install it as a PWA on your phone
- **also test/use the Android shell on your own device**: build and sideload the APK

## Recommended Production Strategy

Use this order:

1. deploy Forge to Firebase Hosting + Functions
2. verify the live deployed URL
3. install that deployed site as a PWA on your phone
4. optionally build and sideload the Android APK if you want the Capacitor shell too

This is the cleanest path because the deployed PWA is the most honest and fully supported runtime today.

## What You Need Before Deploying

### 1. Local prerequisites

On your machine, make sure these work:

- Node.js
- npm
- Firebase CLI
- Java and Android SDK only if you also want the Android native shell
- `adb` only if you also want to install directly on an Android device

Recommended version note:

- the Functions workspace declares Node `20`
- if your machine is on Node `22`, installs may still work, but npm can warn about engine mismatch
- for the cleanest parity with deployed Functions, prefer Node `20`

If `firebase` is not installed yet, install it first:

```bash
npm install -g firebase-tools
firebase --version
```

### 2. Firebase project prerequisites

Your Firebase project needs:

- Firebase Hosting enabled
- Firestore enabled
- Cloud Storage enabled and initialized
- Functions enabled
- Google sign-in enabled in Firebase Authentication

Important:

- Forge scheduled backups now depend on Firebase Storage
- the deploy command includes `storage`
- if Storage has not been initialized in the Firebase project, deploy will fail before completion

To initialize Storage:

1. open Firebase Console
2. open your Forge project
3. go to `Storage`
4. click `Get started`
5. choose a region
6. finish setup

### 3. Local environment file

Your repo root `.env` must contain real Firebase web config values.

Forge expects:

```bash
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Optional later:

```bash
VITE_FIREBASE_APPCHECK_SITE_KEY=...
```

## Part 1: Production Deployment

### Step 1. Install dependencies

From the repo root:

```bash
npm install
npm run functions:install
```

Why:

- the main app and the Functions workspace are verified separately
- production deployment touches both

What you may see:

- if your local Node version is newer than `20`, `npm run functions:install` can print an `EBADENGINE` warning

What that means:

- this is a version-parity warning, not an immediate failure
- it did not block the real setup attempt
- the cleaner long-term move is to use Node `20` locally for Functions work

### Step 2. Confirm Firebase CLI login and project selection

If `firebase login` says `command not found`, install the CLI first:

```bash
npm install -g firebase-tools
firebase --version
```

Then continue:

```bash
firebase login
firebase use --add
```

Pick the Firebase project that belongs to Forge.

Why:

- the deploy commands below assume the CLI is pointed at the correct project
- this avoids accidental deployment into the wrong Firebase project

### Step 3. Run the launch gate

```bash
npm run launch:verify
```

What this covers:

- lint
- typecheck
- tests
- production build
- Functions lint/typecheck/build

Why:

- this is the current production verification command for the repo
- if this is red, do not deploy yet

### Step 4. Deploy Forge

Before this step, make sure Firebase Storage has been initialized in the project.

If it has not, deploy can fail with an error like:

```text
Firebase Storage has not been set up on project '...'
```

That is a Firebase project setup issue, not an app-code issue.

```bash
firebase deploy --only hosting,firestore:rules,firestore:indexes,storage,functions
```

What this deploys:

- web app hosting
- Firestore rules
- Firestore indexes
- Storage rules
- Firebase Functions

Why this exact command matters:

- Forge now depends on repo-managed rules and Functions, not just static hosting
- scheduled backups and other platform behavior need these layers aligned

If deploy fails on `storage`:

1. open Firebase Console
2. open `Storage`
3. click `Get started`
4. finish initialization
5. rerun the same deploy command

### Step 5. Open the live Hosting URL

After deploy, Firebase will print a Hosting URL.

Open it and verify:

- the app loads
- Google sign-in works
- the authenticated shell opens
- Settings loads without infrastructure errors

### Step 6. Do a real live smoke test

At minimum, test these on the deployed URL:

1. Sign in with Google
2. Change day mode
3. Mark one block complete or skipped
4. Open Settings and confirm diagnostics render
5. Export a manual backup JSON
6. If you use Calendar, connect Calendar read and verify status surfaces

Why:

- successful deploy is not enough
- this proves the live environment works with real Firebase services

## Part 2: Install Forge On Your Phone

There are two good ways to do this.

## Option A: Install As A PWA On Your Phone

This is the recommended real-use path today.

### Android PWA install

1. Open the deployed Forge URL in Chrome on your Android phone.
2. Sign in once online.
3. In Chrome, open the menu.
4. Tap `Add to Home screen` or `Install app`.
5. Confirm installation.

After install, verify:

- Forge appears on your home screen
- it opens in an app-like shell
- after one successful online load, the shell can reopen offline

Why this is the recommended path:

- it matches the current supported production posture
- notifications and PWA behavior are already part of the verified launch boundary
- it does not depend on unfinished native-specific auth or push work

### iPhone PWA install

If you want to use Forge on iPhone today, treat it as a browser/PWA experience, not a verified native-shell experience.

Typical install flow:

1. Open the deployed URL in Safari
2. Tap Share
3. Tap `Add to Home Screen`

Important honesty note:

- the repo’s verified native-shell posture is Android
- iPhone PWA can still be used, but it is not the explicitly verified shell in the current candidate summary

## Option B: Install The Android Native Shell

This is a good personal-use or pilot-use option if you want the Capacitor wrapper on Android.

### Step 1. Make sure your phone is visible to `adb`

Enable Developer Options and USB debugging on your Android phone, then connect it by USB.

Check:

```bash
adb devices
```

You should see your device listed as `device`.

### Step 2. Build the Android APK

From the repo root:

```bash
npm run android:assemble
```

This:

- builds the web assets
- syncs them into Capacitor Android
- assembles the debug APK

### Step 3. Install the APK to your phone

```bash
npm run android:install
```

This installs:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

### Step 4. Launch the app

You can either open it manually on the phone or start it from the terminal:

```bash
adb shell am start -n com.forge.executionos/.MainActivity
```

### Step 5. Verify the app opens

At minimum check:

- the shell launches
- sign-in screen loads
- after sign-in, the app shell opens

### Important native-shell honesty note

This Android shell is real and verified, but it is not yet the repo’s claimed “full native production mobile product.”

Current limits:

- native push is not shipped
- native auth callback completion is not shipped
- native health-provider bridges are not shipped
- some flows still inherit browser assumptions

So for your own daily use:

- PWA install is the most production-ready runtime
- Android shell install is a valid optional wrapper

## Which Option Should You Personally Use?

Use this rule:

- if you want the most stable real-use setup now: **deploy + install the PWA**
- if you also want to test the Android shell: **deploy + install the PWA + optionally sideload the APK**

If you are not publishing to the Play Store right now, the PWA route is simpler and more honest.

## Full End-To-End Command Sequence

If you want the shortest complete path from local repo to live phone install:

### A. Deploy production

```bash
npm install
npm run functions:install
npm install -g firebase-tools
firebase --version
firebase login
firebase use --add
npm run launch:verify
firebase deploy --only hosting,firestore:rules,firestore:indexes,storage,functions
```

### B. Install on your phone as a PWA

1. Open the deployed Firebase Hosting URL in Chrome on your phone
2. Sign in
3. Tap `Add to Home screen` / `Install app`

### C. Optional: also install the Android native shell

```bash
adb devices
npm run android:assemble
npm run android:install
adb shell am start -n com.forge.executionos/.MainActivity
```

## How To Decide If Deployment Was Successful

Deployment is successful if all of these are true:

- `npm run launch:verify` passed before deploy
- Firebase deploy finished without errors
- the live URL loads
- Google sign-in works
- one real app action persists
- Settings diagnostics show a healthy enough posture
- your phone can install and open the PWA

For Android shell install, success also means:

- `npm run android:assemble` succeeded
- `npm run android:install` succeeded
- `MainActivity` launches on the device

## Current Production Limits You Should Accept Up Front

These are not surprise bugs. They are the current product boundary:

- notifications are browser and installed-PWA only
- Calendar is primary-calendar only
- Calendar mirroring is explicit and operator-triggered
- long-lived server-managed Calendar OAuth is not shipped
- health integration is scaffold-only
- Android native shell is verified, but still not a full native-platform feature set
- iOS native-shell verification is not part of the current launch candidate

## If You Want The Simplest Recommendation

Do this:

1. deploy to Firebase Hosting + Functions
2. open the live URL on your Android phone
3. install Forge as a PWA
4. use that as your real daily app

That is the cleanest, most honest, production-ready path for Forge today.

## Troubleshooting From A Real Setup Attempt

These notes come directly from a real deployment attempt on this repo.

### 1. `firebase: command not found`

Meaning:

- Firebase CLI is not installed on your machine yet

Fix:

```bash
npm install -g firebase-tools
firebase --version
```

### 2. `npm warn EBADENGINE ... required: { node: '20' } current: { node: 'v22...' }`

Meaning:

- the Functions workspace expects Node `20`
- your local machine is on a different Node version

Impact:

- this is a warning, not the actual deploy blocker shown in your logs
- local install and verification can still succeed
- for better runtime parity, use Node `20` when possible

### 3. test output shows `act(...)` warnings or `[forge-monitoring]` stderr logs

Meaning:

- those are test-time warnings or expected monitoring prints
- they are not failures if the suite still ends with all tests passing

Impact:

- not a deployment blocker
- worth cleaning later, but not the reason deploy stopped

### 4. `Firebase Storage has not been set up on project ...`

Meaning:

- your Firebase project does not have Storage initialized yet
- Forge now uses Cloud Storage for scheduled-backup payloads

This is the real blocker from your logs.

Fix:

1. open Firebase Console
2. go to your Forge project
3. open `Storage`
4. click `Get started`
5. choose a region
6. finish setup
7. rerun:

```bash
firebase deploy --only hosting,firestore:rules,firestore:indexes,storage,functions
```

### 5. What should you do next after fixing Storage?

Use this exact sequence:

```bash
npm run launch:verify
firebase deploy --only hosting,firestore:rules,firestore:indexes,storage,functions
```

Then:

1. open the live Hosting URL
2. sign in once
3. install the site on your phone as a PWA
4. optionally build and sideload the Android shell

### 6. `functions/index.js does not exist, can't deploy Cloud Functions`

Meaning:

- Firebase deploy could not find the Functions package entrypoint it expects

What changed in the repo:

- Forge now declares the Functions entrypoint explicitly as `lib/index.js`
- Firebase deploy is now configured to run the Functions build automatically before deploy

Why this matters:

- the Functions workspace is bundled output, not raw `functions/index.js`
- deploy should use the compiled `lib/index.js` artifact, not guess an old default

If you pulled the latest repo changes, rerun:

```bash
npm run functions:verify
firebase deploy --only hosting,firestore:rules,firestore:indexes,storage,functions
```

If you still see this after pulling the latest changes:

1. confirm [functions/package.json](/Users/ayushjaipuriar/Documents/GitHub/forge/functions/package.json) contains:

```json
"main": "lib/index.js"
```

2. confirm [firebase.json](/Users/ayushjaipuriar/Documents/GitHub/forge/firebase.json) contains a Functions `predeploy` build step
3. rerun `npm run functions:verify`
