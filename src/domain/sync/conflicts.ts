import type { SyncEntityKind, SyncResolutionStrategy } from '@/domain/sync/types'

export type SyncConflictPolicy = {
  entityKind: SyncEntityKind
  strategy: SyncResolutionStrategy
  rationale: string
}

export const syncConflictPolicies: Record<SyncEntityKind, SyncConflictPolicy> = {
  settings: {
    entityKind: 'settings',
    strategy: 'replace-snapshot',
    rationale: 'Settings are saved as one snapshot today, so replacement is safer than pretending field-level merges already exist.',
  },
  dayInstance: {
    entityKind: 'dayInstance',
    strategy: 'replace-snapshot',
    rationale: 'Daily execution state is saved as one date-scoped record, so whole-record replacement is the current safe baseline.',
  },
  notificationState: {
    entityKind: 'notificationState',
    strategy: 'latest-write-wins',
    rationale: 'Notification counters and permission status are singleton state where the freshest evaluated view should take precedence.',
  },
  backup: {
    entityKind: 'backup',
    strategy: 'latest-write-wins',
    rationale: 'Backup metadata is append-heavy, so duplicate records should resolve toward the most recent known job status.',
  },
  calendar: {
    entityKind: 'calendar',
    strategy: 'manual-review',
    rationale: 'External calendar drift can affect real mirrored events, so unresolved discrepancies should stay visible instead of silently merging.',
  },
  health: {
    entityKind: 'health',
    strategy: 'merge-safe-map',
    rationale: 'Future provider-linked health state is naturally provider-scoped, so safe map merges are the intended long-term approach.',
  },
}

export function getSyncConflictPolicy(entityKind: SyncEntityKind): SyncConflictPolicy {
  return syncConflictPolicies[entityKind]
}
