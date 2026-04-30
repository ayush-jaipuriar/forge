import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded'
import { alpha } from '@mui/material/styles'
import { Chip, Stack, Typography } from '@mui/material'

type OperationalSignalCardProps = {
  title: string
  detail: string
  tone: 'critical' | 'warning' | 'info' | 'positive'
  badge?: string
}

export function OperationalSignalCard({
  title,
  detail,
  tone,
  badge,
}: OperationalSignalCardProps) {
  const icon = {
    critical: <WarningAmberRoundedIcon color="error" fontSize="small" />,
    warning: <WarningAmberRoundedIcon color="warning" fontSize="small" />,
    info: <InfoOutlinedIcon color="info" fontSize="small" />,
    positive: <TaskAltRoundedIcon color="success" fontSize="small" />,
  }[tone]

  return (
    <Stack
      spacing={1}
      sx={(theme) => {
        const toneColor = {
          critical: theme.palette.error.main,
          warning: theme.palette.warning.main,
          info: theme.palette.text.secondary,
          positive: theme.palette.success.main,
        }[tone]

        return {
          border: '1px solid',
          borderColor: alpha(toneColor, tone === 'info' ? 0.12 : 0.2),
          borderRadius: 3.5,
          p: 1.6,
          background:
            theme.palette.mode === 'light'
              ? `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(toneColor, tone === 'info' ? 0.03 : 0.06)} 100%)`
              : alpha(toneColor, tone === 'info' ? 0.05 : 0.07),
        }
      }}
    >
      <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="flex-start">
        <Stack direction="row" spacing={1} alignItems="flex-start">
          {icon}
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
            sx={(theme) => ({
              color:
                tone === 'critical'
                  ? theme.palette.error.main
                  : tone === 'warning'
                    ? theme.palette.warning.main
                    : tone === 'positive'
                      ? theme.palette.success.main
                      : theme.palette.text.secondary,
              backgroundColor: alpha(
                tone === 'critical'
                  ? theme.palette.error.main
                  : tone === 'warning'
                    ? theme.palette.warning.main
                    : tone === 'positive'
                      ? theme.palette.success.main
                      : theme.palette.text.secondary,
                theme.palette.mode === 'light' ? 0.06 : 0.08,
              ),
            })}
          />
        ) : null}
      </Stack>
    </Stack>
  )
}
