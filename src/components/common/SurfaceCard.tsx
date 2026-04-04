import type { PropsWithChildren, ReactNode } from 'react'
import { alpha } from '@mui/material/styles'
import { Card, CardContent, Stack, Typography } from '@mui/material'
import { forgeTokens } from '@/app/theme/tokens'

type SurfaceCardProps = PropsWithChildren<{
  eyebrow?: string
  title?: string
  description?: string
  action?: ReactNode
  contentSx?: object
}>

export function SurfaceCard({
  eyebrow,
  title,
  description,
  action,
  children,
  contentSx,
}: SurfaceCardProps) {
  return (
    <Card
      sx={{
        height: '100%',
        borderColor: alpha(forgeTokens.palette.text.secondary, 0.12),
      }}
    >
      <CardContent sx={{ p: { xs: 2.25, md: 2.75 }, ...contentSx }}>
        <Stack spacing={2.25}>
          {eyebrow || title || description || action ? (
            <Stack
              direction={{ xs: 'column', md: action ? 'row' : 'column' }}
              spacing={1.25}
              justifyContent="space-between"
              alignItems={action ? { xs: 'flex-start', md: 'center' } : 'flex-start'}
            >
              <Stack spacing={0.6}>
                {eyebrow ? (
                  <Typography
                    variant="overline"
                    color="primary.light"
                    sx={{
                      fontSize: '0.64rem',
                      letterSpacing: '0.2em',
                    }}
                  >
                    {eyebrow}
                  </Typography>
                ) : null}
                {title ? <Typography variant="h3">{title}</Typography> : null}
                {description ? (
                  <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 840 }}>
                    {description}
                  </Typography>
                ) : null}
              </Stack>
              {action}
            </Stack>
          ) : null}
          {children}
        </Stack>
      </CardContent>
    </Card>
  )
}
