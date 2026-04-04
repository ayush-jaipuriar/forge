import type { PropsWithChildren } from 'react'
import { useEffect, useMemo, useState } from 'react'
import {
  browserLocalPersistence,
  getRedirectResult,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from 'firebase/auth'
import { getFirebaseAuth, getGoogleAuthProvider, getPrimaryGoogleAuthMethod } from '@/lib/firebase/client'
import { hasFirebaseEnv, missingFirebaseEnvKeys } from '@/lib/firebase/config'
import { AuthSessionContext } from '@/features/auth/providers/authSessionContext'
import { bootstrapUserSession } from '@/features/auth/services/bootstrapUserSession'
import type { AuthFlowPhase, AuthSessionValue, AuthStatus, SessionUser } from '@/features/auth/types/auth'
import { clearLocalCalendarSessionArtifacts } from '@/services/calendar/calendarIntegrationService'
import { reportMonitoringError } from '@/services/monitoring/monitoringService'

const GOOGLE_REDIRECT_INTENT_KEY = 'forge-auth-google-redirect'

type AuthState = {
  status: AuthStatus
  flowPhase: AuthFlowPhase
  user: SessionUser | null
  errorMessage: string | null
}

function getInitialState(): AuthState {
  if (!hasFirebaseEnv) {
    return {
      status: 'missing_config',
      flowPhase: 'idle',
      user: null,
      errorMessage: `Firebase configuration is incomplete. Missing: ${missingFirebaseEnvKeys.join(', ')}`,
    }
  }

  return {
    status: 'checking',
    flowPhase: hasPendingGoogleRedirect() ? 'returning' : 'idle',
    user: null,
    errorMessage: null,
  }
}

export function AuthSessionProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<AuthState>(getInitialState)

  useEffect(() => {
    if (!hasFirebaseEnv) {
      return
    }

    const auth = getFirebaseAuth()

    if (!auth) {
      return
    }

    let active = true
    let unsubscribe = () => {}

    const initializeAuth = async () => {
      if (hasPendingGoogleRedirect()) {
        setState((current) => ({
          ...current,
          status: 'checking',
          flowPhase: 'returning',
          errorMessage: null,
        }))

        try {
          await getRedirectResult(auth)
        } catch (error) {
          reportMonitoringError({
            domain: 'auth',
            action: 'complete-google-redirect',
            message: 'Google redirect sign-in failed after returning to Forge.',
            error,
          })

          clearPendingGoogleRedirect()

          if (active) {
            setState({
              status: 'unauthenticated',
              flowPhase: 'idle',
              user: null,
              errorMessage: getReadableAuthError(error),
            })
          }
        }

        clearPendingGoogleRedirect()
      }

      if (!active) {
        return
      }

      unsubscribe = onAuthStateChanged(
        auth,
        async (firebaseUser) => {
          if (!active) {
            return
          }

          if (!firebaseUser) {
            setState((current) => ({
              status: 'unauthenticated',
              flowPhase: 'idle',
              user: null,
              errorMessage: current.errorMessage,
            }))

            return
          }

          setState((current) => ({
            ...current,
            status: 'checking',
            flowPhase: 'returning',
            errorMessage: null,
          }))

          try {
            await bootstrapUserSession(firebaseUser)

            if (!active) {
              return
            }

            setState({
              status: 'authenticated',
              flowPhase: 'idle',
              user: mapFirebaseUser(firebaseUser),
              errorMessage: null,
            })
          } catch (error) {
            reportMonitoringError({
              domain: 'auth',
              action: 'bootstrap-user-session',
              message: 'Failed to bootstrap the authenticated Firebase session.',
              error,
            })

            if (!active) {
              return
            }

            setState({
              status: 'error',
              flowPhase: 'idle',
              user: null,
              errorMessage: getReadableAuthError(error),
            })
          }
        },
        (error) => {
          reportMonitoringError({
            domain: 'auth',
            action: 'observe-auth-state',
            message: 'Firebase auth state observation failed.',
            error,
          })

          if (!active) {
            return
          }

          setState({
            status: 'error',
            flowPhase: 'idle',
            user: null,
            errorMessage: getReadableAuthError(error),
          })
        },
      )
    }

    void initializeAuth()

    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  const value = useMemo<AuthSessionValue>(
    () => ({
      ...state,
      signInWithGoogle: async () => {
        if (!hasFirebaseEnv) {
          setState({
            status: 'missing_config',
            flowPhase: 'idle',
            user: null,
            errorMessage: `Firebase configuration is incomplete. Missing: ${missingFirebaseEnvKeys.join(', ')}`,
          })

          return
        }

        const auth = getFirebaseAuth()

        if (!auth) {
          setState({
            status: 'error',
            flowPhase: 'idle',
            user: null,
            errorMessage: 'Firebase Auth could not be initialized.',
          })

          return
        }

        setState((current) => ({
          ...current,
          status: 'checking',
          flowPhase: 'redirecting',
          errorMessage: null,
        }))

        try {
          await setPersistence(auth, browserLocalPersistence)
          const authMethod = getPrimaryGoogleAuthMethod()

          if (authMethod === 'redirect') {
            markPendingGoogleRedirect()
            await signInWithRedirect(auth, getGoogleAuthProvider())
            return
          }

          await signInWithPopup(auth, getGoogleAuthProvider())
        } catch (error) {
          clearPendingGoogleRedirect()

          reportMonitoringError({
            domain: 'auth',
            action: 'sign-in-with-google',
            message: 'Google sign-in failed.',
            error,
          })

          setState({
            status: 'unauthenticated',
            flowPhase: 'idle',
            user: null,
            errorMessage: getReadableAuthError(error),
          })
        }
      },
      signOutUser: async () => {
        const auth = getFirebaseAuth()

        if (!auth) {
          setState(getInitialState())
          return
        }

        await clearLocalCalendarSessionArtifacts({
          clearMirrors: true,
        })
        await signOut(auth)
      },
    }),
    [state],
  )

  return <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>
}

function mapFirebaseUser(user: { uid: string; email: string | null; displayName: string | null; photoURL: string | null }): SessionUser {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
  }
}

function getReadableAuthError(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return 'An unknown authentication error occurred.'
}

function hasPendingGoogleRedirect() {
  if (typeof window === 'undefined') {
    return false
  }

  return window.sessionStorage.getItem(GOOGLE_REDIRECT_INTENT_KEY) === 'pending'
}

function markPendingGoogleRedirect() {
  if (typeof window === 'undefined') {
    return
  }

  window.sessionStorage.setItem(GOOGLE_REDIRECT_INTENT_KEY, 'pending')
}

function clearPendingGoogleRedirect() {
  if (typeof window === 'undefined') {
    return
  }

  window.sessionStorage.removeItem(GOOGLE_REDIRECT_INTENT_KEY)
}
