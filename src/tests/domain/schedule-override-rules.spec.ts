import { describe, expect, it } from 'vitest'
import {
  getAllowedDayTypeOverrides,
  getAllowedScheduleBlockTransitions,
  getScheduledDayTypeForDate,
  isDayTypeOverrideAllowed,
} from '@/domain/schedule/overrideRules'
import { forgeRoutine } from '@/data/seeds'

describe('schedule override rules', () => {
  it('allows only weekday-compatible operational day-type overrides', () => {
    expect(getAllowedDayTypeOverrides('2026-03-24')).toEqual([
      'wfhHighOutput',
      'wfoContinuity',
      'lowEnergy',
      'survival',
    ])

    expect(isDayTypeOverrideAllowed('2026-03-24', 'weekendDeepWork')).toBe(false)
    expect(isDayTypeOverrideAllowed('2026-03-24', 'survival')).toBe(true)
  })

  it('keeps weekend overrides within the sanctioned weekend shapes plus fallback types', () => {
    expect(getAllowedDayTypeOverrides('2026-03-29')).toEqual([
      'weekendConsolidation',
      'weekendDeepWork',
      'lowEnergy',
      'survival',
    ])
    expect(getScheduledDayTypeForDate('2026-03-29', forgeRoutine)).toBe('weekendConsolidation')
  })

  it('returns only sanctioned schedule block transitions', () => {
    expect(getAllowedScheduleBlockTransitions('planned')).toEqual(['completed', 'moved', 'skipped'])
    expect(getAllowedScheduleBlockTransitions('moved')).toEqual(['planned'])
  })
})
