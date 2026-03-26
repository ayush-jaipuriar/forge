import GoogleIcon from '@mui/icons-material/Google'
import { Alert, Box, Button, Card, CardContent, Divider, Stack, Typography } from '@mui/material'
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
            <Typography color="text.secondary">
              Forge now uses real Firebase Auth boundaries. Google Sign-In is the only allowed entry path for Phase 1.
            </Typography>
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
            <Divider flexItem />
            <Typography variant="body2" color="text.secondary">
              First successful sign-in will also bootstrap your user document and default settings document in
              Firestore.
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}
