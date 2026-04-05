import type { ReactNode } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { browserLocalPersistence, getRedirectResult, onAuthStateChanged, setPersistence, signInWithPopup, signInWithRedirect, signOut } from 'firebase/auth'
import { AuthSessionProvider } from '@/features/auth/providers/AuthSessionProvider'
import { useAuthSession } from '@/features/auth/providers/useAuthSession'
import type { GoogleAuthMethod } from '@/lib/firebase/client'

const authModuleMock = vi.hoisted(() => ({
  auth: { name: 'firebase-auth', currentUser: null as null | { uid: string; email: string | null; displayName: string | null; photoURL: string | null } },
  provider: { providerId: 'google.com' },
}))

const bootstrapUserSessionMock = vi.hoisted(() => vi.fn(async () => {}))
const bootstrapGuestSessionMock = vi.hoisted(() => vi.fn(async () => {}))
const clearLocalCalendarSessionArtifactsMock = vi.hoisted(() => vi.fn(async () => {}))
const reportMonitoringErrorMock = vi.hoisted(() => vi.fn())
const resetForgeDbMock = vi.hoisted(() => vi.fn(async () => {}))
const getPrimaryGoogleAuthMethodMock = vi.hoisted(() => vi.fn<() => GoogleAuthMethod>(() => 'redirect'))

vi.mock('firebase/auth', () => ({
  browserLocalPersistence: { type: 'LOCAL' },
  getRedirectResult: vi.fn(),
  onAuthStateChanged: vi.fn(),
  setPersistence: vi.fn(),
  signInWithPopup: vi.fn(),
  signInWithRedirect: vi.fn(),
  signOut: vi.fn(),
}))

vi.mock('@/lib/firebase/config', () => ({
  hasFirebaseEnv: true,
  missingFirebaseEnvKeys: [],
}))

vi.mock('@/lib/firebase/client', () => ({
  getFirebaseAuth: () => authModuleMock.auth,
  getGoogleAuthProvider: () => authModuleMock.provider,
  getPrimaryGoogleAuthMethod: getPrimaryGoogleAuthMethodMock,
}))

vi.mock('@/features/auth/services/bootstrapUserSession', () => ({
  bootstrapUserSession: bootstrapUserSessionMock,
}))

vi.mock('@/features/auth/services/bootstrapGuestSession', () => ({
  bootstrapGuestSession: bootstrapGuestSessionMock,
}))

vi.mock('@/services/calendar/calendarIntegrationService', () => ({
  clearLocalCalendarSessionArtifacts: clearLocalCalendarSessionArtifactsMock,
}))

vi.mock('@/services/monitoring/monitoringService', () => ({
  reportMonitoringError: reportMonitoringErrorMock,
}))

vi.mock('@/data/local/forgeDb', () => ({
  resetForgeDb: resetForgeDbMock,
}))

function TestHarness() {
  const { errorMessage, flowPhase, signInAsGuest, signInWithGoogle, signOutUser, status, user } = useAuthSession()

  return (
    <div>
      <div>{status}</div>
      <div>{flowPhase}</div>
      <div>{user?.email ?? 'no-user'}</div>
      <div>{user?.displayName ?? 'no-name'}</div>
      <div>{errorMessage ?? 'no-error'}</div>
      <button onClick={() => void signInWithGoogle()}>sign in</button>
      <button onClick={() => void signInAsGuest()}>guest in</button>
      <button onClick={() => void signOutUser()}>sign out</button>
    </div>
  )
}

function renderProvider(ui: ReactNode = <TestHarness />) {
  return render(<AuthSessionProvider>{ui}</AuthSessionProvider>)
}

function callAuthObserver(
  next: Parameters<typeof onAuthStateChanged>[1],
  user: {
    uid: string
    email: string | null
    displayName: string | null
    photoURL: string | null
  } | null,
) {
  if (typeof next === 'function') {
    void next(user as never)
    return
  }

  next.next?.(user as never)
}

