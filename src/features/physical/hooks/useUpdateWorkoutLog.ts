import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useUiStore } from '@/app/store/uiStore'
import { useAuthSession } from '@/features/auth/providers/useAuthSession'
import type { WorkoutLogEntry } from '@/domain/physical/types'
import { updateWorkoutLog } from '@/services/settings/workoutLogService'

type UpdateWorkoutLogVariables = {
  date: string
  patch: WorkoutLogEntry
}

export function useUpdateWorkoutLog() {
  const queryClient = useQueryClient()
  const { status: authStatus, user } = useAuthSession()
  const setSyncStatus = useUiStore((state) => state.setSyncStatus)

  return useMutation({
    mutationFn: async ({ date, patch }: UpdateWorkoutLogVariables) =>
      updateWorkoutLog({
        date,
        patch,
        userId: authStatus === 'authenticated' && user ? user.uid : undefined,
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
        queryClient.invalidateQueries({ queryKey: ['physical-workspace'] }),
        queryClient.invalidateQueries({ queryKey: ['readiness-workspace'] }),
      ])
    },
  })
}
