# Phase 4 Launch Candidate Summary

This document records the current launch-candidate posture for Forge after Phase 4 Milestone 8.

It is intentionally short and operational:

- what was verified
- what is included in the current candidate
- what remains an accepted limit instead of an unresolved surprise

## Verification Snapshot

Current verification completed for this launch candidate:

- `npm run launch:verify`
- `npm run native:doctor`
- `npm run android:assemble`
- Android shell install verified with `adb install -r android/app/build/outputs/apk/debug/app-debug.apk`
- Android shell launch verified with `adb shell am start -n com.forge.executionos/.MainActivity`
- Android resumed-state confirmation verified from `adb shell dumpsys activity activities`

### Quality Results

- root app:
  - lint
  - typecheck
  - tests
  - build
- Functions workspace:
  - lint
  - typecheck
  - build
- current integrated test count:
  - `58` files
  - `212` tests

## Included In The Current Candidate

- browser and installed-PWA launch path with documented rollback and operator runbooks
- local-first execution flows with sync diagnostics and restore safety
- scheduled backups with restore-ready remote staging
- browser and installed-PWA notifications with scheduled Functions evaluation
- Google Calendar primary-calendar read pressure plus explicit major-block write mirroring
- Capacitor Android shell with verified local assemble, install, and launch flow
- runtime-capability and platform-ownership surfaces in Settings

## Accepted Limits

These are accepted launch limits, not hidden defects:

- notifications are browser and installed-PWA only; native mobile push is not shipped
- Google Calendar remains primary-calendar only
- Calendar mirroring is explicit and operator-triggered; background reconciliation is not shipped
- long-lived server-managed Calendar OAuth is not shipped
- health integration is scaffold-only and does not ingest live provider data
- the Android native shell is a verified wrapper around the current web product; native auth callback completion, native push, and native health bridges are not shipped
- Forge supports staging restore from restore-ready scheduled backups, but it does not yet provide a full backup-management console or automatic cross-device recovery
- iOS native-shell verification is not part of the current launch-candidate posture

## Operational Reading Of This Candidate

Forge can now be described honestly as:

- launch-ready on the web and installed PWA path
- supportable through repo-owned launch and rollback docs
- verified as a real Android native shell foundation
- still intentionally conservative about mobile-native integrations and privileged server-owned provider flows

## Next Platform Direction

The next major work after this launch candidate should not be framed as “more polish.”

It should be framed as whichever of these becomes the next product priority:

1. deeper native-mobile capability delivery
2. more deliberate server ownership for privileged integration and diagnostics flows
3. production rollout iteration from real operator feedback
