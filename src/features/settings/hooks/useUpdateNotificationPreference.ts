import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useUiStore } from '@/app/store/uiStore'
import { useAuthSession } from '@/features/auth/providers/useAuthSession'
import { updateNotificationPreference } from '@/services/settings/notificationPreferenceService'

export function useUpdateNotificationPreference() {
  const queryClient = useQueryClient()
  const { status, user } = useAuthSession()
  const setSyncStatus = useUiStore((state) => state.setSyncStatus)

  return useMutation({
    mutationFn: async (enabled: boolean) =>
      updateNotificationPreference({
        enabled,
        userId: status === 'authenticated' && user ? user.uid : undefined,
        syncMode: status === 'guest' ? 'localOnly' : 'cloud',
      }),
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
