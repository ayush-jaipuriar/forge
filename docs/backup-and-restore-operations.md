# Backup and Restore Operations

## Purpose

This document records the Phase 3 Milestone 4 manual backup and restore foundation.

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

## Schema Compatibility

Current schema version:

- `FORGE_BACKUP_SCHEMA_VERSION = 1`

Current rule:

- unsupported schema versions fail validation immediately

This is strict on purpose because backup compatibility should fail early and clearly rather than partially mutate local state under ambiguous assumptions.
