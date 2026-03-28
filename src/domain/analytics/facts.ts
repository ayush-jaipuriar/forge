import type { DayMode, SleepStatus, WarState, WorkoutStatus } from '@/domain/common/types'
import type { WorkoutLogEntry } from '@/domain/physical/types'
import type { PrepDomainKey } from '@/domain/prep/types'
import type { BlockInstance, DayInstance } from '@/domain/routine/types'
import type { DayScorePreview } from '@/domain/scoring/types'
import { analyticsTimeBands, type AnalyticsTimeBand } from '@/domain/analytics/types'

export type AnalyticsTimeBandOutcome = {
  band: AnalyticsTimeBand
  completedBlocks: number
  skippedBlocks: number
  movedBlocks: number
  totalBlocks: number
}

export type AnalyticsDayFact = {
  date: string
  weekday: DayInstance['weekday']
  dayType: DayInstance['dayType']
  dayMode: DayMode
  warState: WarState
  earnedScore: number
  projectedScore: number
  interviewPrepScore: number
  physicalScore: number
  disciplineScore: number
  consistencyScore: number
  sleepStatus: SleepStatus
  sleepDurationHours?: number
  workoutStatus: WorkoutStatus
  workoutExpected: boolean
  workoutCompleted: boolean
  completedBlocks: number
  skippedBlocks: number
  movedBlocks: number
  completedDeepBlocks: number
  missedPrimeBlock: boolean
  requiredOutputsCaptured: number
  prepMinutes: number
  fallbackActivated: boolean
  focusedPrepDomains: PrepDomainKey[]
  timeBandOutcomes: AnalyticsTimeBandOutcome[]
}

export function deriveAnalyticsDayFact({
  dayInstance,
  scorePreview,
  sleepStatus,
  sleepDurationHours,
  workoutState,
  focusedPrepDomains,
}: {
  dayInstance: DayInstance
  scorePreview: DayScorePreview
  sleepStatus: SleepStatus
  sleepDurationHours?: number
  workoutState: WorkoutLogEntry
  focusedPrepDomains: PrepDomainKey[]
}): AnalyticsDayFact {
  const completedBlocks = dayInstance.blocks.filter((block) => block.status === 'completed').length
  const skippedBlocks = dayInstance.blocks.filter((block) => block.status === 'skipped').length
  const movedBlocks = dayInstance.blocks.filter((block) => block.status === 'moved').length
  const completedDeepBlocks = dayInstance.blocks.filter((block) => block.kind === 'deepWork' && block.status === 'completed').length
  const missedPrimeBlock = dayInstance.blocks.some((block) => block.kind === 'deepWork' && block.requiredOutput && block.status === 'skipped')
  const requiredOutputsCaptured = dayInstance.blocks.filter((block) => block.requiredOutput && hasMeaningfulOutput(block)).length
  const prepMinutes = getPrepMinutes(dayInstance.blocks)
  const workoutExpected = workoutState.status !== 'optional' && workoutState.workoutType !== 'rest'
  const workoutCompleted = workoutState.status === 'done'
  const fallbackActivated =
    dayInstance.dayMode === 'lowEnergy' ||
    dayInstance.dayMode === 'survival' ||
    dayInstance.dayType === 'lowEnergy' ||
    dayInstance.dayType === 'survival'

  return {
    date: dayInstance.date,
    weekday: dayInstance.weekday,
    dayType: dayInstance.dayType,
    dayMode: dayInstance.dayMode,
    warState: scorePreview.warState,
    earnedScore: scorePreview.earnedScore,
    projectedScore: scorePreview.projectedScore,
    interviewPrepScore: scorePreview.subscores.interviewPrep,
    physicalScore: scorePreview.subscores.physical,
    disciplineScore: scorePreview.subscores.discipline,
    consistencyScore: scorePreview.subscores.consistency,
    sleepStatus,
    sleepDurationHours,
    workoutStatus: workoutState.status,
    workoutExpected,
    workoutCompleted,
    completedBlocks,
    skippedBlocks,
    movedBlocks,
    completedDeepBlocks,
    missedPrimeBlock,
    requiredOutputsCaptured,
    prepMinutes,
    fallbackActivated,
    focusedPrepDomains,
    timeBandOutcomes: getTimeBandOutcomes(dayInstance.blocks),
  }
}

function getPrepMinutes(blocks: BlockInstance[]) {
  return blocks
    .filter((block) => ['deepWork', 'prep', 'review'].includes(block.kind) && block.status === 'completed')
    .reduce((total, block) => total + getBlockMinutes(block), 0)
}

function getBlockMinutes(block: BlockInstance) {
  if (block.durationMinutes) {
    return block.durationMinutes
  }

  if (block.startTime && block.endTime) {
    const [startHours, startMinutes] = block.startTime.split(':').map(Number)
    const [endHours, endMinutes] = block.endTime.split(':').map(Number)

    return endHours * 60 + endMinutes - (startHours * 60 + startMinutes)
  }

  switch (block.kind) {
    case 'deepWork':
      return 75
    case 'prep':
    case 'review':
      return 30
    default:
      return 0
  }
}

function hasMeaningfulOutput(block: BlockInstance) {
  return Boolean(block.executionNote?.trim())
}

function getTimeBandOutcomes(blocks: BlockInstance[]) {
  const outcomes = Object.fromEntries(
    analyticsTimeBands.map((band) => [
      band,
      {
        band,
        completedBlocks: 0,
        skippedBlocks: 0,
        movedBlocks: 0,
        totalBlocks: 0,
      },
    ]),
  ) as Record<AnalyticsTimeBand, AnalyticsTimeBandOutcome>

  for (const block of blocks) {
    const band = getAnalyticsTimeBand(block)
    outcomes[band].totalBlocks += 1

    if (block.status === 'completed') {
      outcomes[band].completedBlocks += 1
    } else if (block.status === 'skipped') {
      outcomes[band].skippedBlocks += 1
    } else if (block.status === 'moved') {
      outcomes[band].movedBlocks += 1
    }
  }

  return analyticsTimeBands.map((band) => outcomes[band])
}

export function getAnalyticsTimeBand(block: BlockInstance): AnalyticsTimeBand {
  if (block.startTime) {
    const [hours] = block.startTime.split(':').map(Number)

    if (hours < 11) {
      return 'morning'
    }

    if (hours < 14) {
      return 'midday'
    }

    if (hours < 17) {
      return 'afternoon'
    }

    if (hours < 21) {
      return 'evening'
    }

    return 'night'
  }

  switch (block.kind) {
    case 'activation':
    case 'deepWork':
      return 'morning'
    case 'prep':
      return 'midday'
    case 'analytics':
      return 'afternoon'
    case 'workout':
    case 'review':
      return 'evening'
    case 'planning':
    case 'recovery':
      return 'night'
    default:
      return 'afternoon'
  }
}
