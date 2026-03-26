import { applyDayModeToInstance } from '@/domain/execution/fallbacks'
import type { DayMode, DayType, Weekday } from '@/domain/common/types'
import type { RoutineTemplate, DayInstance, WeeklyRoutineEntry, BlockTemplate } from '@/domain/routine/types'

type GenerateDayInstanceInput = {
  date: string
  routine: RoutineTemplate
  dayMode?: DayMode
  overrideDayType?: DayType
}

export function generateDayInstance({ date, routine, dayMode = 'normal', overrideDayType }: GenerateDayInstanceInput): DayInstance {
  const weekday = getWeekdayFromDate(date)
  const weeklyEntry = resolveWeeklyEntry(routine.weeklySchedule, weekday)
  const dayType = overrideDayType ?? weeklyEntry.dayType
  const template = routine.templatesByDayType[dayType]

  const baseInstance: DayInstance = {
    id: `${date}:${dayType}`,
    date,
    weekday,
    dayType,
    dayMode,
    label: template.label,
    focusLabel: template.focusLabel,
    wakeWindow: template.wakeWindow,
    sleepWindow: template.sleepWindow,
    expectationSummary: [...template.expectationSummary],
    blocks: template.blocks.map((block) => generateBlockInstance(block, date)),
  }

  return applyDayModeToInstance(baseInstance, dayMode)
}

function resolveWeeklyEntry(schedule: WeeklyRoutineEntry[], weekday: Weekday) {
  const entry = schedule.find((item) => item.weekday === weekday)

  if (!entry) {
    throw new Error(`No routine entry exists for weekday "${weekday}".`)
  }

  return entry
}

function generateBlockInstance(block: BlockTemplate, date: string) {
  return {
    id: `${date}:${block.id}`,
    templateId: block.id,
    title: block.title,
    kind: block.kind,
    status: 'planned' as const,
    startTime: block.startTime,
    endTime: block.endTime,
    durationMinutes: block.durationMinutes,
    detail: block.detail,
    focusAreas: block.focusAreas ?? [],
    requiredOutput: block.requiredOutput ?? false,
    optional: block.optional ?? false,
    date,
  }
}

function getWeekdayFromDate(date: string): Weekday {
  const day = new Date(`${date}T00:00:00`).getDay()

  const weekdayMap: Record<number, Weekday> = {
    0: 'sunday',
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday',
  }

  return weekdayMap[day]
}
