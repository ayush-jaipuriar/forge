import { Chip, Stack, Typography } from '@mui/material'
import type { StreakEntry } from '@/domain/analytics/types'

type StreakSummaryListProps = {
  streaks: StreakEntry[]
}

const streakLabels: Record<StreakEntry['category'], string> = {
  execution: 'Execution',
  deepWork: 'Deep Work',
  prep: 'Prep',
  workout: 'Workout',
  sleep: 'Sleep',
  logging: 'Logging',
}

export function StreakSummaryList({ streaks }: StreakSummaryListProps) {
  return (
    <Stack spacing={1}>
      {streaks.map((entry) => (
        <Stack
          key={entry.category}
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          justifyContent="space-between"
          sx={{
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 3,
            p: 1.25,
          }}
        >
          <Stack spacing={0.4}>
            <Typography variant="subtitle2">{streakLabels[entry.category]}</Typography>
            <Typography variant="caption" color="text.secondary">
              {entry.lastBreakReason ?? 'No break recorded inside this window yet.'}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap" alignItems="center">
            <Chip label={`Current ${entry.current}`} size="small" />
            <Chip label={`Longest ${entry.longest}`} size="small" variant="outlined" />
            {entry.lastBreakDate ? <Chip label={`Last break ${entry.lastBreakDate.slice(5)}`} size="small" variant="outlined" /> : null}
          </Stack>
        </Stack>
      ))}
    </Stack>
  )
}
