import { buildMirroredRoutineBlockPreview } from '@/domain/calendar/conventions'
import { deriveRecommendationCalendarContext } from '@/domain/calendar/deriveRecommendationCalendarContext'
import {
  createDefaultCalendarConnectionSnapshot,
  createEmptyCalendarCollisionSummary,
} from '@/domain/calendar/types'
import type {
  CalendarConnectionSnapshot,
  CalendarRecommendationContext,
  MirroredRoutineBlock,
} from '@/domain/calendar/types'

export interface CalendarIntegrationService {
  getConnectionSnapshot(connection?: CalendarConnectionSnapshot | null): Promise<CalendarConnectionSnapshot>
  getRecommendationContext(args: {
    date: string
    connection?: CalendarConnectionSnapshot | null
  }): Promise<CalendarRecommendationContext>
  getMirroredBlockPreview(args: {
    blockId: string
    date: string
    title: string
    startsAt?: string
    endsAt?: string
  }): MirroredRoutineBlock
}

class GoogleCalendarScaffoldingService implements CalendarIntegrationService {
  async getConnectionSnapshot(connection?: CalendarConnectionSnapshot | null) {
    return connection ?? createDefaultCalendarConnectionSnapshot()
  }

  async getRecommendationContext({ date, connection }: { date: string; connection?: CalendarConnectionSnapshot | null }) {
    const normalizedConnection = await this.getConnectionSnapshot(connection)
    const summary = createEmptyCalendarCollisionSummary(date)

    return deriveRecommendationCalendarContext({
      date,
      connection: normalizedConnection,
      summary,
    })
  }

  getMirroredBlockPreview({
    blockId,
    date,
    title,
    startsAt,
    endsAt,
  }: {
    blockId: string
    date: string
    title: string
    startsAt?: string
    endsAt?: string
  }) {
    return buildMirroredRoutineBlockPreview({
      blockId,
      dayDate: date,
      title,
      startsAt,
      endsAt,
    })
  }
}

export const googleCalendarScaffoldingService = new GoogleCalendarScaffoldingService()
