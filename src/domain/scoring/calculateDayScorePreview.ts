import type { BlockInstance, DayInstance } from '@/domain/routine/types'
import type { SleepStatus } from '@/domain/common/types'
import type { WorkoutScheduleEntry } from '@/domain/physical/types'
import type { ReadinessSnapshot } from '@/domain/readiness/types'
import type { DayScorePreview, ScoreBreakdownItem } from '@/domain/scoring/types'

export function calculateDayScorePreview(
  dayInstance: DayInstance,
  context: {
    scheduledWorkout: WorkoutScheduleEntry | null
    sleepStatus: SleepStatus
    readinessSnapshot: ReadinessSnapshot
  },
): DayScorePreview {
  const primaryExecutionBlock = getPrimaryExecutionBlock(dayInstance)
  const prepTargetMinutes = getPrepTargetMinutes(dayInstance)
  const fullDayPrepCapacity = getPrepMinutes(dayInstance.blocks, ['completed', 'planned', 'moved', 'skipped'])
  const completedPrepMinutes = getPrepMinutes(dayInstance.blocks, ['completed'])
  const possiblePrepMinutes = getPrepMinutes(dayInstance.blocks, ['completed', 'planned', 'moved'])
  const hasSecondaryPrepCompleted = dayInstance.blocks.some(
    (block) => block.id !== primaryExecutionBlock?.id && isSecondaryPrepBlock(block) && block.status === 'completed',
  )
  const hasSecondaryPrepPotential = dayInstance.blocks.some(
    (block) => block.id !== primaryExecutionBlock?.id && isSecondaryPrepBlock(block) && isReplayableBlockStatus(block.status),
  )
  const workoutBlocks = dayInstance.blocks.filter((block) => block.kind === 'workout')
  const hasWorkoutExpectation = context.scheduledWorkout?.status === 'scheduled' || workoutBlocks.some((block) => !block.optional)
  const hasWorkoutCompleted = workoutBlocks.some((block) => block.status === 'completed')
  const hasWorkoutPotential = workoutBlocks.some((block) => isReplayableBlockStatus(block.status))
  const planningBlocks = dayInstance.blocks.filter((block) => block.kind === 'planning')
  const hasPlanningCompleted = planningBlocks.some((block) => block.status === 'completed')
  const hasPlanningPotential = planningBlocks.some((block) => isReplayableBlockStatus(block.status))
  const planningIsExpected = planningBlocks.length > 0
  const hasLoggingCompliance = dayInstance.blocks.some((block) => block.status !== 'planned')
  const requiredBlocks = dayInstance.blocks.filter((block) => !block.optional)
  const completedRequiredBlocks = requiredBlocks.filter((block) => block.status === 'completed').length
  const replayableRequiredBlocks = requiredBlocks.filter((block) => isReplayableBlockStatus(block.status)).length

  const breakdown: ScoreBreakdownItem[] = [
    {
      key: 'deepWork',
      label: 'Primary Execution',
      max: 35,
      earned: primaryExecutionBlock?.status === 'completed' ? 35 : 0,
      projected:
        primaryExecutionBlock?.status === 'completed'
          ? 35
          : primaryExecutionBlock && isReplayableBlockStatus(primaryExecutionBlock.status)
            ? 35
            : 0,
    },
    {
      key: 'prepExecution',
      label: 'Prep Execution',
      max: 20,
      earned: (hasSecondaryPrepCompleted ? 10 : 0) + (completedPrepMinutes >= Math.min(prepTargetMinutes, fullDayPrepCapacity) ? 10 : 0),
      projected:
        (hasSecondaryPrepCompleted || hasSecondaryPrepPotential ? 10 : 0) +
        (possiblePrepMinutes >= Math.min(prepTargetMinutes, fullDayPrepCapacity) ? 10 : 0),
    },
    {
      key: 'physicalExecution',
      label: 'Physical Execution',
      max: 15,
      earned:
        (hasWorkoutExpectation ? (hasWorkoutCompleted ? 10 : 0) : 10) +
        (context.sleepStatus === 'met' ? 5 : 0),
      projected:
        (hasWorkoutExpectation ? (hasWorkoutCompleted || hasWorkoutPotential ? 10 : 0) : 10) +
        (context.sleepStatus === 'missed' ? 0 : 5),
    },
    {
      key: 'discipline',
      label: 'Discipline',
      max: 15,
      earned: (planningIsExpected ? (hasPlanningCompleted ? 4 : 0) : 4) + (hasLoggingCompliance ? 4 : 0),
      projected: 7 + (planningIsExpected ? (hasPlanningCompleted || hasPlanningPotential ? 4 : 0) : 4) + 4,
    },
    {
      key: 'dayTypeCompliance',
      label: 'Day-Type Compliance',
      max: 15,
      earned: scoreCompliance(completedRequiredBlocks, requiredBlocks.length, 15),
      projected: scoreCompliance(replayableRequiredBlocks, requiredBlocks.length, 15),
    },
  ]

  const earnedScore = breakdown.reduce((sum, item) => sum + item.earned, 0)
  const projectedScore = breakdown.reduce((sum, item) => sum + item.projected, 0)
  const warState = getWarState(projectedScore)

  return {
    earnedScore,
    projectedScore,
    warState,
    label: getWarStateLabel(warState),
    subscores: {
      interviewPrep: clampScore(
        breakdown.find((item) => item.key === 'deepWork')!.projected + breakdown.find((item) => item.key === 'prepExecution')!.projected,
      ),
      physical: clampScore(breakdown.find((item) => item.key === 'physicalExecution')!.projected),
      discipline: clampScore(breakdown.find((item) => item.key === 'discipline')!.projected),
      consistency: clampScore(
        breakdown.find((item) => item.key === 'dayTypeCompliance')!.projected +
          getReadinessConsistencyBonus(context.readinessSnapshot),
      ),
      master: projectedScore,
    },
    breakdown,
  }
}

