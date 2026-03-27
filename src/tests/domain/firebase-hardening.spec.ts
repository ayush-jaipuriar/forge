import { describe, expect, it, vi } from 'vitest'
import {
  initializeForgeAppCheck,
  resolveAppCheckBootstrapOutcome,
} from '@/lib/firebase/appCheck'
import {
  FORGE_MONITORING_EVENT,
  reportMonitoringError,
  reportMonitoringEvent,
} from '@/services/monitoring/monitoringService'

describe('firebase hardening helpers', () => {
  it('keeps App Check local-dev safe by skipping localhost bootstrap when a site key is not configured', () => {
    expect(resolveAppCheckBootstrapOutcome('localhost')).toBe('not-configured')
    expect(resolveAppCheckBootstrapOutcome('127.0.0.1')).toBe('not-configured')
  })

  it('returns a non-throwing outcome when App Check bootstrap is attempted in local development', () => {
    expect(initializeForgeAppCheck('localhost')).toBe('not-configured')
  })

  it('dispatches monitoring events for future operational tooling to subscribe to', () => {
    const listener = vi.fn()
    window.addEventListener(FORGE_MONITORING_EVENT, listener as EventListener)

    const event = reportMonitoringEvent({
      level: 'warning',
      domain: 'analytics',
      action: 'stale-snapshot',
      message: 'Analytics snapshot is stale.',
      metadata: {
        snapshotId: 'rolling-7d',
      },
    })

    expect(event.timestamp).toBeTruthy()
    expect(listener).toHaveBeenCalledTimes(1)

    window.removeEventListener(FORGE_MONITORING_EVENT, listener as EventListener)
  })

  it('normalizes unknown errors into monitoring payloads', () => {
    const event = reportMonitoringError({
      domain: 'sync',
      action: 'queue-replay',
      message: 'Queue replay failed.',
      error: new Error('Replay failed'),
    })

    expect(event.level).toBe('error')
    expect(event.metadata?.errorMessage).toBe('Replay failed')
  })
})
