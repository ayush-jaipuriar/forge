import type { SyncStatus } from '@/domain/common/types'

type ConnectivityModel = {
  eyebrow: string
  title: string
  detail: string
  tone: 'success' | 'warning' | 'neutral'
}

export type PwaSurfaceMode = 'hidden' | 'compact' | 'card'

export function getConnectivityStatusModel({
  isOnline,
  syncStatus,
}: {
  isOnline: boolean
  syncStatus: SyncStatus
}): ConnectivityModel {
  if (!isOnline && syncStatus === 'queued') {
    return {
      eyebrow: 'Offline Queue',
      title: 'Working offline with queued writes',
      detail: 'Recent local changes are preserved and will replay when connectivity returns.',
      tone: 'warning',
    }
  }

  if (!isOnline) {
    return {
      eyebrow: 'Offline Shell',
      title: 'Cached shell active',
      detail: 'The app is offline, but the local execution surface can still load from cached assets and IndexedDB state.',
      tone: 'warning',
    }
  }

  if (syncStatus === 'queued') {
    return {
      eyebrow: 'Sync Queue',
      title: 'Changes are waiting to replay',
      detail: 'The browser is back online, but queued writes are still waiting for the next successful authenticated sync pass.',
      tone: 'neutral',
    }
  }

  if (syncStatus === 'stale') {
    return {
      eyebrow: 'Sync Stale',
      title: 'Queued changes have been waiting too long',
      detail: 'Forge still has unsynced local work, and the queue age now suggests the current browser state may be drifting from the cloud baseline.',
      tone: 'warning',
    }
  }

  if (syncStatus === 'conflicted') {
    return {
      eyebrow: 'Sync Conflict',
      title: 'Manual review is needed before sync can be trusted',
      detail: 'Forge detected a conflict state that should stay visible instead of silently overwriting data.',
      tone: 'warning',
    }
  }

  if (syncStatus === 'degraded') {
    return {
      eyebrow: 'Sync Degraded',
      title: 'Replay failures are blocking a clean sync pass',
      detail: 'Local changes are still preserved, but at least one replay attempt failed and needs recovery attention.',
      tone: 'warning',
    }
  }

  if (syncStatus === 'syncing') {
    return {
      eyebrow: 'Sync',
      title: 'Replaying local changes now',
      detail: 'Forge is flushing queued local updates to the remote backend.',
      tone: 'neutral',
    }
  }

  return {
    eyebrow: 'Shell Status',
    title: 'Installable and connected',
    detail: 'The cached shell is healthy and the current browser session is online.',
    tone: 'success',
  }
}

export function shouldShowPwaStatusCard({
  isOnline,
  syncStatus,
  canInstall,
  needRefresh,
  offlineReady,
}: {
  isOnline: boolean
  syncStatus: SyncStatus
  canInstall: boolean
  needRefresh: boolean
  offlineReady: boolean
}) {
  return getPwaSurfaceMode({
    pathname: '/',
    isOnline,
    syncStatus,
    canInstall,
    needRefresh,
    offlineReady,
  }) !== 'hidden'
}

export function getPwaSurfaceMode({
  pathname,
  isOnline,
  syncStatus,
  canInstall,
  needRefresh,
  offlineReady,
}: {
  pathname: string
  isOnline: boolean
  syncStatus: SyncStatus
  canInstall: boolean
  needRefresh: boolean
  offlineReady: boolean
}): PwaSurfaceMode {
  void pathname
  void canInstall
  void offlineReady

  if (!isOnline || syncStatus !== 'stable' || needRefresh) {
    return 'card'
  }

  return 'hidden'
}
