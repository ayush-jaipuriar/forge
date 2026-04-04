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
  const { flowPhase, status } = useAuthSession()

  if (status === 'checking') {
    return (
      <AuthStatusScreen
        title={flowPhase === 'returning' ? 'Completing Google sign-in' : 'Verifying your command surface'}
        description={
          flowPhase === 'returning'
            ? 'Forge is finishing the Google redirect and restoring your authenticated workspace.'
            : 'Forge is restoring your session and preparing your authenticated workspace.'
        }
        loading
      />
    )
  }

  if (status !== 'authenticated') {
    return <Navigate to="/auth" replace />
  }

  return <AppShell />
}

function PublicOnlyRoute() {
  const { flowPhase, status } = useAuthSession()

  if (status === 'checking') {
    return (
      <AuthStatusScreen
        title={flowPhase === 'redirecting' ? 'Redirecting to Google' : 'Connecting to Forge'}
        description={
          flowPhase === 'redirecting'
            ? 'Forge is handing this session to Google Sign-In and will return you here once authentication completes.'
            : flowPhase === 'returning'
              ? 'Google has returned to Forge. Restoring your authenticated session before exposing the app.'
              : 'Checking Firebase Auth state before exposing the sign-in surface.'
        }
        loading
      />
    )
  }

  if (status === 'authenticated') {
    return <Navigate to="/" replace />
  }

  return <AuthPage />
}
