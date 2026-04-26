import { useQuery } from '@tanstack/react-query'
import { useAuthSession } from '@/features/auth/providers/useAuthSession'
import { getPrepWorkspace, getPrepWorkspaceForUser } from '@/services/prep/prepPersistenceService'

export function usePrepWorkspace() {
  const { status, user } = useAuthSession()
  const readMode = status === 'authenticated' ? 'authenticatedCloud' : 'guestLocal'

  return useQuery({
    queryKey: ['prep-workspace', readMode, user?.uid ?? 'local'],
    queryFn: () => {
      if (status === 'authenticated' && user) {
        return getPrepWorkspaceForUser(user.uid)
      }

      return getPrepWorkspace()
    },
    enabled: status === 'authenticated' ? Boolean(user) : status === 'guest',
    retry: status === 'authenticated' ? 1 : 3,
  })
}
