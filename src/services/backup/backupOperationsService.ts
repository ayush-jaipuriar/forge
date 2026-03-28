import { collection, doc, getDoc, getDocs, limit, orderBy, query } from 'firebase/firestore'
import { localBackupOperationsRepository, localBackupRepository } from '@/data/local'
import {
  createDefaultBackupOperationsSnapshot,
  type BackupOperationsSnapshot,
  type BackupSnapshotRecord,
} from '@/domain/backup/types'
import { getFirebaseFirestore } from '@/lib/firebase/client'
import { buildBackupRestoreEligibility } from '@/services/backup/backupPayloadStorage'
import { reportMonitoringEvent } from '@/services/monitoring/monitoringService'

export type BackupOperationsWorkspace = {
  operations: BackupOperationsSnapshot
  recentBackups: BackupSnapshotRecord[]
  source: {
    operations: 'local' | 'remote'
    recentBackups: 'local' | 'remote'
  }
}

const emittedBackupHealthEvents = new Map<string, string>()

function buildMonitoringCacheKey(params: {
  action: 'scheduled-backup-stale' | 'scheduled-backup-degraded'
  userId?: string | null
  source: 'local' | 'remote'
}) {
  return `${params.action}:${params.userId ?? 'anonymous'}:${params.source}`
}

export function reportBackupHealthMonitoring(params: {
  operations: BackupOperationsSnapshot
  source: 'local' | 'remote'
  userId?: string | null
}) {
  const { operations, source, userId } = params
  const staleCacheKey = buildMonitoringCacheKey({
    action: 'scheduled-backup-stale',
    userId,
    source,
  })
  const degradedCacheKey = buildMonitoringCacheKey({
    action: 'scheduled-backup-degraded',
    userId,
    source,
  })

  if (operations.healthState === 'healthy' || operations.healthState === 'unknown') {
    emittedBackupHealthEvents.delete(staleCacheKey)
    emittedBackupHealthEvents.delete(degradedCacheKey)
    return
  }

  if (operations.healthState === 'stale') {
    const signature = JSON.stringify({
      healthState: operations.healthState,
      latestBackupId: operations.latestBackupId ?? null,
      latestSuccessfulBackupAt: operations.latestSuccessfulBackupAt ?? null,
      staleAfterHours: operations.staleAfterHours,
    })

    if (emittedBackupHealthEvents.get(staleCacheKey) !== signature) {
      reportMonitoringEvent({
        level: 'warning',
        domain: 'backup',
        action: 'scheduled-backup-stale',
        message: 'Scheduled backup protection is stale and may indicate a missed or delayed backup run.',
        metadata: {
          userId: userId ?? null,
          source,
          latestBackupId: operations.latestBackupId ?? null,
          latestSuccessfulBackupAt: operations.latestSuccessfulBackupAt ?? null,
          staleAfterHours: operations.staleAfterHours,
        },
      })
      emittedBackupHealthEvents.set(staleCacheKey, signature)
    }
  }

  if (operations.healthState === 'degraded' || operations.latestFailureMessage) {
    const signature = JSON.stringify({
      healthState: operations.healthState,
      latestBackupId: operations.latestBackupId ?? null,
      latestSuccessfulBackupAt: operations.latestSuccessfulBackupAt ?? null,
      latestFailureAt: operations.latestFailureAt ?? null,
      latestFailureMessage: operations.latestFailureMessage ?? null,
      pendingDeletionCount: operations.pendingDeletionCount,
    })

    if (emittedBackupHealthEvents.get(degradedCacheKey) !== signature) {
      reportMonitoringEvent({
        level: 'error',
        domain: 'backup',
        action: 'scheduled-backup-degraded',
        message: 'Scheduled backup protection is degraded or a recent backup run failed.',
        metadata: {
          userId: userId ?? null,
          source,
          latestBackupId: operations.latestBackupId ?? null,
          latestSuccessfulBackupAt: operations.latestSuccessfulBackupAt ?? null,
          latestFailureAt: operations.latestFailureAt ?? null,
          latestFailureMessage: operations.latestFailureMessage ?? null,
          pendingDeletionCount: operations.pendingDeletionCount,
        },
      })
      emittedBackupHealthEvents.set(degradedCacheKey, signature)
    }
  }
}

