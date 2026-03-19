import { create } from 'zustand'

type ViewMode = 'compact' | 'full'

interface AnalisisStore {
  viewMode: ViewMode
  filterPanelOpen: boolean
  setViewMode: (mode: ViewMode) => void
  toggleFilterPanel: () => void
  closeFilterPanel: () => void
}

export const useAnalisisStore = create<AnalisisStore>((set) => ({
  // estado inicial
  viewMode: 'compact',
  filterPanelOpen: true,

  // acciones
  setViewMode: (mode) => set({ viewMode: mode }),
  toggleFilterPanel: () => set((state) => ({ filterPanelOpen: !state.filterPanelOpen })),
  closeFilterPanel: () => set({ filterPanelOpen: false }),
}))