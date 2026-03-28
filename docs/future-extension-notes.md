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
- a dedicated [Phase 3 plan](/Users/ayushjaipuriar/Documents/GitHub/forge/docs/phase-3-spec-implementation-plan.md) now defines the notification, sync-hardening, backup, Calendar, and health-scaffolding path explicitly so integration work stays staged and honest

## What Should Stay Deferred

- bidirectional Calendar sync
- health wearable or device ingestion
- dedicated backend extraction for orchestration or merge conflict resolution
- AI-generated planning or coaching features

## Phase Boundary After Milestone 10

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
## Backup Payload Storage Migration

This is no longer just a future note. It is now part of the official Phase 3 milestone sequence before Calendar work continues.

The current Phase 3 scheduled-backup implementation keeps metadata and payloads in Firestore so the system stays simple while the feature is being proven, but the planned migration path is now explicit:

1. Keep `backups/{backupId}` and `backupOperations/default` in Firestore as the operational index.
2. Move heavy scheduled-backup payload bodies to Cloud Storage using deterministic object keys derived from `backupId`.
3. Keep checksum, byte size, retention state, storage location, and restore eligibility in Firestore metadata.
4. Add retrieval helpers and restore contracts so future in-app restore from server-side scheduled backups becomes possible without redesigning the backup model again.

Cloud Storage is now the chosen target, not just one possible fallback.
