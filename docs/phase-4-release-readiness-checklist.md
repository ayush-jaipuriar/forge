# Phase 4 Release Readiness Checklist

Use this as the release gate for the launch-hardening portion of Phase 4.

## Verification Commands

- [x] `npm run launch:verify`
- [x] `npm run native:doctor`
- [x] `npm run android:assemble`
- [x] Android shell install and launch verified on a local emulator over `adb`

## Launch Operations

- [x] the launch runbook in [docs/phase-4-launch-operations.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/phase-4-launch-operations.md) has been reviewed for the current candidate
- [x] Hosting and Functions rollback expectations are understood before deploy
- [x] common support steps for auth, sync, backup, restore, and Calendar failures are available to the operator

## Browser And PWA Smoke Tests

- [x] auth flow succeeds from the launch candidate
- [x] Today execution updates persist and recompute score/recommendation state
- [x] Schedule overrides apply and reflect back into weekly and daily views
- [x] notification settings and browser permission posture render honestly
- [x] installed PWA and offline shell behavior render honestly from a built or deployed origin
- [x] manual backup export and staged restore behave correctly
- [x] Calendar read posture reflects real connection/sync truth
- [x] Calendar write mirroring remains explicit and operator-triggered

## Native Shell Smoke Tests

- [x] Capacitor doctor reports Android support healthy for the local environment
- [x] debug APK assembles from the current launch candidate
- [x] APK installs successfully to a local Android emulator over `adb`
- [x] `com.forge.executionos/.MainActivity` reaches resumed state after launch

## Diagnostics And Supportability

- [x] Settings shows an operator-facing diagnostics summary
- [x] launch-critical warnings can be seen without opening browser devtools first
- [x] known observability blind spots remain documented in [docs/phase-4-operational-diagnostics.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/phase-4-operational-diagnostics.md)

## Product Honesty

- [x] browser and installed-PWA notifications remain the only claimed delivery channels
- [x] primary-calendar-only Calendar support remains documented honestly
- [x] explicit major-block mirroring remains documented honestly
- [x] health integration is still described as scaffold-only unless a later milestone changes that
- [x] no future-scope mobile, push, or provider capabilities are described as already shipped

## Signoff Result

- [x] Phase 4 launch-hardening posture is repeatable from docs, commands, and known support steps rather than tribal memory
