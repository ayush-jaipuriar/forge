import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import MenuRoundedIcon from '@mui/icons-material/MenuRounded'
import { useMemo, useState } from 'react'
import { alpha } from '@mui/material/styles'
import { Avatar, Box, Button, Container, Drawer, IconButton, Stack, Tooltip, Typography } from '@mui/material'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { navigationItems } from '@/app/router/navigation'
import { useUiStore } from '@/app/store/uiStore'
import { StatusBadge } from '@/components/status/StatusBadge'
import { SyncIndicator } from '@/components/status/SyncIndicator'
import { useAuthSession } from '@/features/auth/providers/useAuthSession'
import { PwaStatusCard } from '@/features/pwa/components/PwaStatusCard'
import { getPwaSurfaceMode } from '@/features/pwa/pwaStatus'
import { usePwaState } from '@/features/pwa/providers/usePwaState'

const mobileQuickNavPaths = ['/', '/plan', '/insights', '/settings']

export function AppShell() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const { signInWithGoogle, signOutUser, user } = useAuthSession()
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
    () => navigationItems.find((item) => isRouteActive(location.pathname, item.path)) ?? null,
    [location.pathname],
  )
  const activeRouteLabel = activeItem?.label ?? getSecondaryRouteLabel(location.pathname)
  const mobileQuickNavItems = navigationItems.filter((item) => mobileQuickNavPaths.includes(item.path))
  const showSyncIndicator = syncStatus !== 'stable'
  const showOperationalSignals = warState !== 'onTrack' || dayMode !== 'normal' || showSyncIndicator

  return (
    <Box sx={(theme) => ({ minHeight: '100vh', background: theme.palette.background.default })}>
      <Box
        sx={{
          minHeight: '100vh',
          display: { xs: 'block', md: 'grid' },
          gridTemplateColumns: { md: '108px minmax(0, 1fr)' },
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
            gap: 1.5,
            borderRight: '1px solid',
            borderColor: 'divider',
            backgroundColor: (theme) => alpha(theme.palette.background.default, theme.palette.mode === 'light' ? 0.7 : 0.82),
            backdropFilter: 'blur(16px)',
            px: 1.25,
            py: 1.75,
          }}
        >
          <Stack spacing={0.5} alignItems="center" sx={{ px: 0.25 }}>
            <Typography
              variant="overline"
              color="primary.light"
              sx={{ fontSize: '0.8rem', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}
            >
              F
            </Typography>
          </Stack>

          <Stack spacing={0.5} sx={{ flex: 1 }}>
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
                      px: 0.85,
                      py: 0.95,
                      borderRadius: 2.75,
                      color: isActive ? 'text.primary' : 'text.secondary',
                      textDecoration: 'none',
                      backgroundColor: (theme) =>
                        isActive ? alpha(theme.palette.primary.main, theme.palette.mode === 'light' ? 0.08 : 0.1) : 'transparent',
                      border: '1px solid',
                      borderColor: 'transparent',
                      transition: 'background-color 160ms ease, border-color 160ms ease, color 160ms ease, transform 160ms ease, box-shadow 160ms ease',
                      '&::before': isActive
                        ? {
                            content: '""',
                            position: 'absolute',
                            insetBlock: 10,
                            insetInlineStart: -4,
                            width: 2,
                            borderRadius: 999,
                            backgroundColor: 'primary.main',
                          }
                        : undefined,
                      '&:hover': {
                        backgroundColor: (theme) => alpha(theme.palette.background.paper, theme.palette.mode === 'light' ? 0.54 : 0.36),
                        color: 'text.primary',
                        transform: 'translateX(1px)',
                      },
                      '&:focus-visible': {
                        outline: 'none',
                        backgroundColor: (theme) => alpha(theme.palette.background.paper, theme.palette.mode === 'light' ? 0.6 : 0.44),
                        boxShadow: (theme) => `0 0 0 2px ${alpha(theme.palette.primary.main, 0.22)}`,
                      },
                    }}
                  >
                    <Stack spacing={0.35} alignItems="center">
                      <Icon fontSize="small" />
                      <Typography
                        sx={{
                          fontSize: '0.6rem',
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

          <Stack spacing={0.75} alignItems="center">
            <Avatar
              sx={{
                width: 34,
                height: 34,
                bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.mode === 'light' ? 0.12 : 0.18),
                color: 'primary.light',
                border: '1px solid',
                borderColor: (theme) => alpha(theme.palette.primary.main, 0.32),
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
              backgroundColor: (theme) => alpha(theme.palette.background.default, theme.palette.mode === 'light' ? 0.74 : 0.82),
              backdropFilter: 'blur(16px)',
            }}
          >
            <Container maxWidth={false} sx={{ px: { xs: 2, md: 3 }, py: { xs: 1.25, md: 1.35 }, maxWidth: 1480 }}>
              <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
                  <IconButton
                    aria-label="Open navigation drawer"
                    aria-controls="forge-mobile-navigation-drawer"
                    aria-expanded={mobileMenuOpen}
                    onClick={() => setMobileMenuOpen(true)}
                    sx={{
                      display: { xs: 'inline-flex', md: 'none' },
                      border: '1px solid',
                      borderColor: 'divider',
                      backgroundColor: (theme) => alpha(theme.palette.background.paper, theme.palette.mode === 'light' ? 0.54 : 0.34),
                    }}
                  >
                    <MenuRoundedIcon />
                  </IconButton>

                  <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                    <Typography
                      variant="overline"
                      color="primary.light"
                      sx={{ fontSize: '0.62rem', letterSpacing: '0.14em' }}
                    >
                      Personal planner
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={0.9}
                      alignItems="baseline"
                      sx={{ minWidth: 0 }}
                    >
                      <Typography variant="h3" sx={{ whiteSpace: 'nowrap', fontSize: { xs: '1.52rem', md: '1.6rem' } }}>
                        Forge
                      </Typography>
                      <Typography
                        color="text.secondary"
                        sx={{
                          fontFamily: '"JetBrains Mono", "SFMono-Regular", monospace',
                          fontSize: '0.66rem',
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {activeRouteLabel}
                      </Typography>
                    </Stack>
                  </Stack>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                  {showSyncIndicator ? (
                    <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                      <SyncIndicator status={syncStatus} compact />
                    </Box>
                  ) : null}
                  <Button
                    component={NavLink}
                    to="/about"
                    color="inherit"
                    sx={{
                      display: { xs: 'none', lg: 'inline-flex' },
                      minWidth: 0,
                      px: 1.1,
                      color: 'text.secondary',
                      '&:hover': {
                        color: 'text.primary',
                        backgroundColor: (theme) => alpha(theme.palette.background.paper, theme.palette.mode === 'light' ? 0.5 : 0.34),
                      },
                    }}
                  >
                    About
                  </Button>
                  {user?.isGuest ? (
                    <Button
                      variant="contained"
                      onClick={() => void signInWithGoogle()}
                      sx={{ display: { xs: 'none', md: 'inline-flex' }, whiteSpace: 'nowrap' }}
                    >
                      Sign in
                    </Button>
                  ) : (
                    <Button
                      variant="outlined"
                      color="inherit"
                      startIcon={<LogoutRoundedIcon fontSize="small" />}
                      onClick={() => void signOutUser()}
                      sx={{ display: { xs: 'none', md: 'inline-flex' }, whiteSpace: 'nowrap' }}
                    >
                      Sign out
                    </Button>
                  )}
                </Stack>
              </Stack>
            </Container>
          </Box>

          <Box component="main" sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 }, pb: { xs: 12, md: 4 } }}>
            <Container maxWidth={false} sx={{ px: 0, maxWidth: 1480 }}>
              <Stack spacing={3}>
                {showOperationalSignals ? (
                  <Stack
                    direction="row"
                    spacing={0.9}
                    useFlexGap
                    flexWrap="wrap"
                    alignItems="center"
                    sx={{
                      minHeight: 28,
                    }}
                  >
                    {warState !== 'onTrack' ? (
                      <StatusBadge label={titleFromToken(warState)} tone={warState} />
                    ) : null}
                    {dayMode !== 'normal' ? <StatusBadge label={titleFromToken(dayMode)} tone={dayMode} /> : null}
                    {showSyncIndicator ? <SyncIndicator status={syncStatus} compact /> : null}
                  </Stack>
                ) : null}

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

                <Box data-forge-page-transition="true">
                  <Outlet />
                </Box>
              </Stack>
            </Container>
          </Box>
        </Box>
      </Box>

      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        PaperProps={{ id: 'forge-mobile-navigation-drawer' }}
      >
        <Stack spacing={3} sx={{ width: 320, p: 3 }}>
          <Stack spacing={0.5}>
            <Typography variant="overline" color="primary.light">
              Forge
            </Typography>
            <Typography variant="h3">Navigation</Typography>
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
                  variant={isActive ? 'contained' : 'text'}
                  sx={{ justifyContent: 'flex-start' }}
                >
                  {label}
                </Button>
              )
            })}
          </Stack>

          {showOperationalSignals ? (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {warState !== 'onTrack' ? <StatusBadge label={titleFromToken(warState)} tone={warState} /> : null}
              {dayMode !== 'normal' ? <StatusBadge label={titleFromToken(dayMode)} tone={dayMode} /> : null}
              {showSyncIndicator ? <SyncIndicator status={syncStatus} compact /> : null}
            </Stack>
          ) : null}

          <Button
            component={NavLink}
            to="/about"
            variant="text"
            color="inherit"
            onClick={() => setMobileMenuOpen(false)}
            sx={{ alignSelf: 'flex-start', px: 0 }}
          >
            About Forge
          </Button>

          {user?.isGuest ? (
            <Stack spacing={1} alignItems="flex-start">
              <Button variant="contained" onClick={() => void signInWithGoogle()}>
                Sign in to save progress
              </Button>
              <Button variant="text" color="inherit" onClick={() => void signOutUser()} sx={{ px: 0 }}>
                Leave demo
              </Button>
            </Stack>
          ) : (
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<LogoutRoundedIcon fontSize="small" />}
              onClick={() => void signOutUser()}
              sx={{ alignSelf: 'flex-start' }}
            >
              Sign out
            </Button>
          )}
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
            borderRadius: 3.5,
            p: 0.6,
            justifyContent: 'space-between',
            backgroundColor: (theme) => alpha(theme.palette.background.default, theme.palette.mode === 'light' ? 0.82 : 0.88),
            backdropFilter: 'blur(14px)',
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
                  borderRadius: 2.5,
                  px: 0.75,
                  py: 0.65,
                  backgroundColor: (theme) => (isActive ? alpha(theme.palette.primary.main, theme.palette.mode === 'light' ? 0.08 : 0.1) : 'transparent'),
                  border: '1px solid',
                  borderColor: 'transparent',
                  color: isActive ? 'text.primary' : 'text.secondary',
                  '&:focus-visible': {
                    outline: 'none',
                    backgroundColor: (theme) => alpha(theme.palette.background.paper, theme.palette.mode === 'light' ? 0.62 : 0.5),
                    boxShadow: (theme) => `0 0 0 2px ${alpha(theme.palette.primary.main, 0.22)}`,
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
            aria-controls="forge-mobile-navigation-drawer"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(true)}
            sx={{
              flex: 1,
              minWidth: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              borderRadius: 2.5,
              px: 0.75,
              py: 0.65,
              border: '1px solid',
              borderColor: 'divider',
              color: 'text.secondary',
              backgroundColor: 'transparent',
              appearance: 'none',
              cursor: 'pointer',
              transition: 'background-color 160ms ease, border-color 160ms ease, color 160ms ease, transform 160ms ease',
              '&:hover': {
                backgroundColor: (theme) => alpha(theme.palette.background.paper, theme.palette.mode === 'light' ? 0.66 : 0.42),
                transform: 'translateY(-1px)',
              },
              '&:active': {
                transform: 'translateY(0)',
              },
              '&:focus-visible': {
                outline: 'none',
                backgroundColor: (theme) => alpha(theme.palette.background.paper, theme.palette.mode === 'light' ? 0.62 : 0.5),
                boxShadow: (theme) => `0 0 0 2px ${alpha(theme.palette.primary.main, 0.22)}`,
              },
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
    case 'Insights':
    case 'Settings':
    case 'Today':
    case 'Plan':
      return label
    default:
      return label
  }
}

function getCompactRailLabel(label: string) {
  switch (label) {
    case 'Insights':
      return 'Insights'
    default:
      return label
  }
}

function getSecondaryRouteLabel(pathname: string) {
  if (pathname.startsWith('/about')) {
    return 'About'
  }

  return 'Forge'
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
