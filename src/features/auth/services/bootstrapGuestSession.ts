import { localDayInstanceRepository, localSettingsRepository } from '@/data/local'
import { resetForgeDb } from '@/data/local/forgeDb'
import { forgeRoutine, forgeWorkoutSchedule } from '@/data/seeds'
import type { DayMode, DayType } from '@/domain/common/types'
import { generateDayInstance } from '@/domain/routine/generateDayInstance'
import type { DayInstance } from '@/domain/routine/types'
import { getDateKey } from '@/domain/routine/week'
import type { UserSettings } from '@/domain/settings/types'
import { createDefaultUserSettings } from '@/domain/settings/types'

export async function bootstrapGuestSession(anchorDate = new Date()) {
  await resetForgeDb()

  const { dayInstances, settings } = buildGuestWorkspace(anchorDate)

  await localSettingsRepository.upsert(settings)
  await localDayInstanceRepository.upsertMany(dayInstances)
}

function buildGuestWorkspace(anchorDate: Date) {
  const settings = createDefaultUserSettings()
  const dayInstances: DayInstance[] = []

  for (let offset = -27; offset <= 0; offset += 1) {
    const date = addDays(anchorDate, offset)
    const dateKey = getDateKey(date)
    const dayMode = getGuestDayMode(offset)
    const overrideDayType = getGuestDayTypeOverride(offset)

    if (dayMode !== 'normal') {
      settings.dayModeOverrides[dateKey] = dayMode
    }

    if (overrideDayType) {
      settings.dayTypeOverrides[dateKey] = overrideDayType
    }

    settings.dailySignals[dateKey] = getGuestDailySignals(dayMode, offset)

    const dayInstance = buildGuestDayInstance({
      dateKey,
      dayMode,
      overrideDayType,
      offset,
    })

    dayInstances.push(dayInstance)

    const workoutLog = getGuestWorkoutLog(dayInstance, dayMode, offset)
    if (workoutLog) {
      settings.workoutLogs[dateKey] = workoutLog
    }
  }

  settings.prepTopicProgress = createGuestPrepProgress()
  settings.updatedAt = new Date().toISOString()

  return {
    settings,
    dayInstances,
  }
}

function buildGuestDayInstance({
  dateKey,
  dayMode,
  overrideDayType,
  offset,
}: {
  dateKey: string
  dayMode: DayMode
  overrideDayType?: DayType
  offset: number
}) {
  const instance = generateDayInstance({
    date: dateKey,
    routine: forgeRoutine,
    dayMode,
    overrideDayType,
  })

  if (offset === 0) {
    return instance
  }

  const completionQuota = getCompletionQuota(dayMode)
  let completedCount = 0

  return {
    ...instance,
    blocks: instance.blocks.map((block, index, blocks) => {
      let status = block.status

      if (completedCount < completionQuota && (dayMode === 'ideal' || !block.optional || index === blocks.length - 1)) {
        status = 'completed'
        completedCount += 1
      } else if (block.kind === 'workout' || block.optional) {
        status = dayMode === 'survival' ? 'skipped' : 'moved'
      } else if (block.kind === 'planning' && dayMode !== 'survival') {
        status = 'completed'
      } else {
        status = dayMode === 'normal' ? 'moved' : 'skipped'
      }

      return {
        ...block,
        status,
        executionNote:
          status === 'completed' && (block.kind === 'deepWork' || block.kind === 'prep')
            ? getGuestExecutionNote(dayMode, block.title)
            : block.executionNote,
      }
    }),
  }
}

function getCompletionQuota(dayMode: DayMode) {
  switch (dayMode) {
    case 'ideal':
      return 4
    case 'normal':
      return 3
    case 'lowEnergy':
      return 2
    case 'survival':
      return 1
  }
}

function getGuestDayMode(offset: number): DayMode {
  if (offset === 0) {
    return 'normal'
  }

  const absolute = Math.abs(offset)

  if (absolute % 11 === 0) {
    return 'survival'
  }

  if (absolute % 7 === 0) {
    return 'ideal'
  }

  if (absolute % 5 === 0) {
    return 'lowEnergy'
  }

  return 'normal'
}

function getGuestDayTypeOverride(offset: number): DayType | undefined {
  const absolute = Math.abs(offset)

  if (absolute === 9) {
    return 'lowEnergy'
  }

  if (absolute === 18) {
    return 'survival'
  }

  return undefined
}

