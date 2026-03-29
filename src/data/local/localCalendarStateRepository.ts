import type { CalendarStateRepository } from '@/data/repositories/types'
import { getForgeDb } from '@/data/local/forgeDb'
import { createDefaultCalendarSyncStateSnapshot } from '@/domain/calendar/types'

export class LocalCalendarStateRepository implements CalendarStateRepository {
  async getDefault() {
    const db = await getForgeDb()
    return (await db.get('calendarState', 'default')) ?? createDefaultCalendarSyncStateSnapshot()
  }

  async upsert(snapshot: Parameters<CalendarStateRepository['upsert']>[0]) {
    const db = await getForgeDb()
    await db.put('calendarState', {
      ...createDefaultCalendarSyncStateSnapshot(),
      ...snapshot,
    })
  }
}
