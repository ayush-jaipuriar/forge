/**
 * Health integration service.
 *
 * This service is the seam between the domain health types and the feature surfaces
 * (Settings, Physical, Readiness). It produces a workspace view that is honest about
 * the current Phase 3 posture: all providers are planned, no data is available.
 *
 * Future phases will extend this service to:
 * - load provider connection state from Firestore
 * - call provider adapters (Apple Health, Google Health Connect, etc.)
 * - return real normalized signal data
 *
 * For now, the service returns a persisted local snapshot with a default fallback.
 * This keeps the seam architecture-ready without inventing fake connected UX.
 */

import { localHealthIntegrationRepository } from '@/data/local'
import {
  deriveHealthConnectionSummary,
  deriveHealthConnectionSummaryLabel,
  deriveHealthPhaseNotice,
  getProviderStatusLabel,
} from '@/domain/health/providers'
import { type HealthIntegrationSettingsWorkspace, type HealthIntegrationSnapshot } from '@/domain/health/types'

// ─── Workspace Builder ────────────────────────────────────────────────────────

/**
 * Builds a HealthIntegrationSettingsWorkspace from the current integration snapshot.
 *
 * This maps the raw snapshot into the display-ready shape that the Settings card,
 * Physical banner, and Readiness banner consume. All field values are derived from
 * the snapshot rather than hardcoded in the UI, so future phases can connect a real
 * snapshot (from Firestore) and the UI will update automatically.
 */
export function buildHealthIntegrationSettingsWorkspace(
  snapshot: HealthIntegrationSnapshot,
): HealthIntegrationSettingsWorkspace {
  const connectedProviders = snapshot.providers.filter((p) => p.status === 'connected')
  const availableSignalCount = Object.values(snapshot.normalizedSignalAvailability).filter(Boolean).length
  const totalSignalCount = Object.keys(snapshot.normalizedSignalAvailability).length

  return {
    connectionSummary: deriveHealthConnectionSummary(snapshot.providers),
    providers: snapshot.providers.map((p) => ({
      provider: p.provider,
      displayName: p.displayName,
      status: p.status,
      unavailableReason: p.unavailableReason,
      unavailableLabel: getProviderStatusLabel(p.status, p.unavailableReason),
      platformAvailable: p.platformAvailable,
      supportedSignalCount: p.supportedSignals.length,
    })),
    availableSignalCount,
    totalSignalCount,
    anyProviderConnected: connectedProviders.length > 0,
    statusSummaryLabel: deriveHealthConnectionSummaryLabel(snapshot.providers),
    phaseNotice: deriveHealthPhaseNotice(snapshot.providers),
  }
}

// ─── Service Singleton ────────────────────────────────────────────────────────

/**
 * Health integration service.
 *
 * getSettingsWorkspace() is called by settingsWorkspaceService and returns
 * the workspace view for the Settings card.
 *
 * Phase 3: returns a local persisted snapshot with a default fallback.
 * Future: load from Firestore, merge with real provider connection state.
 */
export const healthIntegrationService = {
  /**
   * Returns the current health integration workspace for Settings display.
   * In Phase 3 this is already async because it respects the local repository seam.
   */
  async getSettingsWorkspace(): Promise<HealthIntegrationSettingsWorkspace> {
    const snapshot = await localHealthIntegrationRepository.getDefault()
    return buildHealthIntegrationSettingsWorkspace(snapshot)
  },

  /**
   * Returns the current snapshot for persistence baseline purposes.
   * Phase 3 uses local persistence with default fallback; future phases can layer remote state on top.
   */
  async getSnapshot(): Promise<HealthIntegrationSnapshot> {
    return localHealthIntegrationRepository.getDefault()
  },

  async upsertSnapshot(snapshot: HealthIntegrationSnapshot): Promise<void> {
    await localHealthIntegrationRepository.upsert(snapshot)
  },
}
