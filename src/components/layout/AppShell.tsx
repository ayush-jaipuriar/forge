import MenuRoundedIcon from '@mui/icons-material/MenuRounded'
import { Box, Button, Container, IconButton, Stack, Typography } from '@mui/material'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { navigationItems } from '@/app/router/navigation'
import { useUiStore } from '@/app/store/uiStore'
import { StatusBadge } from '@/components/status/StatusBadge'

export function AppShell() {
  const location = useLocation()
  const dayMode = useUiStore((state) => state.dayMode)
  const warState = useUiStore((state) => state.warState)

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
                <IconButton
                  aria-label="Open utility actions"
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

          <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', md: 'flex' }, flexWrap: 'wrap' }}>
            {navigationItems.map(({ icon: Icon, label, path }) => {
              const isActive = location.pathname === path

              return (
                <Button
                  key={path}
                  component={NavLink}
                  to={path}
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

function titleFromToken(value: string) {
  return value
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (character) => character.toUpperCase())
    .trim()
}
