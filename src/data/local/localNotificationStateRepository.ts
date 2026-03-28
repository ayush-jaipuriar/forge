import type { NotificationStateRepository } from '@/data/repositories/types'
import { getForgeDb } from '@/data/local/forgeDb'
import { createDefaultNotificationStateSnapshot } from '@/domain/notifications/types'

export class LocalNotificationStateRepository implements NotificationStateRepository {
  async getDefault() {
    const db = await getForgeDb()
    const snapshot = await db.get('notificationState', 'default')

    if (snapshot) {
      const normalized = {
        ...createDefaultNotificationStateSnapshot(),
        ...snapshot,
        countersByDate: snapshot.countersByDate ?? {},
      }

      await db.put('notificationState', normalized)

      return normalized
    }

    const initial = createDefaultNotificationStateSnapshot()
    await db.put('notificationState', initial)
    return initial
  }

  async upsert(snapshot: Parameters<NotificationStateRepository['upsert']>[0]) {
    const db = await getForgeDb()
    await db.put('notificationState', {
      ...createDefaultNotificationStateSnapshot(),
      ...snapshot,
      countersByDate: snapshot.countersByDate ?? {},
    })
  }
}
