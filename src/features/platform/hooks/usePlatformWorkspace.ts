import { useMemo } from 'react'
import { usePwaState } from '@/features/pwa/providers/usePwaState'
import { getPlatformWorkspace } from '@/services/platform/platformCapabilitiesService'

export function usePlatformWorkspace() {
  const { isInstalled, canInstall, isOnline, needRefresh, offlineReady } = usePwaState()

  return useMemo(
    () =>
      getPlatformWorkspace({
        isInstalled,
        canInstall,
        isOnline,
        needRefresh,
        offlineReady,
      }),
    [canInstall, isInstalled, isOnline, needRefresh, offlineReady],
  )
}
