import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getFunctions } from 'firebase/functions'
import { getStorage } from 'firebase/storage'
import { getFirebaseConfig, hasFirebaseEnv } from '@/lib/firebase/config'

let cachedProvider: GoogleAuthProvider | null = null
export type GoogleAuthMethod = 'redirect' | 'popup'

export function getFirebaseApp() {
  if (!hasFirebaseEnv) {
    return null
  }

  return getApps().length > 0 ? getApp() : initializeApp(getFirebaseConfig())
}

export function getFirebaseAuth() {
  const app = getFirebaseApp()

  return app ? getAuth(app) : null
}

export function getFirebaseFirestore() {
  const app = getFirebaseApp()

  return app ? getFirestore(app) : null
}

export function getFirebaseStorage() {
  const app = getFirebaseApp()

  return app ? getStorage(app) : null
}

export function getFirebaseFunctions() {
  const app = getFirebaseApp()

  return app ? getFunctions(app, 'asia-south1') : null
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

export function getPrimaryGoogleAuthMethod(): GoogleAuthMethod {
  // Popup is the most reliable browser-wide default for Forge today.
  // Redirect auth remains implemented in the provider, but it should only
  // become the primary path again once the hosted OAuth callback setup is
  // explicitly aligned outside the repo.
  return 'popup'
}
