import type { NotificationLogRepository } from '@/data/repositories/types'
import { getForgeDb } from '@/data/local/forgeDb'

export class LocalNotificationLogRepository implements NotificationLogRepository {
  async listRecent(limit = 20) {
    const db = await getForgeDb()
    const records = await db.getAll('notificationLog')

    return records.sort((left, right) => right.evaluatedAt.localeCompare(left.evaluatedAt)).slice(0, limit)
  }

  async upsert(record: Parameters<NotificationLogRepository['upsert']>[0]) {
    const db = await getForgeDb()
    await db.put('notificationLog', record)
  }
}
