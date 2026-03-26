import type { DayMode } from '@/domain/common/types'
import { generateDayInstance } from '@/domain/routine/generateDayInstance'
import type { DayInstance, RoutineTemplate } from '@/domain/routine/types'

type GenerateWeekInstancesInput = {
  anchorDate?: string
  routine: RoutineTemplate
  dayModesByDate?: Partial<Record<string, DayMode>>
}

export function getDateKey(date: Date) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function generateWeekInstances({
  anchorDate = getDateKey(new Date()),
  routine,
  dayModesByDate = {},
}: GenerateWeekInstancesInput): DayInstance[] {
  const start = getStartOfWeek(anchorDate)

  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(start, index)
    const dateKey = getDateKey(date)

    return generateDayInstance({
      date: dateKey,
      routine,
      dayMode: dayModesByDate[dateKey] ?? 'normal',
    })
  })
}

export function formatDateLabel(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00`)

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date)
}

export function formatWeekdayLabel(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00`)

  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
  }).format(date)
}

function getStartOfWeek(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00`)
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day

  return addDays(date, diff)
}

function addDays(date: Date, amount: number) {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + amount)

  return nextDate
}
