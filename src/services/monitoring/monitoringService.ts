export type MonitoringLevel = 'info' | 'warning' | 'error'
export type MonitoringDomain = 'auth' | 'sync' | 'firebase' | 'security' | 'analytics' | 'backup'

export type MonitoringEvent = {
  level: MonitoringLevel
  domain: MonitoringDomain
  action: string
  message: string
  timestamp: string
  metadata?: Record<string, unknown>
}

export const FORGE_MONITORING_EVENT = 'forge:monitoring'

export function reportMonitoringEvent(input: Omit<MonitoringEvent, 'timestamp'>) {
  const event: MonitoringEvent = {
    ...input,
    timestamp: new Date().toISOString(),
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(FORGE_MONITORING_EVENT, { detail: event }))
  }

  if (import.meta.env.DEV) {
    if (event.level === 'error') {
      console.error('[forge-monitoring]', event)
    } else if (event.level === 'warning') {
      console.warn('[forge-monitoring]', event)
    }
  }

  return event
}

export function reportMonitoringError(params: {
  domain: MonitoringDomain
  action: string
  message: string
  error: unknown
  metadata?: Record<string, unknown>
}) {
  return reportMonitoringEvent({
    level: 'error',
    domain: params.domain,
    action: params.action,
    message: params.message,
    metadata: {
      ...params.metadata,
      errorMessage: params.error instanceof Error ? params.error.message : String(params.error),
    },
  })
}
