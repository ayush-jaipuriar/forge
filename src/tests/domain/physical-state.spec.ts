import { describe, expect, it } from 'vitest'
import { forgeWorkoutSchedule } from '@/data/seeds'
import { deriveSleepStatusFromDuration, getWeeklyWorkoutSummary, getWorkoutForDate } from '@/domain/physical/selectors'

describe('physical selectors', () => {
  it('derives sleep target status from logged duration', () => {
    expect(deriveSleepStatusFromDuration(8)).toBe('met')
    expect(deriveSleepStatusFromDuration(6.5)).toBe('missed')
    expect(deriveSleepStatusFromDuration(undefined)).toBe('unknown')
  })

  it('prefers persisted workout logs over the scheduled default state', () => {
    const scheduledWorkout = forgeWorkoutSchedule[0]
    const workout = getWorkoutForDate({
      date: '2026-03-23',
      scheduledWorkout,
      workoutLogs: {
        '2026-03-23': {
          date: '2026-03-23',
          workoutType: scheduledWorkout.workoutType,
          label: scheduledWorkout.label,
          status: 'done',
          note: 'Completed after work.',
        },
      },
    })

    expect(workout.status).toBe('done')
    expect(workout.note).toMatch(/after work/i)
  })

  it('summarizes weekly workout outcomes alongside the seeded schedule', () => {
    const summary = getWeeklyWorkoutSummary(forgeWorkoutSchedule, {
      '2026-03-23': {
        date: '2026-03-23',
        workoutType: 'upperA',
        label: 'Upper A',
        status: 'done',
      },
      '2026-03-24': {
        date: '2026-03-24',
        workoutType: 'rest',
        label: 'No Major Workout',
        status: 'skipped',
      },
    })

    expect(summary.doneCount).toBe(1)
    expect(summary.skippedCount).toBe(1)
    expect(summary.scheduledCount).toBeGreaterThan(0)
  })
})
