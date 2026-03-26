import type { DayMode } from '@/domain/common/types'
import type { DayInstance } from '@/domain/routine/types'

export function applyDayModeToInstance(instance: DayInstance, dayMode: DayMode): DayInstance {
  if (dayMode === 'ideal' || dayMode === 'normal') {
    return {
      ...instance,
      dayMode,
    }
  }

  const allowedKinds = dayMode === 'lowEnergy' ? new Set(['deepWork', 'prep', 'workout', 'planning', 'recovery']) : new Set(['prep', 'planning', 'recovery'])

  return {
    ...instance,
    dayMode,
    dayType: dayMode === 'lowEnergy' ? 'lowEnergy' : 'survival',
    label: dayMode === 'lowEnergy' ? 'Low Energy Day' : 'Survival Day',
    focusLabel: dayMode === 'lowEnergy' ? 'Reduce load, preserve momentum' : 'Absolute minimum to preserve continuity',
    expectationSummary:
      dayMode === 'lowEnergy'
        ? ['reduce load', 'preserve momentum', 'lighter tasks', 'maintain minimum viable day']
        : ['absolute minimum', 'salvage mode', 'keep streak alive', 'protect sleep and recovery'],
    blocks: instance.blocks
      .filter((block) => allowedKinds.has(block.kind))
      .map((block) => ({
        ...block,
        optional:
          dayMode === 'survival'
            ? block.kind !== 'planning'
            : block.optional || (block.kind !== 'deepWork' && block.kind !== 'workout'),
      })),
  }
}