export async function getBackupOperationsWorkspace(userId: string | null | undefined): Promise<BackupOperationsWorkspace> {
  const checkedAt = new Date().toISOString()
  const restoreUserId = userId ?? 'local-user'

  if (!userId) {
    const operations = (await localBackupOperationsRepository.getDefault()) ?? createDefaultBackupOperationsSnapshot()
    reportBackupHealthMonitoring({
      operations,
      source: 'local',
      userId,
    })

    return {
      operations,
      recentBackups: (await localBackupRepository.listRecent(5)).map((backup) => ({
        ...backup,
        restoreEligibility:
          backup.restoreEligibility ??
          buildBackupRestoreEligibility({
            backup,
            userId: restoreUserId,
            checkedAt,
          }),
      })),
      source: {
        operations: 'local',
        recentBackups: 'local',
      },
    }
  }

  const db = getFirebaseFirestore()

  if (!db) {
    const operations = (await localBackupOperationsRepository.getDefault()) ?? createDefaultBackupOperationsSnapshot()
    reportBackupHealthMonitoring({
      operations,
      source: 'local',
      userId,
    })

    return {
      operations,
      recentBackups: (await localBackupRepository.listRecent(5)).map((backup) => ({
        ...backup,
        restoreEligibility:
          backup.restoreEligibility ??
          buildBackupRestoreEligibility({
            backup,
            userId: restoreUserId,
            checkedAt,
          }),
      })),
      source: {
        operations: 'local',
        recentBackups: 'local',
      },
    }
  }

  try {
    const operationsRef = doc(db, 'users', userId, 'backupOperations', 'default')
    const backupsQuery = query(collection(db, 'users', userId, 'backups'), orderBy('createdAt', 'desc'), limit(5))
    const [operationsSnapshot, backupsSnapshot] = await Promise.all([getDoc(operationsRef), getDocs(backupsQuery)])

    const operations = operationsSnapshot.exists()
      ? ({ ...createDefaultBackupOperationsSnapshot(), ...operationsSnapshot.data() } as BackupOperationsSnapshot)
      : createDefaultBackupOperationsSnapshot()
    const recentBackups = backupsSnapshot.docs.map((entry) => {
      const backup = entry.data() as BackupSnapshotRecord

      return {
        ...backup,
        restoreEligibility:
          backup.restoreEligibility ??
          buildBackupRestoreEligibility({
            backup,
            userId: restoreUserId,
            checkedAt,
          }),
      }
    })
    reportBackupHealthMonitoring({
      operations,
      source: 'remote',
      userId,
    })

    if (recentBackups.length > 0) {
      return {
        operations,
        recentBackups,
        source: {
          operations: 'remote',
          recentBackups: 'remote',
        },
      }
    }

    return {
      operations,
      recentBackups: await localBackupRepository.listRecent(5),
      source: {
        operations: 'remote',
        recentBackups: 'local',
      },
    }
  } catch (error) {
    reportMonitoringEvent({
      level: 'warning',
      domain: 'backup',
      action: 'load-backup-operations-workspace',
      message: 'Falling back to local backup metadata because remote backup state could not be loaded.',
      metadata: {
        userId,
        errorMessage: error instanceof Error ? error.message : String(error),
      },
    })

    const operations = (await localBackupOperationsRepository.getDefault()) ?? createDefaultBackupOperationsSnapshot()
    reportBackupHealthMonitoring({
      operations,
      source: 'local',
      userId,
    })

    return {
      operations,
      recentBackups: (await localBackupRepository.listRecent(5)).map((backup) => ({
        ...backup,
        restoreEligibility:
          backup.restoreEligibility ??
          buildBackupRestoreEligibility({
            backup,
            userId: restoreUserId,
            checkedAt,
          }),
      })),
      source: {
        operations: 'local',
        recentBackups: 'local',
      },
    }
  }
}
