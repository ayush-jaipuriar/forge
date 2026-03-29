// ─── Provider Registry ────────────────────────────────────────────────────────

export const healthProviders = ['appleHealth', 'googleHealthConnect', 'googleFit', 'fitbit'] as const
export type HealthProvider = (typeof healthProviders)[number]

/**
 * Explicit provider status enum.
 *
 * - planned: Forge has designed the seam but has not built the connection flow yet.
 *   This is the honest state for Phase 3 — the architecture is ready but no user can connect.
 * - notConnected: The integration is built and available on this platform but the user has not connected.
 * - unsupported: The provider is not available on the current platform (e.g. Apple Health on Android web).
 * - connected: The provider is connected and returning data.
 * - error: The provider was previously connected but has a current error.
 */
export const healthProviderStatuses = [
  'planned',
  'notConnected',
  'unsupported',
  'connected',
  'error',
] as const
export type HealthProviderStatus = (typeof healthProviderStatuses)[number]

/**
 * Why a provider is not available, for honest UX copy.
 * Used when status is 'planned' or 'unsupported'.
 */
export const healthProviderUnavailableReasons = [
  'phaseNotStarted',
  'platformIncompatible',
  'requiresNativeShell',
  'requiresWearableDevice',
] as const
export type HealthProviderUnavailableReason = (typeof healthProviderUnavailableReasons)[number]

// ─── Normalized Health Signals ────────────────────────────────────────────────

/**
 * Normalized signal keys that Forge can consume from any health provider.
 * These are the abstraction layer between raw provider data and Forge domain logic.
 * Adding a new signal here is the first step to supporting it from a future provider.
 */
export const normalizedHealthSignals = [
  'sleepDuration',
  'sleepConsistency',
  'recoveryScore',
  'steps',
  'heartRate',
] as const
export type NormalizedHealthSignal = (typeof normalizedHealthSignals)[number]

/**
 * Human-readable labels for normalized signals, for display in Settings and info surfaces.
 */
export const normalizedHealthSignalLabels: Record<NormalizedHealthSignal, string> = {
  sleepDuration: 'Sleep Duration',
  sleepConsistency: 'Sleep Consistency',
  recoveryScore: 'Recovery Score',
  steps: 'Daily Steps',
  heartRate: 'Resting Heart Rate',
}

/**
 * Normalized sleep signal shape. Future Apple Health / Google Health Connect providers
 * will map their raw sleep data into this shape before Forge consumes it.
 */
export type NormalizedSleepSignal = {
  signal: 'sleepDuration'
  durationHours: number
  source: HealthProvider
  recordedAt: string
}

export type NormalizedSleepConsistencySignal = {
  signal: 'sleepConsistency'
  consistencyScore: number // 0–100
  source: HealthProvider
  recordedAt: string
}

/**
 * Normalized recovery signal shape. Future wearable providers (e.g. Garmin, Fitbit)
 * will map their readiness/body-battery scores into this shape.
 */
export type NormalizedRecoverySignal = {
  signal: 'recoveryScore'
  score: number // 0–100
  label: string // Provider-defined label, e.g. "Good", "Optimal"
  source: HealthProvider
  recordedAt: string
}

/**
 * Normalized activity signal shape.
 */
export type NormalizedActivitySignal = {
  signal: 'steps' | 'heartRate'
  value: number
  unit: 'steps' | 'bpm'
  source: HealthProvider
  recordedAt: string
}

export type NormalizedHealthSignalData =
  | NormalizedSleepSignal
  | NormalizedSleepConsistencySignal
  | NormalizedRecoverySignal
  | NormalizedActivitySignal

// ─── Provider State ───────────────────────────────────────────────────────────

export type HealthProviderState = {
  provider: HealthProvider
  status: HealthProviderStatus
  unavailableReason?: HealthProviderUnavailableReason
  supportedSignals: NormalizedHealthSignal[]
  lastCheckedAt?: string
  lastSuccessfulSyncAt?: string
  /** Human-readable name for display */
  displayName: string
  /** Whether this provider is available on the current platform */
  platformAvailable: boolean
}

// ─── Integration Snapshot ─────────────────────────────────────────────────────

/**
 * Persisted health integration document.
 * This is what gets stored and loaded on app boot.
 */
export type HealthIntegrationSnapshot = {
  id: 'default'
  schemaVersion: 1
  providers: HealthProviderState[]
  normalizedSignalAvailability: Record<NormalizedHealthSignal, boolean>
  connectionSummary: 'planned' | 'partiallyConnected' | 'connected' | 'unsupported'
  updatedAt: string
}

export function createDefaultHealthIntegrationSnapshot(): HealthIntegrationSnapshot {
  return {
    id: 'default',
    schemaVersion: 1,
    providers: [
      {
        provider: 'appleHealth',
        status: 'planned',
        unavailableReason: 'requiresNativeShell',
        supportedSignals: ['sleepDuration', 'sleepConsistency', 'steps', 'heartRate', 'recoveryScore'],
        displayName: 'Apple Health',
        platformAvailable: false,
      },
      {
        provider: 'googleHealthConnect',
        status: 'planned',
        unavailableReason: 'requiresNativeShell',
        supportedSignals: ['sleepDuration', 'steps', 'heartRate'],
        displayName: 'Google Health Connect',
        platformAvailable: false,
      },
      {
        provider: 'googleFit',
        status: 'planned',
        unavailableReason: 'phaseNotStarted',
        supportedSignals: ['sleepDuration', 'steps', 'heartRate'],
        displayName: 'Google Fit',
        platformAvailable: false,
      },
      {
        provider: 'fitbit',
        status: 'planned',
        unavailableReason: 'phaseNotStarted',
        supportedSignals: ['sleepDuration', 'sleepConsistency', 'recoveryScore', 'steps', 'heartRate'],
        displayName: 'Fitbit',
        platformAvailable: false,
      },
    ],
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

// ─── Settings Workspace ───────────────────────────────────────────────────────

/**
 * Health integration information prepared for Settings and feature surfaces.
 * This is the shape that UI components should consume — not the raw snapshot.
 *
 * It is an honest, static view of the health integration posture for Phase 3:
 * all providers are planned, no data is available, and the seams are documented
 * without pretending any provider is connected.
 */
export type HealthIntegrationSettingsWorkspace = {
  connectionSummary: HealthIntegrationSnapshot['connectionSummary']
  providers: Array<{
    provider: HealthProvider
    displayName: string
    status: HealthProviderStatus
    unavailableReason?: HealthProviderUnavailableReason
    unavailableLabel: string
    platformAvailable: boolean
    supportedSignalCount: number
  }>
  availableSignalCount: number
  totalSignalCount: number
  anyProviderConnected: boolean
  /** Honest explanation of the current state for UI display */
  statusSummaryLabel: string
  /** Phase-honest notice for the Settings card */
  phaseNotice: string
}
