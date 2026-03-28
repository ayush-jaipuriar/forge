import type { SyncConflictRepository } from '@/data/repositories/types'
import { getForgeDb } from '@/data/local/forgeDb'

export class LocalSyncConflictRepository implements SyncConflictRepository {
  async listOpen() {
    const db = await getForgeDb()
    const conflicts = await db.getAll('syncConflicts')

    return conflicts
      .filter((conflict) => conflict.status === 'open')
      .sort((left, right) => left.detectedAt.localeCompare(right.detectedAt))
  }

  async upsert(record: Parameters<SyncConflictRepository['upsert']>[0]) {
    const db = await getForgeDb()
    await db.put('syncConflicts', record)
  }
}
