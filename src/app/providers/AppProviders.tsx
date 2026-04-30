import type { PropsWithChildren } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/query/queryClient'
import { ThemeModeProvider } from '@/app/theme/ThemeModeProvider'
import { AuthSessionProvider } from '@/features/auth/providers/AuthSessionProvider'
import { NotificationProvider } from '@/features/notifications/providers/NotificationProvider'
import { PwaProvider } from '@/features/pwa/providers/PwaProvider'
import { FirebaseSecurityProvider } from '@/features/security/providers/FirebaseSecurityProvider'
import { SyncProvider } from '@/services/sync/SyncProvider'

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ThemeModeProvider>
      <PwaProvider>
        <FirebaseSecurityProvider>
          <QueryClientProvider client={queryClient}>
            <AuthSessionProvider>
              <SyncProvider>
                <NotificationProvider>{children}</NotificationProvider>
              </SyncProvider>
            </AuthSessionProvider>
          </QueryClientProvider>
        </FirebaseSecurityProvider>
      </PwaProvider>
    </ThemeModeProvider>
  )
}
