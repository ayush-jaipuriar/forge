import type { ExternalCalendarEventRepository } from '@/data/repositories/types'
import { getForgeDb } from '@/data/local/forgeDb'
import type { ExternalCalendarEventCacheRecord } from '@/domain/calendar/types'

export class LocalExternalCalendarEventRepository implements ExternalCalendarEventRepository {
  async listForDate(date: string) {
    const db = await getForgeDb()
    return db.getAllFromIndex('externalCalendarEvents', 'byDate', date)
  }

  async upsertMany(records: ExternalCalendarEventCacheRecord[]) {
    const db = await getForgeDb()
    const transaction = db.transaction('externalCalendarEvents', 'readwrite')

    await Promise.all(records.map((record) => transaction.store.put(record)))
    await transaction.done
  }

  async replaceForDates(dates: string[], records: ExternalCalendarEventCacheRecord[]) {
    const db = await getForgeDb()
    const transaction = db.transaction('externalCalendarEvents', 'readwrite')
    const uniqueDates = [...new Set(dates)]

    for (const date of uniqueDates) {
      const existingKeys = await transaction.store.index('byDate').getAllKeys(date)
      await Promise.all(existingKeys.map((key) => transaction.store.delete(key)))
    }

    await Promise.all(records.map((record) => transaction.store.put(record)))
    await transaction.done
  }

  async clearAll() {
    const db = await getForgeDb()
    await db.clear('externalCalendarEvents')
  }
}
