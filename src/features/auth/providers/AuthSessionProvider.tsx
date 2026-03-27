import type { PropsWithChildren } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { browserLocalPersistence, onAuthStateChanged, setPersistence, signInWithPopup, signOut } from 'firebase/auth'
import { getFirebaseAuth, getGoogleAuthProvider } from '@/lib/firebase/client'
import { hasFirebaseEnv, missingFirebaseEnvKeys } from '@/lib/firebase/config'
import { AuthSessionContext } from '@/features/auth/providers/authSessionContext'
import { bootstrapUserSession } from '@/features/auth/services/bootstrapUserSession'
import type { AuthSessionValue, AuthStatus, SessionUser } from '@/features/auth/types/auth'
import { reportMonitoringError } from '@/services/monitoring/monitoringService'

type AuthState = {
  status: AuthStatus
  user: SessionUser | null
  errorMessage: string | null
}

function getInitialState(): AuthState {
  if (!hasFirebaseEnv) {
    return {
      status: 'missing_config',
      user: null,
      errorMessage: `Firebase configuration is incomplete. Missing: ${missingFirebaseEnvKeys.join(', ')}`,
    }
  }

  return {
    status: 'checking',
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
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        if (!active) {
          return
        }

        if (!firebaseUser) {
          setState({
            status: 'unauthenticated',
            user: null,
            errorMessage: null,
          })

          return
        }

        setState((current) => ({
          ...current,
          status: 'checking',
          errorMessage: null,
        }))

        try {
          await bootstrapUserSession(firebaseUser)

          if (!active) {
            return
          }

          setState({
            status: 'authenticated',
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
          user: null,
          errorMessage: getReadableAuthError(error),
        })
      },
    )

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
            user: null,
            errorMessage: `Firebase configuration is incomplete. Missing: ${missingFirebaseEnvKeys.join(', ')}`,
          })

          return
        }

        const auth = getFirebaseAuth()

        if (!auth) {
          setState({
            status: 'error',
            user: null,
            errorMessage: 'Firebase Auth could not be initialized.',
          })

          return
        }

        setState((current) => ({
          ...current,
          status: 'checking',
          errorMessage: null,
        }))

        try {
          await setPersistence(auth, browserLocalPersistence)
          await signInWithPopup(auth, getGoogleAuthProvider())
        } catch (error) {
          reportMonitoringError({
            domain: 'auth',
            action: 'sign-in-with-google',
            message: 'Google sign-in failed.',
            error,
          })

          setState({
            status: 'unauthenticated',
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
