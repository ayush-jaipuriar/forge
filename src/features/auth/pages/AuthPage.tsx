import GoogleIcon from '@mui/icons-material/Google'
import { alpha } from '@mui/material/styles'
import { Alert, Box, Button, Card, CardContent, Stack, Typography } from '@mui/material'
import { forgeTokens } from '@/app/theme/tokens'
import { missingFirebaseEnvKeys } from '@/lib/firebase/config'
import { useAuthSession } from '@/features/auth/providers/useAuthSession'

export function AuthPage() {
  const { errorMessage, signInWithGoogle, status } = useAuthSession()
  const signInDisabled = status === 'checking' || status === 'missing_config'

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        px: 2,
        py: 4,
      }}
    >
      <Card
        data-forge-page-transition="true"
        sx={{
          maxWidth: 540,
          width: '100%',
          borderColor: alpha(forgeTokens.palette.text.secondary, 0.16),
          background: forgeTokens.gradients.panel,
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack spacing={3}>
            <Typography variant="overline" color="primary.light">
              Entry Gate
            </Typography>
            <Stack spacing={1}>
              <Typography variant="h2">Sign in to Forge</Typography>
              <Typography color="text.secondary">Continue with Google to enter Forge.</Typography>
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
            >
              {status === 'checking' ? 'Connecting...' : 'Continue with Google'}
            </Button>
            <Typography variant="caption" color="text.secondary">
              Forge restores the workspace after Google returns.
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}
