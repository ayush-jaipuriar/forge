import { createContext } from 'react'

export type PwaContextValue = {
  isOnline: boolean
  isInstalled: boolean
  canInstall: boolean
  needRefresh: boolean
  offlineReady: boolean
  promptInstall: () => Promise<'accepted' | 'dismissed' | 'unavailable'>
  dismissOfflineReady: () => void
  applyAppUpdate: () => Promise<void>
}

export const PwaContext = createContext<PwaContextValue | null>(null)
