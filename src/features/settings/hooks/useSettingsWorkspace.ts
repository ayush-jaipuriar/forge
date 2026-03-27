import { useQuery } from '@tanstack/react-query'
import { getSettingsWorkspace } from '@/services/settings/settingsWorkspaceService'

export function useSettingsWorkspace() {
  return useQuery({
    queryKey: ['settings-workspace'],
    queryFn: () => getSettingsWorkspace(),
  })
}
