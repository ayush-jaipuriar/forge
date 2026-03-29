import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthSession } from '@/features/auth/providers/useAuthSession'
import { googleCalendarIntegrationService } from '@/services/calendar/calendarIntegrationService'

export function useDisconnectCalendar() {
  const queryClient = useQueryClient()
  const { status, user } = useAuthSession()

  return useMutation({
    mutationFn: async () =>
      googleCalendarIntegrationService.disconnect(status === 'authenticated' && user ? user.uid : undefined),
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['settings-workspace'] }),
        queryClient.invalidateQueries({ queryKey: ['today-workspace'] }),
        queryClient.invalidateQueries({ queryKey: ['weekly-workspace'] }),
      ])
    },
  })
}
