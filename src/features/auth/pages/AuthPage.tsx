import GoogleIcon from '@mui/icons-material/Google'
import { alpha } from '@mui/material/styles'
import { Alert, Box, Button, Card, CardContent, Stack, Typography } from '@mui/material'
import { forgeTokens } from '@/app/theme/tokens'
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
        display: 'grid',
        placeItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        px: { xs: 2, sm: 3 },
        py: { xs: 4, sm: 6 },
        background:
          'radial-gradient(circle at 18% 34%, rgba(212, 111, 60, 0.32), transparent 26%), radial-gradient(circle at 78% 20%, rgba(88, 146, 182, 0.24), transparent 24%), linear-gradient(180deg, #070910 0%, #05070c 100%)',
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          width: { xs: '92vw', md: 980 },
          maxWidth: '92vw',
          height: { xs: 280, sm: 340, md: 400 },
          top: { xs: 24, sm: 28, md: 30 },
          left: '50%',
          transform: 'translateX(-50%)',
          pointerEvents: 'none',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(90deg, rgba(237, 218, 196, 0.14) 0%, rgba(237, 218, 196, 0.06) 36%, rgba(13, 17, 25, 0.08) 36%, rgba(13, 17, 25, 0.08) 100%)',
            clipPath: 'polygon(0 0, 76% 0, 76% 62%, 100% 62%, 100% 100%, 0 100%)',
            opacity: 0.9,
          }}
        />
        <Box
          component="img"
          src="/icon-512.png"
          alt=""
          sx={{
            position: 'absolute',
            width: { xs: 300, sm: 380, md: 460 },
            insetInline: '50%',
            top: { xs: 18, sm: 20, md: 18 },
            transform: 'translateX(-50%)',
            opacity: 0.12,
            filter: 'brightness(0.65) saturate(0.75)',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        />
      </Box>
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(112deg, transparent 0 28%, rgba(240, 179, 122, 0.1) 28% 42%, transparent 42% 58%, rgba(98, 116, 141, 0.14) 58% 78%, transparent 78% 100%)',
          opacity: 0.7,
          pointerEvents: 'none',
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          insetInline: 0,
          bottom: 0,
          height: '24%',
          background:
            'linear-gradient(180deg, rgba(7, 9, 16, 0) 0%, rgba(7, 9, 16, 0.88) 46%, rgba(7, 9, 16, 1) 100%)',
          pointerEvents: 'none',
        }}
      />
      <Card
        data-forge-page-transition="true"
        sx={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 730,
          width: '100%',
          borderRadius: 6,
          borderColor: alpha(forgeTokens.palette.text.secondary, 0.22),
          background: `linear-gradient(180deg, ${alpha('#152032', 0.94)} 0%, ${alpha('#0e1521', 0.96)} 100%)`,
          backdropFilter: 'blur(20px)',
          boxShadow: '0 28px 70px rgba(0, 0, 0, 0.42)',
          mt: { xs: 8, sm: 10, md: 12 },
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 5 }, pt: { xs: 4.5, sm: 5.75 } }}>
          <Stack spacing={3.5}>
            <Typography
              variant="overline"
              color="primary.light"
              sx={{
                fontSize: { xs: '0.9rem', sm: '1rem' },
                letterSpacing: '0.14em',
              }}
            >
              Entry Gate
            </Typography>
            <Stack spacing={1.25}>
              <Typography
                variant="h2"
                sx={{
                  fontSize: { xs: '2.6rem', sm: '3.85rem' },
                  lineHeight: 0.94,
                  letterSpacing: '-0.05em',
                  maxWidth: '11.5ch',
                }}
              >
                Sign in to Forge
              </Typography>
              <Typography
                color="text.primary"
                sx={{
                  fontSize: { xs: '1.2rem', sm: '1.48rem' },
                  lineHeight: 1.14,
                  maxWidth: '20.5ch',
                }}
              >
                Continue with Google or start a temporary guest workspace.
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
                minHeight: 64,
                borderRadius: 4,
                fontSize: { xs: '1.2rem', sm: '1.35rem' },
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: '#131313',
                background: 'linear-gradient(135deg, #f7ba62 0%, #ffb24d 100%)',
                boxShadow: '0 14px 30px rgba(212, 111, 60, 0.24)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #ffc066 0%, #ffb85c 100%)',
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
                minHeight: 64,
                borderRadius: 4,
                fontSize: { xs: '1.15rem', sm: '1.28rem' },
                fontWeight: 700,
                color: 'primary.light',
                borderColor: alpha(forgeTokens.palette.accent.gold, 0.72),
                backgroundColor: alpha('#243041', 0.58),
                '&:hover': {
                  borderColor: alpha(forgeTokens.palette.accent.gold, 0.88),
                  backgroundColor: alpha('#2b384b', 0.78),
                },
              }}
            >
              {status === 'checking' && flowPhase === 'guesting' ? 'Preparing guest workspace...' : 'Try guest workspace'}
            </Button>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                fontFamily: '"JetBrains Mono", "SFMono-Regular", monospace',
                fontSize: { xs: '0.95rem', sm: '1rem' },
                lineHeight: 1.55,
                maxWidth: '36ch',
              }}
            >
              Guest mode uses local demo data and clears when you exit the session.
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}
