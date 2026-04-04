export type PlatformRuntimeShell = 'browser' | 'installedPwa' | 'nativeShell'

export type PlatformHost = 'web' | 'android' | 'ios' | 'unknown'

export type PlatformCapabilityStatus = 'supported' | 'limited' | 'planned'

export type PlatformCapabilityKey =
  | 'auth'
  | 'notifications'
  | 'backupExport'
  | 'restoreImport'
  | 'calendar'
  | 'health'

export type PlatformDetectionSnapshot = {
  isNativeShell: boolean
  nativePlatform: PlatformHost
  isInstalledPwa: boolean
  canInstallPwa: boolean
  isOnline: boolean
  needRefresh: boolean
  offlineReady: boolean
}

export type PlatformCapabilityDescriptor = {
  key: PlatformCapabilityKey
  label: string
  status: PlatformCapabilityStatus
  summary: string
}

export type PlatformWorkspace = {
  runtime: PlatformRuntimeShell
  host: PlatformHost
  shellLabel: string
  shellSupportLabel: string
  summary: string
  installSurfaceLabel: string
  capabilities: PlatformCapabilityDescriptor[]
  supportNotes: string[]
  isOnline: boolean
  canInstallPwa: boolean
  needRefresh: boolean
  offlineReady: boolean
}
