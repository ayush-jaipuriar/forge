import { alpha } from '@mui/material/styles'
import type { ReactNode } from 'react'
import { Box, Skeleton, Stack, Typography } from '@mui/material'

type EmptyStateProps = {
  eyebrow?: string
  title: string
  description: string
  icon?: ReactNode
  action?: ReactNode
  align?: 'left' | 'center'
  tone?: 'default' | 'info' | 'success' | 'warning' | 'error'
  loading?: boolean
  compact?: boolean
}

export function EmptyState({
  eyebrow,
  title,
  description,
  icon,
  action,
  align = 'left',
  tone = 'default',
  loading = false,
  compact = false,
}: EmptyStateProps) {
  const centered = align === 'center'

  return (
    <Stack
      spacing={compact ? 1 : 1.25}
      alignItems={centered ? 'center' : 'flex-start'}
      textAlign={centered ? 'center' : 'left'}
      role={loading ? 'status' : tone === 'error' ? 'alert' : undefined}
      aria-live={loading ? 'polite' : tone === 'error' ? 'assertive' : undefined}
      sx={(theme) => {
        const accent = {
          default: theme.palette.primary.dark,
          info: theme.palette.info.main,
          success: theme.palette.success.main,
          warning: theme.palette.warning.main,
          error: theme.palette.error.main,
        }[tone]

        return {
          border: '1px solid',
          borderColor: alpha(accent, tone === 'default' ? 0.12 : 0.18),
          borderRadius: 4,
          p: compact ? 2 : 2.5,
          background:
            theme.palette.mode === 'light'
              ? `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.74)} 0%, ${alpha(theme.palette.background.default, 0.9)} 100%)`
              : `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.42)} 0%, ${alpha(theme.palette.background.default, 0.66)} 100%)`,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: theme.palette.mode === 'light' ? '0 10px 24px rgba(75, 55, 34, 0.04)' : 'none',
          '&::before': {
            content: '""',
            position: 'absolute',
            insetInlineStart: 18,
            insetBlockStart: 18,
            width: 10,
            height: 10,
            borderRadius: '999px',
            backgroundColor: alpha(accent, 0.72),
            pointerEvents: 'none',
          },
        }
      }}
    >
      {eyebrow ? (
        <Typography
          variant="overline"
          sx={(theme) => ({
            color: {
              default: theme.palette.primary.dark,
              info: theme.palette.info.main,
              success: theme.palette.success.main,
              warning: theme.palette.warning.main,
              error: theme.palette.error.main,
            }[tone],
            fontSize: '0.62rem',
            letterSpacing: '0.12em',
            fontWeight: 700,
          })}
        >
          {eyebrow}
        </Typography>
      ) : null}

      {loading ? (
        <Stack spacing={0.75} sx={{ width: centered ? 'min(320px, 100%)' : '100%', maxWidth: 420 }}>
          <Skeleton variant="rounded" width="68%" height={compact ? 10 : 12} />
          <Skeleton variant="rounded" width="92%" height={compact ? 10 : 12} />
          <Skeleton variant="rounded" width="44%" height={compact ? 10 : 12} />
        </Stack>
      ) : icon ? (
        <Box
          sx={(theme) => ({
            display: 'inline-flex',
            color: {
              default: theme.palette.primary.dark,
              info: theme.palette.info.main,
              success: theme.palette.success.main,
              warning: theme.palette.warning.main,
              error: theme.palette.error.main,
            }[tone],
            '& .MuiSvgIcon-root': {
              fontSize: compact ? '1.1rem' : '1.25rem',
            },
          })}
        >
          {icon}
        </Box>
      ) : null}

      <Typography variant={compact ? 'h4' : 'h3'}>{title}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: centered ? 540 : 'none' }}>
        {description}
      </Typography>
      {action ? (
        <Box sx={{ pt: compact ? 0.25 : 0.5, width: centered ? '100%' : 'auto' }}>
          {action}
        </Box>
      ) : null}
    </Stack>
  )
}
