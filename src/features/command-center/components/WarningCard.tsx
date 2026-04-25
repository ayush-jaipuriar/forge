import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded'
import ReportGmailerrorredRoundedIcon from '@mui/icons-material/ReportGmailerrorredRounded'
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded'
import { Chip, Stack, Typography } from '@mui/material'
import { SurfaceCard } from '@/components/common/SurfaceCard'
import { commandCenterChartTheme } from '@/features/command-center/chartTheme'
import type { CommandCenterWarning } from '@/services/analytics/commandCenterWorkspaceService'

type WarningCardProps = {
  warning: CommandCenterWarning
}

export function WarningCard({ warning }: WarningCardProps) {
  const tone = warning.severity === 'critical' ? 'critical' : warning.severity === 'warning' ? 'gold' : 'steel'
  const palette = commandCenterChartTheme.tones[tone]
  const Icon =
    warning.severity === 'critical'
      ? ReportGmailerrorredRoundedIcon
      : warning.severity === 'warning'
        ? ErrorOutlineRoundedIcon
        : ShieldRoundedIcon

  return (
    <SurfaceCard
      eyebrow={warning.severity === 'critical' ? 'Critical Risk' : warning.severity === 'warning' ? 'Warning' : 'Watch'}
      title={warning.title}
      description={warning.detail}
      contentSx={{
        background: `linear-gradient(180deg, ${palette.soft} 0%, rgba(13, 17, 26, 0.96) 100%)`,
      }}
      action={<Icon sx={{ color: palette.solid }} />}
    >
      <Stack spacing={0.5}>
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          <Chip label={`Confidence ${warning.confidence}`} size="small" sx={{ borderColor: palette.border }} />
        </Stack>
        <Typography variant="body2" color="text.secondary">
          Insight warnings are meant to create behavior change, not just explain what already went wrong.
        </Typography>
      </Stack>
    </SurfaceCard>
  )
}
