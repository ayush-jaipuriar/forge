import { localCalendarSessionRepository, localCalendarStateRepository, localExternalCalendarEventRepository, localSettingsRepository, localSyncQueueRepository } from '@/data/local'
import { buildCalendarCollisionSummary } from '@/domain/calendar/collisions'
import { buildMirroredRoutineBlockPreview } from '@/domain/calendar/conventions'
import { deriveRecommendationCalendarContext } from '@/domain/calendar/deriveRecommendationCalendarContext'
import {
  createDefaultCalendarConnectionSnapshot,
  createDefaultCalendarSyncStateSnapshot,
  createEmptyCalendarCollisionSummary,
} from '@/domain/calendar/types'
import type {
  CalendarConnectionSnapshot,
  CalendarRecommendationContext,
  CalendarSessionSnapshot,
  CalendarSyncStateSnapshot,
  ExternalCalendarEventCacheRecord,
  MirroredRoutineBlock,
} from '@/domain/calendar/types'
import type { BlockInstance } from '@/domain/routine/types'
import { getFirebaseAuth } from '@/lib/firebase/client'
import { reportMonitoringError } from '@/services/monitoring/monitoringService'
import { fetchGoogleCalendarEvents, requestGoogleCalendarSession } from '@/services/calendar/googleCalendarClient'
import { createSyncQueueItem } from '@/services/sync/syncQueue'
import { flushSyncQueue } from '@/services/sync/syncOrchestrator'

type CalendarDayWorkspace = {
  connection: CalendarConnectionSnapshot
  syncState: CalendarSyncStateSnapshot
  summary: ReturnType<typeof createEmptyCalendarCollisionSummary>
  events: ExternalCalendarEventCacheRecord[]
}

type CalendarSettingsWorkspace = {
  connection: CalendarConnectionSnapshot
  syncState: CalendarSyncStateSnapshot
  cachedEventCount: number
}

type RefreshCalendarCacheInput = {
  dates: string[]
  blocksByDate: Record<string, BlockInstance[]>
  connection?: CalendarConnectionSnapshot | null
}

