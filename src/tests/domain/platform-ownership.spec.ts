import { describe, expect, it } from 'vitest'
import { buildPlatformServiceWorkspace, createPlatformServiceBoundaries } from '@/domain/platform/ownership'

describe('platform ownership boundaries', () => {
  it('defines the expected browser, PWA, and Functions ownership map', () => {
    const boundaries = createPlatformServiceBoundaries()

    expect(boundaries.find((boundary) => boundary.key === 'localExecution')?.owner).toBe('browser')
    expect(boundaries.find((boundary) => boundary.key === 'pwaShell')?.owner).toBe('pwaRuntime')
    expect(boundaries.find((boundary) => boundary.key === 'scheduledBackups')?.owner).toBe('firebaseFunctions')
    expect(boundaries.find((boundary) => boundary.key === 'scheduledNotifications')?.owner).toBe('firebaseFunctions')
    expect(boundaries.find((boundary) => boundary.key === 'analyticsSnapshots')?.owner).toBe('firebaseFunctions')
  })

  it('marks current callable-backed Functions services as active and future extractions as planned', () => {
    const boundaries = createPlatformServiceBoundaries()

    expect(boundaries.find((boundary) => boundary.key === 'scheduledBackups')?.status).toBe('active')
    expect(boundaries.find((boundary) => boundary.key === 'scheduledNotifications')?.status).toBe('active')
    expect(boundaries.find((boundary) => boundary.key === 'analyticsSnapshots')?.status).toBe('active')
    expect(boundaries.find((boundary) => boundary.key === 'integrationTokens')?.status).toBe('planned')
    expect(boundaries.find((boundary) => boundary.key === 'diagnosticsAggregation')?.status).toBe('planned')
  })

  it('exposes only active callable-backed Functions services as user-invokable operations', () => {
    const workspace = buildPlatformServiceWorkspace()

    expect(workspace.userInvokableFunctions.map((boundary) => boundary.key)).toEqual([
      'scheduledBackups',
      'scheduledNotifications',
      'analyticsSnapshots',
    ])
    expect(workspace.userInvokableFunctions.every((boundary) => Boolean(boundary.callableName))).toBe(true)
  })
})
