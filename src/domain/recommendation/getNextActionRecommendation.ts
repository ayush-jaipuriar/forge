import type { EnergyStatus, SleepStatus } from '@/domain/common/types'
import type { WorkoutScheduleEntry } from '@/domain/physical/types'
import type { NextActionRecommendation } from '@/domain/recommendation/types'
import type { DayInstance } from '@/domain/routine/types'
import type { DayScorePreview } from '@/domain/scoring/types'
import type { ReadinessSnapshot } from '@/domain/readiness/types'

export function getNextActionRecommendation({
  dayInstance,
  currentBlock,
  topPriorities,
  scorePreview,
  readinessSnapshot,
  scheduledWorkout,
  sleepStatus,
  energyStatus,
  currentTime = getCurrentTimeKey(new Date()),
}: {
  dayInstance: DayInstance
  currentBlock: DayInstance['blocks'][number] | null
  topPriorities: DayInstance['blocks']
  scorePreview: DayScorePreview
  readinessSnapshot: ReadinessSnapshot
  scheduledWorkout: WorkoutScheduleEntry | null
  sleepStatus: SleepStatus
  energyStatus: EnergyStatus
  currentTime?: string
}): NextActionRecommendation {
  const primaryExecutionBlock =
    dayInstance.blocks.find((block) => block.kind === 'deepWork' && block.requiredOutput && block.status === 'planned') ??
    dayInstance.blocks.find((block) => ['deepWork', 'prep', 'review'].includes(block.kind) && block.status === 'planned') ??
    null
  const planningBlock = dayInstance.blocks.find((block) => block.kind === 'planning' && block.status === 'planned') ?? null
  const scheduledWorkoutBlock =
    dayInstance.blocks.find((block) => block.kind === 'workout' && block.status === 'planned' && !block.optional) ?? null

  const staleLowValueBlock =
    dayInstance.blocks.find((block) => ['activation', 'analytics'].includes(block.kind) && block.status === 'planned') ?? null

  if (scorePreview.warState === 'critical' && planningBlock) {
    return {
      actionLabel: `Stabilize with ${planningBlock.title}`,
      rationale: 'The day is below salvageable pace. Close the loop, protect recovery, and prepare a clean reset instead of pretending the original plan is still alive.',
      urgency: 'critical',
      alternativePath: primaryExecutionBlock ? `If you still have one honest push left, finish ${primaryExecutionBlock.title} before shutting down.` : undefined,
      explanation: 'Critical war-state with a live planning block triggers hard stabilization guidance.',
    }
  }

  if ((sleepStatus === 'missed' || energyStatus === 'low') && dayInstance.dayMode === 'lowEnergy') {
    return {
      actionLabel: 'Escalate to Survival mode',
      rationale: 'Low-energy posture is no longer enough. Reduce the target further and protect continuity instead of burning out on a broken plan.',
      urgency: 'high',
      alternativePath: planningBlock ? `If you refuse another downgrade, at least finish ${planningBlock.title} and close the day deliberately.` : undefined,
      explanation: 'Low energy plus already-reduced mode pushes the engine toward survival-mode advice.',
    }
  }

  if ((sleepStatus === 'missed' || energyStatus === 'low') && (dayInstance.dayMode === 'normal' || dayInstance.dayMode === 'ideal')) {
    return {
      actionLabel: 'Downgrade to Low Energy mode',
      rationale: 'Sleep missed the target, so preserving quality matters more than clinging to the original load.',
      urgency: 'high',
      alternativePath: primaryExecutionBlock ? `If you keep the current mode, the only justified move is ${primaryExecutionBlock.title}.` : undefined,
      explanation: 'Sleep miss or low energy in a full-load mode triggers fallback guidance before more drift compounds.',
    }
  }

  if (staleLowValueBlock && topPriorities[0] && currentTime >= '10:30') {
    return {
      actionLabel: `Move ${staleLowValueBlock.title} and start ${topPriorities[0].title}`,
      rationale: 'A low-value block is still hanging around while stronger work remains live. Re-sequence the day instead of letting admin-shaped inertia win.',
      urgency: 'high',
      alternativePath: planningBlock ? `If the day is already too fragmented, pivot straight to ${planningBlock.title} and salvage the close.` : undefined,
      explanation: 'Stale low-value blocks after the morning trigger a move-later recommendation.',
    }
  }

  if (primaryExecutionBlock && currentTime <= '12:00') {
    return {
      actionLabel: `Do ${primaryExecutionBlock.title}`,
      rationale: 'The highest-value execution block still dominates the score and readiness outcome, especially before the day fragments.',
      urgency: 'high',
      alternativePath: scheduledWorkoutBlock ? `Do not drift into the workout early. Keep ${scheduledWorkoutBlock.title} as the later support lane.` : undefined,
      explanation: 'Before noon, the primary execution block outranks nearly every other option.',
    }
  }

  if (scheduledWorkout?.status === 'scheduled' && scheduledWorkoutBlock && currentTime >= '17:00') {
    return {
      actionLabel: `Start ${scheduledWorkoutBlock.title}`,
      rationale: 'The planned workout is still live and physical execution is part of the score, not an optional side quest.',
      urgency: scorePreview.warState === 'slipping' ? 'high' : 'medium',
      alternativePath: planningBlock ? `If training is impossible tonight, move straight to ${planningBlock.title} and protect tomorrow.` : undefined,
      explanation: 'Late-day workout expectation and slipping war-state can elevate physical execution above more passive options.',
    }
  }

  if (currentBlock) {
    return {
      actionLabel: `Finish ${currentBlock.title}`,
      rationale: 'The cleanest next action is usually the active block already occupying the execution lane.',
      urgency: 'medium',
      alternativePath: topPriorities[0] ? `If that block is stale, switch deliberately to ${topPriorities[0].title}.` : undefined,
      explanation: 'When a live block already exists, finishing it is still the least-fragmenting move.',
    }
  }

  if (topPriorities[0]) {
    return {
      actionLabel: `Advance ${topPriorities[0].title}`,
      rationale: `${readinessSnapshot.pressureLabel} The strongest remaining block should absorb the next clean unit of attention.`,
      urgency: 'medium',
      alternativePath: planningBlock ? `If focus is gone, close with ${planningBlock.title} instead of drifting.` : undefined,
      explanation: 'With no stronger interrupt, the engine falls back to the highest-priority remaining block.',
    }
  }

  return {
    actionLabel: 'Close the day cleanly',
    rationale: 'Critical work is no longer live. Preserve the next day instead of manufacturing busywork.',
    urgency: 'medium',
    explanation: 'No meaningful execution block remains, so the engine shifts to closure instead of vanity activity.',
  }
}

function getCurrentTimeKey(date: Date) {
  const hours = `${date.getHours()}`.padStart(2, '0')
  const minutes = `${date.getMinutes()}`.padStart(2, '0')

  return `${hours}:${minutes}`
}
