import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { AuthStatusScreen } from '@/features/auth/components/AuthStatusScreen'
import { AuthPage } from '@/features/auth/pages/AuthPage'
import { CommandCenterPage } from '@/features/command-center/pages/CommandCenterPage'
import { useAuthSession } from '@/features/auth/providers/useAuthSession'
import { PhysicalPage } from '@/features/physical/pages/PhysicalPage'
import { PrepPage } from '@/features/prep/pages/PrepPage'
import { ReadinessPage } from '@/features/readiness/pages/ReadinessPage'
import { SchedulePage } from '@/features/schedule/pages/SchedulePage'
import { SettingsPage } from '@/features/settings/pages/SettingsPage'
import { TodayPage } from '@/features/today/pages/TodayPage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<PublicOnlyRoute />} />
        <Route element={<ProtectedLayout />}>
          <Route index element={<TodayPage />} />
          <Route path="/command-center" element={<CommandCenterPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/prep" element={<PrepPage />} />
          <Route path="/physical" element={<PhysicalPage />} />
          <Route path="/readiness" element={<ReadinessPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

function ProtectedLayout() {
  const { flowPhase, status, user } = useAuthSession()

  if (status === 'checking' && !user) {
    return (
      <AuthStatusScreen
        title={
          flowPhase === 'returning'
            ? 'Completing Google sign-in'
            : flowPhase === 'guesting'
              ? 'Preparing guest workspace'
              : 'Verifying your command surface'
        }
        description={
          flowPhase === 'returning'
            ? 'Restoring your workspace.'
            : flowPhase === 'guesting'
              ? 'Seeding demo data for a local guest session.'
            : 'Checking your session.'
        }
        loading
      />
    )
  }

  if (status !== 'authenticated' && status !== 'guest') {
    return <Navigate to="/auth" replace />
  }

  return <AppShell />
}

function PublicOnlyRoute() {
  const { flowPhase, status } = useAuthSession()

  if (status === 'checking') {
    return (
      <AuthStatusScreen
        title={
          flowPhase === 'redirecting'
            ? 'Redirecting to Google'
            : flowPhase === 'guesting'
              ? 'Preparing guest workspace'
              : 'Connecting to Forge'
        }
        description={
          flowPhase === 'redirecting'
            ? 'Leaving Forge for sign-in.'
            : flowPhase === 'guesting'
              ? 'Building a temporary local demo session.'
            : flowPhase === 'returning'
              ? 'Google returned. Restoring Forge.'
              : 'Checking Firebase Auth.'
        }
        loading
      />
    )
  }

  if (status === 'authenticated' || status === 'guest') {
    return <Navigate to="/" replace />
  }

  return <AuthPage />
}
