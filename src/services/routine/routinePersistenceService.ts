import { forgePrepTaxonomy, forgeRoutine, forgeWorkoutSchedule } from '@/data/seeds'
import { localDayInstanceRepository, localSettingsRepository } from '@/data/local'
import { FirestoreDayInstanceRepository } from '@/data/firebase/firestoreDayInstanceRepository'
import { FirestoreSettingsRepository } from '@/data/firebase/firestoreSettingsRepository'
import { deriveRecommendationCalendarContext } from '@/domain/calendar/deriveRecommendationCalendarContext'
import { googleCalendarIntegrationService } from '@/services/calendar/calendarIntegrationService'
import {
  buildScheduleOperationalSignals,
  buildTodayOperationalSignals,
  getOperationalAnalyticsSummary,
} from '@/services/analytics/operationalAnalyticsService'
import { getWorkoutForDate } from '@/domain/physical/selectors'
import { getCurrentBlock, getTopPriorityBlocks } from '@/domain/routine/selectors'
import { getFocusedPrepDomains, mergePrepTopicProgress } from '@/domain/prep/selectors'
import { generateDayInstance } from '@/domain/routine/generateDayInstance'
import { formatDateLabel, formatWeekdayLabel, generateWeekInstances, getDateKey } from '@/domain/routine/week'
import { calculateDayScorePreview } from '@/domain/scoring/calculateDayScorePreview'
import { calculateReadinessSnapshot } from '@/domain/readiness/calculateReadinessSnapshot'
import { getFallbackModeSuggestion } from '@/domain/recommendation/getFallbackModeSuggestion'
import { getNextActionRecommendation } from '@/domain/recommendation/getNextActionRecommendation'
import { dayTypeLabels, getAllowedDayTypeOverrides, getScheduledDayTypeForDate } from '@/domain/schedule/overrideRules'
import type { DayInstance } from '@/domain/routine/types'
import { createDefaultUserSettings, type UserSettings } from '@/domain/settings/types'

const firestoreDayInstanceRepository = new FirestoreDayInstanceRepository()
const firestoreSettingsRepository = new FirestoreSettingsRepository()

export async function getOrCreateTodayWorkspace(date = new Date()) {
  const dateKey = getDateKey(date)
  const settings = await localSettingsRepository.getDefault()
  const dayInstance = await getOrCreateDayInstanceFromSettings({
    dateKey,
    settings,
    readExisting: () => localDayInstanceRepository.getByDate(dateKey),
    persistGenerated: (instance) => localDayInstanceRepository.upsert(instance),
  })

  return buildTodayWorkspace({
    date,
    dateKey,
    settings,
    dayInstance,
  })
}

export async function getOrCreateTodayWorkspaceForUser(userId: string, date = new Date()) {
  const dateKey = getDateKey(date)
  const settings = await getCloudSettingsOrCreateDefault(userId)
  const dayInstance = await getOrCreateDayInstanceFromSettings({
    dateKey,
    settings,
    readExisting: () => firestoreDayInstanceRepository.getByDate(userId, dateKey),
    persistGenerated: (instance) => firestoreDayInstanceRepository.upsert(userId, instance),
  })

  return buildTodayWorkspace({
    date,
    dateKey,
    settings,
    dayInstance,
  })
}

