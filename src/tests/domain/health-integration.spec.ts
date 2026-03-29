/**
 * Health integration domain tests — Milestone 9
 *
 * These tests verify:
 * 1. Provider state interpretation is honest (no connected states in Phase 3)
 * 2. Unavailable reason labels are clear and deterministic
 * 3. Signal availability correctly returns false when no providers are connected
 * 4. Normalization functions produce valid typed shapes
 * 5. The settings workspace builder produces a consistent, honest view
 * 6. Validation helpers catch out-of-range or malformed signals
 */

import { beforeEach, describe, expect, it } from 'vitest'
import { localHealthIntegrationRepository } from '@/data/local'
import { resetForgeDb } from '@/data/local/forgeDb'
import {
  createDefaultHealthIntegrationSnapshot,
  normalizedHealthSignals,
  type HealthProviderState,
  type NormalizedSleepConsistencySignal,
} from '@/domain/health/types'
import {
  deriveHealthConnectionSummaryLabel,
  deriveHealthPhaseNotice,
  getAvailableSignals,
  getProviderDisplayHints,
  getProviderStatusLabel,
  getUnavailableReasonLabel,
  isProviderConnectable,
  isProviderOperational,
  isSignalAvailable,
} from '@/domain/health/providers'
import {
  normalizeHeartRateSignal,
  normalizeRecoverySignal,
  normalizeSleepConsistencySignal,
  normalizeSleepSignal,
  normalizeStepsSignal,
  validateNormalizedSignal,
} from '@/domain/health/normalization'
import { buildHealthIntegrationSettingsWorkspace, healthIntegrationService } from '@/services/health/healthIntegrationService'

beforeEach(async () => {
  await resetForgeDb()
})

describe('health integration — Phase 3 scaffolding', () => {
  // ─── Default snapshot ────────────────────────────────────────────────────────

  it('creates a default snapshot with all providers in planned state', () => {
    const snapshot = createDefaultHealthIntegrationSnapshot()

    expect(snapshot.id).toBe('default')
    expect(snapshot.schemaVersion).toBe(1)
    expect(snapshot.connectionSummary).toBe('planned')
    expect(snapshot.providers).toHaveLength(4)
    expect(snapshot.providers.every((p) => p.status === 'planned')).toBe(true)
  })

  it('default snapshot has no available signals', () => {
    const snapshot = createDefaultHealthIntegrationSnapshot()

    for (const signal of normalizedHealthSignals) {
      expect(snapshot.normalizedSignalAvailability[signal]).toBe(false)
    }
  })

  it('default snapshot providers have display names and platform availability flags', () => {
    const snapshot = createDefaultHealthIntegrationSnapshot()

    for (const provider of snapshot.providers) {
      expect(provider.displayName).toBeTruthy()
      // In Phase 3, no provider is platform-available (all require a native shell or are not built)
      expect(provider.platformAvailable).toBe(false)
    }
  })
})

describe('health provider status — honest display labels', () => {
  it('maps planned status to a clear label', () => {
    expect(getProviderStatusLabel('planned', 'phaseNotStarted')).toBe('Planned for a future phase')
    expect(getProviderStatusLabel('planned', 'requiresNativeShell')).toBe(
      'Requires a native mobile app shell',
    )
    expect(getProviderStatusLabel('planned')).toBe('Planned')
  })

  it('maps notConnected status to a clear label', () => {
    expect(getProviderStatusLabel('notConnected')).toBe('Not connected')
  })

  it('maps unsupported status with and without reason', () => {
    expect(getProviderStatusLabel('unsupported', 'platformIncompatible')).toBe(
      'Not available on this platform',
    )
    expect(getProviderStatusLabel('unsupported')).toBe('Not supported on this platform')
  })

  it('maps error and connected states', () => {
    expect(getProviderStatusLabel('connected')).toBe('Connected')
    expect(getProviderStatusLabel('error')).toBe('Connection error')
  })

  it('maps all unavailable reasons to distinct non-empty labels', () => {
    const reasons = [
      'phaseNotStarted',
      'platformIncompatible',
      'requiresNativeShell',
      'requiresWearableDevice',
    ] as const

    const labels = reasons.map((reason) => getUnavailableReasonLabel(reason))
    const uniqueLabels = new Set(labels)

    expect(uniqueLabels.size).toBe(reasons.length)
    for (const label of labels) {
      expect(label.length).toBeGreaterThan(0)
    }
  })
})

describe('health provider readiness helpers', () => {
  function makePlannedProvider(): HealthProviderState {
    return {
      provider: 'appleHealth',
      status: 'planned',
      unavailableReason: 'requiresNativeShell',
      supportedSignals: ['sleepDuration'],
      displayName: 'Apple Health',
      platformAvailable: false,
    }
  }

  it('planned provider is not connectable and not operational', () => {
    const provider = makePlannedProvider()
    expect(isProviderConnectable(provider)).toBe(false)
    expect(isProviderOperational(provider)).toBe(false)
  })

  it('notConnected but platform-available provider is connectable', () => {
    const provider: HealthProviderState = {
      ...makePlannedProvider(),
      status: 'notConnected',
      platformAvailable: true,
    }
    expect(isProviderConnectable(provider)).toBe(true)
    expect(isProviderOperational(provider)).toBe(false)
  })

  it('connected provider is operational and not connectable', () => {
    const provider: HealthProviderState = {
      ...makePlannedProvider(),
      status: 'connected',
      platformAvailable: true,
    }
    expect(isProviderConnectable(provider)).toBe(false)
    expect(isProviderOperational(provider)).toBe(true)
  })
})

