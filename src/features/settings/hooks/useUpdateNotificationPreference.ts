import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useUiStore } from '@/app/store/uiStore'
import { useAuthSession } from '@/features/auth/providers/useAuthSession'
import { updateNotificationPreference } from '@/services/settings/notificationPreferenceService'
import { getMutationSyncStatus } from '@/services/sync/sourceOfTruth'
import { useOnlineStatus } from '@/services/sync/useOnlineStatus'

export function useUpdateNotificationPreference() {
  const queryClient = useQueryClient()
  const { status, user } = useAuthSession()
  const setSyncStatus = useUiStore((state) => state.setSyncStatus)
  const isOnline = useOnlineStatus()

  const mutation = useMutation({
    mutationFn: async (enabled: boolean) =>
      updateNotificationPreference({
        enabled,
        userId: status === 'authenticated' && user ? user.uid : undefined,
        syncMode: status === 'guest' ? 'localOnly' : 'cloud',
      }),
    onMutate: async () => {
      const previousState = useUiStore.getState()
      setSyncStatus(getMutationSyncStatus({ isAuthenticated: status === 'authenticated' }))

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

  return {
    ...mutation,
    isCloudWriteUnavailable: status === 'authenticated' && !isOnline,
  }
}
