export const healthProviders = ['appleHealth', 'googleHealthConnect', 'googleFit', 'fitbit'] as const
export type HealthProvider = (typeof healthProviders)[number]

export const healthProviderStatuses = [
  'notConnected',
  'unsupported',
  'planned',
  'connected',
  'error',
] as const
export type HealthProviderStatus = (typeof healthProviderStatuses)[number]

export const normalizedHealthSignals = [
  'sleepDuration',
  'sleepConsistency',
  'recoveryScore',
  'steps',
  'heartRate',
] as const
export type NormalizedHealthSignal = (typeof normalizedHealthSignals)[number]

export type HealthProviderState = {
  provider: HealthProvider
  status: HealthProviderStatus
  supportedSignals: NormalizedHealthSignal[]
  lastCheckedAt?: string
  lastSuccessfulSyncAt?: string
}

export type HealthIntegrationSnapshot = {
  id: 'default'
  providers: HealthProviderState[]
  normalizedSignalAvailability: Record<NormalizedHealthSignal, boolean>
  connectionSummary: 'planned' | 'partiallyConnected' | 'connected' | 'unsupported'
  updatedAt: string
}

export function createDefaultHealthIntegrationSnapshot(): HealthIntegrationSnapshot {
  return {
    id: 'default',
    providers: healthProviders.map((provider) => ({
      provider,
      status: 'planned',
      supportedSignals: [],
    })),
    normalizedSignalAvailability: {
      sleepDuration: false,
      sleepConsistency: false,
      recoveryScore: false,
      steps: false,
      heartRate: false,
    },
    connectionSummary: 'planned',
    updatedAt: new Date().toISOString(),
  }
}
