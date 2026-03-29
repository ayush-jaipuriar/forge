/**
 * Health provider display-state interpretation.
 *
 * These are pure domain functions that translate HealthProviderStatus and
 * HealthProviderUnavailableReason into user-facing labels and UX decisions.
 *
 * The key design constraint: every possible state must have honest copy.
 * There is no "coming soon" button. There is no fake "Connect" action.
 * The UI should read the product's honest Phase 3 posture clearly.
 */

import type {
  HealthIntegrationSnapshot,
  HealthProvider,
  HealthProviderState,
  HealthProviderStatus,
  HealthProviderUnavailableReason,
  NormalizedHealthSignal,
} from './types'
import { normalizedHealthSignalLabels } from './types'

// ─── Unavailable Reason Labels ────────────────────────────────────────────────

/**
 * Returns an honest, terse label explaining why a provider is not available.
 * Used in Settings and feature surfaces to avoid dead buttons and vague placeholders.
 */
export function getUnavailableReasonLabel(reason: HealthProviderUnavailableReason): string {
  switch (reason) {
    case 'phaseNotStarted':
      return 'Planned for a future phase'
    case 'platformIncompatible':
      return 'Not available on this platform'
    case 'requiresNativeShell':
      return 'Requires a native mobile app shell'
    case 'requiresWearableDevice':
      return 'Requires a paired wearable device'
  }
}

// ─── Provider Status Labels ───────────────────────────────────────────────────

/**
 * Returns a concise status label for a provider, combining status and reason
 * to produce copy that is honest about what is and is not supported.
 */
export function getProviderStatusLabel(
  status: HealthProviderStatus,
  unavailableReason?: HealthProviderUnavailableReason,
): string {
  switch (status) {
    case 'planned':
      return unavailableReason ? getUnavailableReasonLabel(unavailableReason) : 'Planned'
    case 'notConnected':
      return 'Not connected'
    case 'unsupported':
      return unavailableReason ? getUnavailableReasonLabel(unavailableReason) : 'Not supported on this platform'
    case 'connected':
      return 'Connected'
    case 'error':
      return 'Connection error'
  }
}

// ─── Provider Readiness ───────────────────────────────────────────────────────

/**
 * Returns whether a user action to connect this provider makes sense right now.
 * Prevents rendering dead connect buttons for providers that are planned or platform-incompatible.
 */
export function isProviderConnectable(provider: HealthProviderState): boolean {
  return provider.status === 'notConnected' && provider.platformAvailable
}

/**
 * Returns whether this provider is considered fully operational.
 */
export function isProviderOperational(provider: HealthProviderState): boolean {
  return provider.status === 'connected'
}

// ─── Signal Availability ──────────────────────────────────────────────────────

/**
 * Returns whether a specific normalized signal is available from any connected provider.
 * In Phase 3, this always returns false since no providers are connected.
 * Future phases: iterate over connected providers and check supportedSignals.
 */
export function isSignalAvailable(
  signal: NormalizedHealthSignal,
  providers: HealthProviderState[],
): boolean {
  return providers.some(
    (provider) => provider.status === 'connected' && provider.supportedSignals.includes(signal),
  )
}

/**
 * Returns a list of signals that are currently available (from connected providers).
 * In Phase 3, this always returns an empty array.
 */
export function getAvailableSignals(providers: HealthProviderState[]): NormalizedHealthSignal[] {
  const available = new Set<NormalizedHealthSignal>()
  for (const provider of providers) {
    if (provider.status === 'connected') {
      for (const signal of provider.supportedSignals) {
        available.add(signal)
      }
    }
  }
  return Array.from(available)
}

// ─── Summary Derivation ───────────────────────────────────────────────────────

/**
 * Derives a human-readable summary label for the overall health integration state.
 * Used in Settings chips and banners.
 */
export function deriveHealthConnectionSummaryLabel(providers: HealthProviderState[]): string {
  const connectedCount = providers.filter((p) => p.status === 'connected').length
  const errorCount = providers.filter((p) => p.status === 'error').length

  if (connectedCount === 0 && errorCount === 0) {
    return 'No providers connected — all planned for future phases'
  }
  if (errorCount > 0) {
    return `${connectedCount} connected, ${errorCount} with errors`
  }
  if (connectedCount === providers.length) {
    return 'All providers connected'
  }
  return `${connectedCount} of ${providers.length} providers connected`
}

export function deriveHealthConnectionSummary(
  providers: HealthProviderState[],
): HealthIntegrationSnapshot['connectionSummary'] {
  const connectedCount = providers.filter((provider) => provider.status === 'connected').length
  const unsupportedCount = providers.filter((provider) => provider.status === 'unsupported').length
  const allPlanned = providers.every((provider) => provider.status === 'planned')

  if (connectedCount === providers.length && connectedCount > 0) {
    return 'connected'
  }

  if (unsupportedCount === providers.length && unsupportedCount > 0) {
    return 'unsupported'
  }

  if (allPlanned) {
    return 'planned'
  }

  return 'partiallyConnected'
}

/**
 * Derives an honest phase notice for the Settings card.
 * This reflects the current Phase 3 posture: scaffolding only, no live providers.
 */
export function deriveHealthPhaseNotice(providers: HealthProviderState[]): string {
  const anyConnectable = providers.some((p) => isProviderConnectable(p))
  const allPlanned = providers.every((p) => p.status === 'planned')

  if (allPlanned) {
    return (
      'Health integration is scaffolded but no providers are connected in Phase 3. ' +
      'Apple Health and Google Health Connect require a native mobile shell. ' +
      'Google Fit and Fitbit API integration is planned for a future phase.'
    )
  }
  if (anyConnectable) {
    return 'Some providers are available to connect. Connect them to enable automated sleep and recovery tracking.'
  }
  return 'Health integration is partially configured. Review provider states for details.'
}

// ─── Provider Icon Hints ──────────────────────────────────────────────────────

/**
 * Returns provider-specific display metadata for the Settings surface.
 * This does NOT imply any live branding or asset dependency — it is purely
 * metadata that a future UI layer can use for icon or color selection.
 */
export function getProviderDisplayHints(provider: HealthProvider): {
  shortName: string
  platform: 'ios' | 'android' | 'web' | 'multiplatform'
  primarySignal: NormalizedHealthSignal
} {
  switch (provider) {
    case 'appleHealth':
      return { shortName: 'Apple Health', platform: 'ios', primarySignal: 'sleepDuration' }
    case 'googleHealthConnect':
      return { shortName: 'Health Connect', platform: 'android', primarySignal: 'steps' }
    case 'googleFit':
      return { shortName: 'Google Fit', platform: 'android', primarySignal: 'steps' }
    case 'fitbit':
      return { shortName: 'Fitbit', platform: 'multiplatform', primarySignal: 'recoveryScore' }
  }
}

// ─── Signal Label Helper ──────────────────────────────────────────────────────

export function getSignalLabel(signal: NormalizedHealthSignal): string {
  return normalizedHealthSignalLabels[signal]
}
