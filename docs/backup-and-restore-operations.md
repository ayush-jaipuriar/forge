# Backup and Restore Operations

## Purpose

This document records the Phase 3 backup durability model across:

- Milestone 4 manual backup and restore foundation
- Milestone 5 scheduled backups, retention, and recovery operations
- Milestone 6 Cloud Storage payload migration and server-restore foundations

The key boundary is simple:

- export gives the user a versioned, inspectable copy of core Forge state
- restore brings back the most important local operational state first
- derived or provider-owned state is reported honestly when it is regenerated or skipped

## Current Manual Backup Model

Forge now supports two manual export outputs from Settings:

- versioned backup JSON
- markdown-friendly execution notes export

The JSON payload is the system-grade artifact.

The markdown file is the human-readable companion for execution notes.

## What the JSON Backup Includes

Current payload contents:

- backup id and schema version
- export timestamp and user identity snapshot
- default settings snapshot
- day instances
- analytics essentials:
  - generated snapshots
  - analytics metadata
  - readiness projection
  - streak snapshot
  - weekly missions
- integration essentials:
  - calendar sync state derived from current settings
  - notification state
  - sync diagnostics snapshot
  - health scaffolding snapshot

## What the Markdown Export Includes

The notes export is intentionally narrow.

It includes:

- export timestamp
- user label
- every block execution note grouped by date and block title

If no execution notes exist, Forge exports a short placeholder note instead of an empty file.

## Restore Model

Restore is now a staged flow, not an immediate blind write.

Current steps:

1. user selects a JSON backup file
2. Forge parses and validates the schema version and required structure
3. Forge creates a restore stage summary plus warnings
4. user applies the staged restore intentionally
5. Forge writes the compatible local state and records a restore job

## Restore Safety Rule

Restore is now treated as a local state replacement event, not just a data import.

That means:

- Forge clears any queued local sync mutations before finishing the restore
- this prevents stale pre-restore writes from replaying later and silently overwriting the restored state
- the restore job records that queue-clear step as a warning so the behavior stays visible

## What Restore Applies Today

Current restore behavior applies:

- settings
- day instances
- notification state
- calendar connection state when present, through the settings snapshot

## What Restore Does Not Apply Directly

These are intentionally treated as derived or provider-owned state:

- analytics snapshots
- projections
- streaks
- missions
- sync diagnostics
- health integration state
- Firebase Auth user identity

Forge reports those as warnings so the restore remains honest.

## UI Refresh Behavior

Applying a restore now invalidates the workspaces that depend on restored settings and day data:

- Settings
- Today
- Schedule weekly view
- Prep
- Physical
- Readiness
- Command Center

This matters because restore should feel deterministic immediately, not “correct after a random reload.”

## Why Partial Restore Exists

Partial restore is not a bug here. It is a product choice.

Why:

- analytics should regenerate from restored execution data instead of importing stale derived artifacts blindly
- sync diagnostics describe operational conditions, not durable user intent
- provider-owned state such as auth and future health connections should not be spoofed into local truth

## Persisted Metadata

Manual backup and restore now leave a local metadata trail:

- backup records include byte size, checksum hint, source record count, trigger, and timestamps
- restore job records include status, warnings, summary text, and applied-count reporting

This metadata is stored locally so later scheduled backup work can build on the same model instead of inventing a parallel one.

## Current Limits

Current Milestone 4 intentionally does not provide:

- automatic scheduled backups
- retention cleanup
- remote backup storage management
- restore-from-backup browser picker fed from server-side backup history

Those are Milestone 5 responsibilities.

## Scheduled Backup Model

Forge now also has a server-orchestrated scheduled backup path through Firebase Functions.

Current default behavior:

- cadence: once per day at `03:30 Asia/Kolkata`
- trigger type recorded as `scheduled`
- full payload persisted separately from metadata so retention can prune heavy payloads without losing audit visibility

The important boundary is:

- scheduled backups are the continuity system
- manual exports are still the user-controlled escape hatch
- backup health is judged from scheduled protection, not from whether the user happened to click export recently

## Current Retention Policy

Default retention keeps:

- `7` most recent scheduled daily backup dates
- `8` most recent scheduled weekly backup windows beyond those daily keeps
- `20` most recent manual backups

When a backup falls outside retention:

- its metadata record is marked `expired`
- its `retentionExpiresAt` timestamp is recorded
- its stored payload body is deleted from its backing store

This keeps recovery history inspectable while preventing old payload storage from growing forever.

## Backup Health and Freshness

Forge now tracks backup health through a dedicated backup-operations snapshot.

Current default rules:

