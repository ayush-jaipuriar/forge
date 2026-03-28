import { describe, expect, it } from 'vitest'
import { createSyncQueueItem } from '@/services/sync/syncQueue'
import { createDefaultUserSettings } from '@/domain/settings/types'
import { assessSyncHealth } from '@/services/sync/syncHealthService'
import { getSyncConflictPolicy } from '@/domain/sync/conflicts'

describe('syncHealthService', () => {
  it('marks aged queued writes as stale instead of pretending they are merely waiting', () => {
    const settings = createDefaultUserSettings()
    const item = createSyncQueueItem('upsertSettings', settings.id, settings)
    item.updatedAt = '2026-03-28T10:00:00.000Z'

    const assessment = assessSyncHealth({
      queueItems: [item],
      isOnline: false,
      isAuthenticated: false,
      isFlushing: false,
      now: new Date('2026-03-28T11:00:00.000Z'),
    })

    expect(assessment.syncStatus).toBe('stale')
    expect(assessment.diagnostics.staleEntityCount).toBe(1)
    expect(assessment.diagnostics.healthState).toBe('stale')
  })

  it('marks failed replay items as degraded and records the latest failure timestamp', () => {
    const settings = createDefaultUserSettings()
    const item = createSyncQueueItem('upsertSettings', settings.id, settings)
    item.status = 'failed'

    const assessment = assessSyncHealth({
      queueItems: [item],
      isOnline: true,
      isAuthenticated: true,
      isFlushing: false,
      now: new Date('2026-03-28T11:00:00.000Z'),
    })

    expect(assessment.syncStatus).toBe('degraded')
    expect(assessment.diagnostics.failedCount).toBe(1)
    expect(assessment.diagnostics.lastFailedSyncAt).toBe('2026-03-28T11:00:00.000Z')
  })

  it('elevates open conflict records above queue health because they require explicit review', () => {
    const assessment = assessSyncHealth({
      queueItems: [],
      conflictRecords: [
        {
          id: 'conflict-1',
          entityKind: 'calendar',
          entityId: 'mirror-1',
          status: 'open',
          strategy: 'manual-review',
          summary: 'Mirror diverged from the current Forge block.',
          detectedAt: '2026-03-28T11:00:00.000Z',
        },
      ],
      isOnline: true,
      isAuthenticated: true,
      isFlushing: false,
      now: new Date('2026-03-28T11:00:00.000Z'),
    })

    expect(assessment.syncStatus).toBe('conflicted')
    expect(assessment.diagnostics.conflictedCount).toBe(1)
    expect(assessment.diagnostics.repairState).toBe('pending')
  })

  it('documents the current entity-specific conflict strategies explicitly', () => {
    expect(getSyncConflictPolicy('settings').strategy).toBe('replace-snapshot')
    expect(getSyncConflictPolicy('dayInstance').strategy).toBe('replace-snapshot')
    expect(getSyncConflictPolicy('calendar').strategy).toBe('manual-review')
    expect(getSyncConflictPolicy('health').strategy).toBe('merge-safe-map')
  })
})
