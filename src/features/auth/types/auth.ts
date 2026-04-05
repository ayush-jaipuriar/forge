export type AuthStatus = 'checking' | 'authenticated' | 'guest' | 'unauthenticated' | 'missing_config' | 'error'
export type AuthFlowPhase = 'idle' | 'redirecting' | 'returning' | 'guesting'

export type SessionUser = {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  isGuest?: boolean
}

export type AuthSessionValue = {
  status: AuthStatus
  flowPhase: AuthFlowPhase
  user: SessionUser | null
  errorMessage: string | null
  signInWithGoogle: () => Promise<void>
  signInAsGuest: () => Promise<void>
  signOutUser: () => Promise<void>
}
