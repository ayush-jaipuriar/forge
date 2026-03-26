import { getPhysicalSnapshot } from '@/data/seeds/usePhysicalSnapshot'
import { getPrepSnapshot } from '@/data/seeds/usePrepSnapshot'

describe('seed-derived snapshots', () => {
  it('builds prep summaries from the seeded taxonomy and routine focus', () => {
    const snapshot = getPrepSnapshot(new Date('2026-03-23T08:30:00'))

    expect(snapshot.totalTopicCount).toBeGreaterThan(0)
    expect(snapshot.domainSummaries.some((domain) => domain.label === 'DSA')).toBe(true)
    expect(snapshot.focusedDomains.length).toBeGreaterThan(0)
  })

  it('builds physical summaries from the seeded workout schedule', () => {
    const snapshot = getPhysicalSnapshot(new Date('2026-03-23T08:30:00'))

    expect(snapshot.scheduledWorkout?.label).toBe('Upper A')
    expect(snapshot.weeklyWorkoutSummary.scheduledCount).toBeGreaterThan(0)
  })
})
