import { describe, expect, it } from 'vitest'
import {
  createDefaultBackupRetentionPolicy,
  createEmptyRestoreCounts,
  FORGE_BACKUP_SCHEMA_VERSION,
} from '@/domain/backup/types'
import {
  createDefaultCalendarSyncStateSnapshot,
  createEmptyCalendarCollisionSummary,
} from '@/domain/calendar/types'
import { createDefaultHealthIntegrationSnapshot } from '@/domain/health/types'
import {
  createDefaultNotificationStateSnapshot,
  FORGE_NOTIFICATION_DAILY_CAP,
} from '@/domain/notifications/types'
import { createDefaultSyncDiagnosticsSnapshot } from '@/domain/sync/types'

describe('phase 3 contracts', () => {
  it('creates notification defaults with the enforced daily-cap and supported browser channels', () => {
    const snapshot = createDefaultNotificationStateSnapshot()

    expect(snapshot.id).toBe('default')
    expect(snapshot.notificationsEnabled).toBe(true)
    expect(snapshot.dailyCap).toBe(FORGE_NOTIFICATION_DAILY_CAP)
    expect(snapshot.permission).toBe('default')
    expect(snapshot.supportedChannels).toEqual(['browser', 'pwa'])
  })

  it('creates sync diagnostics defaults with a healthy baseline and zeroed counts', () => {
    const diagnostics = createDefaultSyncDiagnosticsSnapshot()

    expect(diagnostics.healthState).toBe('healthy')
    expect(diagnostics.failedCount).toBe(0)
    expect(diagnostics.conflictedCount).toBe(0)
    expect(diagnostics.staleThresholdMinutes).toBe(30)
  })

  it('creates backup defaults that start with versioned retention and zeroed restore counts', () => {
    const retention = createDefaultBackupRetentionPolicy()
    const counts = createEmptyRestoreCounts()

    expect(FORGE_BACKUP_SCHEMA_VERSION).toBe(1)
    expect(retention.keepDaily).toBe(7)
    expect(retention.keepWeekly).toBe(8)
    expect(retention.keepManual).toBe(20)
    expect(counts.dayInstances).toBe(0)
    expect(counts.analyticsSnapshots).toBe(0)
  })

  it('creates a richer calendar sync snapshot without breaking the placeholder collision baseline', () => {
    const snapshot = createDefaultCalendarSyncStateSnapshot()
    const collision = createEmptyCalendarCollisionSummary('2026-03-28')

    expect(snapshot.id).toBe('default')
    expect(snapshot.featureGate).toBe('scaffoldingOnly')
    expect(snapshot.externalEventSyncStatus).toBe('idle')
    expect(snapshot.mirrorSyncStatus).toBe('idle')
    expect(collision.severity).toBe('none')
    expect(collision.overlappingEventCount).toBe(0)
  })

  it('creates health scaffolding defaults that stay honest about provider readiness', () => {
    const snapshot = createDefaultHealthIntegrationSnapshot()

    expect(snapshot.id).toBe('default')
    expect(snapshot.connectionSummary).toBe('planned')
    expect(snapshot.providers).toHaveLength(4)
    expect(snapshot.providers.every((provider) => provider.status === 'planned')).toBe(true)
    expect(snapshot.normalizedSignalAvailability.sleepDuration).toBe(false)
    expect(snapshot.normalizedSignalAvailability.recoveryScore).toBe(false)
  })
})
