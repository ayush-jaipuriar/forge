import { alpha } from '@mui/material/styles'
import type { ReactNode } from 'react'
import { Box, CircularProgress, Stack, Typography } from '@mui/material'
import { forgeTokens } from '@/app/theme/tokens'

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

const toneMap = {
  default: {
    accent: forgeTokens.palette.accent.copper,
    soft: alpha(forgeTokens.palette.background.elevated, 0.64),
    border: alpha(forgeTokens.palette.text.secondary, 0.16),
  },
  info: {
    accent: forgeTokens.palette.accent.steel,
    soft: alpha(forgeTokens.palette.accent.steel, 0.1),
    border: alpha(forgeTokens.palette.accent.steel, 0.22),
  },
  success: {
    accent: forgeTokens.palette.accent.success,
    soft: alpha(forgeTokens.palette.accent.success, 0.1),
    border: alpha(forgeTokens.palette.accent.success, 0.22),
  },
  warning: {
    accent: forgeTokens.palette.accent.warning,
    soft: alpha(forgeTokens.palette.accent.warning, 0.1),
    border: alpha(forgeTokens.palette.accent.warning, 0.24),
  },
  error: {
    accent: forgeTokens.palette.accent.critical,
    soft: alpha(forgeTokens.palette.accent.critical, 0.1),
    border: alpha(forgeTokens.palette.accent.critical, 0.24),
  },
} as const

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
  const palette = toneMap[tone]
  const centered = align === 'center'

  return (
    <Stack
      spacing={compact ? 1 : 1.25}
      alignItems={centered ? 'center' : 'flex-start'}
      textAlign={centered ? 'center' : 'left'}
      role={loading ? 'status' : tone === 'error' ? 'alert' : undefined}
      aria-live={loading ? 'polite' : tone === 'error' ? 'assertive' : undefined}
      sx={{
        border: '1px solid',
        borderColor: palette.border,
        borderRadius: 4,
        p: compact ? 2 : 2.5,
        background: `linear-gradient(180deg, ${alpha(forgeTokens.palette.background.elevated, 0.72)} 0%, ${alpha(forgeTokens.palette.background.panel, 0.88)} 100%)`,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          borderTop: '1px solid',
          borderColor: alpha(palette.accent, 0.45),
          pointerEvents: 'none',
        },
      }}
    >
      {eyebrow ? (
        <Typography
          variant="overline"
          sx={{
            color: palette.accent,
            fontSize: '0.64rem',
            letterSpacing: '0.18em',
          }}
        >
          {eyebrow}
        </Typography>
      ) : null}

      {loading ? (
        <CircularProgress size={compact ? 22 : 26} sx={{ color: palette.accent }} />
      ) : icon ? (
        <Box
          sx={{
            display: 'inline-flex',
            color: palette.accent,
            '& .MuiSvgIcon-root': {
              fontSize: compact ? '1.1rem' : '1.25rem',
            },
          }}
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
