import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { AuthStatusScreen } from '@/features/auth/components/AuthStatusScreen'
import { AuthPage } from '@/features/auth/pages/AuthPage'
import { AboutPage } from '@/features/about/pages/AboutPage'
import { InsightsPage } from '@/features/insights/pages/InsightsPage'
import { useAuthSession } from '@/features/auth/providers/useAuthSession'
import { PlanPage } from '@/features/plan/pages/PlanPage'
import { SettingsPage } from '@/features/settings/pages/SettingsPage'
import { TodayPage } from '@/features/today/pages/TodayPage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<PublicOnlyRoute />} />
        <Route element={<ProtectedLayout />}>
          <Route index element={<TodayPage />} />
          <Route path="/plan" element={<PlanPage />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="/command-center" element={<Navigate to="/insights?view=weekly" replace />} />
          <Route path="/schedule" element={<Navigate to="/plan?view=week" replace />} />
          <Route path="/prep" element={<Navigate to="/plan?view=prep" replace />} />
          <Route path="/physical" element={<Navigate to="/" replace />} />
          <Route path="/readiness" element={<Navigate to="/insights?view=readiness" replace />} />
          <Route path="/about" element={<AboutPage />} />
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
              : 'Checking your session'
        }
        description={
          flowPhase === 'returning'
            ? 'Restoring your workspace.'
            : flowPhase === 'guesting'
              ? 'Loading demo data.'
            : 'This should only take a moment.'
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
            ? 'Opening Google sign-in.'
            : flowPhase === 'guesting'
              ? 'Loading demo data.'
            : flowPhase === 'returning'
              ? 'Restoring your workspace.'
              : 'Checking your session.'
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
