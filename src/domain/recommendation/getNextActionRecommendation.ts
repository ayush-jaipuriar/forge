import type { EnergyStatus, SleepStatus } from '@/domain/common/types'
import type { WorkoutLogEntry, WorkoutScheduleEntry } from '@/domain/physical/types'
import type { ReadinessSnapshot } from '@/domain/readiness/types'
import type { NextActionRecommendation } from '@/domain/recommendation/types'
import type { DayInstance } from '@/domain/routine/types'
import type { DayScorePreview } from '@/domain/scoring/types'

type RecommendationContext = {
  dayInstance: DayInstance
  currentBlock: DayInstance['blocks'][number] | null
  topPriorities: DayInstance['blocks']
  scorePreview: DayScorePreview
  readinessSnapshot: ReadinessSnapshot
  scheduledWorkout: WorkoutScheduleEntry | null
  workoutState?: WorkoutLogEntry | null
  sleepStatus: SleepStatus
  energyStatus: EnergyStatus
  schedulePressureLevel?: ReadinessSnapshot['paceSnapshot']['paceLevel']
  conflictState?: 'clear' | 'constrained'
  fallbackState?: 'stable' | 'suggested' | 'active'
  currentTime?: string
}

export function getNextActionRecommendation({
  dayInstance,
  currentBlock,
  topPriorities,
  scorePreview,
  readinessSnapshot,
  scheduledWorkout,
  workoutState = null,
  sleepStatus,
  energyStatus,
  schedulePressureLevel = readinessSnapshot.paceSnapshot.paceLevel,
  conflictState = 'clear',
  fallbackState = dayInstance.dayMode === 'normal' || dayInstance.dayMode === 'ideal' ? 'stable' : 'active',
  currentTime = getCurrentTimeKey(new Date()),
}: RecommendationContext): NextActionRecommendation {
  const primaryExecutionBlock =
    dayInstance.blocks.find((block) => block.kind === 'deepWork' && block.requiredOutput && block.status === 'planned') ??
    dayInstance.blocks.find((block) => ['deepWork', 'prep', 'review'].includes(block.kind) && block.status === 'planned') ??
    null
  const skippedPrimaryBlock =
    dayInstance.blocks.find((block) => block.kind === 'deepWork' && block.requiredOutput && block.status === 'skipped') ??
    null
  const planningBlock = dayInstance.blocks.find((block) => block.kind === 'planning' && block.status === 'planned') ?? null
  const salvagePrepBlock = dayInstance.blocks.find((block) => ['prep', 'review'].includes(block.kind) && block.status === 'planned') ?? null
  const scheduledWorkoutBlock =
    dayInstance.blocks.find((block) => block.kind === 'workout' && block.status === 'planned' && !block.optional) ?? null
  const staleLowValueBlock =
    dayInstance.blocks.find((block) => ['activation', 'analytics'].includes(block.kind) && block.status === 'planned') ?? null
  const effectiveWorkoutState = workoutState?.status ?? scheduledWorkout?.status ?? 'optional'

  const orderedRules: Array<() => NextActionRecommendation | null> = [
    () => {
      if (conflictState === 'constrained' && currentBlock) {
        return {
          ruleKey: 'protect-conflict-boundary',
          actionLabel: `Protect ${currentBlock.title} against outside drift`,
          rationale: 'The schedule is constrained, so the best move is to preserve the active block boundary instead of improvising new work.',
          urgency: 'high',
          alternativePath: planningBlock ? `If the block is no longer realistic, switch to ${planningBlock.title} and re-close the day.` : undefined,
          explanation: 'Conflict state takes top precedence because fragmented attention destroys the rest of the rule stack.',
        }
      }

      return null
    },
    () => {
      if (skippedPrimaryBlock && salvagePrepBlock) {
        return {
          ruleKey: 'missed-prime-salvage',
          actionLabel: `You missed prime work. Move to ${salvagePrepBlock.title}`,
          rationale: 'The highest-value block is gone. Shift to a clean salvage block instead of trying to inflate the day with low-value activity.',
          urgency: 'high',
          alternativePath: planningBlock ? `If focus is fully gone, move straight to ${planningBlock.title}.` : undefined,
          explanation: 'A missed prime execution block triggers explicit salvage guidance before any easier task can take over the queue.',
        }
      }

      return null
    },
    () => {
      if (scorePreview.warState === 'critical' && planningBlock) {
        return {
          ruleKey: 'critical-stabilization',
          actionLabel: `Stabilize with ${planningBlock.title}`,
          rationale: 'The day is below salvageable pace. Close the loop, protect recovery, and prepare a clean reset instead of pretending the original plan is still alive.',
          urgency: 'critical',
          alternativePath: salvagePrepBlock ? `If you still have one honest push left, finish ${salvagePrepBlock.title} before shutting down.` : undefined,
          explanation: 'Critical war-state with a live planning block triggers hard stabilization guidance.',
        }
      }

      return null
    },
    () => {
      if ((sleepStatus === 'missed' || energyStatus === 'low') && fallbackState === 'active' && dayInstance.dayMode === 'lowEnergy') {
        return {
          ruleKey: 'escalate-survival',
          actionLabel: 'Escalate to Survival mode',
          rationale: 'Low-energy posture is no longer enough. Reduce the target further and protect continuity instead of burning out on a broken plan.',
          urgency: 'high',
          alternativePath: planningBlock ? `If you refuse another downgrade, at least finish ${planningBlock.title} and close the day deliberately.` : undefined,
          explanation: 'Low energy plus already-reduced mode pushes the engine toward survival-mode advice.',
        }
      }

      return null
    },
    () => {
      if ((sleepStatus === 'missed' || energyStatus === 'low') && fallbackState !== 'active' && (dayInstance.dayMode === 'normal' || dayInstance.dayMode === 'ideal')) {
        return {
          ruleKey: 'downgrade-low-energy',
          actionLabel: 'Downgrade to Low Energy mode',
          rationale: 'Support signals are below target, so preserving quality matters more than clinging to the original load.',
          urgency: 'high',
          alternativePath: primaryExecutionBlock ? `If you keep the current mode, the only justified move is ${primaryExecutionBlock.title}.` : undefined,
          explanation: 'Sleep miss or low energy in a full-load mode triggers fallback guidance before more drift compounds.',
        }
      }

      return null
    },
    () => {
      if (effectiveWorkoutState === 'scheduled' && scheduledWorkoutBlock && currentTime >= '17:00') {
        return {
          ruleKey: 'closing-workout-window',
          actionLabel: `Train ${scheduledWorkoutBlock.title} now`,
          rationale: 'The workout window is closing and physical execution is part of the score, not an optional side quest.',
          urgency: scorePreview.warState === 'slipping' || schedulePressureLevel === 'critical' ? 'high' : 'medium',
          alternativePath: planningBlock ? `If training is impossible tonight, move straight to ${planningBlock.title} and protect tomorrow.` : undefined,
          explanation: 'Late-day workout expectation and slipping score pressure can elevate physical execution above more passive options.',
        }
      }

      return null
    },
    () => {
      if (staleLowValueBlock && topPriorities[0] && currentTime >= '10:30') {
        return {
          ruleKey: 'move-stale-low-value-block',
          actionLabel: `Move ${staleLowValueBlock.title} and start ${topPriorities[0].title}`,
          rationale: 'A low-value block is still hanging around while stronger work remains live. Re-sequence the day instead of letting admin-shaped inertia win.',
          urgency: 'high',
          alternativePath: planningBlock ? `If the day is already too fragmented, pivot straight to ${planningBlock.title} and salvage the close.` : undefined,
          explanation: 'Stale low-value blocks after the morning trigger a move-later recommendation.',
        }
      }

      return null
    },
    () => {
      if (primaryExecutionBlock && currentTime <= '12:00') {
        return {
          ruleKey: 'morning-primary-execution',
          actionLabel: `Do ${primaryExecutionBlock.title}`,
          rationale: 'The highest-value execution block still dominates the score and readiness outcome, especially before the day fragments.',
          urgency: schedulePressureLevel === 'critical' || schedulePressureLevel === 'behind' ? 'high' : 'medium',
          alternativePath: scheduledWorkoutBlock ? `Do not drift into the workout early. Keep ${scheduledWorkoutBlock.title} as the later support lane.` : undefined,
          explanation: 'Before noon, the primary execution block outranks nearly every other option.',
        }
      }

      return null
    },
    () => {
      if (dayInstance.dayType === 'wfoContinuity' && effectiveWorkoutState !== 'scheduled' && !topPriorities.some((block) => block.requiredOutput)) {
        return {
          ruleKey: 'wfo-shift-to-recovery',
          actionLabel: 'WFO expectations met. Shift to recovery.',
          rationale: 'Continuity-day expectations are lighter by design, so once the honest baseline is covered the app should stop manufacturing heroics.',
          urgency: 'medium',
          alternativePath: planningBlock ? `Close with ${planningBlock.title} to keep tomorrow clean.` : undefined,
          explanation: 'WFO continuity days should not be punished unfairly after their lighter expectation set is met.',
        }
      }

      return null
    },
    () => {
      if (currentBlock) {
        return {
          ruleKey: 'finish-current-block',
          actionLabel: `Finish ${currentBlock.title}`,
          rationale: 'The cleanest next action is usually the active block already occupying the execution lane.',
          urgency: 'medium',
          alternativePath: topPriorities[0] ? `If that block is stale, switch deliberately to ${topPriorities[0].title}.` : undefined,
          explanation: 'When a live block already exists, finishing it is still the least-fragmenting move.',
        }
      }

      return null
    },
    () => {
      if (topPriorities[0]) {
        return {
          ruleKey: 'advance-top-priority',
          actionLabel: `Advance ${topPriorities[0].title}`,
          rationale: `${readinessSnapshot.paceSnapshot.paceLabel} The strongest remaining block should absorb the next clean unit of attention.`,
          urgency: schedulePressureLevel === 'critical' ? 'high' : 'medium',
          alternativePath: planningBlock ? `If focus is gone, close with ${planningBlock.title} instead of drifting.` : undefined,
          explanation: 'With no stronger interrupt, the engine falls back to the highest-priority remaining block.',
        }
      }

      return null
    },
  ]

  for (const rule of orderedRules) {
    const recommendation = rule()

    if (recommendation) {
      return recommendation
    }
  }

  return {
    ruleKey: 'close-cleanly',
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
