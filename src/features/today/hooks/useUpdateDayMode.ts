import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useUiStore } from '@/app/store/uiStore'
import { useAuthSession } from '@/features/auth/providers/useAuthSession'
import type { DayMode } from '@/domain/common/types'
import { updateDayModeOverride } from '@/services/settings/dayModeOverrideService'
import { getMutationSyncStatus } from '@/services/sync/sourceOfTruth'
import { useOnlineStatus } from '@/services/sync/useOnlineStatus'

type UpdateDayModeVariables = {
  date: string
  dayMode: DayMode
}

export function useUpdateDayMode() {
  const queryClient = useQueryClient()
  const { status, user } = useAuthSession()
  const setDayMode = useUiStore((state) => state.setDayMode)
  const setSyncStatus = useUiStore((state) => state.setSyncStatus)
  const isOnline = useOnlineStatus()

  const mutation = useMutation({
    mutationFn: async ({ date, dayMode }: UpdateDayModeVariables) =>
      updateDayModeOverride({
        date,
        dayMode,
        userId: status === 'authenticated' && user ? user.uid : undefined,
        syncMode: status === 'guest' ? 'localOnly' : 'cloud',
      }),
    onMutate: async ({ dayMode }) => {
      const previousState = useUiStore.getState()

      setDayMode(dayMode)
      setSyncStatus(getMutationSyncStatus({ isAuthenticated: status === 'authenticated' }))

      return {
        previousDayMode: previousState.dayMode,
        previousSyncStatus: previousState.syncStatus,
      }
    },
    onError: async (_error, _variables, context) => {
      if (context) {
        setDayMode(context.previousDayMode)
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
    isCloudWriteUnavailable: status === 'authenticated' && !isOnline,
  }
}
