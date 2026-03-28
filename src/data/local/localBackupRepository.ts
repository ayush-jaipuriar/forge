import type { BackupRepository } from '@/data/repositories/types'
import { getForgeDb } from '@/data/local/forgeDb'
import type { BackupSnapshotRecord } from '@/domain/backup/types'

export class LocalBackupRepository implements BackupRepository {
  async listRecent(limit = 10): Promise<BackupSnapshotRecord[]> {
    const db = await getForgeDb()
    const records = await db.getAll('backups')

    return records.sort((left, right) => right.createdAt.localeCompare(left.createdAt)).slice(0, limit)
  }

  async upsert(snapshot: BackupSnapshotRecord) {
    const db = await getForgeDb()
    await db.put('backups', snapshot)
  }
}
