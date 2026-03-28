# Future Extension Notes

Phase 1 should leave clean extension points for:

- analytics and Command Center depth
- notifications
- Google Calendar read and write sync
- health provider integrations
- AI-assisted coaching layers
- future backend extraction if the client-heavy Firebase architecture becomes limiting

## What Already Exists

- scoring and recommendation engines now accept typed context objects instead of screen-local heuristics
- local-first persistence is already separated from Firestore replay boundaries
- PWA and Hosting behavior are real enough to support future installability and sync hardening
- calendar scaffolding now has typed domain models, service boundaries, and settings storage
- a dedicated [Phase 2 plan](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/phase-2-spec-implementation-plan.md) now defines the analytics, Command Center, projection, streak, mission, and hardening path explicitly so this depth does not get improvised later

## What Should Stay Deferred

- bidirectional Calendar sync
- health wearable or device ingestion
- dedicated backend extraction for orchestration or merge conflict resolution
- AI-generated planning or coaching features

## Phase Boundary After Milestone 9

Phase 2 now covers:

- analytics contracts and snapshot generation
- Command Center charts, projections, warnings, insights, streaks, missions, and momentum
- operational analytics surfacing back into Today, Readiness, and Schedule
- Firebase hardening work needed to sustain those analytics surfaces

Phase 3 still begins at:

- real bidirectional Calendar sync
- notifications and reminder delivery
- export and backup features
- deeper sync or orchestration extraction beyond the current Firebase-plus-Functions posture
