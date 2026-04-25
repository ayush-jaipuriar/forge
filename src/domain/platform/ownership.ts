export const platformServiceOwners = ['browser', 'pwaRuntime', 'firebaseFunctions', 'sharedDomain'] as const
export type PlatformServiceOwner = (typeof platformServiceOwners)[number]

export const platformServiceBoundaryStatuses = ['active', 'planned'] as const
export type PlatformServiceBoundaryStatus = (typeof platformServiceBoundaryStatuses)[number]

export const platformServiceBoundaryKeys = [
  'localExecution',
  'pwaShell',
  'calendarSession',
  'scheduledBackups',
  'scheduledNotifications',
  'analyticsSnapshots',
  'integrationTokens',
  'diagnosticsAggregation',
] as const
export type PlatformServiceBoundaryKey = (typeof platformServiceBoundaryKeys)[number]

export type PlatformServiceBoundary = {
  key: PlatformServiceBoundaryKey
  label: string
  owner: PlatformServiceOwner
  status: PlatformServiceBoundaryStatus
  description: string
  rationale: string
  callableName?: 'generateUserBackup' | 'evaluateUserNotifications' | 'generateUserAnalyticsSnapshots'
  manualTriggerLabel?: string
}

export type PlatformServiceWorkspace = {
  boundaries: PlatformServiceBoundary[]
  browserOwned: PlatformServiceBoundary[]
  pwaOwned: PlatformServiceBoundary[]
  functionsOwned: PlatformServiceBoundary[]
  sharedDomainOwned: PlatformServiceBoundary[]
  userInvokableFunctions: PlatformServiceBoundary[]
}

export function createPlatformServiceBoundaries(): PlatformServiceBoundary[] {
  return [
    {
      key: 'localExecution',
      label: 'Local execution and sync interaction',
      owner: 'browser',
      status: 'active',
      description: 'Fast local-first execution flow, restore apply, queue shaping, and visible user-controlled actions remain browser-owned.',
      rationale: 'These flows need low-latency interaction and explicit user control, so moving them server-side would make the product feel slower and less explainable.',
    },
    {
      key: 'pwaShell',
      label: 'PWA install and offline app',
      owner: 'pwaRuntime',
      status: 'active',
      description: 'Installability, cached startup, and update/offline messaging remain owned by the PWA layer and service worker.',
      rationale: 'Install and cache behavior are app delivery concerns, not business-domain concerns.',
    },
    {
      key: 'calendarSession',
      label: 'Interactive Calendar session control',
      owner: 'browser',
      status: 'active',
      description: 'Calendar connect, reconnect, read refresh, and explicit mirror reconciliation are still user-driven browser actions.',
      rationale: 'Current Calendar behavior still depends on user-interactive OAuth and explicit intent, so browser ownership is still the honest limit.',
    },
    {
      key: 'scheduledBackups',
      label: 'Scheduled backups and retention',
      owner: 'firebaseFunctions',
      status: 'active',
      description: 'Scheduled backup generation, retention cleanup, and backup metadata lifecycle are server-owned through Firebase Functions and Storage.',
      rationale: 'These are time-based orchestration responsibilities that should not depend on an active browser session.',
      callableName: 'generateUserBackup',
      manualTriggerLabel: 'Run backup now',
    },
    {
      key: 'scheduledNotifications',
      label: 'Scheduled notification evaluation',
      owner: 'firebaseFunctions',
      status: 'active',
      description: 'Notification candidate evaluation and scheduled run metadata are server-owned through Firebase Functions.',
      rationale: 'Sparse notification cadence should continue even when no browser session is open, which makes it a server-owned orchestration concern.',
      callableName: 'evaluateUserNotifications',
      manualTriggerLabel: 'Evaluate notifications now',
    },
    {
      key: 'analyticsSnapshots',
      label: 'Analytics snapshot regeneration',
      owner: 'firebaseFunctions',
      status: 'active',
      description: 'Analytics snapshot regeneration has a user-invokable Functions path even though charts and interpretation still render in the client.',
      rationale: 'Snapshot generation is heavy derived orchestration and benefits from a server-owned companion instead of staying purely browser-owned.',
      callableName: 'generateUserAnalyticsSnapshots',
      manualTriggerLabel: 'Regenerate analytics now',
    },
    {
      key: 'integrationTokens',
      label: 'Long-lived integration token handling',
      owner: 'firebaseFunctions',
      status: 'planned',
      description: 'Server-owned token lifecycle and integration state management are intentionally deferred but identified as future Functions work.',
      rationale: 'Long-lived provider tokens and privileged integration refresh should not remain browser-only once that work begins.',
    },
    {
      key: 'diagnosticsAggregation',
      label: 'Cross-platform health summary',
      owner: 'firebaseFunctions',
      status: 'planned',
      description: 'A richer remote health summary may later move into Functions once browser, native shell, and server signals need one shared view.',
      rationale: 'Cross-platform health details become more useful when they can include server facts instead of only browser-observed state, but that extraction is not justified yet.',
    },
  ]
}

export function buildPlatformServiceWorkspace(): PlatformServiceWorkspace {
  const boundaries = createPlatformServiceBoundaries()

  return {
    boundaries,
    browserOwned: boundaries.filter((boundary) => boundary.owner === 'browser'),
    pwaOwned: boundaries.filter((boundary) => boundary.owner === 'pwaRuntime'),
    functionsOwned: boundaries.filter((boundary) => boundary.owner === 'firebaseFunctions'),
    sharedDomainOwned: boundaries.filter((boundary) => boundary.owner === 'sharedDomain'),
    userInvokableFunctions: boundaries.filter(
      (boundary) => boundary.owner === 'firebaseFunctions' && boundary.status === 'active' && Boolean(boundary.callableName),
    ),
  }
}
