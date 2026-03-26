import type { WorkoutScheduleEntry } from '@/domain/physical/types'

export const forgeWorkoutSchedule: WorkoutScheduleEntry[] = [
  {
    weekday: 'monday',
    dayTypes: ['wfhHighOutput'],
    workoutType: 'upperA',
    label: 'Upper A',
    status: 'scheduled',
  },
  {
    weekday: 'tuesday',
    dayTypes: ['wfoContinuity'],
    workoutType: 'rest',
    label: 'No Major Workout',
    status: 'optional',
  },
  {
    weekday: 'wednesday',
    dayTypes: ['wfoContinuity'],
    workoutType: 'rest',
    label: 'No Major Workout',
    status: 'optional',
  },
  {
    weekday: 'thursday',
    dayTypes: ['wfhHighOutput'],
    workoutType: 'lowerA',
    label: 'Lower A',
    status: 'scheduled',
  },
  {
    weekday: 'friday',
    dayTypes: ['wfhHighOutput'],
    workoutType: 'upperB',
    label: 'Upper B',
    status: 'scheduled',
  },
  {
    weekday: 'saturday',
    dayTypes: ['weekendDeepWork'],
    workoutType: 'accessoryMobility',
    label: 'Optional Accessory / Pump / Mobility',
    status: 'optional',
  },
  {
    weekday: 'sunday',
    dayTypes: ['weekendConsolidation'],
    workoutType: 'lowerBRecovery',
    label: 'Lower B / Recovery',
    status: 'scheduled',
  },
]
