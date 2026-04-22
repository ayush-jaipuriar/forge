import { describe, expect, it } from 'vitest'
import { getConnectivityStatusModel, getPwaSurfaceMode, shouldShowPwaStatusCard } from '@/features/pwa/pwaStatus'

describe('pwaStatus helpers', () => {
  it('surfaces the strongest offline queue warning when connectivity is down and writes are outstanding', () => {
    const model = getConnectivityStatusModel({
      isOnline: false,
      syncStatus: 'queued',
    })

    expect(model.eyebrow).toBe('Offline Queue')
    expect(model.tone).toBe('warning')
    expect(model.detail).toMatch(/replay/i)
  })

  it('treats a healthy connected shell as success', () => {
    const model = getConnectivityStatusModel({
      isOnline: true,
      syncStatus: 'stable',
    })

    expect(model.title).toBe('Installable and connected')
    expect(model.tone).toBe('success')
  })

  it('surfaces degraded sync as a recovery problem instead of a generic queued state', () => {
    const model = getConnectivityStatusModel({
      isOnline: true,
      syncStatus: 'degraded',
    })

    expect(model.eyebrow).toBe('Sync Degraded')
    expect(model.detail).toMatch(/replay attempt failed/i)
  })

  it('shows the status surface only when update, offline, or sync states need user attention', () => {
    expect(
      shouldShowPwaStatusCard({
        isOnline: true,
        syncStatus: 'stable',
        canInstall: false,
        needRefresh: false,
        offlineReady: false,
      }),
    ).toBe(false)

    expect(
      shouldShowPwaStatusCard({
        isOnline: false,
        syncStatus: 'stable',
        canInstall: false,
        needRefresh: false,
        offlineReady: false,
      }),
    ).toBe(true)

    expect(
      shouldShowPwaStatusCard({
        isOnline: true,
        syncStatus: 'stable',
        canInstall: true,
        needRefresh: false,
        offlineReady: false,
      }),
    ).toBe(false)
  })

  it('hides healthy installability and offline-ready prompts from normal app flow', () => {
    expect(
      getPwaSurfaceMode({
        pathname: '/',
        isOnline: true,
        syncStatus: 'stable',
        canInstall: true,
        needRefresh: false,
        offlineReady: false,
      }),
    ).toBe('hidden')

    expect(
      getPwaSurfaceMode({
        pathname: '/settings',
        isOnline: true,
        syncStatus: 'stable',
        canInstall: false,
        needRefresh: false,
        offlineReady: true,
      }),
    ).toBe('hidden')
  })

  it('hides healthy installability prompts on non-core routes but keeps error states prominent everywhere', () => {
    expect(
      getPwaSurfaceMode({
        pathname: '/command-center',
        isOnline: true,
        syncStatus: 'stable',
        canInstall: true,
        needRefresh: false,
        offlineReady: false,
      }),
    ).toBe('hidden')

    expect(
      getPwaSurfaceMode({
        pathname: '/command-center',
        isOnline: false,
        syncStatus: 'stable',
        canInstall: false,
        needRefresh: false,
        offlineReady: false,
      }),
    ).toBe('card')
  })
})
