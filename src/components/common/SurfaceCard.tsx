import type { PropsWithChildren, ReactNode } from 'react'
import { alpha } from '@mui/material/styles'
import { Card, CardContent, Stack, Typography } from '@mui/material'

type SurfaceCardVariant = 'default' | 'hero' | 'quiet' | 'plain'

type SurfaceCardProps = PropsWithChildren<{
  eyebrow?: string
  title?: string
  description?: string
  action?: ReactNode
  contentSx?: object
  variant?: SurfaceCardVariant
}>

export function SurfaceCard({
  eyebrow,
  title,
  description,
  action,
  children,
  contentSx,
  variant = 'default',
}: SurfaceCardProps) {
  return (
    <Card
      data-forge-surface={variant}
      sx={(theme) => {
        const isLight = theme.palette.mode === 'light'
        const palette = theme.palette
        const variants: Record<SurfaceCardVariant, object> = {
          default: {
            background:
              isLight
                ? 'linear-gradient(180deg, rgba(255, 251, 245, 0.94) 0%, rgba(247, 241, 233, 0.98) 100%)'
                : 'linear-gradient(180deg, rgba(34, 28, 22, 0.92) 0%, rgba(24, 20, 16, 0.96) 100%)',
            borderColor: alpha(palette.text.secondary, isLight ? 0.12 : 0.08),
            boxShadow: isLight ? '0 10px 28px rgba(75, 55, 34, 0.06)' : '0 12px 30px rgba(10, 7, 5, 0.16)',
          },
          hero: {
            background:
              isLight
                ? 'radial-gradient(circle at top right, rgba(191, 120, 74, 0.1), transparent 32%), linear-gradient(180deg, rgba(255, 250, 242, 0.98) 0%, rgba(244, 235, 224, 0.98) 100%)'
                : 'radial-gradient(circle at top right, rgba(228, 169, 104, 0.1), transparent 32%), linear-gradient(180deg, rgba(38, 31, 24, 0.96) 0%, rgba(24, 20, 16, 0.98) 100%)',
            borderColor: alpha(palette.primary.main, isLight ? 0.2 : 0.14),
            boxShadow: isLight ? '0 14px 38px rgba(75, 55, 34, 0.08)' : '0 18px 42px rgba(10, 7, 5, 0.2)',
          },
          quiet: {
            background:
              isLight
                ? 'linear-gradient(180deg, rgba(255, 251, 245, 0.76) 0%, rgba(249, 244, 237, 0.82) 100%)'
                : alpha(palette.background.paper, 0.34),
            borderColor: alpha(palette.text.secondary, isLight ? 0.1 : 0.06),
            boxShadow: 'none',
          },
          plain: {
            background: 'transparent',
            borderColor: 'transparent',
            boxShadow: 'none',
          },
        }

        return {
          height: '100%',
          borderRadius: variant === 'hero' ? { xs: 4, md: 5 } : 3.5,
          ...variants[variant],
        }
      }}
    >
      <CardContent sx={{ p: variant === 'hero' ? { xs: 2.75, md: 3.5 } : { xs: 2.1, md: 2.5 }, ...contentSx }}>
        <Stack spacing={2}>
          {eyebrow || title || description || action ? (
            <Stack
              direction={{ xs: 'column', md: action ? 'row' : 'column' }}
              spacing={1}
              justifyContent="space-between"
              alignItems={action ? { xs: 'flex-start', md: 'center' } : 'flex-start'}
            >
              <Stack spacing={0.5}>
                {eyebrow ? (
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
