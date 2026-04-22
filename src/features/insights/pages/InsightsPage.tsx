import { useMemo } from 'react'
import { Box, Chip, Stack, Tab, Tabs } from '@mui/material'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { SectionHeader } from '@/components/common/SectionHeader'
import { SurfaceCard } from '@/components/common/SurfaceCard'
import { CommandCenterPage } from '@/features/command-center/pages/CommandCenterPage'
import { ReadinessPage } from '@/features/readiness/pages/ReadinessPage'

type InsightsView = 'weekly' | 'readiness'

export function InsightsPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const activeView = useMemo<InsightsView>(() => {
    const requestedView = searchParams.get('view')

    return requestedView === 'readiness' ? 'readiness' : 'weekly'
  }, [searchParams])

  return (
    <Stack spacing={3}>
      <SurfaceCard>
        <Stack spacing={2}>
          <SectionHeader
            eyebrow="Insights"
            title="Read the pattern before it becomes expensive."
            description="See drift, pace, and weekly signals in one place instead of splitting insight across multiple routes."
            action={<Chip label={activeView === 'weekly' ? 'Weekly view' : 'Readiness view'} size="small" variant="outlined" />}
          />

          <Tabs
            value={activeView}
            onChange={(_event, nextView: InsightsView) => {
              navigate({
                pathname: '/insights',
                search: nextView === 'weekly' ? '?view=weekly' : '?view=readiness',
              })
            }}
            variant="scrollable"
            allowScrollButtonsMobile
            aria-label="Insights sections"
          >
            <Tab label="Weekly" value="weekly" />
            <Tab label="Readiness" value="readiness" />
          </Tabs>
        </Stack>
      </SurfaceCard>

      <Box data-insights-view={activeView}>
        {activeView === 'weekly' ? <CommandCenterPage embedded /> : <ReadinessPage embedded />}
      </Box>
    </Stack>
  )
}