- `healthy`: a successful scheduled backup exists within the freshness window
- `stale`: the most recent successful scheduled backup is older than `36` hours
- `degraded`: the latest scheduled run failed or no trustworthy scheduled protection exists yet
- `unknown`: no real scheduled backup state has been established yet

Settings now surfaces:

- latest successful backup time
- backup health state
- retention-policy counts
- latest failure message when a scheduled backup run fails

When the app observes `stale` or `degraded` scheduled backup protection, it now also emits backup-domain monitoring events. That gives future operational tooling and debug subscribers a concrete signal instead of forcing them to infer risk only from stored state.

Those monitoring events are now edge-triggered rather than read-triggered:

- repeated Settings refetches do not re-emit the same stale or degraded signal forever
- Forge only emits again when the observed backup-health signature changes or the system recovers and later regresses

## Backup Source Provenance

Backup health and recent backup history do not always come from the same place.

Forge now reports that honestly:

- backup health can come from remote `backupOperations` state
- recent backup records can temporarily fall back to local metadata when remote history is unavailable or still empty

The Settings UI now shows those sources separately so the user is not misled into thinking one coherent remote view was loaded when the page is actually mixing durable remote state with local fallback history.

## Recovery and Operational Notes

Current recovery posture is:

- manual restore still restores from user-provided backup JSON
- scheduled backups now create Firestore metadata plus Cloud Storage-backed payload bodies
- Forge can now load restore-ready scheduled backups directly into the staged restore flow from Settings
- restore safety still clears local queued sync items before completion so stale pre-restore writes cannot replay

Current limitation:

- the app still does not provide a broad backup-management console beyond the recent restore-ready list surfaced in Settings
- remote restore still depends on explicit user selection and confirmation; Forge does not auto-apply scheduled backups

## Scheduled Backup Payload Storage

The current scheduled-backup implementation no longer stores payload bodies in Firestore documents.

Current storage posture:

- Firestore keeps backup metadata and backup-operations state
- Cloud Storage stores scheduled backup payload bodies using deterministic object paths derived from `backupId`
- legacy scheduled backups without explicit payload metadata can still resolve to inferred Firestore payload locations for compatibility during migration

Why this matters:

- Firestore remains the operational index
- Cloud Storage absorbs the heavy payload body so growing history does not collide with Firestore document-size limits
- future restore flows can select from metadata first and fetch payload bodies only when needed

## Object-Key Convention

Current default Cloud Storage object path:

- `users/{uid}/backups/{backupId}.json`

This keeps the object path:

- deterministic
- owner-scoped
- easy to clean up during retention expiry

## Server Restore Foundation

Forge now has a dedicated retrieval foundation for scheduled backup payloads:

- backup metadata can declare a payload pointer and restore eligibility
- the client can resolve a scheduled backup record into either a Cloud Storage object or a legacy Firestore payload document
- restore eligibility is now tracked explicitly instead of being implied by backup existence alone

The workflow is now complete enough for honest end-user recovery:

- Settings shows restore-ready scheduled backups from remote metadata
- selecting a backup loads and validates the payload into the same staged-restore surface used by local files
- apply remains a second explicit confirmation step so warnings are visible before local state changes

What still remains for later work:

- a broader backup-management surface with filtering and history beyond the recent restore-ready list
- more advanced multi-device recovery ergonomics

## Previous Scale Limit

The earlier Firestore-only payload approach is now being retired as the main path.

It remains relevant only as a migration and compatibility concern for older scheduled backup records.

## Release-Ready Limits

Phase 3 can honestly claim:

- manual backup export and staged local restore
- scheduled backup generation with retention and Cloud Storage payloads
- restore-safety handling for outstanding local sync queue items
- server-side restore foundations, restore-eligibility metadata, and user-facing staged recovery from recent restore-ready scheduled backups

Phase 3 must not claim:

- automatic cross-device restore reconciliation
- zero-loss guarantees across every local-only integration seam

One important current boundary:

- manual exports can include the browser-local health integration snapshot
- scheduled backups currently fall back to the default health scaffold because that state is still local-first and not yet synchronized to a server-owned health record

The reason for the migration was straightforward:

- a full backup payload includes settings, every stored day instance, and derived analytics artifacts
- Firestore document size is bounded
- Cloud Storage is a better fit for growing payload bodies while Firestore remains a better fit for metadata, retention markers, and restore readiness

## Schema Compatibility

Current schema version:

- `FORGE_BACKUP_SCHEMA_VERSION = 1`

Current rule:

- unsupported schema versions fail validation immediately

This is strict on purpose because backup compatibility should fail early and clearly rather than partially mutate local state under ambiguous assumptions.
