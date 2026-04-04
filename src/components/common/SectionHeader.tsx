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
      spacing={2.5}
      justifyContent="space-between"
      alignItems={{ xs: 'flex-start', md: 'center' }}
    >
      <Stack spacing={0.9} maxWidth={760}>
        <Typography
          variant="overline"
          color="primary.light"
          sx={{
            fontSize: '0.66rem',
            letterSpacing: '0.2em',
          }}
        >
          {eyebrow}
        </Typography>
        <Typography variant="h2" sx={{ maxWidth: 720 }}>
          {title}
        </Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 720 }}>
          {description}
        </Typography>
      </Stack>
      {action ? <Box sx={{ flexShrink: 0 }}>{action}</Box> : null}
    </Stack>
  )
}
