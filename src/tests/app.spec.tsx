import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '@/App'
import type { AuthSessionValue } from '@/features/auth/types/auth'

const authMock = vi.hoisted(() => {
  const baseValue: AuthSessionValue = {
    status: 'authenticated',
    user: {
      uid: 'user-1',
      email: 'operator@forge.test',
      displayName: 'Forge Operator',
      photoURL: null,
    },
    errorMessage: null,
    signInWithGoogle: vi.fn(async () => {}),
    signOutUser: vi.fn(async () => {}),
  }

  return {
    value: baseValue,
  }
})

vi.mock('@/features/auth/providers/AuthSessionProvider', () => ({
  AuthSessionProvider: ({ children }: { children: ReactNode }) => children,
}))

vi.mock('@/features/auth/providers/useAuthSession', () => ({
  useAuthSession: () => authMock.value,
}))

describe('App', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/')
    authMock.value = {
      status: 'authenticated',
      user: {
        uid: 'user-1',
        email: 'operator@forge.test',
        displayName: 'Forge Operator',
        photoURL: null,
      },
      errorMessage: null,
      signInWithGoogle: vi.fn(async () => {}),
      signOutUser: vi.fn(async () => {}),
    }
  })

  it('renders the Forge shell and primary navigation', async () => {
    render(<App />)

    expect(screen.getByText('Forge')).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: /what should i do now/i })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /schedule/i }).length).toBeGreaterThan(0)
  })

  it('routes unauthenticated users to the auth entry screen', () => {
    authMock.value = {
      ...authMock.value,
      status: 'unauthenticated',
      user: null,
    }

    render(<App />)

    expect(screen.getByRole('heading', { name: /sign in to forge/i })).toBeInTheDocument()
    expect(screen.queryByText('Run the day with clarity.')).not.toBeInTheDocument()
  })

  it('does not keep the Today nav link marked as current after navigating away from root', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.click(screen.getAllByRole('link', { name: /schedule/i })[0])

    expect(await screen.findByRole('heading', { name: /fixed routine, visible at a glance/i })).toBeInTheDocument()

    screen.getAllByRole('link', { name: /^today$/i }).forEach((link) => {
      expect(link).not.toHaveAttribute('aria-current', 'page')
    })
  })
})
