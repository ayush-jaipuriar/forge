import type { PropsWithChildren, ReactNode } from 'react'
import { Card, CardContent, Stack, Typography } from '@mui/material'

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
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: { xs: 2.5, md: 3 }, ...contentSx }}>
        <Stack spacing={2}>
          {eyebrow || title || description || action ? (
            <Stack
              direction={{ xs: 'column', md: action ? 'row' : 'column' }}
              spacing={1.5}
              justifyContent="space-between"
              alignItems={action ? { xs: 'flex-start', md: 'center' } : 'flex-start'}
            >
              <Stack spacing={0.75}>
                {eyebrow ? (
                  <Typography variant="overline" color="primary.light">
                    {eyebrow}
                  </Typography>
                ) : null}
                {title ? <Typography variant="h3">{title}</Typography> : null}
                {description ? (
                  <Typography variant="body2" color="text.secondary">
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
