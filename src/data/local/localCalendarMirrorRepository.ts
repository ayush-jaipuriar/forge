import type { CalendarMirrorRepository } from '@/data/repositories/types'
import { getForgeDb } from '@/data/local/forgeDb'

export class LocalCalendarMirrorRepository implements CalendarMirrorRepository {
  async listForDate(date: string) {
    const db = await getForgeDb()
    return db.getAllFromIndex('calendarMirrors', 'byDayDate', date)
  }

  async listAll() {
    const db = await getForgeDb()
    return db.getAll('calendarMirrors')
  }

  async upsert(record: Parameters<CalendarMirrorRepository['upsert']>[0]) {
    const db = await getForgeDb()
    await db.put('calendarMirrors', record)
  }

  async remove(id: string) {
    const db = await getForgeDb()
    await db.delete('calendarMirrors', id)
  }

  async clearAll() {
    const db = await getForgeDb()
    await db.clear('calendarMirrors')
  }
}
