import { localDayInstanceRepository } from '@/data/local'
import { resetForgeDb } from '@/data/local/forgeDb'
import { getCommandCenterWorkspace } from '@/services/analytics/commandCenterWorkspaceService'
import type { DayInstance } from '@/domain/routine/types'

describe('command center workspace service', () => {
  beforeEach(async () => {
    await resetForgeDb()
  })

  it('returns an honest empty-state workspace on a clean local database', async () => {
    const workspace = await getCommandCenterWorkspace('30d', new Date('2026-03-28T00:00:00.000Z'))

    expect(workspace.dataState).toBe('empty')
    expect(workspace.metrics[0]?.value).toBe('0')
    expect(workspace.warnings[0]?.title).toMatch(/history window is still empty/i)
    expect(workspace.projection.status).toBe('insufficientData')
    expect(workspace.missions).toHaveLength(0)
    expect(workspace.momentum.level).toBe('insufficientData')
  })

  it('keeps prep-domain attention scoped to the selected rolling window', async () => {
    await localDayInstanceRepository.upsertMany([
      createDayInstance({
        id: 'day-old',
        date: '2026-03-01',
        focusAreas: ['System Design'],
        durationMinutes: 120,
      }),
      createDayInstance({
        id: 'day-recent',
        date: '2026-03-27',
        focusAreas: ['DSA'],
        durationMinutes: 60,
      }),
    ])

    const recentWorkspace = await getCommandCenterWorkspace('7d', new Date('2026-03-28T00:00:00.000Z'))
    const broadWorkspace = await getCommandCenterWorkspace('30d', new Date('2026-03-28T00:00:00.000Z'))

    expect(recentWorkspace.prepDomainBalance.map((entry) => entry.key)).toEqual(['dsa'])
    expect(broadWorkspace.prepDomainBalance.map((entry) => entry.key)).toEqual(
      expect.arrayContaining(['dsa', 'systemDesign']),
    )
  })
})

function createDayInstance({
  id,
  date,
  focusAreas,
  durationMinutes,
}: {
  id: string
  date: string
  focusAreas: string[]
  durationMinutes: number
}): DayInstance {
  return {
    id,
    date,
    weekday: 'friday',
    dayType: 'wfhHighOutput',
    dayMode: 'normal',
    label: 'WFH High Output',
    focusLabel: 'Prime execution',
    expectationSummary: ['Protect the prime execution window.'],
    blocks: [
      {
        id: `${id}-block`,
        templateId: `${id}-template`,
        title: 'Prep block',
        kind: 'deepWork',
        status: 'completed',
        executionNote: 'Completed a meaningful output.',
        startTime: '08:00',
        endTime: '09:30',
        durationMinutes,
        detail: 'Focused prep work.',
        focusAreas,
        requiredOutput: true,
        optional: false,
        date,
      },
    ],
  }
}
