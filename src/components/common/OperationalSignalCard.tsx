import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded'
import { alpha } from '@mui/material/styles'
import { Chip, Stack, Typography } from '@mui/material'
import { forgeTokens } from '@/app/theme/tokens'

type OperationalSignalCardProps = {
  title: string
  detail: string
  tone: 'critical' | 'warning' | 'info' | 'positive'
  badge?: string
}

const toneStyles = {
  critical: {
    borderColor: forgeTokens.palette.accent.critical,
    backgroundColor: alpha(forgeTokens.palette.accent.critical, 0.08),
    icon: <WarningAmberRoundedIcon color="error" fontSize="small" />,
  },
  warning: {
    borderColor: forgeTokens.palette.accent.warning,
    backgroundColor: alpha(forgeTokens.palette.accent.warning, 0.08),
    icon: <WarningAmberRoundedIcon color="warning" fontSize="small" />,
  },
  info: {
    borderColor: alpha(forgeTokens.palette.text.secondary, 0.16),
    backgroundColor: alpha(forgeTokens.palette.background.elevated, 0.5),
    icon: <InfoOutlinedIcon color="info" fontSize="small" />,
  },
  positive: {
    borderColor: forgeTokens.palette.accent.success,
    backgroundColor: alpha(forgeTokens.palette.accent.success, 0.08),
    icon: <TaskAltRoundedIcon color="success" fontSize="small" />,
  },
} as const

export function OperationalSignalCard({
  title,
  detail,
  tone,
  badge,
}: OperationalSignalCardProps) {
  const style = toneStyles[tone]

  return (
    <Stack
      spacing={1}
      sx={{
        border: '1px solid',
        borderColor: style.borderColor,
        borderRadius: 3,
        p: 1.75,
        backgroundColor: style.backgroundColor,
      }}
    >
      <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="flex-start">
        <Stack direction="row" spacing={1} alignItems="flex-start">
          {style.icon}
          <Stack spacing={0.4}>
            <Typography variant="subtitle2">{title}</Typography>
            <Typography variant="body2" color="text.secondary">
              {detail}
            </Typography>
          </Stack>
        </Stack>
        {badge ? (
          <Chip
            label={badge}
            size="small"
            sx={{
              color:
                tone === 'critical'
                  ? forgeTokens.palette.accent.critical
                  : tone === 'warning'
                    ? forgeTokens.palette.accent.warning
                    : tone === 'positive'
                      ? forgeTokens.palette.accent.success
                      : forgeTokens.palette.text.secondary,
            }}
          />
        ) : null}
      </Stack>
    </Stack>
  )
}