describe('health signal availability', () => {
  it('returns no available signals when all providers are in planned state', () => {
    const snapshot = createDefaultHealthIntegrationSnapshot()
    const available = getAvailableSignals(snapshot.providers)
    expect(available).toHaveLength(0)
  })

  it('isSignalAvailable returns false for all signals when no provider is connected', () => {
    const snapshot = createDefaultHealthIntegrationSnapshot()
    for (const signal of normalizedHealthSignals) {
      expect(isSignalAvailable(signal, snapshot.providers)).toBe(false)
    }
  })

  it('isSignalAvailable returns true when a connected provider supports the signal', () => {
    const providers: HealthProviderState[] = [
      {
        provider: 'fitbit',
        status: 'connected',
        supportedSignals: ['recoveryScore', 'sleepDuration'],
        displayName: 'Fitbit',
        platformAvailable: true,
      },
    ]
    expect(isSignalAvailable('recoveryScore', providers)).toBe(true)
    expect(isSignalAvailable('steps', providers)).toBe(false)
  })
})

describe('health connection summary labels', () => {
  it('returns an honest no-providers label for Phase 3 defaults', () => {
    const snapshot = createDefaultHealthIntegrationSnapshot()
    const label = deriveHealthConnectionSummaryLabel(snapshot.providers)
    expect(label).toContain('No providers connected')
    expect(label).toContain('planned')
  })

  it('returns an honest phase notice that mentions native shell for Phase 3', () => {
    const snapshot = createDefaultHealthIntegrationSnapshot()
    const notice = deriveHealthPhaseNotice(snapshot.providers)
    expect(notice.length).toBeGreaterThan(0)
    expect(notice).toContain('native')
  })

  it('returns a partial connection label when some providers are connected', () => {
    const providers: HealthProviderState[] = [
      {
        provider: 'fitbit',
        status: 'connected',
        supportedSignals: [],
        displayName: 'Fitbit',
        platformAvailable: true,
      },
      {
        provider: 'appleHealth',
        status: 'planned',
        unavailableReason: 'requiresNativeShell',
        supportedSignals: [],
        displayName: 'Apple Health',
        platformAvailable: false,
      },
    ]
    const label = deriveHealthConnectionSummaryLabel(providers)
    expect(label).toContain('connected')
  })
})

describe('health provider display hints', () => {
  it('returns platform and primary signal hints for all known providers', () => {
    const hints = {
      appleHealth: getProviderDisplayHints('appleHealth'),
      googleHealthConnect: getProviderDisplayHints('googleHealthConnect'),
      googleFit: getProviderDisplayHints('googleFit'),
      fitbit: getProviderDisplayHints('fitbit'),
    }

    expect(hints.appleHealth.platform).toBe('ios')
    expect(hints.appleHealth.primarySignal).toBe('sleepDuration')
    expect(hints.googleHealthConnect.platform).toBe('android')
    expect(hints.fitbit.platform).toBe('multiplatform')
    expect(hints.fitbit.primarySignal).toBe('recoveryScore')
  })
})

describe('health normalization helpers', () => {
  const now = new Date().toISOString()

  it('normalizes sleep signal with duration conversion', () => {
    const signal = normalizeSleepSignal({
      rawDurationMinutes: 450,
      source: 'appleHealth',
      recordedAt: now,
    })
    expect(signal.signal).toBe('sleepDuration')
    expect(signal.durationHours).toBe(7.5)
    expect(signal.source).toBe('appleHealth')
  })

  it('normalizes sleep duration independently from sleep consistency', () => {
    const signal = normalizeSleepSignal({
      rawDurationMinutes: 480,
      source: 'fitbit',
      recordedAt: now,
    })
    expect(signal.durationHours).toBe(8)
  })

  it('normalizes a standalone sleep consistency signal', () => {
    const signal = normalizeSleepConsistencySignal({
      rawConsistencyScore: 82,
      source: 'fitbit',
      recordedAt: now,
    })
    expect(signal.signal).toBe('sleepConsistency')
    expect(signal.consistencyScore).toBe(82)
  })

  it('normalizes recovery signal and clamps score to 0–100', () => {
    const signal = normalizeRecoverySignal({
      rawScore: 75,
      rawLabel: 'Good',
      source: 'fitbit',
      recordedAt: now,
    })
    expect(signal.signal).toBe('recoveryScore')
    expect(signal.score).toBe(75)
    expect(signal.label).toBe('Good')

    const clamped = normalizeRecoverySignal({
      rawScore: 150,
      rawLabel: 'Out of range',
      source: 'fitbit',
      recordedAt: now,
    })
    expect(clamped.score).toBe(100)
  })

  it('normalizes step count to steps unit', () => {
    const signal = normalizeStepsSignal({
      rawStepCount: 8500,
      source: 'googleFit',
      recordedAt: now,
    })
    expect(signal.signal).toBe('steps')
    expect(signal.value).toBe(8500)
    expect(signal.unit).toBe('steps')
  })

  it('normalizes heart rate to bpm unit', () => {
    const signal = normalizeHeartRateSignal({
      rawBpm: 62,
      source: 'appleHealth',
      recordedAt: now,
    })
    expect(signal.signal).toBe('heartRate')
    expect(signal.value).toBe(62)
    expect(signal.unit).toBe('bpm')
  })
})

