import type { PropsWithChildren } from 'react'
import { Chip, Stack, Typography } from '@mui/material'
import { SurfaceCard } from '@/components/common/SurfaceCard'
import { commandCenterChartTheme, type CommandCenterTone } from '@/features/command-center/chartTheme'
import { AnalyticsStateNotice } from '@/features/command-center/components/AnalyticsStateNotice'

type ChartCardProps = PropsWithChildren<{
  eyebrow: string
  title: string
  description: string
  tone?: CommandCenterTone
  state?: 'ready' | 'stale' | 'insufficientData'
  emptyTitle?: string
  emptyDescription?: string
}>

export function ChartCard({
  eyebrow,
  title,
  description,
  tone = 'steel',
  state = 'ready',
  emptyTitle = 'Not enough historical signal yet',
  emptyDescription = 'Forge will fill this panel as more tracked day instances accumulate.',
  children,
}: ChartCardProps) {
  const palette = commandCenterChartTheme.tones[tone]

  return (
    <SurfaceCard
      eyebrow={eyebrow}
      title={title}
      description={description}
      contentSx={{
        background: `linear-gradient(180deg, ${palette.soft} 0%, rgba(13, 17, 26, 0.96) 100%)`,
      }}
      action={
        state === 'stale' ? (
          <Chip
            label="Stale View"
            size="small"
            sx={{
              borderColor: palette.border,
              color: palette.solid,
            }}
          />
        ) : undefined
      }
    >
      {state === 'insufficientData' ? (
        <AnalyticsStateNotice
          title={emptyTitle}
          description={emptyDescription}
          tone={tone}
          kind="insufficientData"
        />
      ) : (
        <Stack spacing={1.5}>
          {children}
          {state === 'stale' ? (
            <Typography variant="body2" color="text.secondary">
              This view is older than the current query freshness window. The structure is still useful, but treat it as
              a snapshot rather than live telemetry.
            </Typography>
          ) : null}
        </Stack>
      )}
    </SurfaceCard>
  )
}
