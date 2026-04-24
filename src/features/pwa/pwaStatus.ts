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
      eyebrow: 'Offline',
      title: 'Changes will sync later',
      detail: 'Recent local changes are preserved and will replay when connectivity returns.',
      tone: 'warning',
    }
  }

  if (!isOnline) {
    return {
      eyebrow: 'Offline',
      title: 'Cached shell active',
      detail: 'Forge can still open recent local data on this device.',
      tone: 'warning',
    }
  }

  if (syncStatus === 'queued') {
    return {
      eyebrow: 'Sync',
      title: 'Changes are waiting',
      detail: 'Queued local changes will sync on the next clean pass.',
      tone: 'neutral',
    }
  }

  if (syncStatus === 'stale') {
    return {
      eyebrow: 'Sync',
      title: 'Sync needs attention',
      detail: 'Some local changes have waited longer than expected.',
      tone: 'warning',
    }
  }

  if (syncStatus === 'conflicted') {
    return {
      eyebrow: 'Sync',
      title: 'Review needed',
      detail: 'Forge found a conflict and paused automatic overwrite.',
      tone: 'warning',
    }
  }

  if (syncStatus === 'degraded') {
    return {
      eyebrow: 'Sync',
      title: 'Sync is blocked',
      detail: 'Local changes are preserved, but replay needs recovery.',
      tone: 'warning',
    }
  }

  if (syncStatus === 'syncing') {
    return {
      eyebrow: 'Sync',
      title: 'Syncing changes',
      detail: 'Local updates are being sent now.',
      tone: 'neutral',
    }
  }

  return {
    eyebrow: 'App',
    title: 'Online',
    detail: 'Forge is connected on this device.',
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
