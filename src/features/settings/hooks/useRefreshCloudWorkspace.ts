import { useMutation } from '@tanstack/react-query'
import { hydrateCloudSharedState } from '@/services/sync/cloudSyncService'

export function useRefreshCloudWorkspace(userId?: string | null) {
  return useMutation({
    mutationFn: async () => {
      if (!userId) {
        throw new Error('Forge needs an authenticated user before it can refresh shared cloud state.')
      }

      return hydrateCloudSharedState(userId)
    },
  })
}
