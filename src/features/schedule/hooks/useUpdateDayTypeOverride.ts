import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useUiStore } from '@/app/store/uiStore'
import { useAuthSession } from '@/features/auth/providers/useAuthSession'
import type { DayType } from '@/domain/common/types'
import { updateDayTypeOverride } from '@/services/settings/dayTypeOverrideService'
import { getMutationSyncStatus } from '@/services/sync/sourceOfTruth'
import { useOnlineStatus } from '@/services/sync/useOnlineStatus'

type UpdateDayTypeOverrideVariables = {
  date: string
  dayType: DayType
}

export function useUpdateDayTypeOverride() {
  const queryClient = useQueryClient()
  const { status: authStatus, user } = useAuthSession()
  const setSyncStatus = useUiStore((state) => state.setSyncStatus)
  const isOnline = useOnlineStatus()

  const mutation = useMutation({
    mutationFn: async ({ date, dayType }: UpdateDayTypeOverrideVariables) =>
      updateDayTypeOverride({
        date,
        dayType,
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
        queryClient.invalidateQueries({ queryKey: ['today-workspace'] }),
        queryClient.invalidateQueries({ queryKey: ['weekly-workspace'] }),
      ])
    },
  })

  return {
    ...mutation,
    isCloudWriteUnavailable: authStatus === 'authenticated' && !isOnline,
  }
}
