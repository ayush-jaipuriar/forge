import FlagRoundedIcon from '@mui/icons-material/FlagRounded'
import { Chip, LinearProgress, Stack, Typography } from '@mui/material'
import type { WeeklyMission } from '@/domain/analytics/types'
import { commandCenterChartTheme } from '@/features/command-center/chartTheme'

type MissionCardProps = {
  mission: WeeklyMission
}

export function MissionCard({ mission }: MissionCardProps) {
  const palette =
    mission.priority === 'high'
      ? commandCenterChartTheme.tones.critical
      : commandCenterChartTheme.tones.gold
  const progressPercent = mission.target === 0 ? 0 : Math.min(100, Math.round((mission.progress / mission.target) * 100))

  return (
    <Stack
      spacing={1.25}
      sx={{
        border: '1px solid',
        borderColor: palette.border,
        borderRadius: 3,
        p: 1.75,
        background: `linear-gradient(180deg, ${palette.soft} 0%, rgba(255, 255, 255, 0.02) 100%)`,
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
        <Stack spacing={0.5}>
          <Stack direction="row" spacing={1} alignItems="center">
            <FlagRoundedIcon sx={{ color: palette.solid, fontSize: 18 }} />
            <Typography variant="subtitle2">{mission.title}</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {mission.description}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap" justifyContent="flex-end">
          <Chip label={mission.priority === 'high' ? 'High priority' : 'Medium priority'} size="small" color={mission.priority === 'high' ? 'error' : 'warning'} />
          <Chip label={mission.status === 'completed' ? 'Completed' : mission.status === 'missed' ? 'Missed' : 'Active'} size="small" variant="outlined" />
        </Stack>
      </Stack>

      <Stack spacing={0.5}>
        <Stack direction="row" justifyContent="space-between" spacing={1}>
          <Typography variant="caption" color="text.secondary">
            Progress
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {mission.progress}/{mission.target} {mission.unit}
          </Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={progressPercent}
          color={mission.priority === 'high' ? 'error' : 'warning'}
          sx={{
            height: 8,
            borderRadius: 999,
            backgroundColor: 'rgba(255,255,255,0.06)',
          }}
        />
      </Stack>

      <Typography variant="caption" color="text.secondary">
        {mission.rationale}
      </Typography>
    </Stack>
  )
}
