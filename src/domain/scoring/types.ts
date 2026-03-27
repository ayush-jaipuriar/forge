import type { WarState } from '@/domain/common/types'

export type ScoreBreakdownCategory =
  | 'deepWork'
  | 'prepExecution'
  | 'physicalExecution'
  | 'discipline'
  | 'dayTypeCompliance'

export type ScoreBreakdownItem = {
  key: ScoreBreakdownCategory
  label: string
  max: number
  earned: number
  projected: number
}

export type DayScorePreview = {
  earnedScore: number
  projectedScore: number
  warState: WarState
  label: string
  constraints: string[]
  subscores: {
    interviewPrep: number
    physical: number
    discipline: number
    consistency: number
    master: number
  }
  breakdown: ScoreBreakdownItem[]
}
