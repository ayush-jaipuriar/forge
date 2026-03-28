# Backup and Restore Operations

## Purpose

This document records the Phase 3 backup durability model across:

- Milestone 4 manual backup and restore foundation
- Milestone 5 scheduled backups, retention, and recovery operations

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
- its stored payload document is deleted

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
- scheduled backups create durable remote recovery records and payloads for later recovery tooling
- restore safety still clears local queued sync items before completion so stale pre-restore writes cannot replay

Current limitation:

- the app does not yet expose a browser picker for server-side scheduled backup history
- scheduled backup records are available to support later recovery UI and admin workflows, but recovery selection remains a future milestone

## Known Scale Limit and Planned Storage Strategy

The current scheduled-backup implementation stores each full backup payload in Firestore as a single document.

That is acceptable for early-stage verification and modest history sizes, but it is not the long-term scalability posture.

Why this matters:

- a full backup payload includes settings, every stored day instance, and derived analytics artifacts
- Firestore document size is bounded
- a user with enough retained history can eventually exceed that bound even if the metadata model itself remains healthy

Planned next-step strategy:

- keep backup metadata and operations state in Firestore
- move heavy scheduled backup payload bodies to Cloud Storage, or chunk them into manifest-plus-parts storage if Cloud Storage is not yet adopted
- keep restore and retention driven from Firestore metadata records so operational visibility does not depend on blob reads

Until that storage migration lands, scheduled backups should be treated as operationally useful but still carrying a documented scale ceiling.

## Schema Compatibility

Current schema version:

- `FORGE_BACKUP_SCHEMA_VERSION = 1`

Current rule:

- unsupported schema versions fail validation immediately

This is strict on purpose because backup compatibility should fail early and clearly rather than partially mutate local state under ambiguous assumptions.
