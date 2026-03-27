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

export type PrepTopicProgressSnapshot = {
  confidence?: ConfidenceLevel
  exposureState?: PrepExposureState
  revisionCount: number
  solvedCount: number
  exposureCount: number
  hoursSpent: number
  notes?: string
}

export type PrepTopicRecord = PrepTopicSeed & {
  confidence: ConfidenceLevel
  exposureState: PrepExposureState
  revisionCount: number
  solvedCount: number
  exposureCount: number
  hoursSpent: number
  notes?: string
}
