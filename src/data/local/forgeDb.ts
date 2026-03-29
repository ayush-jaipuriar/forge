import { openDB } from 'idb'
import type { DBSchema, IDBPDatabase } from 'idb'
import type { BackupOperationsSnapshot, BackupSnapshotRecord, ForgeExportPayload, RestoreJobRecord } from '@/domain/backup/types'
import type {
  CalendarMirrorRecord,
  CalendarSessionSnapshot,
  CalendarSyncStateSnapshot,
  ExternalCalendarEventCacheRecord,
} from '@/domain/calendar/types'
import type { AnySyncQueueItem } from '@/domain/execution/sync'
import type { HealthIntegrationSnapshot } from '@/domain/health/types'
import type { NotificationLogRecord, NotificationStateSnapshot } from '@/domain/notifications/types'
import type { DayInstance } from '@/domain/routine/types'
import type { UserSettings } from '@/domain/settings/types'
import type { SyncConflictRecord, SyncDiagnosticsSnapshot } from '@/domain/sync/types'

type ForgeDbSchema = DBSchema & {
  dayInstances: {
    key: string
    value: DayInstance
    indexes: {
      byDate: string
    }
  }
  settings: {
    key: string
    value: UserSettings
  }
  syncQueue: {
    key: string
    value: AnySyncQueueItem
    indexes: {
      byStatus: string
      byQueuedAt: string
    }
  }
  syncDiagnostics: {
    key: string
    value: SyncDiagnosticsSnapshot
  }
  syncConflicts: {
    key: string
    value: SyncConflictRecord
    indexes: {
      byStatus: string
      byDetectedAt: string
    }
  }
  notificationState: {
    key: string
    value: NotificationStateSnapshot
  }
  notificationLog: {
    key: string
    value: NotificationLogRecord
    indexes: {
      byStatus: string
      byEvaluatedAt: string
    }
  }
  backups: {
    key: string
    value: BackupSnapshotRecord
    indexes: {
      byCreatedAt: string
    }
  }
  backupOperations: {
    key: string
    value: BackupOperationsSnapshot
  }
  restoreJobs: {
    key: string
    value: RestoreJobRecord
    indexes: {
      byCreatedAt: string
    }
  }
  exportPayloads: {
    key: string
    value: ForgeExportPayload
    indexes: {
      byExportedAt: string
    }
  }
  calendarState: {
    key: string
    value: CalendarSyncStateSnapshot
  }
  externalCalendarEvents: {
    key: string
    value: ExternalCalendarEventCacheRecord
    indexes: {
      byDate: string
      byFetchedAt: string
    }
  }
  calendarSessions: {
    key: string
    value: CalendarSessionSnapshot
  }
  calendarMirrors: {
    key: string
    value: CalendarMirrorRecord
    indexes: {
      byDayDate: string
      byProviderEventId: string
    }
  }
  healthIntegration: {
    key: string
    value: HealthIntegrationSnapshot
  }
}

let dbPromise: Promise<IDBPDatabase<ForgeDbSchema>> | null = null
const FORGE_DB_NAME = 'forge-db'

export function getForgeDb() {
  if (!dbPromise) {
    dbPromise = openDB<ForgeDbSchema>(FORGE_DB_NAME, 8, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('dayInstances')) {
          const dayInstances = db.createObjectStore('dayInstances', {
            keyPath: 'id',
          })
          dayInstances.createIndex('byDate', 'date')
        }

        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', {
            keyPath: 'id',
          })
        }

        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncQueue = db.createObjectStore('syncQueue', {
            keyPath: 'id',
          })
          syncQueue.createIndex('byStatus', 'status')
          syncQueue.createIndex('byQueuedAt', 'queuedAt')
        }

        if (!db.objectStoreNames.contains('syncDiagnostics')) {
          db.createObjectStore('syncDiagnostics', {
            keyPath: 'id',
          })
        }

        if (!db.objectStoreNames.contains('syncConflicts')) {
          const syncConflicts = db.createObjectStore('syncConflicts', {
            keyPath: 'id',
          })
          syncConflicts.createIndex('byStatus', 'status')
          syncConflicts.createIndex('byDetectedAt', 'detectedAt')
        }

        if (!db.objectStoreNames.contains('notificationState')) {
          db.createObjectStore('notificationState', {
            keyPath: 'id',
          })
        }

        if (!db.objectStoreNames.contains('notificationLog')) {
          const notificationLog = db.createObjectStore('notificationLog', {
            keyPath: 'id',
          })
          notificationLog.createIndex('byStatus', 'status')
          notificationLog.createIndex('byEvaluatedAt', 'evaluatedAt')
        }

        if (!db.objectStoreNames.contains('backups')) {
          const backups = db.createObjectStore('backups', {
            keyPath: 'id',
          })
          backups.createIndex('byCreatedAt', 'createdAt')
        }

        if (!db.objectStoreNames.contains('backupOperations')) {
          db.createObjectStore('backupOperations', {
            keyPath: 'id',
          })
        }

        if (!db.objectStoreNames.contains('restoreJobs')) {
          const restoreJobs = db.createObjectStore('restoreJobs', {
            keyPath: 'id',
          })
          restoreJobs.createIndex('byCreatedAt', 'createdAt')
        }

        if (!db.objectStoreNames.contains('exportPayloads')) {
          const exportPayloads = db.createObjectStore('exportPayloads', {
            keyPath: 'id',
          })
          exportPayloads.createIndex('byExportedAt', 'exportedAt')
        }

        if (!db.objectStoreNames.contains('calendarState')) {
          db.createObjectStore('calendarState', {
            keyPath: 'id',
          })
        }

        if (!db.objectStoreNames.contains('externalCalendarEvents')) {
          const externalCalendarEvents = db.createObjectStore('externalCalendarEvents', {
            keyPath: 'id',
          })
          externalCalendarEvents.createIndex('byDate', 'date')
          externalCalendarEvents.createIndex('byFetchedAt', 'fetchedAt')
        }

        if (!db.objectStoreNames.contains('calendarSessions')) {
          db.createObjectStore('calendarSessions', {
            keyPath: 'id',
          })
        }

        if (!db.objectStoreNames.contains('calendarMirrors')) {
          const calendarMirrors = db.createObjectStore('calendarMirrors', {
            keyPath: 'id',
          })
          calendarMirrors.createIndex('byDayDate', 'dayDate')
          calendarMirrors.createIndex('byProviderEventId', 'providerEventId')
        }

        if (!db.objectStoreNames.contains('healthIntegration')) {
          db.createObjectStore('healthIntegration', {
            keyPath: 'id',
          })
        }
      },
    })
  }

  return dbPromise
}

export async function resetForgeDb() {
  if (dbPromise) {
    const db = await dbPromise
    db.close()
    dbPromise = null
  }

  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(FORGE_DB_NAME)

    request.onerror = () => {
      reject(request.error)
    }

    request.onblocked = () => {
      resolve()
    }

    request.onsuccess = () => {
      resolve()
    }
  })
}
