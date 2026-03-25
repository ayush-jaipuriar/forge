import { create } from 'zustand'
import type { DayMode, WarState } from '@/domain/common/types'

type UiState = {
  dayMode: DayMode
  warState: WarState
  setDayMode: (dayMode: DayMode) => void
  setWarState: (warState: WarState) => void
}

export const useUiStore = create<UiState>((set) => ({
  dayMode: 'normal',
  warState: 'slipping',
  setDayMode: (dayMode) => set({ dayMode }),
  setWarState: (warState) => set({ warState }),
}))
