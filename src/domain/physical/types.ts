import type { DayType, Weekday, WorkoutStatus } from '@/domain/common/types'

export type WorkoutType =
  | 'upperA'
  | 'lowerA'
  | 'upperB'
  | 'lowerBRecovery'
  | 'accessoryMobility'
  | 'rest'

export type WorkoutScheduleEntry = {
  weekday: Weekday
  dayTypes: DayType[]
  workoutType: WorkoutType
  label: string
  status: WorkoutStatus
}
