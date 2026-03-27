import type { ReadinessLevel } from '@/domain/common/types'
import type { PrepDomainKey } from '@/domain/prep/types'

export type ReadinessDomainState = {
  domain: PrepDomainKey
  label: string
  readinessLevel: ReadinessLevel
  touchedTopicCount: number
  totalTopicCount: number
  highConfidenceCount: number
  hoursSpent: number
}

export type ReadinessPaceSnapshot = {
  touchedTopicCount: number
  totalTopicCount: number
  highConfidenceTopicCount: number
  coveragePercent: number
  requiredTopicsPerWeek: number
  paceLevel: ReadinessLevel
  paceLabel: string
}

export type ReadinessSnapshot = {
  targetDate: string
  daysRemaining: number
  pressureLabel: string
  pressureLevel: ReadinessLevel
  paceSnapshot: ReadinessPaceSnapshot
  domainStates: ReadinessDomainState[]
  focusedDomains: Array<{
    domain: PrepDomainKey
    label: string
    readinessLevel: ReadinessLevel
  }>
}
