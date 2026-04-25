import type { EnergyStatus, SleepStatus } from '@/domain/common/types'
import type { FallbackModeSuggestion } from '@/domain/recommendation/types'
import type { DayInstance } from '@/domain/routine/types'
import type { DayScorePreview } from '@/domain/scoring/types'

export function getFallbackModeSuggestion({
  dayInstance,
  scorePreview,
  sleepStatus,
  energyStatus,
}: {
  dayInstance: DayInstance
  scorePreview: DayScorePreview
  sleepStatus: SleepStatus
  energyStatus: EnergyStatus
}): FallbackModeSuggestion | null {
  const supportIsCompromised = sleepStatus === 'missed' || energyStatus === 'low'

  if (dayInstance.dayMode === 'lowEnergy' && (supportIsCompromised || scorePreview.warState === 'critical')) {
    return {
      suggestedDayMode: 'survival',
      title: 'Drop into Survival mode',
      rationale: 'The day is degraded beyond a low-energy trim. Reduce the standard, preserve continuity, and stop pretending the fuller plan is still alive.',
      explanation:
        scorePreview.warState === 'critical'
          ? 'Critical score risk in an already reduced mode means the next honest move is to protect continuity.'
          : 'Low sleep or low energy while already in low-energy mode means the execution target still needs to shrink.',
      urgency: scorePreview.warState === 'critical' ? 'critical' : 'high',
    }
  }

  if ((dayInstance.dayMode === 'ideal' || dayInstance.dayMode === 'normal') && supportIsCompromised) {
    return {
      suggestedDayMode: 'lowEnergy',
      title: 'Shift into Low Energy mode',
      rationale: 'The support inputs are below target. Lower the cognitive load now so the day can stay honest and productive.',
      explanation: 'Missed sleep or low energy on a full-load mode is a classic degradation signal, so Forge should suggest a smaller but still meaningful plan.',
      urgency: 'high',
    }
  }

  if ((dayInstance.dayMode === 'ideal' || dayInstance.dayMode === 'normal') && scorePreview.warState === 'critical') {
    return {
      suggestedDayMode: 'survival',
      title: 'Switch to Survival mode and salvage the close',
      rationale: 'The day has already fallen below a clean recovery pace. Protect what still matters and stop carrying the fiction of the original load.',
      explanation: 'A critical day state under a full-load posture means execution expectations should compress immediately.',
      urgency: 'critical',
    }
  }

  return null
}
