import { useQuery } from '@tanstack/react-query'
import type { AnalyticsRollingWindowKey } from '@/domain/analytics/types'
import { getCommandCenterWorkspace } from '@/services/analytics/commandCenterWorkspaceService'

export function useCommandCenterWorkspace(windowKey: AnalyticsRollingWindowKey) {
  return useQuery({
    queryKey: ['command-center-workspace', windowKey],
    queryFn: () => getCommandCenterWorkspace(windowKey),
  })
}
