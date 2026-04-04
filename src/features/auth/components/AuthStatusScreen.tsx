import { Box } from '@mui/material'
import { EmptyState } from '@/components/common/EmptyState'

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
      <Box sx={{ width: '100%', maxWidth: 540 }} data-forge-page-transition="true">
        <EmptyState
          eyebrow="Session Status"
          title={title}
          description={description}
          loading={loading}
          tone="info"
          align="center"
        />
      </Box>
    </Box>
  )
}
