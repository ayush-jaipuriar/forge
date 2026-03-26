import { openDB } from 'idb'
import type { DBSchema, IDBPDatabase } from 'idb'
import type { AnySyncQueueItem } from '@/domain/execution/sync'
import type { DayInstance } from '@/domain/routine/types'
import type { UserSettings } from '@/domain/settings/types'

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
}

let dbPromise: Promise<IDBPDatabase<ForgeDbSchema>> | null = null
const FORGE_DB_NAME = 'forge-db'

export function getForgeDb() {
  if (!dbPromise) {
    dbPromise = openDB<ForgeDbSchema>(FORGE_DB_NAME, 1, {
      upgrade(db) {
        const dayInstances = db.createObjectStore('dayInstances', {
          keyPath: 'id',
        })
        dayInstances.createIndex('byDate', 'date')

        db.createObjectStore('settings', {
          keyPath: 'id',
        })

        const syncQueue = db.createObjectStore('syncQueue', {
          keyPath: 'id',
        })
        syncQueue.createIndex('byStatus', 'status')
        syncQueue.createIndex('byQueuedAt', 'queuedAt')
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
