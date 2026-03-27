import {
  createDefaultCalendarConnectionSnapshot,
  createEmptyCalendarCollisionSummary,
} from '@/domain/calendar/types'
import type {
  CalendarCollisionSummary,
  CalendarConnectionSnapshot,
  CalendarRecommendationContext,
} from '@/domain/calendar/types'

export function deriveRecommendationCalendarContext({
  date,
  connection,
  summary,
}: {
  date: string
  connection?: CalendarConnectionSnapshot | null
  summary?: CalendarCollisionSummary | null
}): CalendarRecommendationContext {
  const normalizedConnection = connection ?? createDefaultCalendarConnectionSnapshot()
  const normalizedSummary = summary ?? createEmptyCalendarCollisionSummary(date)
  const conflictState =
    normalizedSummary.severity === 'hard' || normalizedSummary.constrainedWindows.length > 0 ? 'constrained' : 'clear'

  return {
    conflictState,
    provider: normalizedConnection.provider,
    connectionStatus: normalizedConnection.connectionStatus,
    featureGate: normalizedConnection.featureGate,
    summary: normalizedSummary,
  }
}
