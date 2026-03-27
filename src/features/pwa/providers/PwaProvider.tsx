import type { PropsWithChildren } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { PwaContext } from '@/features/pwa/providers/pwaContext'

type InstallPromptOutcome = 'accepted' | 'dismissed' | 'unavailable'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{
    outcome: Exclude<InstallPromptOutcome, 'unavailable'>
    platform: string
  }>
}

type PwaContextValue = {
  isOnline: boolean
  isInstalled: boolean
  canInstall: boolean
  needRefresh: boolean
  offlineReady: boolean
  promptInstall: () => Promise<InstallPromptOutcome>
  dismissOfflineReady: () => void
  applyAppUpdate: () => Promise<void>
}

export function PwaProvider({ children }: PropsWithChildren) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isOnline, setIsOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine))
  const [isInstalled, setIsInstalled] = useState(() => getIsInstalled())
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW()

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true)
    }

    function handleOffline() {
      setIsOnline(false)
    }

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault()
      setDeferredPrompt(event as BeforeInstallPromptEvent)
    }

    function handleAppInstalled() {
      setIsInstalled(true)
      setDeferredPrompt(null)
    }

    const standaloneMediaQuery = window.matchMedia('(display-mode: standalone)')
    const handleDisplayModeChange = () => setIsInstalled(getIsInstalled())

    handleDisplayModeChange()

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    standaloneMediaQuery.addEventListener('change', handleDisplayModeChange)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      standaloneMediaQuery.removeEventListener('change', handleDisplayModeChange)
    }
  }, [])

  const promptInstall = useCallback(async (): Promise<InstallPromptOutcome> => {
    if (!deferredPrompt) {
      return 'unavailable'
    }

    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setDeferredPrompt(null)
    }

    return outcome
  }, [deferredPrompt])

  const applyAppUpdate = useCallback(async () => {
    await updateServiceWorker(true)
    setNeedRefresh(false)
  }, [setNeedRefresh, updateServiceWorker])

  const value = useMemo<PwaContextValue>(
    () => ({
      isOnline,
      isInstalled,
      canInstall: Boolean(deferredPrompt) && !isInstalled,
      needRefresh,
      offlineReady,
      promptInstall,
      dismissOfflineReady: () => setOfflineReady(false),
      applyAppUpdate,
    }),
    [applyAppUpdate, deferredPrompt, isInstalled, isOnline, needRefresh, offlineReady, promptInstall, setOfflineReady],
  )

  return <PwaContext.Provider value={value}>{children}</PwaContext.Provider>
}

function getIsInstalled() {
  if (typeof window === 'undefined') {
    return false
  }

  const navigatorWithStandalone = window.navigator as Navigator & { standalone?: boolean }

  return window.matchMedia('(display-mode: standalone)').matches || navigatorWithStandalone.standalone === true
}
