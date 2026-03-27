import type { ReadinessLevel } from '@/domain/common/types'
import type { PrepDomainKey } from '@/domain/prep/types'

export type ReadinessSnapshot = {
  targetDate: string
  daysRemaining: number
  pressureLabel: string
  pressureLevel: ReadinessLevel
  focusedDomains: Array<{
    domain: PrepDomainKey
    label: string
    readinessLevel: ReadinessLevel
  }>
}
