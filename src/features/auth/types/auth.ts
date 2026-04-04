export type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated' | 'missing_config' | 'error'
export type AuthFlowPhase = 'idle' | 'redirecting' | 'returning'

export type SessionUser = {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
}

export type AuthSessionValue = {
  status: AuthStatus
  flowPhase: AuthFlowPhase
  user: SessionUser | null
  errorMessage: string | null
  signInWithGoogle: () => Promise<void>
  signOutUser: () => Promise<void>
}
