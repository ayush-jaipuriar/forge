import type { SyncWriteMode } from '@/services/sync/persistSyncableChange'

export class OnlineOnlyMutationError extends Error {
  code = 'forge/online-required'

  constructor(message = 'Reconnect to save changes.') {
    super(message)
    this.name = 'OnlineOnlyMutationError'
  }
}

export function isAuthenticatedCloudMode(userId?: string | null, mode: SyncWriteMode = 'cloud') {
  return mode !== 'localOnly' && Boolean(userId)
}

export function isBrowserOnline() {
  if (typeof navigator === 'undefined') {
    return true
  }

  return navigator.onLine
}

export function assertAuthenticatedCloudWriteAvailable(userId?: string | null, mode: SyncWriteMode = 'cloud') {
  if (!isAuthenticatedCloudMode(userId, mode)) {
    return
  }

  if (!isBrowserOnline()) {
    throw new OnlineOnlyMutationError()
  }
}

export function getMutationSyncStatus({
  isAuthenticated,
  isOnline = isBrowserOnline(),
}: {
  isAuthenticated: boolean
  isOnline?: boolean
}) {
  if (!isAuthenticated) {
    return 'stable' as const
  }

  return isOnline ? ('syncing' as const) : ('stale' as const)
}
