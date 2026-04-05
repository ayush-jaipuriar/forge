type FirebaseConfig = {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
}

const rawFirebaseConfig: FirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '',
}

export const missingFirebaseEnvKeys = Object.entries(rawFirebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key)

export const hasFirebaseEnv = missingFirebaseEnvKeys.length === 0
export const firebaseAppCheckSiteKey = import.meta.env.VITE_FIREBASE_APPCHECK_SITE_KEY ?? ''
export const hasAppCheckSiteKey = firebaseAppCheckSiteKey.length > 0

export function getFirebaseConfig(): FirebaseConfig {
  return {
    ...rawFirebaseConfig,
  }
}