describe('health signal validation', () => {
  const now = new Date().toISOString()

  it('validates a well-formed sleep signal without errors', () => {
    const signal = normalizeSleepSignal({
      rawDurationMinutes: 420,
      source: 'appleHealth',
      recordedAt: now,
    })
    expect(validateNormalizedSignal(signal)).toHaveLength(0)
  })

  it('flags a sleep signal with an impossible duration', () => {
    const signal = normalizeSleepSignal({
      rawDurationMinutes: 1500, // 25h
      source: 'appleHealth',
      recordedAt: now,
    })
    expect(validateNormalizedSignal(signal).length).toBeGreaterThan(0)
  })

  it('validates a well-formed recovery signal without errors', () => {
    const signal = normalizeRecoverySignal({
      rawScore: 88,
      rawLabel: 'Optimal',
      source: 'fitbit',
      recordedAt: now,
    })
    expect(validateNormalizedSignal(signal)).toHaveLength(0)
  })

  it('flags a heart rate signal with an implausible bpm', () => {
    const signal = normalizeHeartRateSignal({
      rawBpm: 500,
      source: 'appleHealth',
      recordedAt: now,
    })
    expect(validateNormalizedSignal(signal).length).toBeGreaterThan(0)
  })

  it('flags a signal with an invalid timestamp', () => {
    const signal = normalizeSleepSignal({
      rawDurationMinutes: 420,
      source: 'appleHealth',
      recordedAt: 'not-a-date',
    })
    expect(validateNormalizedSignal(signal).length).toBeGreaterThan(0)
  })

  it('flags a sleep consistency signal outside the 0-100 range', () => {
    const signal: NormalizedSleepConsistencySignal = {
      signal: 'sleepConsistency',
      consistencyScore: 150,
      source: 'fitbit',
      recordedAt: now,
    }
    expect(validateNormalizedSignal(signal).length).toBeGreaterThan(0)
  })
})

describe('health integration settings workspace builder', () => {
  it('produces a workspace with the correct Phase 3 honest state', () => {
    const snapshot = createDefaultHealthIntegrationSnapshot()
    const workspace = buildHealthIntegrationSettingsWorkspace(snapshot)

    expect(workspace.connectionSummary).toBe('planned')
    expect(workspace.anyProviderConnected).toBe(false)
    expect(workspace.availableSignalCount).toBe(0)
    expect(workspace.providers).toHaveLength(4)
  })

  it('workspace providers all have unavailableLabel and displayName', () => {
    const snapshot = createDefaultHealthIntegrationSnapshot()
    const workspace = buildHealthIntegrationSettingsWorkspace(snapshot)

    for (const provider of workspace.providers) {
      expect(provider.displayName).toBeTruthy()
      expect(provider.unavailableLabel).toBeTruthy()
    }
  })

  it('workspace statusSummaryLabel mentions no providers connected', () => {
    const snapshot = createDefaultHealthIntegrationSnapshot()
    const workspace = buildHealthIntegrationSettingsWorkspace(snapshot)

    expect(workspace.statusSummaryLabel).toContain('No providers connected')
  })

  it('workspace phaseNotice is non-empty and mentions Phase 3 constraints', () => {
    const snapshot = createDefaultHealthIntegrationSnapshot()
    const workspace = buildHealthIntegrationSettingsWorkspace(snapshot)

    expect(workspace.phaseNotice.length).toBeGreaterThan(20)
    expect(workspace.phaseNotice.toLowerCase()).toContain('native')
  })

  it('service returns persisted local health state instead of recreating defaults each call', async () => {
    const snapshot = createDefaultHealthIntegrationSnapshot()
    snapshot.providers[0] = {
      ...snapshot.providers[0],
      status: 'notConnected',
      platformAvailable: true,
      unavailableReason: undefined,
    }
    snapshot.normalizedSignalAvailability.sleepDuration = true
    await localHealthIntegrationRepository.upsert(snapshot)

    const workspace = await healthIntegrationService.getSettingsWorkspace()

    expect(workspace.providers[0]?.status).toBe('notConnected')
    expect(workspace.providers[0]?.platformAvailable).toBe(true)
    expect(workspace.availableSignalCount).toBe(1)
    expect(workspace.connectionSummary).toBe('partiallyConnected')
  })
})
