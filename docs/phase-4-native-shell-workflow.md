# Phase 4 Native Shell Workflow

Use this document as the local build and verification guide for the first Forge native shell.

The current native-shell direction is intentionally narrow:

- Capacitor wraps the existing React + Vite product
- Android is the first verified shell target
- browser and PWA remain first-class and must not be degraded

## Current Foundation

Forge now has:

- Capacitor config in [capacitor.config.ts](/Users/ayushjaipuriar/Documents/GitHub/forge/capacitor.config.ts)
- an Android shell project in [android](/Users/ayushjaipuriar/Documents/GitHub/forge/android)
- repo scripts for sync, assemble, install, and open flows in [package.json](/Users/ayushjaipuriar/Documents/GitHub/forge/package.json)

## Local Prerequisites

Before using the Android shell locally, verify:

- Node.js and npm available
- Java installed
- Android SDK installed locally
- `adb` available
- at least one Android emulator or device available for run/install verification

Recommended environment posture:

- `ANDROID_HOME` or `ANDROID_SDK_ROOT` should point at the local Android SDK when possible
- if those env vars are not exported, Gradle can still use `android/local.properties`, but that file stays local-only and must not be committed

## Primary Commands

### Doctor

```bash
npm run native:doctor
```

Use this first to confirm Capacitor dependencies are healthy.

### Sync Native Assets

```bash
npm run android:sync
```

This:

- builds the web app
- copies the current `dist/` assets into the Android project
- updates Capacitor plugin metadata

### Assemble Debug APK

```bash
npm run android:assemble
```

This:

- rebuilds web assets
- syncs Capacitor Android
- runs `./gradlew assembleDebug`

Expected output:

- a debug APK at [android/app/build/outputs/apk/debug/app-debug.apk](/Users/ayushjaipuriar/Documents/GitHub/forge/android/app/build/outputs/apk/debug/app-debug.apk)

### Install On Connected Device Or Emulator

```bash
npm run android:install
```

This uses `adb install -r` against the generated debug APK.

### Open In Android Studio

```bash
npm run android:open
```

Use this when you want IDE-assisted inspection, emulator management, or Gradle troubleshooting.

## Verified Local Baseline

Phase 4 Milestone 4 has already verified this local path on the current machine:

- `npm run native:doctor`
- `npm run build`
- `npx cap add android`
- `./gradlew assembleDebug`
- `adb install -r android/app/build/outputs/apk/debug/app-debug.apk`
- app launch confirmed on an Android emulator through `adb shell monkey -p com.forge.executionos -c android.intent.category.LAUNCHER 1`

That means the current shell foundation is not theoretical; it has already produced and launched a local Android build.

## Environment Configuration Model

The native shell currently uses the same built web assets as the browser product.

What that means today:

- Firebase web config is still baked into the web build at build time
- there is no separate Android-native Firebase config file in Phase 4 Milestone 4
- native shell environment behavior currently depends on the web build inputs, not on a fully separate native config stack

Why this is acceptable right now:

- Milestone 4 is about shell foundation, not full native divergence
- separate native capability boundaries and support notes are the next milestone

## Boot And Auth Assumptions

Current verified shell behavior:

- the Android shell can boot the bundled Forge web app
- the main activity launches successfully
- offline startup inherits the bundled web/PWA shell behavior rather than introducing a separate native renderer

Current honesty boundary:

- browser popup auth assumptions are still the real implemented auth model
- native callback handling, deep-link auth completion, and mobile-specific OAuth ergonomics are not yet declared finished in this milestone
- native push and health-provider bridges are still future work

## Emulator And Device Notes

### Emulator

Useful checks:

```bash
adb devices -l
adb shell monkey -p com.forge.executionos -c android.intent.category.LAUNCHER 1
```

If the emulator command is not on PATH, use the SDK-local binary directly when needed:

```bash
~/Library/Android/sdk/emulator/emulator -avd <your_avd_name>
```

### Physical Device

Useful checks:

- USB debugging enabled
- `adb devices -l` shows the device
- `npm run android:install` succeeds

## Known Limits At This Stage

- the Android shell is verified for local build, install, and launch, not yet for deep native integration behavior
- browser/PWA remain the product’s most mature runtime surfaces
- native auth callback handling is not yet declared complete
- native notification delivery is not yet implemented
- health-provider ingestion remains scaffold-only
