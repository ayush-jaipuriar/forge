import type {
  PlatformCapabilityDescriptor,
  PlatformCapabilityStatus,
  PlatformDetectionSnapshot,
  PlatformHost,
  PlatformRuntimeShell,
  PlatformWorkspace,
} from '@/domain/platform/types'

export function derivePlatformRuntime(snapshot: PlatformDetectionSnapshot): PlatformRuntimeShell {
  if (snapshot.isNativeShell) {
    return 'nativeShell'
  }

  if (snapshot.isInstalledPwa) {
    return 'installedPwa'
  }

  return 'browser'
}

export function derivePlatformHostLabel(host: PlatformHost) {
  if (host === 'android') {
    return 'Android'
  }

  if (host === 'ios') {
    return 'iOS'
  }

  if (host === 'web') {
    return 'Web'
  }

  return 'Unknown host'
}

export function buildPlatformWorkspace(snapshot: PlatformDetectionSnapshot): PlatformWorkspace {
  const runtime = derivePlatformRuntime(snapshot)
  const hostLabel = derivePlatformHostLabel(snapshot.nativePlatform)
  const capabilities = buildCapabilityDescriptors(runtime)

  return {
    runtime,
    host: snapshot.nativePlatform,
    shellLabel: getShellLabel(runtime, hostLabel),
    shellSupportLabel: getShellSupportLabel(runtime),
    summary: getRuntimeSummary(runtime),
    installSurfaceLabel: getInstallSurfaceLabel(runtime, snapshot),
    capabilities,
    supportNotes: getSupportNotes(runtime),
    isOnline: snapshot.isOnline,
    canInstallPwa: snapshot.canInstallPwa,
    needRefresh: snapshot.needRefresh,
    offlineReady: snapshot.offlineReady,
  }
}

export function getPlatformCapability(
  workspace: PlatformWorkspace,
  key: PlatformCapabilityDescriptor['key'],
) {
  return workspace.capabilities.find((capability) => capability.key === key)
}

function getShellLabel(runtime: PlatformRuntimeShell, hostLabel: string) {
  if (runtime === 'nativeShell') {
    return `Native ${hostLabel} Shell`
  }

  if (runtime === 'installedPwa') {
    return 'Installed PWA'
  }

  return 'Browser Tab'
}

function getShellSupportLabel(runtime: PlatformRuntimeShell) {
  if (runtime === 'nativeShell') {
    return 'Foundation runtime'
  }

  if (runtime === 'installedPwa') {
    return 'Installed web runtime'
  }

  return 'Primary runtime'
}

function getRuntimeSummary(runtime: PlatformRuntimeShell) {
  if (runtime === 'nativeShell') {
    return 'The Capacitor shell is real and launchable, but most product integrations still inherit browser constraints until native bridges and callback flows are hardened.'
  }

  if (runtime === 'installedPwa') {
    return 'The installed PWA keeps the strongest current Forge behavior: browser-owned auth, browser-owned notifications, and the offline-capable web shell.'
  }

  return 'Browser remains the most complete and best-understood Forge runtime today, including auth, Calendar, backup export, and restore import flows.'
}

function getInstallSurfaceLabel(runtime: PlatformRuntimeShell, snapshot: PlatformDetectionSnapshot) {
  if (runtime === 'nativeShell') {
    return 'Installed through the Android shell'
  }

  if (runtime === 'installedPwa') {
    return 'Installed through the browser shell'
  }

  return snapshot.canInstallPwa ? 'Browser install prompt available' : 'Running as a normal browser session'
}

function getSupportNotes(runtime: PlatformRuntimeShell) {
  if (runtime === 'nativeShell') {
    return [
      'Notifications still use browser-style permission and delivery from the bundled web runtime. Native push is not implemented.',
      'Backup export and restore import still rely on webview download and file-selection behavior rather than native share or document-picker flows.',
      'Firebase auth and Google Calendar still depend on browser-oriented auth and callback assumptions.',
      'The shell exists, but health-provider bridges are still deferred and should not be described as connected.',
    ]
  }

  if (runtime === 'installedPwa') {
    return [
      'Installed PWA behavior is still owned by browser permission, download, and Google session semantics.',
      'This is currently the most trustworthy mobile-friendly runtime for notification and auth behavior.',
    ]
  }

  return [
    'Browser is the reference runtime for launch, support, and troubleshooting today.',
  ]
}

function buildCapabilityDescriptors(runtime: PlatformRuntimeShell): PlatformCapabilityDescriptor[] {
  if (runtime === 'nativeShell') {
    return [
      capability(
        'auth',
        'Firebase Auth',
        'limited',
        'Current shell behavior still relies on browser-style auth and does not yet claim native callback or deep-link completion as hardened.',
      ),
      capability(
        'notifications',
        'Notifications',
        'limited',
        'Notification delivery still follows browser and installed-PWA rules from the bundled web runtime; native push is deferred.',
      ),
      capability(
        'backupExport',
        'Backup Export',
        'limited',
        'Backup export still depends on webview download handling and is not yet upgraded to native share or file-save flows.',
      ),
      capability(
        'restoreImport',
        'Restore Import',
        'limited',
        'Restore import still depends on browser-style file selection inside the shell rather than a native document picker.',
      ),
      capability(
        'calendar',
        'Google Calendar',
        'limited',
        'Calendar reconnect and write-mirror flows still depend on browser-owned Google auth ergonomics and should be treated as foundation-level support inside the shell.',
      ),
      capability(
        'health',
        'Health Providers',
        'planned',
        'The native shell now exists, but no Apple Health, Health Connect, or Fitbit bridge is implemented yet.',
      ),
    ]
  }

  if (runtime === 'installedPwa') {
    return [
      capability('auth', 'Firebase Auth', 'supported', 'Installed PWA auth is supported through the browser-owned Google sign-in flow.'),
      capability(
        'notifications',
        'Notifications',
        'supported',
        'Installed PWA notifications are supported through the same browser permission and delivery model already used on the web.',
      ),
      capability('backupExport', 'Backup Export', 'supported', 'Exports use the browser download model from the installed shell.'),
      capability('restoreImport', 'Restore Import', 'supported', 'Restore import uses the browser file picker inside the installed shell.'),
      capability(
        'calendar',
        'Google Calendar',
        'supported',
        'Calendar read and explicit write-mirroring continue to use browser Google session behavior inside the installed shell.',
      ),
      capability('health', 'Health Providers', 'planned', 'Health providers still require a later native bridge and are not connected in the installed PWA.'),
    ]
  }

  return [
    capability('auth', 'Firebase Auth', 'supported', 'Browser auth is supported today, with redirect on hosted surfaces and popup fallback on localhost/dev.'),
    capability('notifications', 'Notifications', 'supported', 'Browser notifications are supported once permission is granted.'),
    capability('backupExport', 'Backup Export', 'supported', 'Backup export uses browser downloads.'),
    capability('restoreImport', 'Restore Import', 'supported', 'Restore import uses the browser file picker.'),
    capability('calendar', 'Google Calendar', 'supported', 'Calendar integration is currently strongest in the browser runtime.'),
    capability('health', 'Health Providers', 'planned', 'Health providers are not yet connected in the browser runtime.'),
  ]
}

function capability(
  key: PlatformCapabilityDescriptor['key'],
  label: string,
  status: PlatformCapabilityStatus,
  summary: string,
): PlatformCapabilityDescriptor {
  return {
    key,
    label,
    status,
    summary,
  }
}
