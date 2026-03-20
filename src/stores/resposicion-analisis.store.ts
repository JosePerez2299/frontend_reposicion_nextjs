import { create } from "zustand";

type ViewMode = "compact" | "full";

interface AnalisisStore {
  // UI
  viewMode: ViewMode;
  filterPanelOpen: boolean;

  // datos
  filters: AnalisisFilters;
  appliedFilters: AnalisisFilters;
  hasApplied: boolean;

  // acciones UI
  setViewMode: (mode: ViewMode) => void;
  toggleFilterPanel: () => void;
  closeFilterPanel: () => void;

  // acciones filtros
  setFilters: (filters: AnalisisFilters) => void;
  applyFilters: (filters: AnalisisFilters) => void;
  clearFilters: () => void;
}

export interface AnalisisFilters {
  category: string;
  groups: string[];
  subgroups: string[];
}

const INITIAL_FILTERS: AnalisisFilters = {
  category: "",
  groups: [],
  subgroups: [],
};

export const useAnalisisStore = create<AnalisisStore>((set) => ({
  // UI
  viewMode: "compact",
  filterPanelOpen: true,

  // datos
  filters: INITIAL_FILTERS,
  appliedFilters: INITIAL_FILTERS,
  hasApplied: false,

  // acciones UI
  setViewMode: (mode) => set({ viewMode: mode }),
  toggleFilterPanel: () =>
    set((state) => ({ filterPanelOpen: !state.filterPanelOpen })),
  closeFilterPanel: () => set({ filterPanelOpen: false }),

  // acciones filtros
  setFilters: (filters) => set({ filters }),
  applyFilters: (filters) =>
    set({
      filters,
      appliedFilters: filters,
      hasApplied: true,
      filterPanelOpen: false,
    }),
  clearFilters: () =>
    set({
      filters: INITIAL_FILTERS,
      appliedFilters: INITIAL_FILTERS,
      hasApplied: false,
    }),
}));
