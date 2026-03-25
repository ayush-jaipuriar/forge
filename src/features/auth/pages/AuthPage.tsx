import GoogleIcon from '@mui/icons-material/Google'
import { Box, Button, Card, CardContent, Stack, Typography } from '@mui/material'

export function AuthPage() {
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
              Firebase Auth and real Google Sign-In will replace this shell in Milestone 2.
            </Typography>
            <Button variant="contained" startIcon={<GoogleIcon />}>
              Continue with Google
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}
