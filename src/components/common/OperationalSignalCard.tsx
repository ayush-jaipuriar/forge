import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded'
import { Chip, Stack, Typography } from '@mui/material'

type OperationalSignalCardProps = {
  title: string
  detail: string
  tone: 'critical' | 'warning' | 'info' | 'positive'
  badge?: string
}

const toneStyles = {
  critical: {
    borderColor: 'error.main',
    backgroundColor: 'rgba(211, 47, 47, 0.08)',
    icon: <WarningAmberRoundedIcon color="error" fontSize="small" />,
  },
  warning: {
    borderColor: 'warning.main',
    backgroundColor: 'rgba(237, 108, 2, 0.08)',
    icon: <WarningAmberRoundedIcon color="warning" fontSize="small" />,
  },
  info: {
    borderColor: 'divider',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    icon: <InfoOutlinedIcon color="info" fontSize="small" />,
  },
  positive: {
    borderColor: 'success.main',
    backgroundColor: 'rgba(46, 125, 50, 0.08)',
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
        p: 1.5,
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
        {badge ? <Chip label={badge} size="small" color={tone === 'critical' ? 'error' : tone === 'warning' ? 'warning' : tone === 'positive' ? 'success' : 'default'} /> : null}
      </Stack>
    </Stack>
  )
}
