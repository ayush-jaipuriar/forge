import { describe, expect, it } from 'vitest'
import { buildPlatformWorkspace, derivePlatformRuntime, getPlatformCapability } from '@/domain/platform/capabilities'
import type { PlatformDetectionSnapshot } from '@/domain/platform/types'

function makeSnapshot(overrides: Partial<PlatformDetectionSnapshot> = {}): PlatformDetectionSnapshot {
  return {
    isNativeShell: false,
    nativePlatform: 'web',
    isInstalledPwa: false,
    canInstallPwa: false,
    isOnline: true,
    needRefresh: false,
    offlineReady: false,
    ...overrides,
  }
}

describe('platform capability interpretation', () => {
  it('treats a normal web session as the browser runtime', () => {
    const workspace = buildPlatformWorkspace(makeSnapshot())

    expect(derivePlatformRuntime(makeSnapshot())).toBe('browser')
    expect(workspace.shellLabel).toBe('Browser Tab')
    expect(workspace.shellSupportLabel).toBe('Primary runtime')
  })

  it('treats standalone install without Capacitor as an installed PWA runtime', () => {
    const workspace = buildPlatformWorkspace(
      makeSnapshot({
        isInstalledPwa: true,
        canInstallPwa: false,
      }),
    )

    expect(workspace.runtime).toBe('installedPwa')
    expect(workspace.shellLabel).toBe('Installed PWA')
    expect(workspace.installSurfaceLabel).toContain('Installed')
  })

  it('prefers native shell over installed PWA when Capacitor is active', () => {
    const workspace = buildPlatformWorkspace(
      makeSnapshot({
        isNativeShell: true,
        nativePlatform: 'android',
        isInstalledPwa: true,
      }),
    )

    expect(workspace.runtime).toBe('nativeShell')
    expect(workspace.shellLabel).toBe('Native Android Shell')
  })

  it('keeps browser auth and calendar as supported on the web runtime', () => {
    const workspace = buildPlatformWorkspace(makeSnapshot())

    expect(getPlatformCapability(workspace, 'auth')?.status).toBe('supported')
    expect(getPlatformCapability(workspace, 'calendar')?.status).toBe('supported')
  })

  it('keeps installed PWA notifications as supported through browser-owned delivery', () => {
    const workspace = buildPlatformWorkspace(
      makeSnapshot({
        isInstalledPwa: true,
      }),
    )

    expect(getPlatformCapability(workspace, 'notifications')?.status).toBe('supported')
    expect(getPlatformCapability(workspace, 'notifications')?.summary).toMatch(/browser permission/i)
  })

  it('marks native shell auth, notifications, backup export, restore import, and calendar as limited', () => {
    const workspace = buildPlatformWorkspace(
      makeSnapshot({
        isNativeShell: true,
        nativePlatform: 'android',
      }),
    )

    expect(getPlatformCapability(workspace, 'auth')?.status).toBe('limited')
    expect(getPlatformCapability(workspace, 'notifications')?.status).toBe('limited')
    expect(getPlatformCapability(workspace, 'backupExport')?.status).toBe('limited')
    expect(getPlatformCapability(workspace, 'restoreImport')?.status).toBe('limited')
    expect(getPlatformCapability(workspace, 'calendar')?.status).toBe('limited')
  })

  it('keeps health providers in planned state even inside the native shell', () => {
    const workspace = buildPlatformWorkspace(
      makeSnapshot({
        isNativeShell: true,
        nativePlatform: 'android',
      }),
    )

    expect(getPlatformCapability(workspace, 'health')?.status).toBe('planned')
    expect(getPlatformCapability(workspace, 'health')?.summary).toMatch(/no .* bridge|not implemented yet/i)
  })

  it('surfaces stronger support notes for the native shell', () => {
    const workspace = buildPlatformWorkspace(
      makeSnapshot({
        isNativeShell: true,
        nativePlatform: 'android',
      }),
    )

    expect(workspace.supportNotes.length).toBeGreaterThanOrEqual(3)
    expect(workspace.supportNotes.join(' ')).toMatch(/native push/i)
    expect(workspace.supportNotes.join(' ')).toMatch(/popup/i)
  })
})
