import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { firebaseConfig, hasFirebaseEnv } from '@/lib/firebase/config'

let cachedProvider: GoogleAuthProvider | null = null

export function getFirebaseApp() {
  if (!hasFirebaseEnv) {
    return null
  }

  return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
}

export function getFirebaseAuth() {
  const app = getFirebaseApp()

  return app ? getAuth(app) : null
}

export function getFirebaseFirestore() {
  const app = getFirebaseApp()

  return app ? getFirestore(app) : null
}

export function getGoogleAuthProvider() {
  if (!cachedProvider) {
    cachedProvider = new GoogleAuthProvider()
    cachedProvider.setCustomParameters({
      prompt: 'select_account',
    })
  }

  return cachedProvider
}
