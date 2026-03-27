import type { DayMode } from '@/domain/common/types'

export type RecommendationUrgency = 'critical' | 'high' | 'medium'

export type NextActionRecommendation = {
  ruleKey: string
  actionLabel: string
  rationale: string
  urgency: RecommendationUrgency
  alternativePath?: string
  explanation: string
}

export type FallbackModeSuggestion = {
  suggestedDayMode: DayMode
  title: string
  rationale: string
  explanation: string
  urgency: RecommendationUrgency
}
