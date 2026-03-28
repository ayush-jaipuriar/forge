import { useMutation, useQueryClient } from '@tanstack/react-query'
import { requestBrowserNotificationPermission } from '@/services/notifications/browserNotificationService'
import { updateNotificationPermission } from '@/services/notifications/notificationStateService'

export function useRequestNotificationPermission() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const permission = await requestBrowserNotificationPermission()
      return updateNotificationPermission(permission)
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['settings-workspace'] })
    },
  })
}
