import { useQuery } from '@tanstack/react-query'
import { useAuthSession } from '@/features/auth/providers/useAuthSession'
import { getOrCreateTodayWorkspace, getOrCreateTodayWorkspaceForUser } from '@/services/routine/routinePersistenceService'

export function useTodayWorkspace() {
  const { status, user } = useAuthSession()
  const readMode = status === 'authenticated' ? 'authenticatedCloud' : 'guestLocal'

  return useQuery({
    queryKey: ['today-workspace', readMode, user?.uid ?? 'local'],
    queryFn: () => {
      if (status === 'authenticated' && user) {
        return getOrCreateTodayWorkspaceForUser(user.uid)
      }

      return getOrCreateTodayWorkspace()
    },
    enabled: status === 'authenticated' ? Boolean(user) : status === 'guest',
    retry: status === 'authenticated' ? 1 : 3,
  })
}
