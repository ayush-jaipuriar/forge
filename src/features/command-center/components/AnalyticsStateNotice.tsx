import AutoGraphRoundedIcon from '@mui/icons-material/AutoGraphRounded'
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded'
import SyncRoundedIcon from '@mui/icons-material/SyncRounded'
import { Stack, Typography } from '@mui/material'
import { commandCenterChartTheme, type CommandCenterTone } from '@/features/command-center/chartTheme'

type AnalyticsStateNoticeProps = {
  title: string
  description: string
  tone?: CommandCenterTone
  kind?: 'insufficientData' | 'stale' | 'loading'
}

export function AnalyticsStateNotice({
  title,
  description,
  tone = 'steel',
  kind = 'insufficientData',
}: AnalyticsStateNoticeProps) {
  const palette = commandCenterChartTheme.tones[tone]
  const Icon =
    kind === 'stale' ? HistoryRoundedIcon : kind === 'loading' ? SyncRoundedIcon : AutoGraphRoundedIcon

  return (
    <Stack
      spacing={1.25}
      sx={{
        border: '1px dashed',
        borderColor: palette.border,
        borderRadius: 4,
        p: 2,
        backgroundColor: palette.soft,
      }}
    >
      <Icon sx={{ color: palette.solid }} />
      <Typography variant="h3">{title}</Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </Stack>
  )
}
