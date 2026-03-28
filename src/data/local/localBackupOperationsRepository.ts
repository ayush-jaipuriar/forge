import type { BackupOperationsRepository } from '@/data/repositories/types'
import { getForgeDb } from '@/data/local/forgeDb'
import { createDefaultBackupOperationsSnapshot, type BackupOperationsSnapshot } from '@/domain/backup/types'

export class LocalBackupOperationsRepository implements BackupOperationsRepository {
  async getDefault(): Promise<BackupOperationsSnapshot | null> {
    const db = await getForgeDb()
    const snapshot = await db.get('backupOperations', 'default')

    if (snapshot) {
      return snapshot
    }

    const initial = createDefaultBackupOperationsSnapshot()
    await db.put('backupOperations', initial)
    return initial
  }

  async upsert(snapshot: BackupOperationsSnapshot) {
    const db = await getForgeDb()
    await db.put('backupOperations', snapshot)
  }
}
