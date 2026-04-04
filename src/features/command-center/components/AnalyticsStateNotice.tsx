import AutoGraphRoundedIcon from '@mui/icons-material/AutoGraphRounded'
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded'
import SyncRoundedIcon from '@mui/icons-material/SyncRounded'
import { EmptyState } from '@/components/common/EmptyState'
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
  const stateTone =
    tone === 'critical' ? 'error' : tone === 'gold' ? 'warning' : tone === 'success' ? 'success' : 'info'

  return (
    <EmptyState
      title={title}
      description={description}
      icon={<Icon sx={{ color: palette.solid }} />}
      tone={stateTone}
      compact
    />
  )
}
