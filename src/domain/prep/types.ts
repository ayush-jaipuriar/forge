import type { ConfidenceLevel, PrepExposureState, ReadinessLevel } from '@/domain/common/types'

export type PrepDomainKey = 'dsa' | 'systemDesign' | 'lld' | 'javaBackend' | 'secondary'

export type PrepTopicSeed = {
  id: string
  domain: PrepDomainKey
  title: string
  group: string
  defaultConfidence: ConfidenceLevel
  defaultExposureState: PrepExposureState
  readinessLevel: ReadinessLevel
}
