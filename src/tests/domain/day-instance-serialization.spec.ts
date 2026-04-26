import { describe, expect, it } from 'vitest'
import { forgeRoutine } from '@/data/seeds'
import { generateDayInstance } from '@/domain/routine/generateDayInstance'
import { serializeDayInstance } from '@/domain/routine/serialization'

describe('day instance serialization', () => {
  it('removes undefined optional fields before persistence', () => {
    const instance = generateDayInstance({
      date: '2026-04-26',
      routine: forgeRoutine,
    })

    const serialized = serializeDayInstance(instance)

    expect(JSON.stringify(serialized)).not.toContain(':undefined')
    expect(hasUndefinedValue(serialized)).toBe(false)
  })
})

function hasUndefinedValue(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.some(hasUndefinedValue)
  }

  if (value && typeof value === 'object') {
    return Object.values(value).some((entryValue) => entryValue === undefined || hasUndefinedValue(entryValue))
  }

  return false
}
