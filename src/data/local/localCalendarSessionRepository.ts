import { getForgeDb } from '@/data/local/forgeDb'
import type { CalendarSessionSnapshot } from '@/domain/calendar/types'

export class LocalCalendarSessionRepository {
  async getDefault() {
    const db = await getForgeDb()
    return (await db.get('calendarSessions', 'default')) ?? null
  }

  async upsert(snapshot: CalendarSessionSnapshot) {
    const db = await getForgeDb()
    await db.put('calendarSessions', snapshot)
  }

  async clear() {
    const db = await getForgeDb()
    await db.delete('calendarSessions', 'default')
  }
}
