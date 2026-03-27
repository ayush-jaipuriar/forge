import { describe, expect, it } from 'vitest'
import { forgeRoutine } from '@/data/seeds'
import { getFallbackModeSuggestion } from '@/domain/recommendation/getFallbackModeSuggestion'
import { generateDayInstance } from '@/domain/routine/generateDayInstance'
import type { DayScorePreview } from '@/domain/scoring/types'

const stableScorePreview: DayScorePreview = {
  earnedScore: 58,
  projectedScore: 76,
  warState: 'onTrack',
  label: 'On Track',
  subscores: {
    interviewPrep: 30,
    physical: 12,
    discipline: 18,
    consistency: 16,
    master: 76,
  },
  breakdown: [],
}

describe('getFallbackModeSuggestion', () => {
  it('suggests low-energy mode when support signals degrade under a full-load day', () => {
    const dayInstance = generateDayInstance({
      date: '2026-03-26',
      routine: forgeRoutine,
      dayMode: 'normal',
    })

    const suggestion = getFallbackModeSuggestion({
      dayInstance,
      scorePreview: stableScorePreview,
      sleepStatus: 'unknown',
      energyStatus: 'low',
    })

    expect(suggestion?.suggestedDayMode).toBe('lowEnergy')
    expect(suggestion?.urgency).toBe('high')
  })

  it('pushes from low-energy into survival when the day is already critical', () => {
    const dayInstance = generateDayInstance({
      date: '2026-03-26',
      routine: forgeRoutine,
      dayMode: 'lowEnergy',
    })

    const suggestion = getFallbackModeSuggestion({
      dayInstance,
      scorePreview: {
        ...stableScorePreview,
        warState: 'critical',
        label: 'Critical',
        projectedScore: 38,
      },
      sleepStatus: 'met',
      energyStatus: 'normal',
    })

    expect(suggestion?.suggestedDayMode).toBe('survival')
    expect(suggestion?.urgency).toBe('critical')
  })

  it('returns no suggestion when the current posture is still honest for the signals', () => {
    const dayInstance = generateDayInstance({
      date: '2026-03-26',
      routine: forgeRoutine,
      dayMode: 'normal',
    })

    const suggestion = getFallbackModeSuggestion({
      dayInstance,
      scorePreview: stableScorePreview,
      sleepStatus: 'met',
      energyStatus: 'normal',
    })

    expect(suggestion).toBeNull()
  })
})
