import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import MenuRoundedIcon from '@mui/icons-material/MenuRounded'
import { useMemo, useState } from 'react'
import { alpha } from '@mui/material/styles'
import { Avatar, Box, Button, Container, Drawer, IconButton, Stack, Tooltip, Typography } from '@mui/material'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { navigationItems } from '@/app/router/navigation'
import { useUiStore } from '@/app/store/uiStore'
import { forgeTokens } from '@/app/theme/tokens'
import { StatusBadge } from '@/components/status/StatusBadge'
import { SyncIndicator } from '@/components/status/SyncIndicator'
import { useAuthSession } from '@/features/auth/providers/useAuthSession'
import { PwaStatusCard } from '@/features/pwa/components/PwaStatusCard'
import { getPwaSurfaceMode } from '@/features/pwa/pwaStatus'
import { usePwaState } from '@/features/pwa/providers/usePwaState'

const mobileQuickNavPaths = ['/', '/command-center', '/schedule', '/settings']

export function AppShell() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const { signOutUser, user } = useAuthSession()
  const dayMode = useUiStore((state) => state.dayMode)
  const warState = useUiStore((state) => state.warState)
  const syncStatus = useUiStore((state) => state.syncStatus)
  const { applyAppUpdate, canInstall, dismissOfflineReady, isInstalled, isOnline, needRefresh, offlineReady, promptInstall } =
    usePwaState()
  const pwaSurfaceMode = getPwaSurfaceMode({
    pathname: location.pathname,
    isOnline,
    syncStatus,
    canInstall,
    needRefresh,
    offlineReady,
  })

  const activeItem = useMemo(
    () => navigationItems.find((item) => isRouteActive(location.pathname, item.path)) ?? navigationItems[0],
    [location.pathname],
  )
  const mobileQuickNavItems = navigationItems.filter((item) => mobileQuickNavPaths.includes(item.path))

  return (
    <Box sx={{ minHeight: '100vh', background: forgeTokens.gradients.page }}>
      <Box
        sx={{
          minHeight: '100vh',
          display: { xs: 'block', md: 'grid' },
          gridTemplateColumns: { md: '124px minmax(0, 1fr)' },
        }}
      >
        <Box
          component="aside"
          sx={{
            position: 'sticky',
            top: 0,
            height: '100vh',
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            gap: 2,
            borderRight: '1px solid',
            borderColor: 'divider',
            backgroundColor: alpha(forgeTokens.palette.background.nav, 0.92),
            backdropFilter: 'blur(18px)',
            px: 1.5,
            py: 2,
          }}
        >
          <Stack spacing={0.25} alignItems="center" sx={{ px: 0.5 }}>
            <Typography
              variant="overline"
              color="primary.light"
              sx={{ fontSize: '0.82rem', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}
            >
              F
            </Typography>
          </Stack>

          <Stack spacing={0.75} sx={{ flex: 1 }}>
            {navigationItems.map(({ icon: Icon, label, path }) => {
              const isActive = isRouteActive(location.pathname, path)
              const compactLabel = getCompactRailLabel(label)

              return (
                <Tooltip key={path} title={label} placement="right">
                  <Box
                    component={NavLink}
                    to={path}
                    end={path === '/'}
                    aria-label={label}
                    sx={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      px: 1,
                      py: 1.05,
                      borderRadius: 3,
                      color: isActive ? 'text.primary' : 'text.secondary',
                      textDecoration: 'none',
                      backgroundColor: isActive
                        ? alpha(forgeTokens.palette.accent.ember, 0.12)
                        : 'transparent',
                      border: '1px solid',
                      borderColor: isActive ? forgeTokens.palette.border.accent : 'transparent',
                      transition: 'background-color 160ms ease, border-color 160ms ease, color 160ms ease',
                      '&::before': isActive
                        ? {
                            content: '""',
                            position: 'absolute',
                            insetBlock: 8,
                            insetInlineStart: -5,
                            width: 2,
                            borderRadius: 999,
                            backgroundColor: 'primary.main',
                          }
                        : undefined,
                      '&:hover': {
                        backgroundColor: alpha(forgeTokens.palette.background.elevated, 0.72),
                        borderColor: alpha(forgeTokens.palette.text.secondary, 0.18),
                      },
                      '&:focus-visible': {
                        backgroundColor: alpha(forgeTokens.palette.background.elevated, 0.72),
                      },
                    }}
                  >
                    <Stack spacing={0.35} alignItems="center">
                      <Icon fontSize="small" />
                      <Typography
                        sx={{
                          fontSize: '0.62rem',
                          lineHeight: 1.1,
                          color: isActive ? 'text.primary' : 'text.secondary',
                          fontWeight: isActive ? 700 : 600,
                          letterSpacing: '0.015em',
                          textAlign: 'center',
                          maxWidth: 76,
                        }}
                      >
                        {compactLabel}
                      </Typography>
                    </Stack>
                  </Box>
                </Tooltip>
              )
            })}
          </Stack>

          <Stack spacing={1} alignItems="center">
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: alpha(forgeTokens.palette.accent.ember, 0.2),
                color: 'primary.light',
                border: '1px solid',
                borderColor: alpha(forgeTokens.palette.accent.ember, 0.35),
                fontSize: '0.82rem',
                fontWeight: 700,
              }}
            >
              {getUserInitials(user?.displayName ?? user?.email ?? 'Forge')}
            </Avatar>
          </Stack>
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Box
            component="header"
            sx={{
              position: 'sticky',
              top: 0,
              zIndex: 20,
              borderBottom: '1px solid',
              borderColor: 'divider',
              backgroundColor: alpha(forgeTokens.palette.background.shell, 0.84),
              backdropFilter: 'blur(18px)',
            }}
          >
            <Container maxWidth={false} sx={{ px: { xs: 2, md: 3 }, py: { xs: 1.5, md: 1.75 }, maxWidth: 1480 }}>
              <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
                  <IconButton
                    aria-label="Open navigation drawer"
                    onClick={() => setMobileMenuOpen(true)}
                    sx={{
                      display: { xs: 'inline-flex', md: 'none' },
                      border: '1px solid',
                      borderColor: 'divider',
                      backgroundColor: alpha(forgeTokens.palette.background.elevated, 0.56),
                    }}
                  >
                    <MenuRoundedIcon />
                  </IconButton>

                  <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                    <Typography variant="overline" color="primary.light">
                      Personal Execution OS
                    </Typography>
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={{ xs: 0.25, sm: 1 }}
                      alignItems={{ xs: 'flex-start', sm: 'center' }}
                      sx={{ minWidth: 0 }}
                    >
                      <Typography variant="h3" sx={{ whiteSpace: 'nowrap' }}>
                        Forge
                      </Typography>
                      <Typography
                        color="text.secondary"
                        sx={{
                          fontFamily: '"JetBrains Mono", "SFMono-Regular", monospace',
                          fontSize: '0.68rem',
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                          whiteSpace: { xs: 'normal', sm: 'nowrap' },
                        }}
                      >
                        {activeItem.label}
                      </Typography>
                    </Stack>
                  </Stack>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                  <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                    <SyncIndicator status={syncStatus} compact />
                  </Box>
                  <Button
                    variant="outlined"
                    color="inherit"
                    startIcon={<LogoutRoundedIcon fontSize="small" />}
                    onClick={() => void signOutUser()}
                    sx={{ display: { xs: 'none', md: 'inline-flex' }, whiteSpace: 'nowrap' }}
                  >
                    Sign out
                  </Button>
                </Stack>
              </Stack>
            </Container>
          </Box>

          <Box component="main" sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 }, pb: { xs: 12, md: 4 } }}>
            <Container maxWidth={false} sx={{ px: 0, maxWidth: 1480 }}>
              <Stack spacing={3}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1}
                  justifyContent="space-between"
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                >
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    <StatusBadge
                      label={warState === 'onTrack' ? 'On Track' : titleFromToken(warState)}
                      tone={warState}
                    />
                    <StatusBadge label={titleFromToken(dayMode)} tone={dayMode} />
                  </Stack>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: { xs: 'none', lg: 'block' } }}
                  >
                    {user?.displayName ?? user?.email ?? 'Authenticated Operator'}
                  </Typography>
                </Stack>

                {pwaSurfaceMode !== 'hidden' ? (
                  <PwaStatusCard
                    variant={pwaSurfaceMode === 'compact' ? 'compact' : 'card'}
                    isOnline={isOnline}
                    syncStatus={syncStatus}
                    canInstall={canInstall}
                    isInstalled={isInstalled}
                    needRefresh={needRefresh}
                    offlineReady={offlineReady}
                    onInstall={async () => {
                      await promptInstall()
                    }}
                    onApplyUpdate={() => applyAppUpdate()}
                    onDismissOfflineReady={dismissOfflineReady}
                  />
                ) : null}

                <Outlet />
              </Stack>
            </Container>
          </Box>
        </Box>
      </Box>

      <Drawer anchor="left" open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)}>
        <Stack spacing={3} sx={{ width: 320, p: 3 }}>
          <Stack spacing={0.75}>
            <Typography variant="overline" color="primary.light">
              Forge Navigation
            </Typography>
            <Typography variant="h3">Execution surfaces</Typography>
            <Typography color="text.secondary">
              Quick routes stay in the bar. The full map stays in this drawer.
            </Typography>
          </Stack>

          <Stack spacing={1}>
            {navigationItems.map(({ icon: Icon, label, path }) => {
              const isActive = isRouteActive(location.pathname, path)

              return (
                <Button
                  key={path}
                  component={NavLink}
                  to={path}
                  end={path === '/'}
                  onClick={() => setMobileMenuOpen(false)}
                  startIcon={<Icon fontSize="small" />}
                  color={isActive ? 'primary' : 'inherit'}
                  variant={isActive ? 'contained' : 'outlined'}
                  sx={{ justifyContent: 'flex-start' }}
                >
                  {label}
                </Button>
              )
            })}
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <StatusBadge label={warState === 'onTrack' ? 'On Track' : titleFromToken(warState)} tone={warState} />
            <StatusBadge label={titleFromToken(dayMode)} tone={dayMode} />
            <SyncIndicator status={syncStatus} compact />
          </Stack>

          <Button
            variant="outlined"
            color="inherit"
            startIcon={<LogoutRoundedIcon fontSize="small" />}
            onClick={() => void signOutUser()}
            sx={{ alignSelf: 'flex-start' }}
          >
            Sign out
          </Button>
        </Stack>
      </Drawer>

      <Box
        sx={{
          position: 'fixed',
          insetInline: 12,
          bottom: 12,
          zIndex: 30,
          display: { xs: 'block', md: 'none' },
        }}
      >
        <Stack
          direction="row"
          spacing={0.75}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 4,
            p: 0.75,
            justifyContent: 'space-between',
            backgroundColor: alpha(forgeTokens.palette.background.shell, 0.94),
            backdropFilter: 'blur(18px)',
          }}
        >
          {mobileQuickNavItems.map(({ icon: Icon, label, path }) => {
            const isActive = isRouteActive(location.pathname, path)

            return (
              <Box
                key={path}
                component={NavLink}
                to={path}
                end={path === '/'}
                aria-label={label}
                sx={{
                  flex: 1,
                  minWidth: 0,
                  textDecoration: 'none',
                  borderRadius: 3,
                  px: 0.75,
                  py: 0.75,
                  backgroundColor: isActive ? alpha(forgeTokens.palette.accent.ember, 0.14) : 'transparent',
                  border: '1px solid',
                  borderColor: isActive ? forgeTokens.palette.border.accent : 'transparent',
                  color: isActive ? 'text.primary' : 'text.secondary',
                  '&:focus-visible': {
                    backgroundColor: alpha(forgeTokens.palette.background.elevated, 0.72),
                  },
                }}
              >
                <Stack spacing={0.35} alignItems="center">
                  <Icon fontSize="small" />
                  <Typography
                    sx={{
                      fontFamily: '"Plus Jakarta Sans", "Inter", "Segoe UI", sans-serif',
                      fontSize: '0.54rem',
                      fontWeight: isActive ? 700 : 600,
                      lineHeight: 1,
                    }}
                  >
                    {getCompactNavigationLabel(label)}
                  </Typography>
                </Stack>
              </Box>
            )
          })}

          <Box
            component="button"
            type="button"
            aria-label="Open navigation drawer"
            onClick={() => setMobileMenuOpen(true)}
            sx={{
              flex: 1,
              minWidth: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              borderRadius: 3,
              px: 0.75,
              py: 0.75,
              border: '1px solid',
              borderColor: 'divider',
              color: 'text.secondary',
              backgroundColor: 'transparent',
              appearance: 'none',
              cursor: 'pointer',
            }}
          >
            <Stack spacing={0.35} alignItems="center">
              <MenuRoundedIcon fontSize="small" />
              <Typography
                sx={{
                  fontFamily: '"Plus Jakarta Sans", "Inter", "Segoe UI", sans-serif',
                  fontSize: '0.54rem',
                  fontWeight: 600,
                  lineHeight: 1,
                }}
              >
                Menu
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </Box>
    </Box>
  )
}

function getCompactNavigationLabel(label: string) {
  switch (label) {
    case 'Command Center':
      return 'Command'
    case 'Settings':
      return 'Settings'
    default:
      return label
  }
}

function getCompactRailLabel(label: string) {
  switch (label) {
    case 'Command Center':
      return 'Command'
    case 'Readiness':
      return 'Ready'
    default:
      return label
  }
}

function getUserInitials(value: string) {
  return value
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((segment) => segment[0]?.toUpperCase() ?? '')
    .join('')
}

function isRouteActive(pathname: string, path: string) {
  if (path === '/') {
    return pathname === '/'
  }

  return pathname.startsWith(path)
}

function titleFromToken(value: string) {
  return value
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (character) => character.toUpperCase())
    .trim()
}
