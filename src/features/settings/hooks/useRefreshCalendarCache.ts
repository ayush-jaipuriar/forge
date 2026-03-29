import { useMutation, useQueryClient } from '@tanstack/react-query'
import { googleCalendarIntegrationService } from '@/services/calendar/calendarIntegrationService'

export function useRefreshCalendarCache() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const dates = buildUpcomingDateRange(7)

      return googleCalendarIntegrationService.refreshCache({
        dates,
        blocksByDate: Object.fromEntries(dates.map((date) => [date, []])),
      })
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['settings-workspace'] }),
        queryClient.invalidateQueries({ queryKey: ['today-workspace'] }),
        queryClient.invalidateQueries({ queryKey: ['weekly-workspace'] }),
      ])
    },
  })
}

function buildUpcomingDateRange(length: number) {
  return Array.from({ length }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() + index)
    return date.toISOString().slice(0, 10)
  })
}
