import { localDayInstanceRepository, localSettingsRepository } from '@/data/local'
import type { AnalyticsRollingWindowKey } from '@/domain/analytics/types'
import { getDateKey } from '@/domain/routine/week'
import { generateAnalyticsSnapshotBundle } from '@/services/analytics/snapshotGeneration'

export async function getRollingAnalyticsWorkspace(windowKey: AnalyticsRollingWindowKey, anchorDate = new Date()) {
  const anchorDateKey = getDateKey(anchorDate)
  const settings = await localSettingsRepository.getDefault()
  const dayInstances = await localDayInstanceRepository.listAll()
  const bundle = generateAnalyticsSnapshotBundle({
    dayInstances,
    settings,
    anchorDate,
  })
  const snapshot = bundle.rollingSnapshots.find((entry) => entry.windowKey === windowKey)

  return {
    anchorDate: anchorDateKey,
    windowKey,
    facts: bundle.facts.filter((fact) => fact.date >= (snapshot?.sourceRange.startDate ?? anchorDateKey) && fact.date <= anchorDateKey),
    snapshot: snapshot ?? bundle.rollingSnapshots[0],
  }
}
