# Phase 4 Release Readiness Checklist

Use this as the release gate for the launch-hardening portion of Phase 4.

## Verification Commands

- [ ] `npm run launch:verify`

## Launch Operations

- [ ] the launch runbook in [docs/phase-4-launch-operations.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/phase-4-launch-operations.md) has been reviewed for the current candidate
- [ ] Hosting and Functions rollback expectations are understood before deploy
- [ ] common support steps for auth, sync, backup, restore, and Calendar failures are available to the operator

## Browser And PWA Smoke Tests

- [ ] auth flow succeeds from the launch candidate
- [ ] Today execution updates persist and recompute score/recommendation state
- [ ] Schedule overrides apply and reflect back into weekly and daily views
- [ ] notification settings and browser permission posture render honestly
- [ ] installed PWA and offline shell behavior render honestly from a built or deployed origin
- [ ] manual backup export and staged restore behave correctly
- [ ] Calendar read posture reflects real connection/sync truth
- [ ] Calendar write mirroring remains explicit and operator-triggered

## Diagnostics And Supportability

- [ ] Settings shows an operator-facing diagnostics summary
- [ ] launch-critical warnings can be seen without opening browser devtools first
- [ ] known observability blind spots remain documented in [docs/phase-4-operational-diagnostics.md](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/phase-4-operational-diagnostics.md)

## Product Honesty

- [ ] browser and installed-PWA notifications remain the only claimed delivery channels
- [ ] primary-calendar-only Calendar support remains documented honestly
- [ ] explicit major-block mirroring remains documented honestly
- [ ] health integration is still described as scaffold-only unless a later milestone changes that
- [ ] no future-scope mobile, push, or provider capabilities are described as already shipped

## Signoff Result

- [ ] Phase 4 launch-hardening posture is repeatable from docs, commands, and known support steps rather than tribal memory