export interface CalendarIntegrationService {
  getConnectionSnapshot(connection?: CalendarConnectionSnapshot | null): Promise<CalendarConnectionSnapshot>
  getSettingsWorkspace(connection?: CalendarConnectionSnapshot | null): Promise<CalendarSettingsWorkspace>
  connectReadAccess(userId?: string): Promise<{ connection: CalendarConnectionSnapshot; pendingCount: number }>
  disconnect(userId?: string): Promise<{ connection: CalendarConnectionSnapshot; pendingCount: number }>
  refreshCache(input: RefreshCalendarCacheInput): Promise<Record<string, CalendarDayWorkspace>>
  getDayWorkspace(args: {
    date: string
    blocks: BlockInstance[]
    connection?: CalendarConnectionSnapshot | null
  }): Promise<CalendarDayWorkspace>
  getRecommendationContext(args: {
    date: string
    blocks: BlockInstance[]
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

class GoogleCalendarIntegrationService implements CalendarIntegrationService {
  async getConnectionSnapshot(connection?: CalendarConnectionSnapshot | null) {
    const normalizedConnection = connection ?? createDefaultCalendarConnectionSnapshot()
    const syncState = await this.getSyncStateSnapshot(normalizedConnection)

    return {
      ...normalizedConnection,
      lastConnectionCheckAt: syncState.lastConnectionCheckAt ?? normalizedConnection.lastConnectionCheckAt,
      lastSuccessfulSyncAt: syncState.lastExternalSyncAt ?? normalizedConnection.lastSuccessfulSyncAt,
    }
  }

  async getSettingsWorkspace(connection?: CalendarConnectionSnapshot | null): Promise<CalendarSettingsWorkspace> {
    const normalizedConnection = await this.getConnectionSnapshot(connection)
    const syncState = await this.getSyncStateSnapshot(normalizedConnection)

    return {
      connection: normalizedConnection,
      syncState,
      cachedEventCount: syncState.cachedEventCount,
    }
  }

  async connectReadAccess(userId?: string) {
    const session = await requestGoogleCalendarSession()
    await localCalendarSessionRepository.upsert(session)

    const currentSettings = await localSettingsRepository.getDefault()
    const baseConnection = currentSettings?.calendarIntegration ?? createDefaultCalendarConnectionSnapshot()
    const nextConnection: CalendarConnectionSnapshot = {
      ...baseConnection,
      provider: 'google',
      connectionStatus: 'connected',
      featureGate: 'readEnabled',
      managedEventMode: baseConnection.managedEventMode,
      selectedCalendarIds: baseConnection.selectedCalendarIds.length > 0 ? baseConnection.selectedCalendarIds : ['primary'],
      lastConnectionCheckAt: new Date().toISOString(),
    }

    const pendingCount = await persistCalendarConnection(nextConnection, userId)

    await localCalendarStateRepository.upsert({
      ...(await this.getSyncStateSnapshot(nextConnection)),
      ...nextConnection,
      externalEventSyncStatus: 'idle',
      lastConnectionCheckAt: nextConnection.lastConnectionCheckAt,
      lastSyncError: undefined,
    })

    return {
      connection: nextConnection,
      pendingCount,
    }
  }

  async disconnect(userId?: string) {
    await clearLocalCalendarSessionArtifacts()

    const currentSettings = await localSettingsRepository.getDefault()
    const nextConnection: CalendarConnectionSnapshot = {
      ...(currentSettings?.calendarIntegration ?? createDefaultCalendarConnectionSnapshot()),
      provider: 'google',
      connectionStatus: 'notConnected',
      featureGate: 'readEnabled',
      selectedCalendarIds: ['primary'],
      lastConnectionCheckAt: new Date().toISOString(),
    }

    const pendingCount = await persistCalendarConnection(nextConnection, userId)

    await localCalendarStateRepository.upsert({
      ...createDefaultCalendarSyncStateSnapshot(),
      ...nextConnection,
      externalEventSyncStatus: 'idle',
      cachedEventCount: 0,
      cachedDateRange: undefined,
      lastSyncError: undefined,
    })

    return {
      connection: nextConnection,
      pendingCount,
    }
  }

  async refreshCache({ dates, blocksByDate, connection }: RefreshCalendarCacheInput) {
    const normalizedConnection = await this.getConnectionSnapshot(connection)
    const syncState = await this.getSyncStateSnapshot(normalizedConnection)
    const uniqueDates = [...new Set(dates)].sort()

    if (normalizedConnection.connectionStatus !== 'connected' || uniqueDates.length === 0) {
      return this.getCachedWorkspaces(uniqueDates, blocksByDate, normalizedConnection, syncState)
    }

    const shouldRefresh = shouldRefreshCalendarRange({
      requestedDates: uniqueDates,
      syncState,
    })

    if (!shouldRefresh) {
      return this.getCachedWorkspaces(uniqueDates, blocksByDate, normalizedConnection, syncState)
    }

    const session = await localCalendarSessionRepository.getDefault()

    if (!isCalendarSessionUsable(session)) {
      await clearLocalCalendarSessionArtifacts()
      const staleState = {
        ...syncState,
        ...normalizedConnection,
        externalEventSyncStatus: 'stale' as const,
        lastSyncError: 'Calendar access needs to be reconnected before Forge can refresh external events.',
      }
      await localCalendarStateRepository.upsert(staleState)

      return this.getCachedWorkspaces(uniqueDates, blocksByDate, normalizedConnection, staleState)
    }

    await localCalendarStateRepository.upsert({
      ...syncState,
      ...normalizedConnection,
      externalEventSyncStatus: 'syncing',
    })

    try {
      const startDate = uniqueDates[0]
      const endDate = uniqueDates[uniqueDates.length - 1]
      const events = await fetchGoogleCalendarEvents({
        accessToken: session.accessToken,
        calendarId: normalizedConnection.selectedCalendarIds[0] ?? 'primary',
        startDate,
        endDate,
      })

      await localExternalCalendarEventRepository.replaceForDates(uniqueDates, events)

      const nextState: CalendarSyncStateSnapshot = {
        ...syncState,
        ...normalizedConnection,
        externalEventSyncStatus: 'idle',
        lastExternalSyncAt: new Date().toISOString(),
        lastConnectionCheckAt: new Date().toISOString(),
        lastSyncError: undefined,
        cachedDateRange: {
          startDate,
          endDate,
        },
        cachedEventCount: events.length,
      }

      await localCalendarStateRepository.upsert(nextState)

      return this.getCachedWorkspaces(uniqueDates, blocksByDate, normalizedConnection, nextState)
    } catch (error) {
      reportMonitoringError({
        domain: 'calendar',
        action: 'refresh-calendar-read-cache',
        message: 'Forge could not refresh Google Calendar events.',
        error,
      })

      const nextState: CalendarSyncStateSnapshot = {
        ...syncState,
        ...normalizedConnection,
        externalEventSyncStatus: 'error',
        lastConnectionCheckAt: new Date().toISOString(),
        lastSyncError: error instanceof Error ? error.message : 'Calendar refresh failed.',
      }

      if (isCalendarAuthError(error)) {
        await clearLocalCalendarSessionArtifacts()
      }

      await localCalendarStateRepository.upsert(nextState)

      return this.getCachedWorkspaces(uniqueDates, blocksByDate, normalizedConnection, nextState)
    }
  }

  async getDayWorkspace({
    date,
    blocks,
    connection,
  }: {
    date: string
    blocks: BlockInstance[]
    connection?: CalendarConnectionSnapshot | null
  }) {
    const workspaces = await this.refreshCache({
      dates: [date],
      blocksByDate: {
        [date]: blocks,
      },
      connection,
    })

    return workspaces[date]
  }

  async getRecommendationContext({
    date,
    blocks,
    connection,
  }: {
    date: string
    blocks: BlockInstance[]
    connection?: CalendarConnectionSnapshot | null
  }) {
    const workspace = await this.getDayWorkspace({
      date,
      blocks,
      connection,
    })

    return deriveRecommendationCalendarContext({
      date,
      connection: workspace.connection,
      summary: workspace.summary,
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

  private async getSyncStateSnapshot(connection?: CalendarConnectionSnapshot | null) {
    const normalizedConnection = connection ?? createDefaultCalendarConnectionSnapshot()
    const storedState = await localCalendarStateRepository.getDefault()

    return {
      ...createDefaultCalendarSyncStateSnapshot(),
      ...storedState,
      ...normalizedConnection,
      id: 'default' as const,
    }
  }

  private async getCachedWorkspaces(
    dates: string[],
    blocksByDate: Record<string, BlockInstance[]>,
    connection: CalendarConnectionSnapshot,
    syncState: CalendarSyncStateSnapshot,
  ) {
    const entries = await Promise.all(
      dates.map(async (date) => {
        const events = await localExternalCalendarEventRepository.listForDate(date)
        const summary =
          events.length === 0
            ? createEmptyCalendarCollisionSummary(date)
            : buildCalendarCollisionSummary({
                date,
                blocks: blocksByDate[date] ?? [],
                events,
                source: 'liveMirror',
              })

        return [
          date,
          {
            connection,
            syncState,
            summary,
            events,
          },
        ] as const
      }),
    )

    return Object.fromEntries(entries)
  }
}

export async function clearLocalCalendarSessionArtifacts() {
  await Promise.all([
    localCalendarSessionRepository.clear(),
    localExternalCalendarEventRepository.clearAll(),
    localCalendarStateRepository.clear(),
  ])
}

function shouldRefreshCalendarRange(args: {
  requestedDates: string[]
  syncState: CalendarSyncStateSnapshot
}) {
  if (!args.syncState.lastExternalSyncAt || !args.syncState.cachedDateRange) {
    return true
  }

  const freshnessAgeMs = Date.now() - new Date(args.syncState.lastExternalSyncAt).getTime()
  const isStale = freshnessAgeMs > 1000 * 60 * 15
  const coversRange =
    args.requestedDates[0] >= args.syncState.cachedDateRange.startDate &&
    args.requestedDates[args.requestedDates.length - 1] <= args.syncState.cachedDateRange.endDate

  return isStale || !coversRange || args.syncState.externalEventSyncStatus === 'error'
}

async function persistCalendarConnection(connection: CalendarConnectionSnapshot, userId?: string) {
  const currentSettings = await localSettingsRepository.getDefault()
  const settings = currentSettings ?? (await localSettingsRepository.getDefault())

  if (!settings) {
    throw new Error('Forge could not load settings before updating Calendar connection.')
  }

  const nextSettings = {
    ...settings,
    calendarIntegration: connection,
    updatedAt: new Date().toISOString(),
  }

  await localSettingsRepository.upsert(nextSettings)
  const outstandingItems = await localSyncQueueRepository.listOutstanding()
  const supersededSettingsItems = outstandingItems.filter(
    (item) => item.actionType === 'upsertSettings' && item.entityId === nextSettings.id,
  )

  await Promise.all(supersededSettingsItems.map((item) => localSyncQueueRepository.remove(item.id)))
  await localSyncQueueRepository.enqueue(createSyncQueueItem('upsertSettings', nextSettings.id, nextSettings))

  if (userId && isOnline()) {
    return flushSyncQueue(userId)
  }

  return localSyncQueueRepository.countOutstanding()
}

function isOnline() {
  if (typeof navigator === 'undefined') {
    return false
  }

  return navigator.onLine
}

function isCalendarSessionUsable(session: CalendarSessionSnapshot | null): session is CalendarSessionSnapshot {
  const activeUid = getFirebaseAuth()?.currentUser?.uid

  if (!session || !activeUid) {
    return false
  }

  return session.userId === activeUid
}

function isCalendarAuthError(error: unknown) {
  if (!(error instanceof Error)) {
    return false
  }

  return error.message.includes('401') || error.message.includes('403')
}

export const googleCalendarIntegrationService = new GoogleCalendarIntegrationService()
