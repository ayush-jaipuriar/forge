import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useUiStore } from '@/app/store/uiStore'
import { useAuthSession } from '@/features/auth/providers/useAuthSession'
import type { EnergyStatus, SleepStatus } from '@/domain/common/types'
import { updateDailySignals } from '@/services/settings/dailySignalsService'

type UpdateDailySignalsVariables = {
  date: string
  sleepStatus?: SleepStatus
  energyStatus?: EnergyStatus
}

export function useUpdateDailySignals() {
  const queryClient = useQueryClient()
  const { status, user } = useAuthSession()
  const setSyncStatus = useUiStore((state) => state.setSyncStatus)

  return useMutation({
    mutationFn: async ({ date, sleepStatus, energyStatus }: UpdateDailySignalsVariables) =>
      updateDailySignals({
        date,
        sleepStatus,
        energyStatus,
        userId: status === 'authenticated' && user ? user.uid : undefined,
      }),
    onMutate: async () => {
      const previousState = useUiStore.getState()
      setSyncStatus('queued')

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
}
