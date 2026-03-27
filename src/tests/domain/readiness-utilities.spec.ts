import { describe, expect, it } from 'vitest'
import { forgePrepTaxonomy } from '@/data/seeds'
import { mergePrepTopicProgress } from '@/domain/prep/selectors'
import { calculateReadinessSnapshot } from '@/domain/readiness/calculateReadinessSnapshot'

describe('readiness utilities', () => {
  it('derives pace and domain readiness from persisted prep activity', () => {
    const [first, second, third] = forgePrepTaxonomy.slice(0, 3)
    const topicRecords = mergePrepTopicProgress(forgePrepTaxonomy, {
      [first.id]: {
        confidence: 'high',
        exposureState: 'retention',
        revisionCount: 2,
        solvedCount: 3,
        exposureCount: 2,
        hoursSpent: 1.5,
      },
      [second.id]: {
        confidence: 'medium',
        exposureState: 'introduced',
        revisionCount: 1,
        solvedCount: 0,
        exposureCount: 1,
        hoursSpent: 0.5,
      },
      [third.id]: {
        confidence: 'low',
        exposureState: 'notStarted',
        revisionCount: 0,
        solvedCount: 0,
        exposureCount: 0,
        hoursSpent: 0,
      },
    })

    const readiness = calculateReadinessSnapshot({
      date: '2026-03-27',
      focusedDomains: [],
      topics: topicRecords,
    })

    expect(readiness.domainStates.length).toBeGreaterThan(0)
    expect(readiness.paceSnapshot.totalTopicCount).toBe(forgePrepTaxonomy.length)
    expect(readiness.paceSnapshot.touchedTopicCount).toBeGreaterThan(0)
    expect(readiness.paceSnapshot.requiredTopicsPerWeek).toBeGreaterThanOrEqual(0)
  })
})
