import type { PropsWithChildren } from 'react'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/query/queryClient'
import { forgeTheme } from '@/app/theme/theme'
import { AuthSessionProvider } from '@/features/auth/providers/AuthSessionProvider'
import { SyncProvider } from '@/services/sync/SyncProvider'

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ThemeProvider theme={forgeTheme}>
      <CssBaseline enableColorScheme />
      <QueryClientProvider client={queryClient}>
        <AuthSessionProvider>
          <SyncProvider>{children}</SyncProvider>
        </AuthSessionProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
