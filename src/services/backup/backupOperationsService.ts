import { collection, doc, getDoc, getDocs, limit, orderBy, query } from 'firebase/firestore'
import { localBackupOperationsRepository, localBackupRepository } from '@/data/local'
import {
  createDefaultBackupOperationsSnapshot,
  type BackupOperationsSnapshot,
  type BackupSnapshotRecord,
} from '@/domain/backup/types'
import { getFirebaseFirestore } from '@/lib/firebase/client'
import { reportMonitoringEvent } from '@/services/monitoring/monitoringService'

export type BackupOperationsWorkspace = {
  operations: BackupOperationsSnapshot
  recentBackups: BackupSnapshotRecord[]
  source: 'local' | 'remote'
}

export function reportBackupHealthMonitoring(params: {
  operations: BackupOperationsSnapshot
  source: 'local' | 'remote'
  userId?: string | null
}) {
  const { operations, source, userId } = params

  if (operations.healthState === 'stale') {
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
  }

  if (operations.healthState === 'degraded' || operations.latestFailureMessage) {
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
  }
}

export async function getBackupOperationsWorkspace(userId: string | null | undefined): Promise<BackupOperationsWorkspace> {
  if (!userId) {
    const operations = (await localBackupOperationsRepository.getDefault()) ?? createDefaultBackupOperationsSnapshot()
    reportBackupHealthMonitoring({
      operations,
      source: 'local',
      userId,
    })

    return {
      operations,
      recentBackups: await localBackupRepository.listRecent(5),
      source: 'local',
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
      recentBackups: await localBackupRepository.listRecent(5),
      source: 'local',
    }
  }

  try {
    const operationsRef = doc(db, 'users', userId, 'backupOperations', 'default')
    const backupsQuery = query(collection(db, 'users', userId, 'backups'), orderBy('createdAt', 'desc'), limit(5))
    const [operationsSnapshot, backupsSnapshot] = await Promise.all([getDoc(operationsRef), getDocs(backupsQuery)])

    const operations = operationsSnapshot.exists()
      ? ({ ...createDefaultBackupOperationsSnapshot(), ...operationsSnapshot.data() } as BackupOperationsSnapshot)
      : createDefaultBackupOperationsSnapshot()
    const recentBackups = backupsSnapshot.docs.map((entry) => entry.data() as BackupSnapshotRecord)
    reportBackupHealthMonitoring({
      operations,
      source: 'remote',
      userId,
    })

    return {
      operations,
      recentBackups: recentBackups.length > 0 ? recentBackups : await localBackupRepository.listRecent(5),
      source: 'remote',
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
      recentBackups: await localBackupRepository.listRecent(5),
      source: 'local',
    }
  }
}
