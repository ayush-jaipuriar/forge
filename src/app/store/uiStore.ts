import { create } from 'zustand'
import type { DayMode, SyncStatus, WarState } from '@/domain/common/types'

type UiState = {
  dayMode: DayMode
  warState: WarState
  syncStatus: SyncStatus
  setDayMode: (dayMode: DayMode) => void
  setWarState: (warState: WarState) => void
  setSyncStatus: (syncStatus: SyncStatus) => void
}

export const useUiStore = create<UiState>((set) => ({
  dayMode: 'normal',
  warState: 'slipping',
  syncStatus: 'stable',
  setDayMode: (dayMode) => set({ dayMode }),
  setWarState: (warState) => set({ warState }),
  setSyncStatus: (syncStatus) => set({ syncStatus }),
}))
