import GoogleIcon from '@mui/icons-material/Google'
import { Alert, Box, Button, Card, CardContent, Stack, Typography } from '@mui/material'
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
      }}
    >
      <Card sx={{ maxWidth: 520, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={2.5}>
            <Typography variant="overline" color="primary.light">
              Entry Gate
            </Typography>
            <Typography variant="h2">Sign in to Forge</Typography>
            <Typography color="text.secondary">Continue with Google to enter Forge.</Typography>
            {status === 'missing_config' ? (
              <Alert severity="warning" variant="outlined">
                Firebase configuration is incomplete. Add the missing keys to your local `.env` file:
                {' '}
                {missingFirebaseEnvKeys.join(', ')}
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
            >
              {status === 'checking' ? 'Connecting...' : 'Continue with Google'}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}
