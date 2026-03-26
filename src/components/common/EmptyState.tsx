import type { ReactNode } from 'react'
import { Stack, Typography } from '@mui/material'

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
        border: '1px dashed',
        borderColor: 'divider',
        borderRadius: 4,
        p: 2.5,
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
      }}
    >
      {icon}
      <Typography variant="h3">{title}</Typography>
      <Typography color="text.secondary">{description}</Typography>
    </Stack>
  )
}
