import { alpha } from '@mui/material/styles'
import type { ReactNode } from 'react'
import { Stack, Typography } from '@mui/material'
import { forgeTokens } from '@/app/theme/tokens'

type EmptyStateProps = {
  title: string
  description: string
  icon?: ReactNode
}

export function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <Stack
      spacing={1.25}
      alignItems="flex-start"
      sx={{
        border: '1px solid',
        borderColor: alpha(forgeTokens.palette.text.secondary, 0.16),
        borderRadius: 4,
        p: 2.5,
        background: `linear-gradient(180deg, ${alpha(forgeTokens.palette.background.elevated, 0.72)} 0%, ${alpha(forgeTokens.palette.background.panel, 0.88)} 100%)`,
      }}
    >
      {icon}
      <Typography variant="h3">{title}</Typography>
      <Typography color="text.secondary">{description}</Typography>
    </Stack>
  )
}