async function buildTodayWorkspace({
  date,
  dateKey,
  settings,
  dayInstance,
}: {
  date: Date
  dateKey: string
  settings: UserSettings
  dayInstance: DayInstance
}) {
  const dayTypeOverride = settings?.dayTypeOverrides[dateKey]
  const dailySignals = settings?.dailySignals[dateKey] ?? {
    sleepStatus: 'unknown' as const,
    energyStatus: 'unknown' as const,
    sleepDurationHours: undefined,
  }
  const scheduledDayType = getScheduledDayTypeForDate(dateKey, forgeRoutine)
  const effectiveDayType = dayTypeOverride ?? scheduledDayType
  const scheduledWorkout =
    forgeWorkoutSchedule.find((entry) => entry.weekday === dayInstance.weekday && entry.dayTypes.includes(dayInstance.dayType)) ??
    null
  const workoutState = getWorkoutForDate({
    date: dateKey,
    scheduledWorkout,
    workoutLogs: settings?.workoutLogs ?? {},
  })
  const topPriorities = getTopPriorityBlocks(dayInstance)
  const focusAreas = [...new Set(dayInstance.blocks.flatMap((block) => block.focusAreas))]
  const prepTopics = mergePrepTopicProgress(forgePrepTaxonomy, settings?.prepTopicProgress ?? {})
  const focusedPrepDomains = getFocusedPrepDomains(prepTopics, [...focusAreas, ...topPriorities.flatMap((block) => block.focusAreas)])
  const currentBlock = getCurrentBlock(dayInstance)
  const readinessSnapshot = calculateReadinessSnapshot({
    date: dateKey,
    focusedDomains: focusedPrepDomains,
    topics: prepTopics,
  })
  const calendarWorkspace = await googleCalendarIntegrationService.getDayWorkspace({
    date: dateKey,
    blocks: dayInstance.blocks,
    connection: settings?.calendarIntegration,
  })
  const calendarContext = deriveRecommendationCalendarContext({
    date: dateKey,
    connection: calendarWorkspace.connection,
    summary: calendarWorkspace.summary,
  })
  const scorePreview = calculateDayScorePreview(dayInstance, {
    scheduledWorkout,
    workoutState,
    sleepStatus: dailySignals.sleepStatus,
    readinessSnapshot,
  })
  const fallbackSuggestion = getFallbackModeSuggestion({
    dayInstance,
    scorePreview,
    sleepStatus: dailySignals.sleepStatus,
    energyStatus: dailySignals.energyStatus,
  })
  const operationalAnalytics = await getOperationalAnalyticsSummary(date)

  return {
    dateKey,
    dateLabel: formatDateLabel(dateKey),
    weekdayLabel: formatWeekdayLabel(dateKey),
    dayInstance,
    baseDayType: scheduledDayType,
    isDayTypeOverridden: effectiveDayType !== scheduledDayType,
    currentBlock,
    topPriorities,
    scheduledWorkout,
    workoutState,
    focusedPrepDomains,
    readinessSnapshot,
    sleepStatus: dailySignals.sleepStatus,
    energyStatus: dailySignals.energyStatus,
    sleepDurationHours: dailySignals.sleepDurationHours,
    scorePreview,
    fallbackSuggestion,
    calendarSummary: calendarWorkspace.summary,
    calendarSyncState: calendarWorkspace.syncState,
    calendarEvents: calendarWorkspace.events,
    calendarMirrors: calendarWorkspace.mirrors,
    operationalSignals: buildTodayOperationalSignals({
      summary: operationalAnalytics,
      dayInstance,
      currentBlock,
      scorePreview,
    }),
    calendarContext,
    recommendation: getNextActionRecommendation({
      dayInstance,
      currentBlock,
      topPriorities,
      scorePreview,
      readinessSnapshot,
      scheduledWorkout,
      workoutState,
      sleepStatus: dailySignals.sleepStatus,
      energyStatus: dailySignals.energyStatus,
      schedulePressureLevel: readinessSnapshot.paceSnapshot.paceLevel,
      calendarContext,
      fallbackState: fallbackSuggestion ? 'suggested' : dayInstance.dayMode === 'normal' || dayInstance.dayMode === 'ideal' ? 'stable' : 'active',
    }),
  }
}

export async function getOrCreateWeeklyWorkspace(anchorDate = new Date()) {
  const anchorDateKey = getDateKey(anchorDate)
  const settings = await localSettingsRepository.getDefault()
  const generatedWeek = generateWeekFromSettings(anchorDateKey, settings)
  const existingInstances = await localDayInstanceRepository.getByDates(generatedWeek.map((instance) => instance.date))
  const mergedWeek = mergeGeneratedWeekWithExisting(generatedWeek, existingInstances)

  await localDayInstanceRepository.upsertMany(mergedWeek)

  return buildWeeklyWorkspace({
    anchorDate,
    settings,
    mergedWeek,
  })
}

export async function getOrCreateWeeklyWorkspaceForUser(userId: string, anchorDate = new Date()) {
  const anchorDateKey = getDateKey(anchorDate)
  const settings = await getCloudSettingsOrCreateDefault(userId)
  const generatedWeek = generateWeekFromSettings(anchorDateKey, settings)
  const existingInstances = await firestoreDayInstanceRepository.getByDates(
    userId,
    generatedWeek.map((instance) => instance.date),
  )
  const mergedWeek = mergeGeneratedWeekWithExisting(generatedWeek, existingInstances)
  const missingOrRegeneratedInstances = mergedWeek.filter((instance) => {
    const existing = existingInstances.find((candidate) => candidate.date === instance.date)

    return !existing || existing.dayMode !== instance.dayMode || existing.dayType !== instance.dayType
  })

  if (missingOrRegeneratedInstances.length > 0) {
    await Promise.all(missingOrRegeneratedInstances.map((instance) => firestoreDayInstanceRepository.upsert(userId, instance)))
  }

  return buildWeeklyWorkspace({
    anchorDate,
    settings,
    mergedWeek,
  })
}

