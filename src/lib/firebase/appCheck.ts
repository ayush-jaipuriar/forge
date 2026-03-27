import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check'
import { getFirebaseApp } from '@/lib/firebase/client'
import { firebaseAppCheckSiteKey, hasAppCheckSiteKey, hasFirebaseEnv } from '@/lib/firebase/config'
import { reportMonitoringError, reportMonitoringEvent } from '@/services/monitoring/monitoringService'

export type AppCheckBootstrapOutcome =
  | 'not-configured'
  | 'skipped-localhost'
  | 'initialized'
  | 'failed'

let appCheckInitialized = false

export function resolveAppCheckBootstrapOutcome(hostname: string): AppCheckBootstrapOutcome {
  if (!hasFirebaseEnv || !hasAppCheckSiteKey) {
    return 'not-configured'
  }

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'skipped-localhost'
  }

  return 'initialized'
}

export function initializeForgeAppCheck(hostname = window.location.hostname): AppCheckBootstrapOutcome {
  const outcome = resolveAppCheckBootstrapOutcome(hostname)

  if (outcome !== 'initialized') {
    return outcome
  }

  if (appCheckInitialized) {
    return 'initialized'
  }

  const app = getFirebaseApp()

  if (!app) {
    return 'not-configured'
  }

  try {
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(firebaseAppCheckSiteKey),
      isTokenAutoRefreshEnabled: true,
    })
    appCheckInitialized = true
    reportMonitoringEvent({
      level: 'info',
      domain: 'security',
      action: 'app-check-initialized',
      message: 'Firebase App Check initialized.',
      metadata: {
        hostname,
      },
    })
    return 'initialized'
  } catch (error) {
    reportMonitoringError({
      domain: 'security',
      action: 'app-check-init-failed',
      message: 'Firebase App Check failed to initialize.',
      error,
      metadata: {
        hostname,
      },
    })
    return 'failed'
  }
}
