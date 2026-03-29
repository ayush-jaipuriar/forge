/**
 * Health signal normalization contracts.
 *
 * This module defines the typed seams through which future health providers
 * will contribute data to Forge. The pattern is:
 *
 *   Provider raw data → ProviderAdapter → NormalizedSignal → Forge domain logic
 *
 * In Phase 3, no provider is actually connected, so this module defines the
 * contract shapes only. The functions here are helpers that future adapters
 * will call to produce data in the format Forge expects.
 *
 * This is "architecture-first, honest scaffolding" — the seam exists and is typed,
 * but there is no fake data flowing through it.
 */

import type {
  HealthProvider,
  NormalizedActivitySignal,
  NormalizedHealthSignalData,
  NormalizedRecoverySignal,
  NormalizedSleepConsistencySignal,
  NormalizedSleepSignal,
} from './types'

// ─── Signal Builders ──────────────────────────────────────────────────────────

/**
 * Normalizes raw sleep data from a provider into the Forge sleep signal shape.
 * Future Apple Health and Google Health Connect adapters will call this.
 *
 * @param rawDurationMinutes - Raw sleep duration in minutes from the provider
 * @param source - The provider that produced this data
 * @param recordedAt - ISO timestamp of when the data was recorded
 */
export function normalizeSleepSignal({
  rawDurationMinutes,
  source,
  recordedAt,
}: {
  rawDurationMinutes: number
  source: HealthProvider
  recordedAt: string
}): NormalizedSleepSignal {
  return {
    signal: 'sleepDuration',
    durationHours: Math.round((rawDurationMinutes / 60) * 10) / 10,
    source,
    recordedAt,
  }
}

export function normalizeSleepConsistencySignal({
  rawConsistencyScore,
  source,
  recordedAt,
}: {
  rawConsistencyScore: number
  source: HealthProvider
  recordedAt: string
}): NormalizedSleepConsistencySignal {
  return {
    signal: 'sleepConsistency',
    consistencyScore: Math.max(0, Math.min(100, rawConsistencyScore)),
    source,
    recordedAt,
  }
}

/**
 * Normalizes a raw recovery/readiness score into the Forge recovery signal shape.
 * Future Fitbit and Garmin adapters will call this.
 *
 * @param rawScore - Provider score, already 0–100
 * @param rawLabel - Provider-defined label (e.g. "Good", "Excellent")
 * @param source - The provider that produced this data
 * @param recordedAt - ISO timestamp
 */
export function normalizeRecoverySignal({
  rawScore,
  rawLabel,
  source,
  recordedAt,
}: {
  rawScore: number
  rawLabel: string
  source: HealthProvider
  recordedAt: string
}): NormalizedRecoverySignal {
  return {
    signal: 'recoveryScore',
    score: Math.max(0, Math.min(100, rawScore)),
    label: rawLabel,
    source,
    recordedAt,
  }
}

/**
 * Normalizes a daily step count into the Forge activity signal shape.
 */
export function normalizeStepsSignal({
  rawStepCount,
  source,
  recordedAt,
}: {
  rawStepCount: number
  source: HealthProvider
  recordedAt: string
}): NormalizedActivitySignal {
  return {
    signal: 'steps',
    value: Math.max(0, rawStepCount),
    unit: 'steps',
    source,
    recordedAt,
  }
}

/**
 * Normalizes a resting heart rate reading.
 */
export function normalizeHeartRateSignal({
  rawBpm,
  source,
  recordedAt,
}: {
  rawBpm: number
  source: HealthProvider
  recordedAt: string
}): NormalizedActivitySignal {
  return {
    signal: 'heartRate',
    value: Math.max(0, rawBpm),
    unit: 'bpm',
    source,
    recordedAt,
  }
}

// ─── Signal Validation ────────────────────────────────────────────────────────

/**
 * Validates that a normalized signal is structurally complete and plausible.
 * Used when accepting data from future provider adapters before persisting.
 *
 * Returns an array of validation messages. An empty array means the signal is valid.
 */
export function validateNormalizedSignal(signal: NormalizedHealthSignalData): string[] {
  const issues: string[] = []

  if (!signal.source) {
    issues.push('Signal is missing a source provider.')
  }

  if (!signal.recordedAt || !isValidIso(signal.recordedAt)) {
    issues.push('Signal has an invalid or missing recordedAt timestamp.')
  }

  if (signal.signal === 'sleepDuration') {
    const sleep = signal as NormalizedSleepSignal
    if (sleep.durationHours < 0 || sleep.durationHours > 24) {
      issues.push(`Sleep duration ${sleep.durationHours}h is outside the plausible range.`)
    }
  }

  if (signal.signal === 'sleepConsistency') {
    const consistency = signal as NormalizedSleepConsistencySignal
    if (consistency.consistencyScore < 0 || consistency.consistencyScore > 100) {
      issues.push(`Sleep consistency score ${consistency.consistencyScore} is outside the 0–100 range.`)
    }
  }

  if (signal.signal === 'recoveryScore') {
    const recovery = signal as NormalizedRecoverySignal
    if (recovery.score < 0 || recovery.score > 100) {
      issues.push(`Recovery score ${recovery.score} is outside the 0–100 range.`)
    }
  }

  if (signal.signal === 'steps') {
    const activity = signal as NormalizedActivitySignal
    if (activity.value < 0) {
      issues.push('Step count cannot be negative.')
    }
  }

  if (signal.signal === 'heartRate') {
    const activity = signal as NormalizedActivitySignal
    if (activity.value < 20 || activity.value > 300) {
      issues.push(`Heart rate ${activity.value} bpm is outside the plausible range.`)
    }
  }

  return issues
}

// ─── Local Helpers ────────────────────────────────────────────────────────────

function isValidIso(value: string): boolean {
  try {
    return !Number.isNaN(new Date(value).getTime())
  } catch {
    return false
  }
}
