import MenuRoundedIcon from '@mui/icons-material/MenuRounded'
import { useState } from 'react'
import { Box, Button, Container, Drawer, IconButton, Stack, Typography } from '@mui/material'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { navigationItems } from '@/app/router/navigation'
import { useUiStore } from '@/app/store/uiStore'
import { StatusBadge } from '@/components/status/StatusBadge'
import { SyncIndicator } from '@/components/status/SyncIndicator'
import { forgeTokens } from '@/app/theme/tokens'

export function AppShell() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const dayMode = useUiStore((state) => state.dayMode)
  const warState = useUiStore((state) => state.warState)
  const syncStatus = useUiStore((state) => state.syncStatus)

  return (
    <Box sx={{ minHeight: '100vh', pb: { xs: 10, md: 4 } }}>
      <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
        <Stack spacing={3}>
          <Box
            component="header"
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 6,
              px: { xs: 2, md: 3 },
              py: { xs: 2, md: 2.5 },
              background:
                'linear-gradient(180deg, rgba(15, 19, 29, 0.92) 0%, rgba(9, 11, 18, 0.98) 100%)',
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
              <Stack spacing={1}>
                <Typography variant="overline" color="primary.light">
                  Personal Execution OS
                </Typography>
                <Typography variant="h2">Forge</Typography>
                <Typography variant="body2" color="text.secondary">
                  Architecture-first foundation for disciplined daily execution.
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <StatusBadge label={warState === 'onTrack' ? 'On Track' : titleFromToken(warState)} tone={warState} />
                <StatusBadge label={titleFromToken(dayMode)} tone={dayMode} />
                <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
                  <SyncIndicator status={syncStatus} />
                </Box>
                <IconButton
                  aria-label="Open utility actions"
                  onClick={() => setMobileMenuOpen(true)}
                  sx={{
                    display: { xs: 'inline-flex', md: 'none' },
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <MenuRoundedIcon />
                </IconButton>
              </Stack>
            </Stack>
          </Box>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
            <SignalStrip
              eyebrow="Command Tone"
              value="Strict, not noisy"
              detail="The shell should feel like a controlled system, not a dashboard template."
            />
            <SignalStrip
              eyebrow="Execution Priority"
              value="Mobile-first flow"
              detail="Touch interactions and low-friction logging stay central to every screen."
            />
            <SignalStrip
              eyebrow="System Health"
              value={syncStatus === 'stable' ? 'Ready for Firebase wiring' : titleFromToken(syncStatus)}
              detail="Sync-state components are established before offline queue logic is introduced."
            />
          </Stack>

          <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', md: 'flex' }, flexWrap: 'wrap' }}>
            {navigationItems.map(({ icon: Icon, label, path }) => {
              const isActive = location.pathname === path

              return (
                <Button
                  key={path}
                  component={NavLink}
                  to={path}
                  end={path === '/'}
                  startIcon={<Icon fontSize="small" />}
                  color={isActive ? 'primary' : 'inherit'}
                  variant={isActive ? 'contained' : 'outlined'}
                >
                  {label}
                </Button>
              )
            })}
          </Stack>

          <Outlet />
        </Stack>
      </Container>

      <Drawer anchor="right" open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)}>
        <Stack spacing={2} sx={{ width: 320, p: 3 }}>
          <Stack spacing={1}>
            <Typography variant="overline" color="primary.light">
              Navigation
            </Typography>
            <Typography variant="h3">Forge Control Surface</Typography>
            <Typography color="text.secondary">
              Mobile keeps the execution loop close. The drawer carries the surrounding context without bloating the
              bottom bar.
            </Typography>
          </Stack>
          <Stack spacing={1}>
            {navigationItems.map(({ icon: Icon, label, path }) => {
              const isActive = location.pathname === path

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
            <SyncIndicator status={syncStatus} />
          </Stack>
        </Stack>
      </Drawer>

      <Box
        sx={{
          position: 'fixed',
          insetInline: 12,
          bottom: 12,
          zIndex: 20,
          display: { xs: 'block', md: 'none' },
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 5,
            p: 1,
            justifyContent: 'space-between',
            backgroundColor: 'rgba(9, 11, 18, 0.95)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {navigationItems.map(({ icon: Icon, label, path }) => {
            const isActive = location.pathname === path

            return (
              <Button
                key={path}
                component={NavLink}
                to={path}
                end={path === '/'}
                aria-label={label}
                color={isActive ? 'primary' : 'inherit'}
                variant={isActive ? 'contained' : 'text'}
                sx={{ minWidth: 0, px: 1.25 }}
              >
                <Icon fontSize="small" />
              </Button>
            )
          })}
        </Stack>
      </Box>
    </Box>
  )
}

function SignalStrip({ eyebrow, value, detail }: { eyebrow: string; value: string; detail: string }) {
  return (
    <Box
      sx={{
        flex: 1,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 4,
        px: 2,
        py: 1.75,
        background:
          'linear-gradient(180deg, rgba(15, 19, 29, 0.88) 0%, rgba(10, 13, 21, 0.92) 100%)',
        boxShadow: forgeTokens.shadow.card,
      }}
    >
      <Stack spacing={0.5}>
        <Typography variant="overline" color="primary.light">
          {eyebrow}
        </Typography>
        <Typography variant="h3">{value}</Typography>
        <Typography variant="body2" color="text.secondary">
          {detail}
        </Typography>
      </Stack>
    </Box>
  )
}

function titleFromToken(value: string) {
  return value
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (character) => character.toUpperCase())
    .trim()
}
