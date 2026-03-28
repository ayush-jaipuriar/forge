import type { RestoreJobRepository } from '@/data/repositories/types'
import { getForgeDb } from '@/data/local/forgeDb'
import type { RestoreJobRecord } from '@/domain/backup/types'

export class LocalRestoreJobRepository implements RestoreJobRepository {
  async listRecent(limit = 10): Promise<RestoreJobRecord[]> {
    const db = await getForgeDb()
    const records = await db.getAll('restoreJobs')

    return records.sort((left, right) => right.createdAt.localeCompare(left.createdAt)).slice(0, limit)
  }

  async upsert(job: RestoreJobRecord) {
    const db = await getForgeDb()
    await db.put('restoreJobs', job)
  }
}
