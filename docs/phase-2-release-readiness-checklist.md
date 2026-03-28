# Phase 2 Release Readiness Checklist

Use this as the final release gate for the analytics-focused Phase 2 system.

## Core Verification

- [ ] `npm run lint`
- [ ] `npm run test:run`
- [ ] `npm run typecheck`
- [ ] `npm run build`

## Command Center

- [ ] Command Center loads honest empty, limited, stale, and error states
- [ ] PRS-priority chart stack renders without overclaiming certainty
- [ ] coach summary, warnings, insights, missions, momentum, and streaks all derive from shared analytics meaning
- [ ] insufficient-data states remain visible where sample support is too thin

## Analytics Integrity

- [ ] snapshot generation, projections, rule engine, gamification engine, and operational signals all reuse shared derivation semantics
- [ ] confidence labels are evidence-based and not treated like statistical certainty
- [ ] known heuristic limits are documented honestly
- [ ] no Phase 3 integrations were silently pulled into Phase 2

## Operational Screens

- [ ] Today shows only action-shaping alerts, not mini-dashboard noise
- [ ] Readiness shows pace and breadth intervention pressure clearly
- [ ] Schedule shows planning pressure and protected dates without becoming a second Today page
- [ ] Command Center remains the depth surface for analytics context

## Firebase and Functions

- [ ] Firestore rules and indexes remain repo-managed and deployable
- [ ] App Check rollout strategy is documented and environment-safe
- [ ] Functions workspace installs and deploys cleanly
- [ ] analytics/Functions failure paths remain visible through monitoring seams

## Performance and Supportability

- [ ] expensive analytics interpretation paths are shared instead of duplicated where possible
- [ ] no obvious repeated chart/rule derivations remain inside page-level code
- [ ] release docs reflect the current Phase 2 architecture and limitations
- [ ] future-extension docs still keep Calendar sync, notifications, and export in Phase 3
