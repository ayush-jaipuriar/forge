import GoogleIcon from '@mui/icons-material/Google'
import { alpha } from '@mui/material/styles'
import { Alert, Box, Button, Card, CardContent, Stack, Typography } from '@mui/material'
import { missingFirebaseEnvKeys } from '@/lib/firebase/config'
import { useAuthSession } from '@/features/auth/providers/useAuthSession'

export function AuthPage() {
  const { errorMessage, flowPhase, signInAsGuest, signInWithGoogle, status } = useAuthSession()
  const signInDisabled = status === 'checking' || status === 'missing_config'
  const guestDisabled = status === 'checking'

  return (
    <Box
      sx={(theme) => ({
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: { xs: 2, sm: 3, md: 5 },
        py: { xs: 2.5, sm: 4 },
        background:
          theme.palette.mode === 'light'
            ? 'radial-gradient(circle at 20% 18%, rgba(196, 112, 66, 0.12), transparent 30%), linear-gradient(180deg, #fbf3e8 0%, #f4ecdf 100%)'
            : 'radial-gradient(circle at 20% 18%, rgba(202, 117, 68, 0.18), transparent 32%), linear-gradient(180deg, #17130f 0%, #100e0c 100%)',
      })}
    >
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          width: 'min(1040px, 100%)',
        }}
      >
        <Box
          aria-hidden
          sx={(theme) => ({
            position: 'fixed',
            inset: 'auto auto 8% 50%',
            width: { xs: 260, sm: 360, md: 520 },
            height: { xs: 260, sm: 360, md: 520 },
            transform: 'translateX(-50%)',
            borderRadius: '50%',
            backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'light' ? 0.08 : 0.1),
            filter: 'blur(48px)',
            pointerEvents: 'none',
          })}
        />
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 0.9fr) minmax(420px, 0.72fr)' },
            gap: { xs: 2.5, md: 3.5 },
            alignItems: 'center',
          }}
        >
          <Stack spacing={2.25} sx={{ display: { xs: 'none', md: 'flex' } }}>
            <Typography variant="overline" color="primary.light">
              Personal execution OS
            </Typography>
            <Typography
              variant="h1"
              sx={{
                maxWidth: 560,
                fontSize: { md: '4.3rem', lg: '5rem' },
                lineHeight: 0.92,
                letterSpacing: '-0.07em',
              }}
            >
              Start with a clear day.
            </Typography>
            <Typography color="text.secondary" sx={{ maxWidth: 480, fontSize: '1.08rem' }}>
              Forge keeps planning, backups, and daily execution in one calm workspace.
            </Typography>
          </Stack>

        <Card
          data-forge-page-transition="true"
          sx={{
            width: '100%',
            maxWidth: { xs: 520, md: 'none' },
            mx: 'auto',
            borderRadius: { xs: 4, sm: 5 },
            borderColor: (theme) => alpha(theme.palette.text.secondary, theme.palette.mode === 'light' ? 0.18 : 0.22),
            background: (theme) =>
              theme.palette.mode === 'light'
                ? 'rgba(255, 250, 242, 0.94)'
                : 'rgba(35, 29, 23, 0.94)',
            backdropFilter: 'blur(20px)',
            boxShadow: (theme) =>
              theme.palette.mode === 'light'
                ? '0 24px 70px rgba(75, 55, 34, 0.12)'
                : '0 24px 70px rgba(10, 7, 5, 0.32)',
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Stack spacing={2.6}>
              <Typography
                variant="overline"
                color="primary.light"
                sx={{
                  fontSize: { xs: '0.82rem', sm: '0.9rem' },
                  letterSpacing: '0.12em',
                  opacity: 0.86,
                }}
              >
                Forge
              </Typography>
              <Stack spacing={1.2}>
                <Typography
                  variant="h2"
                  sx={{
                    fontSize: { xs: '2.45rem', sm: '3rem' },
                    lineHeight: 0.96,
                    letterSpacing: '-0.05em',
                    maxWidth: { xs: '11ch', sm: '10ch' },
                  }}
                >
                  Sign in to Forge
                </Typography>
                <Typography
                  color="text.primary"
                  sx={{
                    fontSize: { xs: '1.08rem', sm: '1.08rem' },
                    lineHeight: 1.14,
                    maxWidth: { xs: '19ch', sm: '20.5ch' },
                  }}
                >
                  Continue with Google. Use demo mode only for a quick preview.
                </Typography>
              </Stack>
              {status === 'missing_config' ? (
                <Alert severity="warning" variant="outlined">
                  Missing Firebase config in local `.env`: {missingFirebaseEnvKeys.join(', ')}
                </Alert>
              ) : null}
              {errorMessage ? (
                <Alert severity={status === 'missing_config' ? 'warning' : 'error'} variant="outlined">
                  {errorMessage}
                </Alert>
              ) : null}
              <Button
                variant="contained"
                startIcon={<GoogleIcon />}
                onClick={() => void signInWithGoogle()}
                disabled={signInDisabled}
                size="large"
                fullWidth
                sx={{
                  minHeight: { xs: 58, sm: 54 },
                  borderRadius: 4,
                  fontSize: { xs: '1.08rem', sm: '1.06rem' },
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  color: (theme) => (theme.palette.mode === 'light' ? '#fffaf2' : '#17110d'),
                  background: (theme) => theme.palette.primary.main,
                  boxShadow: 'none',
                  '&:hover': {
                    background: (theme) => theme.palette.primary.light,
                  },
                }}
              >
                {status === 'checking' ? 'Connecting...' : 'Continue with Google'}
              </Button>
              <Button
                variant="outlined"
                onClick={() => void signInAsGuest()}
                disabled={guestDisabled}
                size="large"
                fullWidth
                sx={{
                  minHeight: { xs: 58, sm: 54 },
                  borderRadius: 4,
                  fontSize: { xs: '1.04rem', sm: '1rem' },
                  fontWeight: 700,
                  color: 'primary.light',
                  borderColor: (theme) => alpha(theme.palette.primary.light, 0.58),
                  backgroundColor: (theme) => alpha(theme.palette.background.paper, theme.palette.mode === 'light' ? 0.48 : 0.46),
                  '&:hover': {
                    borderColor: (theme) => alpha(theme.palette.primary.light, 0.78),
                    backgroundColor: (theme) => alpha(theme.palette.background.paper, theme.palette.mode === 'light' ? 0.72 : 0.64),
                  },
                }}
              >
                {status === 'checking' && flowPhase === 'guesting'
                  ? 'Preparing demo workspace...'
                  : 'Try demo workspace'}
              </Button>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  fontFamily: '"JetBrains Mono", "SFMono-Regular", monospace',
                  fontSize: { xs: '0.88rem', sm: '0.86rem' },
                  lineHeight: 1.5,
                  maxWidth: '33ch',
                }}
              >
                Demo mode uses local data and clears when you exit.
              </Typography>
            </Stack>
          </CardContent>
        </Card>
        </Box>
      </Box>
    </Box>
  )
}
