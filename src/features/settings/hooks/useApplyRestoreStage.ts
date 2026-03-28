import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { RestoreStage } from '@/services/backup/restoreService'
import { applyRestoreStage } from '@/services/backup/restoreService'

export function useApplyRestoreStage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (stage: RestoreStage) => applyRestoreStage(stage),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['settings-workspace'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['today-workspace'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['schedule-workspace'],
        }),
      ])
    },
  })
}
