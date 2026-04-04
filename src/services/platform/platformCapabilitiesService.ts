import { Capacitor } from '@capacitor/core'
import { buildPlatformWorkspace } from '@/domain/platform/capabilities'
import type { PlatformDetectionSnapshot, PlatformHost } from '@/domain/platform/types'

type RuntimeInputs = {
  isInstalled: boolean
  canInstall: boolean
  isOnline: boolean
  needRefresh: boolean
  offlineReady: boolean
}

export function getPlatformWorkspace(runtimeInputs: RuntimeInputs) {
  return buildPlatformWorkspace(getPlatformDetectionSnapshot(runtimeInputs))
}

export function getPlatformDetectionSnapshot(runtimeInputs: RuntimeInputs): PlatformDetectionSnapshot {
  const nativePlatform = normalizeCapacitorPlatform(Capacitor.getPlatform())
  const isNativeShell = Capacitor.isNativePlatform()

  return {
    isNativeShell,
    nativePlatform,
    isInstalledPwa: runtimeInputs.isInstalled && !isNativeShell,
    canInstallPwa: runtimeInputs.canInstall && !isNativeShell,
    isOnline: runtimeInputs.isOnline,
    needRefresh: runtimeInputs.needRefresh,
    offlineReady: runtimeInputs.offlineReady,
  }
}

function normalizeCapacitorPlatform(platform: string): PlatformHost {
  if (platform === 'android' || platform === 'ios') {
    return platform
  }

  if (platform === 'web') {
    return 'web'
  }

  return 'unknown'
}
