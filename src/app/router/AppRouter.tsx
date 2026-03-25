import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { AuthPage } from '@/features/auth/pages/AuthPage'
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
        <Route path="/auth" element={<AuthPage />} />
        <Route element={<AppShell />}>
          <Route index element={<TodayPage />} />
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
