import type { SleepStatus } from '@/domain/common/types'
import type { WorkoutLogEntry, WorkoutScheduleEntry } from '@/domain/physical/types'
import type { ReadinessSnapshot } from '@/domain/readiness/types'
import type { BlockInstance, DayInstance } from '@/domain/routine/types'
import type { DayScorePreview, ScoreBreakdownItem } from '@/domain/scoring/types'

type ScoreContext = {
  scheduledWorkout: WorkoutScheduleEntry | null
  workoutState?: WorkoutLogEntry | null
  sleepStatus: SleepStatus
  readinessSnapshot: ReadinessSnapshot
}

export function calculateDayScorePreview(dayInstance: DayInstance, context: ScoreContext): DayScorePreview {
  const primaryExecutionBlock = getPrimaryExecutionBlock(dayInstance)
  const primaryBlockCompleted = primaryExecutionBlock?.status === 'completed'
  const primaryBlockRecoverable = primaryExecutionBlock ? isRecoverableBlockStatus(primaryExecutionBlock.status) : false
  const primaryOutputCaptured = primaryBlockCompleted && hasMeaningfulOutput(primaryExecutionBlock)
  const prepTargetMinutes = getPrepTargetMinutes(dayInstance)
  const totalRecoverablePrepMinutes = getPrepMinutes(dayInstance.blocks, ['completed', 'planned', 'moved'])
  const completedPrepMinutes = getPrepMinutes(dayInstance.blocks, ['completed'])
  const hasSecondaryPrepCompleted = dayInstance.blocks.some(
    (block) => block.id !== primaryExecutionBlock?.id && isSecondaryPrepBlock(block) && block.status === 'completed',
  )
  const hasSecondaryPrepPotential = dayInstance.blocks.some(
    (block) => block.id !== primaryExecutionBlock?.id && isSecondaryPrepBlock(block) && isRecoverableBlockStatus(block.status),
  )
  const planningBlock = dayInstance.blocks.find((block) => block.kind === 'planning') ?? null
  const planningCompleted = planningBlock?.status === 'completed'
  const planningRecoverable = planningBlock ? isRecoverableBlockStatus(planningBlock.status) : false
  const workoutState = context.workoutState ?? getFallbackWorkoutState(dayInstance, context.scheduledWorkout)
  const workoutExpected = workoutState.status === 'scheduled'
  const workoutCompleted = workoutState.status === 'done' || dayInstance.blocks.some((block) => block.kind === 'workout' && block.status === 'completed')
  const workoutRecoverable = workoutCompleted || workoutState.status === 'scheduled' || workoutState.status === 'optional'
  const lowValueCompletions = dayInstance.blocks.filter(
    (block) => ['activation', 'analytics'].includes(block.kind) && block.status === 'completed',
  ).length
  const trackingCompliance = hasTrackingCompliance(dayInstance, context.sleepStatus, workoutState)
  const requiredBlocks = dayInstance.blocks.filter((block) => !block.optional)
  const completedRequiredBlocks = requiredBlocks.filter((block) => block.status === 'completed').length
  const recoverableRequiredBlocks = requiredBlocks.filter((block) => isRecoverableBlockStatus(block.status)).length

  const breakdown: ScoreBreakdownItem[] = [
    {
      key: 'deepWork',
      label: 'Prime block completed',
      max: 25,
      earned: primaryBlockCompleted ? 25 : 0,
      projected: primaryBlockCompleted ? 25 : primaryBlockRecoverable ? 25 : 0,
    },
    {
      key: 'deepWork',
      label: 'Meaningful output captured',
      max: 10,
      earned: primaryOutputCaptured ? 10 : 0,
      projected: primaryBlockRecoverable ? 10 : 0,
    },
    {
      key: 'prepExecution',
      label: 'Secondary prep block landed',
      max: 10,
      earned: hasSecondaryPrepCompleted ? 10 : 0,
      projected: hasSecondaryPrepCompleted || hasSecondaryPrepPotential ? 10 : 0,
    },
    {
      key: 'prepExecution',
      label: 'Prep time target met',
      max: 10,
      earned: completedPrepMinutes >= prepTargetMinutes ? 10 : 0,
      projected: totalRecoverablePrepMinutes >= prepTargetMinutes ? 10 : 0,
    },
    {
      key: 'physicalExecution',
      label: 'Scheduled workout completed',
      max: 10,
      earned: workoutExpected ? (workoutCompleted ? 10 : 0) : 10,
      projected: workoutExpected ? (workoutRecoverable ? 10 : 0) : 10,
    },
    {
      key: 'physicalExecution',
      label: 'Sleep target met',
      max: 5,
      earned: context.sleepStatus === 'met' ? 5 : 0,
      projected: context.sleepStatus === 'missed' ? 0 : 5,
    },
    {
      key: 'discipline',
      label: 'No major rabbit hole',
      max: 7,
      earned: getRabbitHoleDisciplineScore({ primaryExecutionBlock, lowValueCompletions, projected: false }),
      projected: getRabbitHoleDisciplineScore({ primaryExecutionBlock, lowValueCompletions, projected: true }),
    },
    {
      key: 'discipline',
      label: 'Planning / day hygiene',
      max: 4,
      earned: planningBlock ? (planningCompleted ? 4 : 0) : 4,
      projected: planningBlock ? (planningRecoverable ? 4 : 0) : 4,
    },
    {
      key: 'discipline',
      label: 'Tracking / logging compliance',
      max: 4,
      earned: trackingCompliance ? 4 : 0,
      projected: trackingCompliance ? 4 : 4,
    },
    {
      key: 'dayTypeCompliance',
      label: 'Day-type expectations met',
      max: 15,
      earned: scoreCompliance(completedRequiredBlocks, requiredBlocks.length, 15),
      projected: scoreCompliance(recoverableRequiredBlocks, requiredBlocks.length, 15),
    },
  ]

  const earnedBeforeConstraints = breakdown.reduce((sum, item) => sum + item.earned, 0)
  const projectedBeforeConstraints = breakdown.reduce((sum, item) => sum + item.projected, 0)
  const constraints = getScoreConstraints({ dayInstance, primaryExecutionBlock, lowValueCompletions })
  const earnedScore = applyScoreConstraints(earnedBeforeConstraints, constraints)
  const projectedScore = applyScoreConstraints(projectedBeforeConstraints, constraints)
  const warState = getWarState(projectedScore)

  return {
    earnedScore,
    projectedScore,
    warState,
    label: getWarStateLabel(warState),
    constraints: constraints.map((constraint) => constraint.reason),
    subscores: {
      interviewPrep: clampScore(sumProjected(breakdown, ['deepWork', 'prepExecution'])),
      physical: clampScore(sumProjected(breakdown, ['physicalExecution'])),
      discipline: clampScore(sumProjected(breakdown, ['discipline'])),
      consistency: clampScore(sumProjected(breakdown, ['dayTypeCompliance']) + getReadinessConsistencyBonus(context.readinessSnapshot)),
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

function isRecoverableBlockStatus(status: BlockInstance['status']) {
  return status === 'planned' || status === 'moved' || status === 'completed'
}

function hasMeaningfulOutput(block: BlockInstance | null) {
  return Boolean(block?.executionNote?.trim())
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

function getFallbackWorkoutState(dayInstance: DayInstance, scheduledWorkout: WorkoutScheduleEntry | null): WorkoutLogEntry {
  const workoutBlock = dayInstance.blocks.find((block) => block.kind === 'workout')

  return {
    date: dayInstance.date,
    workoutType: scheduledWorkout?.workoutType ?? 'rest',
    label: scheduledWorkout?.label ?? workoutBlock?.title ?? 'Recovery / Flex',
    status: scheduledWorkout?.status ?? (workoutBlock && !workoutBlock.optional ? 'scheduled' : 'optional'),
  }
}

function hasTrackingCompliance(dayInstance: DayInstance, sleepStatus: SleepStatus, workoutState: WorkoutLogEntry) {
  return (
    dayInstance.blocks.some((block) => block.status !== 'planned' || Boolean(block.executionNote?.trim())) ||
    sleepStatus !== 'unknown' ||
    workoutState.status !== 'scheduled'
  )
}

function getRabbitHoleDisciplineScore({
  primaryExecutionBlock,
  lowValueCompletions,
  projected,
}: {
  primaryExecutionBlock: BlockInstance | null
  lowValueCompletions: number
  projected: boolean
}) {
  if (!primaryExecutionBlock) {
    return 7
  }

  if (primaryExecutionBlock.status === 'skipped') {
    return lowValueCompletions > 0 ? 0 : projected ? 3 : 2
  }

  return 7
}

function scoreCompliance(completedOrRecoverable: number, total: number, max: number) {
  if (total === 0) {
    return max
  }

  return Math.round((completedOrRecoverable / total) * max)
}

function getScoreConstraints({
  dayInstance,
  primaryExecutionBlock,
  lowValueCompletions,
}: {
  dayInstance: DayInstance
  primaryExecutionBlock: BlockInstance | null
  lowValueCompletions: number
}) {
  const constraints: Array<{ maxScore: number; reason: string }> = []
  const deepWorkWeightedDay = ['wfhHighOutput', 'weekendDeepWork', 'weekendConsolidation'].includes(dayInstance.dayType)

  if (deepWorkWeightedDay && primaryExecutionBlock?.requiredOutput && primaryExecutionBlock.status === 'skipped') {
    constraints.push({
      maxScore: 69,
      reason: 'Prime execution was missed, so low-value completions cannot push the day above slipping.',
    })
  }

  if (deepWorkWeightedDay && primaryExecutionBlock?.requiredOutput && primaryExecutionBlock.status === 'skipped' && lowValueCompletions > 0) {
    constraints.push({
      maxScore: 54,
      reason: 'Low-value completions cannot mask a missed prime block on a deep-work-weighted day.',
    })
  }

  return constraints
}

function applyScoreConstraints(score: number, constraints: Array<{ maxScore: number }>) {
  return constraints.reduce((current, constraint) => Math.min(current, constraint.maxScore), score)
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
  switch (snapshot.paceSnapshot.paceLevel) {
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

function sumProjected(items: ScoreBreakdownItem[], keys: ScoreBreakdownItem['key'][]) {
  return items.filter((item) => keys.includes(item.key)).reduce((sum, item) => sum + item.projected, 0)
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, value))
}
