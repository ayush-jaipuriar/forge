import BoltRoundedIcon from '@mui/icons-material/BoltRounded'
import { Chip, LinearProgress, Stack, Typography } from '@mui/material'
import type { MomentumSnapshot } from '@/domain/analytics/types'
import type { DisciplinePosture } from '@/domain/analytics/gamification'
import { SurfaceCard } from '@/components/common/SurfaceCard'
import { commandCenterChartTheme, type CommandCenterTone } from '@/features/command-center/chartTheme'

type MomentumPanelProps = {
  momentum: MomentumSnapshot
  posture: DisciplinePosture
}

export function MomentumPanel({ momentum, posture }: MomentumPanelProps) {
  const tone = getMomentumTone(posture.level)
  const palette = commandCenterChartTheme.tones[tone]

  return (
    <SurfaceCard
      eyebrow="Momentum"
      title={posture.label}
      description={posture.detail}
      action={<Chip label={momentum.label} size="small" color={tone === 'critical' ? 'error' : tone === 'success' ? 'success' : tone === 'gold' ? 'warning' : 'default'} />}
      contentSx={{
        background: `linear-gradient(180deg, ${palette.soft} 0%, rgba(13, 17, 26, 0.96) 100%)`,
      }}
    >
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={1} alignItems="center">
          <BoltRoundedIcon sx={{ color: palette.solid }} />
          <Typography variant="h3" sx={{ fontSize: '2rem' }}>
            {momentum.score}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            /100 momentum score
          </Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={momentum.score}
          color={tone === 'critical' ? 'error' : tone === 'success' ? 'success' : tone === 'gold' ? 'warning' : 'primary'}
          sx={{
            height: 10,
            borderRadius: 999,
            backgroundColor: 'rgba(255,255,255,0.08)',
          }}
        />
        <Typography variant="body2" color="text.secondary">
          {momentum.explanation}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Derived from the trailing {momentum.trailingWindow.toUpperCase()} window with anti-padding weighting toward score quality,
          deep-work continuity, output capture, recovery, and penalties for prime misses and fallback dependence.
        </Typography>
      </Stack>
    </SurfaceCard>
  )
}

function getMomentumTone(level: DisciplinePosture['level']): CommandCenterTone {
  switch (level) {
    case 'surging':
      return 'success'
    case 'steady':
      return 'gold'
    case 'building':
      return 'ember'
    case 'fragile':
      return 'critical'
    case 'insufficientData':
    default:
      return 'steel'
  }
}
