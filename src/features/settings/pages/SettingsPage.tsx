import SettingsSuggestRoundedIcon from '@mui/icons-material/SettingsSuggestRounded'
import { Grid, Stack } from '@mui/material'
import { EmptyState } from '@/components/common/EmptyState'
import { SectionHeader } from '@/components/common/SectionHeader'
import { SurfaceCard } from '@/components/common/SurfaceCard'

const settingsCards = [
  'Firebase connection status',
  'PWA install state',
  'Google Calendar scaffolding',
  'Feature flags and future provider hooks',
]

export function SettingsPage() {
  return (
    <Stack spacing={3}>
      <SectionHeader
        eyebrow="Settings"
        title="Infrastructure surfaces belong here."
        description="This screen will become the operational home for auth, integration status, installability, and future extension flags."
      />
      <Grid container spacing={2}>
        {settingsCards.map((item) => (
          <Grid key={item} size={{ xs: 12, md: 6 }}>
            <SurfaceCard title={item} />
          </Grid>
        ))}
      </Grid>
      <EmptyState
        icon={<SettingsSuggestRoundedIcon color="primary" />}
        title="Integration controls will land here."
        description="Empty and placeholder states now use a deliberate pattern instead of ad hoc text blocks, so unfinished areas can still feel intentional."
      />
    </Stack>
  )
}
