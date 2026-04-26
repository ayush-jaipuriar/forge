import { useQuery } from '@tanstack/react-query'
import { useAuthSession } from '@/features/auth/providers/useAuthSession'
import { getOrCreateWeeklyWorkspace, getOrCreateWeeklyWorkspaceForUser } from '@/services/routine/routinePersistenceService'

export function useWeeklyWorkspace() {
  const { status, user } = useAuthSession()
  const readMode = status === 'authenticated' ? 'authenticatedCloud' : 'guestLocal'

  return useQuery({
    queryKey: ['weekly-workspace', readMode, user?.uid ?? 'local'],
    queryFn: () => {
      if (status === 'authenticated' && user) {
        return getOrCreateWeeklyWorkspaceForUser(user.uid)
      }

      return getOrCreateWeeklyWorkspace()
    },
    enabled: status === 'authenticated' ? Boolean(user) : status === 'guest',
    retry: status === 'authenticated' ? 1 : 3,
  })
}
