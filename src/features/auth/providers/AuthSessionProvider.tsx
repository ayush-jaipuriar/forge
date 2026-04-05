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
import { bootstrapGuestSession } from '@/features/auth/services/bootstrapGuestSession'
import { bootstrapUserSession } from '@/features/auth/services/bootstrapUserSession'
import type { AuthFlowPhase, AuthSessionValue, AuthStatus, SessionUser } from '@/features/auth/types/auth'
import { clearLocalCalendarSessionArtifacts } from '@/services/calendar/calendarIntegrationService'
import { reportMonitoringError } from '@/services/monitoring/monitoringService'
import { resetForgeDb } from '@/data/local/forgeDb'

const GOOGLE_REDIRECT_INTENT_KEY = 'forge-auth-google-redirect'
const GUEST_SESSION_INTENT_KEY = 'forge-auth-guest-session'
const WORKSPACE_KIND_KEY = 'forge-local-workspace-kind'

type AuthState = {
  status: AuthStatus
  flowPhase: AuthFlowPhase
  user: SessionUser | null
  errorMessage: string | null
}

function getInitialState(): AuthState {
  if (hasPendingGuestSession()) {
    return {
      status: 'checking',
      flowPhase: 'guesting',
      user: null,
      errorMessage: null,
    }
  }

  if (!hasFirebaseEnv) {
    return {
      status: 'missing_config',
      flowPhase: 'idle',
      user: null,
      errorMessage: `Firebase configuration is incomplete. Missing: ${missingFirebaseEnvKeys.join(', ')}`,
    }
  }

  const auth = getFirebaseAuth()
  const currentUser = auth?.currentUser ?? null
  const mappedUser = currentUser ? mapFirebaseUser(currentUser) : null

  return {
    status: mappedUser ? 'authenticated' : 'checking',
    flowPhase: hasPendingGoogleRedirect() ? 'returning' : 'idle',
    user: mappedUser,
    errorMessage: null,
  }
}

export function AuthSessionProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<AuthState>(getInitialState)

  useEffect(() => {
    let active = true
    let unsubscribe = () => {}

    const initializeGuestSession = async () => {
      setState({
        status: 'checking',
        flowPhase: 'guesting',
        user: null,
        errorMessage: null,
      })

      try {
        await bootstrapGuestSession()

        if (!active) {
          return
        }

        markWorkspaceKind('guest')
        setState({
          status: 'guest',
          flowPhase: 'idle',
          user: getGuestSessionUser(),
          errorMessage: null,
        })
      } catch (error) {
        reportMonitoringError({
          domain: 'auth',
          action: 'bootstrap-guest-session',
          message: 'Forge could not prepare the guest workspace.',
          error,
        })

        clearPendingGuestSession()
        clearWorkspaceKind()

        if (!active) {
          return
        }

        setState({
          status: hasFirebaseEnv ? 'unauthenticated' : 'missing_config',
          flowPhase: 'idle',
          user: null,
          errorMessage: getReadableAuthError(error),
        })
      }
    }

    if (hasPendingGuestSession()) {
      void initializeGuestSession()

      return () => {
        active = false
        unsubscribe()
      }
    }

    if (!hasFirebaseEnv) {
      return () => {
        active = false
        unsubscribe()
      }
    }

    const auth = getFirebaseAuth()

    if (!auth) {
      return () => {
        active = false
        unsubscribe()
      }
    }

    const initializeAuth = async () => {

      if (hasPendingGoogleRedirect()) {
        setState((current) => ({
          ...current,
          status: current.user ? 'authenticated' : 'checking',
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

          const mappedUser = mapFirebaseUser(firebaseUser)
          setState((current) => ({
            ...current,
            status: 'authenticated',
            flowPhase: current.flowPhase === 'returning' ? 'returning' : 'idle',
            user: mappedUser,
            errorMessage: null,
          }))

          try {
            if (hasGuestWorkspace()) {
              await resetForgeDb()
              clearWorkspaceKind()
            }

            await bootstrapUserSession(firebaseUser)

            if (!active) {
              return
            }

            markWorkspaceKind('user')
            setState({
              status: 'authenticated',
              flowPhase: 'idle',
              user: mappedUser,
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
        clearPendingGuestSession()

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
      signInAsGuest: async () => {
        clearPendingGoogleRedirect()
        markPendingGuestSession()
        setState({
          status: 'checking',
          flowPhase: 'guesting',
          user: null,
          errorMessage: null,
        })

        try {
          await bootstrapGuestSession()
          markWorkspaceKind('guest')

          setState({
            status: 'guest',
            flowPhase: 'idle',
            user: getGuestSessionUser(),
            errorMessage: null,
          })
        } catch (error) {
          clearPendingGuestSession()
          clearWorkspaceKind()

          reportMonitoringError({
            domain: 'auth',
            action: 'sign-in-as-guest',
            message: 'Forge could not start the guest workspace.',
            error,
          })

          setState({
            status: hasFirebaseEnv ? 'unauthenticated' : 'missing_config',
            flowPhase: 'idle',
            user: null,
            errorMessage: getReadableAuthError(error),
          })
        }
      },
      signOutUser: async () => {
        if (state.status === 'guest' || state.user?.isGuest) {
          clearPendingGoogleRedirect()
          clearPendingGuestSession()
          clearWorkspaceKind()
          await resetForgeDb()
          setState({
            status: hasFirebaseEnv ? 'unauthenticated' : 'missing_config',
            flowPhase: 'idle',
            user: null,
            errorMessage: hasFirebaseEnv
              ? null
              : `Firebase configuration is incomplete. Missing: ${missingFirebaseEnvKeys.join(', ')}`,
          })
          return
        }

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
    isGuest: false,
  }
}

function getGuestSessionUser(): SessionUser {
  return {
    uid: 'guest-local',
    email: null,
    displayName: 'Guest',
    photoURL: null,
    isGuest: true,
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

function hasPendingGuestSession() {
  if (typeof window === 'undefined') {
    return false
  }

  return window.sessionStorage.getItem(GUEST_SESSION_INTENT_KEY) === 'active'
}

function markPendingGuestSession() {
  if (typeof window === 'undefined') {
    return
  }

  window.sessionStorage.setItem(GUEST_SESSION_INTENT_KEY, 'active')
}

function clearPendingGuestSession() {
  if (typeof window === 'undefined') {
    return
  }

  window.sessionStorage.removeItem(GUEST_SESSION_INTENT_KEY)
}

function hasGuestWorkspace() {
  if (typeof window === 'undefined') {
    return false
  }

  return window.localStorage.getItem(WORKSPACE_KIND_KEY) === 'guest'
}

function markWorkspaceKind(kind: 'guest' | 'user') {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(WORKSPACE_KIND_KEY, kind)
}

function clearWorkspaceKind() {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(WORKSPACE_KIND_KEY)
}
