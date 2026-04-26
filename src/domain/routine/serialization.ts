import type { DayInstance } from '@/domain/routine/types'

export type PersistedDayInstance = DayInstance

export function serializeDayInstance(instance: DayInstance): PersistedDayInstance {
  return stripUndefinedFields(instance) as PersistedDayInstance
}

export function deserializeDayInstance(record: PersistedDayInstance): DayInstance {
  return structuredClone(record)
}

function stripUndefinedFields(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(stripUndefinedFields)
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, entryValue]) => entryValue !== undefined)
        .map(([key, entryValue]) => [key, stripUndefinedFields(entryValue)]),
    )
  }

  return value
}
