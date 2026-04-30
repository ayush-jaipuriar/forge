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
          color="primary.main"
          sx={{
            fontSize: '0.62rem',
            letterSpacing: '0.12em',
            fontWeight: 700,
          }}
        >
          {eyebrow}
        </Typography>
        <Typography variant="h2" sx={{ maxWidth: 720, letterSpacing: '-0.04em' }}>
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
