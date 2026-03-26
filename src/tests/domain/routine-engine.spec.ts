import { applyDayModeToInstance } from '@/domain/execution/fallbacks'
import { deserializeDayInstance, serializeDayInstance } from '@/domain/routine/serialization'
import { getCurrentBlock, getTopPriorityBlocks } from '@/domain/routine/selectors'
import { generateDayInstance } from '@/domain/routine/generateDayInstance'
import { forgeRoutine } from '@/data/seeds'
import { generateWeekInstances } from '@/domain/routine/week'

describe('routine engine', () => {
  it('generates the configured weekday template from the seeded routine', () => {
    const instance = generateDayInstance({
      date: '2026-03-23',
      routine: forgeRoutine,
    })

    expect(instance.weekday).toBe('monday')
    expect(instance.dayType).toBe('wfhHighOutput')
    expect(instance.label).toBe('WFH High Output Day')
    expect(instance.blocks.some((block) => block.title === 'Prime Deep Block')).toBe(true)
  })

  it('supports explicit low-energy transformation without mutating the base day template', () => {
    const baseInstance = generateDayInstance({
      date: '2026-03-27',
      routine: forgeRoutine,
    })

    const lowEnergy = applyDayModeToInstance(baseInstance, 'lowEnergy')

    expect(baseInstance.dayType).toBe('wfhHighOutput')
    expect(lowEnergy.dayType).toBe('lowEnergy')
    expect(lowEnergy.label).toBe('Low Energy Day')
    expect(lowEnergy.blocks.every((block) => ['deepWork', 'prep', 'workout', 'planning', 'recovery'].includes(block.kind))).toBe(true)
  })

  it('supports survival mode by stripping the plan down to the minimum viable day', () => {
    const instance = generateDayInstance({
      date: '2026-03-28',
      routine: forgeRoutine,
      dayMode: 'survival',
    })

    expect(instance.dayType).toBe('survival')
    expect(instance.blocks.length).toBeGreaterThan(0)
    expect(instance.blocks.every((block) => ['prep', 'planning', 'recovery'].includes(block.kind))).toBe(true)
  })

  it('serializes and deserializes day instances without losing structure', () => {
    const instance = generateDayInstance({
      date: '2026-03-24',
      routine: forgeRoutine,
    })

    const roundTrip = deserializeDayInstance(serializeDayInstance(instance))

    expect(roundTrip).toEqual(instance)
  })

  it('generates the current week as seven concrete day instances', () => {
    const week = generateWeekInstances({
      anchorDate: '2026-03-26',
      routine: forgeRoutine,
    })

    expect(week).toHaveLength(7)
    expect(week[0].weekday).toBe('monday')
    expect(week[6].weekday).toBe('sunday')
  })

  it('derives a current block and top priorities from block metadata', () => {
    const instance = generateDayInstance({
      date: '2026-03-23',
      routine: forgeRoutine,
    })

    const currentBlock = getCurrentBlock(instance, '08:30')
    const topPriorities = getTopPriorityBlocks(instance)

    expect(currentBlock?.title).toBe('Prime Deep Block')
    expect(topPriorities[0]?.requiredOutput).toBe(true)
  })
})
