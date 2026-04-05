import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useUiStore } from '@/app/store/uiStore'
import { useAuthSession } from '@/features/auth/providers/useAuthSession'
import { updateDayBlockNote } from '@/services/routine/dayExecutionService'

type UpdateBlockNoteVariables = {
  date: string
  blockId: string
  executionNote: string
}

export function useUpdateBlockNote() {
  const queryClient = useQueryClient()
  const { status: authStatus, user } = useAuthSession()
  const setSyncStatus = useUiStore((state) => state.setSyncStatus)

  return useMutation({
    mutationFn: async ({ date, blockId, executionNote }: UpdateBlockNoteVariables) =>
      updateDayBlockNote({
        date,
        blockId,
        executionNote,
        userId: authStatus === 'authenticated' && user ? user.uid : undefined,
        syncMode: authStatus === 'guest' ? 'localOnly' : 'cloud',
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
