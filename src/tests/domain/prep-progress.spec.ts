import { describe, expect, it } from 'vitest'
import { forgePrepTaxonomy } from '@/data/seeds'
import { getPrepDomainSummaries, mergePrepTopicProgress } from '@/domain/prep/selectors'

describe('prep progress selectors', () => {
  it('merges persisted progress into the seeded prep taxonomy and derives richer readiness', () => {
    const topic = forgePrepTaxonomy[0]
    const records = mergePrepTopicProgress(forgePrepTaxonomy, {
      [topic.id]: {
        confidence: 'high',
        exposureState: 'retention',
        revisionCount: 3,
        solvedCount: 4,
        exposureCount: 2,
        hoursSpent: 2.5,
        notes: 'Stable enough for timed reps.',
      },
    })

    const updated = records.find((record) => record.id === topic.id)

    expect(updated?.confidence).toBe('high')
    expect(updated?.readinessLevel).toBe('onTrack')
    expect(updated?.notes).toMatch(/timed reps/i)
  })

  it('summarizes touched topics, high-confidence counts, and hours by domain', () => {
    const [first, second] = forgePrepTaxonomy.filter((topic) => topic.domain === 'dsa').slice(0, 2)
    const records = mergePrepTopicProgress(forgePrepTaxonomy, {
      [first.id]: {
        confidence: 'high',
        exposureState: 'retention',
        revisionCount: 2,
        solvedCount: 3,
        exposureCount: 1,
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
    })

    const dsaSummary = getPrepDomainSummaries(records).find((summary) => summary.domain === 'dsa')

    expect(dsaSummary?.touchedTopicCount).toBeGreaterThanOrEqual(2)
    expect(dsaSummary?.highConfidenceCount).toBeGreaterThanOrEqual(1)
    expect(dsaSummary?.hoursSpent).toBeGreaterThanOrEqual(2)
  })
})
