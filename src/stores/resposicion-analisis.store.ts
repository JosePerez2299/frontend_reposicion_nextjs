import { create } from "zustand";

type ViewMode = "compact" | "full";

interface AnalisisStore {
  // UI
  viewMode: ViewMode;
  filterPanelOpen: boolean;

  // estado efectivo (source of truth)
  filters: AnalisisFilters;

  // acciones UI
  setViewMode: (mode: ViewMode) => void;
  toggleFilterPanel: () => void;
  closeFilterPanel: () => void;
  hasActiveFilters: () => boolean;
  // acciones filtros
  setFilters: (filters: AnalisisFilters) => void;
  clearFilters: () => void;
}

export interface AnalisisFilters {
  dates: {
    start: string;
    end: string;
  };
  category: string;
  groups: string[];
  subgroups: string[];
}

const INITIAL_FILTERS: AnalisisFilters = {
  dates: {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    end: new Date().toISOString().split("T")[0],
  },
  category: "",
  groups: [], 
  subgroups: [],
};

export const useAnalisisStore = create<AnalisisStore>((set, get) => ({
  // UI
  viewMode: "compact",
  filterPanelOpen: true,

  // datos
  filters: INITIAL_FILTERS,

  // acciones UI
  setViewMode: (mode) => set({ viewMode: mode }),
  toggleFilterPanel: () =>
    set((state) => ({ filterPanelOpen: !state.filterPanelOpen })),
  closeFilterPanel: () => set({ filterPanelOpen: false }),
  hasActiveFilters: () => {
    const { filters } = get();
    return (
      !!filters.category ||
      filters.groups.length > 0 ||
      filters.subgroups.length > 0
    );
  },
  // acciones filtros
  setFilters: (filters) => set({ filters }),
  clearFilters: () =>
    set({
      filters: INITIAL_FILTERS,
    }),
}));
