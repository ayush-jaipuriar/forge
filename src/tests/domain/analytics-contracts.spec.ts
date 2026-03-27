import { describe, expect, it } from 'vitest'
import {
  ANALYTICS_SNAPSHOT_VERSION,
  analyticsRollingWindowKeys,
  createDefaultAnalyticsMetadataSnapshot,
  createDefaultProjectionSnapshot,
  createDefaultStreakSnapshot,
  createEmptyAnalyticsBreakdowns,
  createEmptyAnalyticsSummaryMetrics,
} from '@/domain/analytics/types'

describe('analytics contracts', () => {
  it('creates zeroed summary metrics so later derivations have a stable baseline shape', () => {
    const metrics = createEmptyAnalyticsSummaryMetrics()

    expect(metrics.trackedDays).toBe(0)
    expect(metrics.completedBlocks).toBe(0)
    expect(metrics.scoreAverages.master).toBe(0)
    expect(metrics.scoreAverages.consistency).toBe(0)
  })

  it('creates empty breakdown groups for every chart family before data is available', () => {
    const breakdowns = createEmptyAnalyticsBreakdowns()

    expect(breakdowns.byDayType).toEqual([])
    expect(breakdowns.byWeekday).toEqual([])
    expect(breakdowns.byPrepDomain).toEqual([])
    expect(breakdowns.byWarState).toEqual([])
  })

  it('creates an honest projection snapshot that starts in insufficient-data state', () => {
    const snapshot = createDefaultProjectionSnapshot('2026-05-31', '2026-03-28')

    expect(snapshot.snapshotVersion).toBe(ANALYTICS_SNAPSHOT_VERSION)
    expect(snapshot.targetDate).toBe('2026-05-31')
    expect(snapshot.lastEvaluatedDate).toBe('2026-03-28')
    expect(snapshot.status).toBe('insufficientData')
    expect(snapshot.confidence).toBe('low')
    expect(snapshot.curve).toEqual([])
  })

  it('creates streak and momentum defaults across all supported streak categories', () => {
    const snapshot = createDefaultStreakSnapshot('2026-03-28T00:00:00.000Z')

    expect(snapshot.snapshotVersion).toBe(ANALYTICS_SNAPSHOT_VERSION)
    expect(snapshot.activeStreaks).toHaveLength(6)
    expect(snapshot.activeStreaks.every((entry) => entry.current === 0 && entry.longest === 0)).toBe(true)
    expect(snapshot.momentum.level).toBe('insufficientData')
    expect(snapshot.momentum.trailingWindow).toBe('7d')
  })

  it('creates metadata defaults that advertise the supported rolling windows and hardening posture', () => {
    const metadata = createDefaultAnalyticsMetadataSnapshot()

    expect(metadata.snapshotVersion).toBe(ANALYTICS_SNAPSHOT_VERSION)
    expect(metadata.availableRollingWindows).toEqual([...analyticsRollingWindowKeys])
    expect(metadata.functionsEnabled).toBe(false)
    expect(metadata.appCheckStatus).toBe('notConfigured')
  })
})
