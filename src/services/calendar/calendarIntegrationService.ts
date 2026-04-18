import {
  localCalendarMirrorRepository,
  localCalendarSessionRepository,
  localCalendarStateRepository,
  localDayInstanceRepository,
  localExternalCalendarEventRepository,
  localSettingsRepository,
} from '@/data/local'
import { buildCalendarCollisionSummary } from '@/domain/calendar/collisions'
import { buildMirroredRoutineBlockPreview } from '@/domain/calendar/conventions'
import { deriveRecommendationCalendarContext } from '@/domain/calendar/deriveRecommendationCalendarContext'
import { deriveCalendarMirrorOperations } from '@/domain/calendar/mirrors'
import {
  createDefaultCalendarConnectionSnapshot,
  createDefaultCalendarSyncStateSnapshot,
  createEmptyCalendarCollisionSummary,
} from '@/domain/calendar/types'
import type {
  CalendarConnectionSnapshot,
  CalendarMirrorRecord,
  CalendarRecommendationContext,
  CalendarSessionSnapshot,
  CalendarSyncStateSnapshot,
  ExternalCalendarEventCacheRecord,
  MirroredRoutineBlock,
} from '@/domain/calendar/types'
import type { BlockInstance } from '@/domain/routine/types'
import { getFirebaseAuth } from '@/lib/firebase/client'
import { reportMonitoringError } from '@/services/monitoring/monitoringService'
import {
  createGoogleCalendarEvent,
  deleteGoogleCalendarEvent,
  fetchGoogleCalendarEvents,
  GOOGLE_CALENDAR_WRITE_SCOPE,
  requestGoogleCalendarSession,
  updateGoogleCalendarEvent,
} from '@/services/calendar/googleCalendarClient'
import { persistSettingsPatch } from '@/services/settings/settingsSyncPersistence'
import { flushSyncQueue } from '@/services/sync/syncOrchestrator'

type CalendarDayWorkspace = {
  connection: CalendarConnectionSnapshot
  syncState: CalendarSyncStateSnapshot
  summary: ReturnType<typeof createEmptyCalendarCollisionSummary>
  events: ExternalCalendarEventCacheRecord[]
  mirrors: CalendarMirrorRecord[]
}