function generateWeekFromSettings(anchorDateKey: string, settings: UserSettings) {
  const dayModesByDate = settings?.dayModeOverrides ?? {}
  const dayTypesByDate = settings?.dayTypeOverrides ?? {}

  return generateWeekInstances({
    anchorDate: anchorDateKey,
    routine: forgeRoutine,
    dayModesByDate,
    dayTypesByDate,
  })
}

function mergeGeneratedWeekWithExisting(generatedWeek: DayInstance[], existingInstances: DayInstance[]) {
  const existingByDate = new Map(existingInstances.map((instance) => [instance.date, instance]))

  return generatedWeek.map((generatedInstance) => {
    const existing = existingByDate.get(generatedInstance.date)

    if (!existing || existing.dayMode !== generatedInstance.dayMode || existing.dayType !== generatedInstance.dayType) {
      return generatedInstance
    }

    return existing
  })
}

async function buildWeeklyWorkspace({
  anchorDate,
  settings,
  mergedWeek,
}: {
  anchorDate: Date
  settings: UserSettings
  mergedWeek: DayInstance[]
}) {
  const dayTypesByDate = settings?.dayTypeOverrides ?? {}
  const calendarWorkspaces = await googleCalendarIntegrationService.refreshCache({
    dates: mergedWeek.map((instance) => instance.date),
    blocksByDate: Object.fromEntries(mergedWeek.map((instance) => [instance.date, instance.blocks])),
    connection: settings?.calendarIntegration,
  })

  const operationalAnalytics = await getOperationalAnalyticsSummary(anchorDate)
  const scheduleSignals = buildScheduleOperationalSignals({
    summary: operationalAnalytics,
    weekDays: mergedWeek.map((instance) => ({
      date: instance.date,
      dayType: instance.dayType,
      weekday: instance.weekday,
      dayMode: instance.dayMode,
    })),
  })

  return {
    globalSignals: scheduleSignals.globalSignals,
    calendar: {
      connectionStatus: settings?.calendarIntegration.connectionStatus ?? 'notConnected',
      syncState: Object.values(calendarWorkspaces)[0]?.syncState ?? null,
      constrainedDayCount: Object.values(calendarWorkspaces).filter((workspace) => workspace.summary.severity !== 'none').length,
    },
    days: mergedWeek.map((instance) => ({
      ...instance,
      dateLabel: formatDateLabel(instance.date),
      weekdayLabel: formatWeekdayLabel(instance.date),
      baseDayType: getScheduledDayTypeForDate(instance.date, forgeRoutine),
      isDayTypeOverridden: (dayTypesByDate[instance.date] ?? getScheduledDayTypeForDate(instance.date, forgeRoutine)) !== getScheduledDayTypeForDate(instance.date, forgeRoutine),
      allowedDayTypes: getAllowedDayTypeOverrides(instance.date).map((dayType) => ({
        value: dayType,
        label: dayTypeLabels[dayType],
      })),
      operationalSignals: scheduleSignals.daySignalsByDate[instance.date] ?? [],
      calendarSummary: calendarWorkspaces[instance.date]?.summary,
      calendarMirrors: calendarWorkspaces[instance.date]?.mirrors ?? [],
    })),
  }
}

export async function persistDayInstanceLocally(instance: DayInstance) {
  await localDayInstanceRepository.upsert(instance)
}

async function getCloudSettingsOrCreateDefault(userId: string) {
  const settings = await firestoreSettingsRepository.getDefault(userId)

  if (settings) {
    return {
      ...createDefaultUserSettings(),
      ...settings,
    }
  }

  const defaultSettings = createDefaultUserSettings()
  await firestoreSettingsRepository.upsert(userId, defaultSettings)

  return defaultSettings
}

async function getOrCreateDayInstanceFromSettings({
  dateKey,
  settings,
  readExisting,
  persistGenerated,
}: {
  dateKey: string
  settings: UserSettings
  readExisting: () => Promise<DayInstance | null>
  persistGenerated: (instance: DayInstance) => Promise<void>
}) {
  const dayMode = settings.dayModeOverrides[dateKey] ?? 'normal'
  const dayTypeOverride = settings.dayTypeOverrides[dateKey]
  const effectiveDayType = dayTypeOverride ?? getScheduledDayTypeForDate(dateKey, forgeRoutine)
  const existingDayInstance = await readExisting()

  if (
    existingDayInstance &&
    existingDayInstance.dayMode === dayMode &&
    existingDayInstance.dayType === effectiveDayType
  ) {
    return existingDayInstance
  }

  const generatedDayInstance = generateDayInstance({
    date: dateKey,
    routine: forgeRoutine,
    dayMode,
    overrideDayType: dayTypeOverride,
  })

  await persistGenerated(generatedDayInstance)

  return generatedDayInstance
}
