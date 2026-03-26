export type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated' | 'missing_config' | 'error'

export type SessionUser = {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
}

export type AuthSessionValue = {
  status: AuthStatus
  user: SessionUser | null
  errorMessage: string | null
  signInWithGoogle: () => Promise<void>
  signOutUser: () => Promise<void>
}
