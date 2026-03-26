import type { DayInstanceRepository } from '@/data/repositories/types'
import { getForgeDb } from '@/data/local/forgeDb'
import { deserializeDayInstance, serializeDayInstance } from '@/domain/routine/serialization'
import type { DayInstance } from '@/domain/routine/types'

export class LocalDayInstanceRepository implements DayInstanceRepository {
  async getByDate(date: string) {
    const db = await getForgeDb()
    const record = await db.getFromIndex('dayInstances', 'byDate', date)

    return record ? deserializeDayInstance(record) : null
  }

  async getByDates(dates: string[]) {
    const db = await getForgeDb()
    const allRecords = await db.getAll('dayInstances')

    return allRecords
      .filter((record) => dates.includes(record.date))
      .map((record) => deserializeDayInstance(record))
  }

  async upsert(instance: DayInstance) {
    const db = await getForgeDb()
    await db.put('dayInstances', serializeDayInstance(instance))
  }

  async upsertMany(instances: DayInstance[]) {
    const db = await getForgeDb()
    const transaction = db.transaction('dayInstances', 'readwrite')

    await Promise.all(instances.map((instance) => transaction.store.put(serializeDayInstance(instance))))
    await transaction.done
  }
}