function getPrimaryExecutionBlock(dayInstance: DayInstance) {
  return (
    dayInstance.blocks.find((block) => block.kind === 'deepWork' && block.requiredOutput) ??
    dayInstance.blocks.find((block) => block.kind === 'deepWork') ??
    dayInstance.blocks.find((block) => !block.optional && isSecondaryPrepBlock(block)) ??
    null
  )
}

function isSecondaryPrepBlock(block: BlockInstance) {
  return block.kind === 'prep' || block.kind === 'review'
}

function isReplayableBlockStatus(status: BlockInstance['status']) {
  return status === 'planned' || status === 'moved' || status === 'completed'
}

function getPrepMinutes(blocks: BlockInstance[], eligibleStatuses: BlockInstance['status'][]) {
  return blocks
    .filter((block) => ['deepWork', 'prep', 'review'].includes(block.kind) && eligibleStatuses.includes(block.status))
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

  return 0
}

function getPrepTargetMinutes(dayInstance: DayInstance) {
  switch (dayInstance.dayType) {
    case 'wfhHighOutput':
      return 120
    case 'wfoContinuity':
      return 35
    case 'weekendDeepWork':
    case 'weekendConsolidation':
      return 150
    case 'lowEnergy':
      return 30
    case 'survival':
      return 20
    default:
      return 60
  }
}

function scoreCompliance(completedOrRecoverable: number, total: number, max: number) {
  if (total === 0) {
    return max
  }

  return Math.round((completedOrRecoverable / total) * max)
}

function getWarState(score: number) {
  if (score >= 85) {
    return 'dominant'
  }

  if (score >= 70) {
    return 'onTrack'
  }

  if (score >= 50) {
    return 'slipping'
  }

  return 'critical'
}

function getWarStateLabel(warState: DayScorePreview['warState']) {
  switch (warState) {
    case 'dominant':
      return 'Dominant'
    case 'onTrack':
      return 'On Track'
    case 'slipping':
      return 'Slipping'
    case 'critical':
      return 'Critical'
    default:
      return 'On Track'
  }
}

function getReadinessConsistencyBonus(snapshot: ReadinessSnapshot) {
  switch (snapshot.pressureLevel) {
    case 'critical':
      return 0
    case 'behind':
      return 2
    case 'building':
      return 4
    case 'onTrack':
      return 5
    default:
      return 0
  }
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, value))
}
