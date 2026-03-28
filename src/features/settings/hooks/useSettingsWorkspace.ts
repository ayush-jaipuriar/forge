import { useQuery } from '@tanstack/react-query'
import { getSettingsWorkspace } from '@/services/settings/settingsWorkspaceService'

export function useSettingsWorkspace(userId?: string | null) {
  return useQuery({
    queryKey: ['settings-workspace', userId ?? 'local'],
    queryFn: () => getSettingsWorkspace(userId),
  })
}
