import type { DayInstance } from '@/domain/routine/types'

export type PersistedDayInstance = DayInstance

export function serializeDayInstance(instance: DayInstance): PersistedDayInstance {
  return structuredClone(instance)
}

export function deserializeDayInstance(record: PersistedDayInstance): DayInstance {
  return structuredClone(record)
}