describe('AuthSessionProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.sessionStorage.clear()
    window.localStorage.clear()
    authModuleMock.auth.currentUser = null
    vi.mocked(setPersistence).mockResolvedValue(undefined)
    vi.mocked(signInWithRedirect).mockResolvedValue(undefined as never)
    vi.mocked(signInWithPopup).mockResolvedValue({} as never)
    vi.mocked(signOut).mockResolvedValue(undefined)
    vi.mocked(getRedirectResult).mockResolvedValue(null)
    getPrimaryGoogleAuthMethodMock.mockReturnValue('redirect')
    vi.mocked(onAuthStateChanged).mockImplementation((_auth, onNext) => {
      callAuthObserver(onNext, null)
      return () => {}
    })
  })

  it('uses redirect sign-in and records the redirect intent before leaving the app', async () => {
    const user = userEvent.setup()

    renderProvider()

    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(setPersistence).toHaveBeenCalledWith(authModuleMock.auth, browserLocalPersistence)
    expect(signInWithRedirect).toHaveBeenCalledWith(authModuleMock.auth, authModuleMock.provider)
    expect(window.sessionStorage.getItem('forge-auth-google-redirect')).toBe('pending')
  })

  it('falls back to popup sign-in on localhost-style runtimes', async () => {
    const user = userEvent.setup()
    getPrimaryGoogleAuthMethodMock.mockReturnValue('popup')

    renderProvider()

    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(signInWithPopup).toHaveBeenCalledWith(authModuleMock.auth, authModuleMock.provider)
    expect(signInWithRedirect).not.toHaveBeenCalled()
    expect(window.sessionStorage.getItem('forge-auth-google-redirect')).toBeNull()
  })

  it('prepares a local guest workspace and authenticates the guest session without Firebase auth', async () => {
    const user = userEvent.setup()

    renderProvider()

    await user.click(screen.getByRole('button', { name: /guest in/i }))

    await waitFor(() => {
      expect(bootstrapGuestSessionMock).toHaveBeenCalled()
      expect(screen.getByText('guest')).toBeInTheDocument()
      expect(screen.getByText('Guest')).toBeInTheDocument()
    })

    expect(window.sessionStorage.getItem('forge-auth-guest-session')).toBe('active')
    expect(window.localStorage.getItem('forge-local-workspace-kind')).toBe('guest')
  })

  it('completes a redirect return and authenticates the restored session', async () => {
    window.sessionStorage.setItem('forge-auth-google-redirect', 'pending')
    authModuleMock.auth.currentUser = {
      uid: 'user-1',
      email: 'operator@forge.test',
      displayName: 'Forge Operator',
      photoURL: null,
    }

    vi.mocked(onAuthStateChanged).mockImplementation((_auth, onNext) => {
      callAuthObserver(onNext, {
        uid: 'user-1',
        email: 'operator@forge.test',
        displayName: 'Forge Operator',
        photoURL: null,
      })
      return () => {}
    })

    renderProvider()

    await waitFor(() => {
      expect(getRedirectResult).toHaveBeenCalledWith(authModuleMock.auth)
      expect(bootstrapUserSessionMock).toHaveBeenCalled()
      expect(screen.getByText('authenticated')).toBeInTheDocument()
      expect(screen.getByText('operator@forge.test')).toBeInTheDocument()
    })

    expect(window.sessionStorage.getItem('forge-auth-google-redirect')).toBeNull()
  })

  it('preserves an already-known Firebase user while bootstrap finishes', async () => {
    authModuleMock.auth.currentUser = {
      uid: 'user-2',
      email: 'known@forge.test',
      displayName: 'Known Operator',
      photoURL: null,
    }

    vi.mocked(onAuthStateChanged).mockImplementation((_auth, onNext) => {
      callAuthObserver(onNext, authModuleMock.auth.currentUser)
      return () => {}
    })

    renderProvider()

    expect(screen.getByText('authenticated')).toBeInTheDocument()
    expect(screen.getByText('known@forge.test')).toBeInTheDocument()

    await waitFor(() => {
      expect(bootstrapUserSessionMock).toHaveBeenCalled()
    })
  })

  it('surfaces redirect-return errors without leaving the redirect intent stuck', async () => {
    window.sessionStorage.setItem('forge-auth-google-redirect', 'pending')
    vi.mocked(getRedirectResult).mockRejectedValue(new Error('Redirect failed'))

    renderProvider()

    await waitFor(() => {
      expect(screen.getByText('unauthenticated')).toBeInTheDocument()
      expect(screen.getByText('Redirect failed')).toBeInTheDocument()
    })

    expect(reportMonitoringErrorMock).toHaveBeenCalled()
    expect(window.sessionStorage.getItem('forge-auth-google-redirect')).toBeNull()
  })

  it('resets the local guest workspace when signing out of a guest session', async () => {
    const user = userEvent.setup()

    renderProvider()

    await user.click(screen.getByRole('button', { name: /guest in/i }))

    await waitFor(() => {
      expect(screen.getByText('guest')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /sign out/i }))

    await waitFor(() => {
      expect(resetForgeDbMock).toHaveBeenCalled()
      expect(screen.getByText('unauthenticated')).toBeInTheDocument()
    })

    expect(window.sessionStorage.getItem('forge-auth-guest-session')).toBeNull()
    expect(window.localStorage.getItem('forge-local-workspace-kind')).toBeNull()
  })
})
