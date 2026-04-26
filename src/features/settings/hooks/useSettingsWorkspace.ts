import { useQuery } from '@tanstack/react-query'
import { useAuthSession } from '@/features/auth/providers/useAuthSession'
import { getSettingsWorkspace } from '@/services/settings/settingsWorkspaceService'

export function useSettingsWorkspace(userId?: string | null) {
  const { status } = useAuthSession()
  const readMode = userId ? 'authenticatedCloud' : 'guestLocal'

  return useQuery({
    queryKey: ['settings-workspace', readMode, userId ?? 'local'],
    queryFn: () => getSettingsWorkspace(userId),
    enabled: userId ? status === 'authenticated' : status === 'guest',
    retry: userId ? 1 : 3,
  })
}
