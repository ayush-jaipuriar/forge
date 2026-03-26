import { Box, CircularProgress, Stack, Typography } from '@mui/material'

type AuthStatusScreenProps = {
  title: string
  description: string
  loading?: boolean
}

export function AuthStatusScreen({ title, description, loading = false }: AuthStatusScreenProps) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        px: 2,
      }}
    >
      <Stack spacing={2} alignItems="center" textAlign="center" maxWidth={480}>
        {loading ? <CircularProgress color="primary" /> : null}
        <Typography variant="h2">{title}</Typography>
        <Typography color="text.secondary">{description}</Typography>
      </Stack>
    </Box>
  )
}
