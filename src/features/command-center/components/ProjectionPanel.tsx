import TimelineRoundedIcon from '@mui/icons-material/TimelineRounded'
import { Chip, Stack, Typography } from '@mui/material'
import { SurfaceCard } from '@/components/common/SurfaceCard'
import { AnalyticsStateNotice } from '@/features/command-center/components/AnalyticsStateNotice'
import { commandCenterChartTheme } from '@/features/command-center/chartTheme'
import type { ReadinessProjectionSnapshot } from '@/domain/analytics/types'

type ProjectionPanelProps = {
  projection: ReadinessProjectionSnapshot
}

export function ProjectionPanel({ projection }: ProjectionPanelProps) {
  const tone =
    projection.status === 'insufficientData'
      ? 'steel'
      : projection.status === 'critical'
      ? 'critical'
      : projection.status === 'slipping' || projection.status === 'atRisk'
        ? 'gold'
        : 'success'
  const palette = commandCenterChartTheme.tones[tone]

  return (
    <SurfaceCard
      eyebrow="Projection"
      title="Readiness Pace"
      description={projection.statusLabel}
      action={<TimelineRoundedIcon sx={{ color: palette.solid }} />}
      contentSx={{
        background: `linear-gradient(180deg, ${palette.soft} 0%, rgba(13, 17, 26, 0.96) 100%)`,
      }}
    >
      {projection.status === 'insufficientData' ? (
        <AnalyticsStateNotice
          title="Projection needs more tracked days"
          description={projection.summary}
          tone="steel"
          kind="insufficientData"
        />
      ) : (
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Chip label={`Projected ${projection.projectedReadinessPercent}%`} size="small" />
            <Chip label={`Confidence ${projection.confidence}`} size="small" />
            <Chip label={`Target slip ${projection.targetSlipDays}d`} size="small" />
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {projection.summary}
          </Typography>
          <Stack spacing={1}>
            {projection.risks.slice(0, 3).map((risk) => (
              <Typography key={risk} variant="body2" color="text.secondary">
                - {risk}
              </Typography>
            ))}
          </Stack>
        </Stack>
      )}
    </SurfaceCard>
  )
}
