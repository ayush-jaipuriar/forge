import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useUiStore } from '@/app/store/uiStore'
import { useAuthSession } from '@/features/auth/providers/useAuthSession'
import type { PrepTopicProgressSnapshot } from '@/domain/prep/types'
import { updatePrepTopicProgress } from '@/services/settings/prepProgressService'
import { getMutationSyncStatus } from '@/services/sync/sourceOfTruth'
import { useOnlineStatus } from '@/services/sync/useOnlineStatus'

type UpdatePrepTopicProgressVariables = {
  topicId: string
  patch: Partial<PrepTopicProgressSnapshot>
}

export function useUpdatePrepTopicProgress() {
  const queryClient = useQueryClient()
  const { status: authStatus, user } = useAuthSession()
  const setSyncStatus = useUiStore((state) => state.setSyncStatus)
  const isOnline = useOnlineStatus()

  const mutation = useMutation({
    mutationFn: async ({ topicId, patch }: UpdatePrepTopicProgressVariables) =>
      updatePrepTopicProgress({
        topicId,
        patch,
        userId: authStatus === 'authenticated' && user ? user.uid : undefined,
        syncMode: authStatus === 'guest' ? 'localOnly' : 'cloud',
      }),
    onMutate: async () => {
      const previousState = useUiStore.getState()
      setSyncStatus(getMutationSyncStatus({ isAuthenticated: authStatus === 'authenticated' }))

      return {
        previousSyncStatus: previousState.syncStatus,
      }
    },
    onError: async (_error, _variables, context) => {
      if (context) {
        setSyncStatus(context.previousSyncStatus)
      }
    },
    onSuccess: async ({ pendingCount }) => {
      setSyncStatus(pendingCount > 0 ? 'queued' : 'stable')
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['prep-workspace'] }),
        queryClient.invalidateQueries({ queryKey: ['readiness-workspace'] }),
        queryClient.invalidateQueries({ queryKey: ['today-workspace'] }),
      ])
    },
  })

  return {
    ...mutation,
    isCloudWriteUnavailable: authStatus === 'authenticated' && !isOnline,
  }
}
