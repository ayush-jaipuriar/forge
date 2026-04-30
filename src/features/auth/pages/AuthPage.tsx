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
      sx={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        px: { xs: 2, sm: 3.5, md: 5 },
        py: { xs: 2.5, sm: 3.5, md: 4.5 },
        background: (theme) =>
          theme.palette.mode === 'light'
            ? 'radial-gradient(circle at 14% 37%, rgba(184, 102, 61, 0.12), transparent 22%), radial-gradient(circle at 80% 18%, rgba(146, 104, 55, 0.08), transparent 21%), linear-gradient(180deg, #fff8ef 0%, #f7f2ea 100%)'
            : 'radial-gradient(circle at 14% 37%, rgba(200, 111, 66, 0.26), transparent 22%), radial-gradient(circle at 80% 18%, rgba(120, 116, 105, 0.16), transparent 21%), linear-gradient(180deg, #17130f 0%, #12100d 100%)',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          zIndex: 0,
          width: 'min(1180px, 100%)',
          minHeight: { xs: 'calc(100svh - 20px)', sm: 'calc(100svh - 28px)', md: 'calc(100vh - 36px)' },
        }}
      >
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              insetInline: 0,
              top: { xs: 0, md: 6 },
              height: { xs: '62%', md: 560 },
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                left: { xs: '6%', md: '9%' },
                top: { xs: 18, md: 24 },
                width: { xs: '34%', md: 290 },
                height: { xs: 150, sm: 200, md: 260 },
                backgroundColor: (theme) => alpha(theme.palette.primary.light, theme.palette.mode === 'light' ? 0.08 : 0.12),
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                left: { xs: '37%', md: '33%' },
                top: { xs: 26, md: 40 },
                width: { xs: '14%', md: 140 },
                height: { xs: 98, sm: 128, md: 150 },
                backgroundColor: (theme) => alpha(theme.palette.primary.light, theme.palette.mode === 'light' ? 0.06 : 0.1),
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                left: { xs: '25%', md: '31%' },
                top: { xs: -42, md: -64 },
                width: { xs: '22%', md: 220 },
                height: { xs: 360, sm: 420, md: 520 },
                transform: 'skewX(-21deg)',
                backgroundColor: (theme) => alpha(theme.palette.primary.dark, theme.palette.mode === 'light' ? 0.1 : 0.22),
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                right: { xs: '4%', md: '7%' },
                top: { xs: -50, md: -72 },
                width: { xs: '35%', md: 340 },
                height: { xs: 390, sm: 470, md: 560 },
                transform: 'skewX(-22deg)',
                backgroundColor: (theme) => alpha(theme.palette.secondary.main, theme.palette.mode === 'light' ? 0.1 : 0.28),
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                right: { xs: '4%', md: '7%' },
                top: { xs: 74, md: 92 },
                width: { xs: 16, sm: 20, md: 26 },
                height: { xs: 120, sm: 156, md: 200 },
                transform: 'skewX(-24deg)',
                backgroundColor: (theme) => alpha(theme.palette.primary.light, theme.palette.mode === 'light' ? 0.12 : 0.28),
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                left: '50%',
                top: { xs: 84, sm: 132, md: 232 },
                width: { xs: 250, sm: 320, md: 460 },
                height: { xs: 250, sm: 320, md: 460 },
                transform: 'translateX(-50%)',
                backgroundColor: (theme) => alpha(theme.palette.background.default, theme.palette.mode === 'light' ? 0.18 : 0.46),
                WebkitMaskImage: 'url(/maskable-source.svg)',
                WebkitMaskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                WebkitMaskSize: 'contain',
                maskImage: 'url(/maskable-source.svg)',
                maskRepeat: 'no-repeat',
                maskPosition: 'center',
                maskSize: 'contain',
                opacity: 0.62,
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                left: { xs: '18%', md: '20%' },
                bottom: { xs: 28, md: 28 },
                width: { xs: 200, sm: 260, md: 320 },
                height: { xs: 88, sm: 104, md: 122 },
                background: (theme) =>
                  theme.palette.mode === 'light'
                    ? 'linear-gradient(180deg, rgba(255, 250, 242, 0.6) 0%, rgba(255, 250, 242, 0.12) 100%)'
                    : 'linear-gradient(180deg, rgba(28, 22, 17, 0.76) 0%, rgba(28, 22, 17, 0.2) 100%)',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                right: { xs: '12%', md: '14%' },
                bottom: { xs: -4, md: 0 },
                width: { xs: 120, sm: 160, md: 220 },
                height: { xs: 120, sm: 150, md: 180 },
                transform: 'skewX(-16deg)',
                backgroundColor: (theme) => alpha(theme.palette.text.secondary, theme.palette.mode === 'light' ? 0.08 : 0.14),
              }}
            />
          </Box>
        </Box>
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              (theme) =>
                theme.palette.mode === 'light'
                  ? 'linear-gradient(109deg, transparent 0 30%, rgba(184, 102, 61, 0.05) 30% 41%, transparent 41% 58%, rgba(146, 104, 55, 0.05) 58% 79%, transparent 79% 100%)'
                  : 'linear-gradient(109deg, transparent 0 30%, rgba(228, 169, 104, 0.07) 30% 41%, transparent 41% 58%, rgba(127, 138, 138, 0.08) 58% 79%, transparent 79% 100%)',
            opacity: 0.52,
            pointerEvents: 'none',
          }}
        />
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            insetInline: 0,
            bottom: 0,
            height: '28%',
            background:
              (theme) =>
                theme.palette.mode === 'light'
                  ? 'linear-gradient(180deg, rgba(247, 242, 234, 0) 0%, rgba(247, 242, 234, 0.76) 42%, rgba(247, 242, 234, 1) 100%)'
                  : 'linear-gradient(180deg, rgba(18, 16, 13, 0) 0%, rgba(18, 16, 13, 0.78) 42%, rgba(18, 16, 13, 1) 100%)',
            pointerEvents: 'none',
          }}
        />
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            left: '50%',
            bottom: { xs: 18, sm: 22, md: 26 },
            width: { xs: '86%', sm: '70%', md: 760 },
            maxWidth: '88vw',
            height: 10,
            transform: 'translateX(-50%)',
            borderRadius: 999,
            background: (theme) =>
              `linear-gradient(90deg, ${alpha(theme.palette.primary.light, 0.04)} 0%, ${alpha(theme.palette.primary.light, 0.14)} 50%, ${alpha(theme.palette.primary.light, 0.04)} 100%)`,
            pointerEvents: 'none',
          }}
        />
        <Card
          data-forge-page-transition="true"
          sx={{
            position: 'absolute',
            zIndex: 1,
            left: '50%',
            top: { xs: '50%', sm: '50%', md: '50%' },
            transform: 'translate(-50%, -50%)',
            width: '100%',
            maxWidth: { xs: '100%', sm: 590, md: 610 },
            borderRadius: { xs: 5, sm: 5.5 },
            borderColor: (theme) => alpha(theme.palette.text.secondary, theme.palette.mode === 'light' ? 0.18 : 0.22),
            background: (theme) =>
              theme.palette.mode === 'light'
                ? 'linear-gradient(180deg, rgba(255, 250, 242, 0.96) 0%, rgba(248, 239, 226, 0.98) 100%)'
                : 'linear-gradient(180deg, rgba(38, 31, 24, 0.96) 0%, rgba(24, 20, 16, 0.98) 100%)',
            backdropFilter: 'blur(20px)',
            boxShadow: (theme) =>
              theme.palette.mode === 'light'
                ? '0 28px 72px rgba(75, 55, 34, 0.12)'
                : '0 28px 72px rgba(10, 7, 5, 0.34)',
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 3.75 }, pt: { xs: 4.6, sm: 4.8 } }}>
            <Stack spacing={{ xs: 2.8, sm: 2.5 }}>
              <Typography
                variant="overline"
                color="primary.light"
                sx={{
                  fontSize: { xs: '0.82rem', sm: '0.9rem' },
                  letterSpacing: '0.12em',
                  opacity: 0.86,
                }}
              >
                Entry Gate
              </Typography>
              <Stack spacing={1.2}>
                <Typography
                  variant="h2"
                  sx={{
                    fontSize: { xs: '2.6rem', sm: '3rem' },
                    lineHeight: 0.94,
                    letterSpacing: '-0.05em',
                    maxWidth: { xs: '10.4ch', sm: '9.5ch' },
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
                  Continue with Google or try a temporary demo workspace.
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
  )
}
