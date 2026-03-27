export type RecommendationUrgency = 'critical' | 'high' | 'medium'

export type NextActionRecommendation = {
  actionLabel: string
  rationale: string
  urgency: RecommendationUrgency
  alternativePath?: string
  explanation: string
}
