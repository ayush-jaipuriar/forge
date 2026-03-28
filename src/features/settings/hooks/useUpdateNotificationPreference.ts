import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useUiStore } from '@/app/store/uiStore'
import { updateNotificationPreference } from '@/services/settings/notificationPreferenceService'

export function useUpdateNotificationPreference() {
  const queryClient = useQueryClient()
  const setSyncStatus = useUiStore((state) => state.setSyncStatus)

  return useMutation({
    mutationFn: async (enabled: boolean) => updateNotificationPreference({ enabled }),
    onMutate: async () => {
      const previousState = useUiStore.getState()
      setSyncStatus('queued')

      return {
        previousSyncStatus: previousState.syncStatus,
      }
    },
    onError: async (_error, _enabled, context) => {
      if (context) {
        setSyncStatus(context.previousSyncStatus)
      }
    },
    onSuccess: async ({ pendingCount }) => {
      setSyncStatus(pendingCount > 0 ? 'queued' : 'stable')
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['settings-workspace'] })
    },
  })
}