type CalendarSettingsWorkspace = {
  connection: CalendarConnectionSnapshot
  syncState: CalendarSyncStateSnapshot
  cachedEventCount: number
  mirroredBlockCount: number
  mirrorErrorCount: number
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
  connectWriteAccess(userId?: string): Promise<{ connection: CalendarConnectionSnapshot; pendingCount: number }>
  disconnect(userId?: string): Promise<{ connection: CalendarConnectionSnapshot; pendingCount: number }>
  refreshCache(input: RefreshCalendarCacheInput): Promise<Record<string, CalendarDayWorkspace>>
  syncMirrors(userId?: string): Promise<{ createdCount: number; updatedCount: number; deletedCount: number; errorCount: number }>
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
    const mirrorRecords = await localCalendarMirrorRepository.listAll()

    return {
      connection: normalizedConnection,
      syncState,
      cachedEventCount: syncState.cachedEventCount,
      mirroredBlockCount: mirrorRecords.length,
      mirrorErrorCount: mirrorRecords.filter((record) => record.status === 'error').length,
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
      featureGate: baseConnection.featureGate === 'writeEnabled' ? 'writeEnabled' : 'readEnabled',
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

  async connectWriteAccess(userId?: string) {
    const session = await requestGoogleCalendarSession(GOOGLE_CALENDAR_WRITE_SCOPE)
    await localCalendarSessionRepository.upsert(session)

    const currentSettings = await localSettingsRepository.getDefault()
    const baseConnection = currentSettings?.calendarIntegration ?? createDefaultCalendarConnectionSnapshot()
    const nextConnection: CalendarConnectionSnapshot = {
      ...baseConnection,
      provider: 'google',
      connectionStatus: 'connected',
      featureGate: 'writeEnabled',
      managedEventMode: 'majorBlocks',
      selectedCalendarIds: baseConnection.selectedCalendarIds.length > 0 ? baseConnection.selectedCalendarIds : ['primary'],
      lastConnectionCheckAt: new Date().toISOString(),
    }

    const pendingCount = await persistCalendarConnection(nextConnection, userId)
    const syncState = await this.getSyncStateSnapshot(nextConnection)

    await localCalendarStateRepository.upsert({
      ...syncState,
      ...nextConnection,
      mirrorSyncStatus: syncState.mirrorSyncStatus === 'idle' ? 'stale' : syncState.mirrorSyncStatus,
      lastMirrorSyncError: undefined,
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
      managedEventMode: 'disabled',
      selectedCalendarIds: ['primary'],
      lastConnectionCheckAt: new Date().toISOString(),
    }

    const pendingCount = await persistCalendarConnection(nextConnection, userId)

    await localCalendarStateRepository.upsert({
      ...createDefaultCalendarSyncStateSnapshot(),
      ...nextConnection,
      externalEventSyncStatus: 'idle',
      mirrorSyncStatus: 'idle',
      cachedEventCount: 0,
      cachedDateRange: undefined,
      lastSyncError: undefined,
      lastMirrorSyncError: undefined,
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

  async syncMirrors(userId?: string) {
    const settings = await localSettingsRepository.getDefault()
    const connection = await this.getConnectionSnapshot(settings?.calendarIntegration)
    const syncState = await this.getSyncStateSnapshot(connection)

    if (connection.connectionStatus !== 'connected') {
      throw new Error('Connect Google Calendar before syncing mirrored Forge blocks.')
    }

    if (connection.featureGate !== 'writeEnabled') {
      throw new Error('Enable Calendar write mirroring before syncing Forge blocks.')
    }

    const session = await localCalendarSessionRepository.getDefault()

    if (!isCalendarWriteSessionUsable(session)) {
      await clearLocalCalendarSessionArtifacts()
      await localCalendarStateRepository.upsert({
        ...syncState,
        ...connection,
        mirrorSyncStatus: 'stale',
        lastMirrorSyncError: 'Calendar write access needs to be reconnected before Forge can sync mirrored blocks.',
        lastSyncError: 'Calendar write access needs to be reconnected before Forge can sync mirrored blocks.',
      })
      throw new Error('Calendar write access needs to be reconnected before Forge can sync mirrored blocks.')
    }

    await localCalendarStateRepository.upsert({
      ...syncState,
      ...connection,
      mirrorSyncStatus: 'syncing',
      lastMirrorSyncError: undefined,
    })

    const calendarId = connection.selectedCalendarIds[0] ?? 'primary'
    const [dayInstances, existingMirrorRecords] = await Promise.all([
      localDayInstanceRepository.listAll(),
      localCalendarMirrorRepository.listAll(),
    ])
    const horizonDates = buildMirrorSyncHorizon()
    const horizonDateSet = new Set(horizonDates)
    const operations = deriveCalendarMirrorOperations({
      blocks: dayInstances
        .filter((dayInstance) => horizonDateSet.has(dayInstance.date))
        .flatMap((dayInstance) => dayInstance.blocks),
      existingRecords: existingMirrorRecords.filter((record) => horizonDateSet.has(record.dayDate)),
      calendarId,
      writeMode: connection.managedEventMode === 'majorBlocks' ? 'majorBlocks' : 'majorBlocks',
    })

    let createdCount = 0
    let updatedCount = 0
    let deletedCount = 0
    let errorCount = 0
    let latestError: string | undefined
    const syncedAt = new Date().toISOString()

    for (const operation of operations) {
      try {
        switch (operation.type) {
          case 'create': {
            const created = await createGoogleCalendarEvent({
              accessToken: session.accessToken,
              calendarId,
              event: {
                title: operation.desired.eventTitle,
                description: operation.desired.description,
                startsAt: operation.desired.startsAt,
                endsAt: operation.desired.endsAt,
                colorId: operation.desired.colorId,
              },
            })
            await localCalendarMirrorRepository.upsert({
              id: operation.desired.id,
              provider: 'google',
              calendarId,
              providerEventId: created.providerEventId,
              blockId: operation.desired.blockId,
              dayDate: operation.desired.dayDate,
              sourceBlockTitle: operation.desired.title,
              sourceBlockStatus: operation.desired.sourceBlockStatus,
              startsAt: operation.desired.startsAt,
              endsAt: operation.desired.endsAt,
              eventTitle: operation.desired.eventTitle,
              colorId: operation.desired.colorId,
              writeMode: operation.desired.writeMode,
              status: 'synced',
              lastSyncedAt: syncedAt,
              lastError: undefined,
              metadataVersion: 1,
            })
            createdCount += 1
            break
          }
          case 'update': {
            const updated = await updateGoogleCalendarEvent({
              accessToken: session.accessToken,
              calendarId,
              providerEventId: operation.existing.providerEventId,
              event: {
                title: operation.desired.eventTitle,
                description: operation.desired.description,
                startsAt: operation.desired.startsAt,
                endsAt: operation.desired.endsAt,
                colorId: operation.desired.colorId,
              },
            })
            await localCalendarMirrorRepository.upsert({
              ...operation.existing,
              providerEventId: updated.providerEventId,
              sourceBlockTitle: operation.desired.title,
              sourceBlockStatus: operation.desired.sourceBlockStatus,
              startsAt: operation.desired.startsAt,
              endsAt: operation.desired.endsAt,
              eventTitle: operation.desired.eventTitle,
              colorId: operation.desired.colorId,
              writeMode: operation.desired.writeMode,
              status: 'synced',
              lastSyncedAt: syncedAt,
              lastError: undefined,
              metadataVersion: 1,
            })
            updatedCount += 1
            break
          }
          case 'delete': {
            if (operation.existing.providerEventId) {
              await deleteGoogleCalendarEvent({
                accessToken: session.accessToken,
                calendarId,
                providerEventId: operation.existing.providerEventId,
              })
            }
            await localCalendarMirrorRepository.remove(operation.existing.id)
            deletedCount += 1
            break
          }
          case 'noop': {
            if (operation.existing.status !== 'synced' || operation.existing.lastError) {
              await localCalendarMirrorRepository.upsert({
                ...operation.existing,
                status: 'synced',
                lastSyncedAt: syncedAt,
                lastError: undefined,
              })
            }
            break
          }
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Calendar mirror sync failed.'
        latestError = message
        errorCount += 1

        if (operation.type === 'update' || operation.type === 'noop' || operation.type === 'delete') {
          await localCalendarMirrorRepository.upsert({
            ...operation.existing,
            status: 'error',
            lastError: message,
          })
        }

        reportMonitoringError({
          domain: 'calendar',
          action: 'sync-calendar-mirrors',
          message: 'Forge could not reconcile one of the mirrored Google Calendar events.',
          error,
          metadata: {
            operationType: operation.type,
            blockId: operation.type === 'delete' ? operation.existing.blockId : operation.desired.blockId,
            dayDate: operation.type === 'delete' ? operation.existing.dayDate : operation.desired.dayDate,
          },
        })
      }
    }

    await localCalendarStateRepository.upsert({
      ...syncState,
      ...connection,
      mirrorSyncStatus: errorCount > 0 ? 'error' : 'idle',
      lastMirrorSyncAt: syncedAt,
      lastMirrorSyncError: latestError,
      lastSyncError: latestError,
    })

    if (userId && isOnline()) {
      await flushSyncQueue(userId)
    }

    return {
      createdCount,
      updatedCount,
      deletedCount,
      errorCount,
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
        const [events, mirrors] = await Promise.all([
          localExternalCalendarEventRepository.listForDate(date),
          localCalendarMirrorRepository.listForDate(date),
        ])
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
            summary: {
              ...summary,
              mirroredBlockCount: mirrors.length,
            },
            events,
            mirrors,
          },
        ] as const
      }),
    )

    return Object.fromEntries(entries)
  }
}

export async function clearLocalCalendarSessionArtifacts(options?: { clearMirrors?: boolean }) {
  await Promise.all([
    localCalendarSessionRepository.clear(),
    localExternalCalendarEventRepository.clearAll(),
    localCalendarStateRepository.clear(),
    ...(options?.clearMirrors ? [localCalendarMirrorRepository.clearAll()] : []),
  ])
}

export async function markCalendarMirrorsStaleIfEnabled() {
  const settings = await localSettingsRepository.getDefault()
  const syncState = await localCalendarStateRepository.getDefault()

  if (!settings || settings.calendarIntegration.featureGate !== 'writeEnabled') {
    return
  }

  await localCalendarStateRepository.upsert({
    ...syncState,
    ...settings.calendarIntegration,
    mirrorSyncStatus: 'stale',
  })
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

  const result = await persistSettingsPatch({
    patch: {
      type: 'setCalendarIntegration',
      settingsId: settings.id,
      value: connection,
      updatedAt: new Date().toISOString(),
    },
    userId,
  })

  return result.pendingCount
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

function isCalendarWriteSessionUsable(session: CalendarSessionSnapshot | null): session is CalendarSessionSnapshot {
  return isCalendarSessionUsable(session) && session.accessScope === GOOGLE_CALENDAR_WRITE_SCOPE
}

function isCalendarAuthError(error: unknown) {
  if (!(error instanceof Error)) {
    return false
  }

  return error.message.includes('401') || error.message.includes('403')
}

export const googleCalendarIntegrationService = new GoogleCalendarIntegrationService()

function buildMirrorSyncHorizon() {
  const today = new Date()

  return Array.from({ length: 14 }, (_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() + index)
    return date.toISOString().slice(0, 10)
  })
}