function getGuestDailySignals(dayMode: DayMode, offset: number): UserSettings['dailySignals'][string] {
  if (offset === 0) {
    return {
      sleepStatus: 'met',
      energyStatus: 'normal',
      sleepDurationHours: 7.2,
    }
  }

  switch (dayMode) {
    case 'ideal':
      return { sleepStatus: 'met', energyStatus: 'high', sleepDurationHours: 7.9 }
    case 'normal':
      return { sleepStatus: 'met', energyStatus: 'normal', sleepDurationHours: 7.1 }
    case 'lowEnergy':
      return { sleepStatus: 'missed', energyStatus: 'low', sleepDurationHours: 5.9 }
    case 'survival':
      return { sleepStatus: 'missed', energyStatus: 'low', sleepDurationHours: 4.8 }
  }
}

function getGuestWorkoutLog(dayInstance: DayInstance, dayMode: DayMode, offset: number): UserSettings['workoutLogs'][string] | null {
  const scheduledWorkout = forgeWorkoutSchedule.find(
    (entry) => entry.weekday === dayInstance.weekday && entry.dayTypes.includes(dayInstance.dayType),
  )

  if (!scheduledWorkout) {
    return null
  }

  if (offset === 0 && scheduledWorkout.status === 'optional') {
    return null
  }

  const status =
    dayMode === 'survival'
      ? scheduledWorkout.status === 'optional'
        ? 'optional'
        : 'skipped'
      : dayMode === 'lowEnergy'
        ? scheduledWorkout.status === 'optional'
          ? 'optional'
          : 'rescheduled'
        : scheduledWorkout.status === 'optional'
          ? 'done'
          : 'done'

  return {
    date: dayInstance.date,
    workoutType: scheduledWorkout.workoutType,
    label: scheduledWorkout.label,
    status,
    note: status === 'done' ? 'Guest session sample: training landed as planned.' : undefined,
    missReason: status === 'skipped' ? 'Recovery load was too high in this sample day.' : undefined,
  }
}

function createGuestPrepProgress(): UserSettings['prepTopicProgress'] {
  return {
    'dsa-arrays': {
      confidence: 'high',
      exposureState: 'confident',
      revisionCount: 6,
      solvedCount: 14,
      exposureCount: 18,
      hoursSpent: 8.5,
      notes: 'Sliding window and prefix-sum patterns are now stable.',
    },
    'dsa-graphs': {
      confidence: 'medium',
      exposureState: 'inProgress',
      revisionCount: 3,
      solvedCount: 6,
      exposureCount: 10,
      hoursSpent: 5.3,
    },
    'system-design-core-caching': {
      confidence: 'medium',
      exposureState: 'retention',
      revisionCount: 4,
      solvedCount: 0,
      exposureCount: 7,
      hoursSpent: 3.2,
    },
    'system-design-case-notification-system': {
      confidence: 'low',
      exposureState: 'introduced',
      revisionCount: 1,
      solvedCount: 0,
      exposureCount: 3,
      hoursSpent: 1.7,
    },
    'lld-pattern-strategy': {
      confidence: 'medium',
      exposureState: 'retention',
      revisionCount: 4,
      solvedCount: 2,
      exposureCount: 6,
      hoursSpent: 2.6,
    },
    'java-backend-spring-boot': {
      confidence: 'medium',
      exposureState: 'inProgress',
      revisionCount: 3,
      solvedCount: 4,
      exposureCount: 8,
      hoursSpent: 4.4,
    },
    'java-core-concurrency': {
      confidence: 'low',
      exposureState: 'introduced',
      revisionCount: 2,
      solvedCount: 1,
      exposureCount: 5,
      hoursSpent: 2.3,
    },
    'secondary-cs-fundamentals': {
      confidence: 'medium',
      exposureState: 'retention',
      revisionCount: 2,
      solvedCount: 0,
      exposureCount: 4,
      hoursSpent: 1.9,
    },
  }
}

function getGuestExecutionNote(dayMode: DayMode, title: string) {
  switch (dayMode) {
    case 'ideal':
      return `Guest sample: ${title} landed cleanly with a confident finish.`
    case 'normal':
      return `Guest sample: ${title} moved forward without drift.`
    case 'lowEnergy':
      return `Guest sample: ${title} was completed at a reduced pace.`
    case 'survival':
      return `Guest sample: ${title} was protected but kept intentionally small.`
  }
}

function addDays(date: Date, amount: number) {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + amount)

  return nextDate
}
