import type { ReactNode } from 'react'
import { Box, Stack, Typography } from '@mui/material'

type SectionHeaderProps = {
  eyebrow: string
  title: string
  description: string
  action?: ReactNode
}

export function SectionHeader({ eyebrow, title, description, action }: SectionHeaderProps) {
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={2}
      justifyContent="space-between"
      alignItems={{ xs: 'flex-start', md: 'flex-end' }}
    >
      <Stack spacing={1} maxWidth={760}>
        <Typography variant="overline" color="primary.light">
          {eyebrow}
        </Typography>
        <Typography variant="h2">{title}</Typography>
        <Typography color="text.secondary">{description}</Typography>
      </Stack>
      {action ? <Box>{action}</Box> : null}
    </Stack>
  )
}
