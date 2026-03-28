import TipsAndUpdatesRoundedIcon from '@mui/icons-material/TipsAndUpdatesRounded'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import { Chip, Stack } from '@mui/material'
import { SurfaceCard } from '@/components/common/SurfaceCard'
import { commandCenterChartTheme } from '@/features/command-center/chartTheme'
import type { CommandCenterInsight } from '@/services/analytics/commandCenterWorkspaceService'

type InsightCardProps = {
  insight: CommandCenterInsight
}

export function InsightCard({ insight }: InsightCardProps) {
  const tone = insight.tone === 'positive' ? 'success' : insight.tone === 'warning' ? 'gold' : 'steel'
  const palette = commandCenterChartTheme.tones[tone]
  const Icon = insight.tone === 'warning' ? WarningAmberRoundedIcon : TipsAndUpdatesRoundedIcon

  return (
    <SurfaceCard
      eyebrow="Insight"
      title={insight.title}
      description={insight.summary}
      contentSx={{
        background: `linear-gradient(180deg, ${palette.soft} 0%, rgba(13, 17, 26, 0.96) 100%)`,
      }}
      action={<Icon sx={{ color: palette.solid }} />}
    >
      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
        <Chip label={`Confidence ${insight.confidence}`} size="small" sx={{ borderColor: palette.border }} />
        {insight.supportingEvidence.map((item) => (
          <Chip key={item} label={item} size="small" sx={{ borderColor: palette.border }} />
        ))}
      </Stack>
    </SurfaceCard>
  )
}
