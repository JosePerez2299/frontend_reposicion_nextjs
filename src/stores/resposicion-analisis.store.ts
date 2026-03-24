import { create } from "zustand";
import { DateRange } from "react-day-picker";

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
  dates: DateRange
  category: string
  groups: string[]
  subgroups: string[]
  productIds: string[]    
}
const DAY_MS = 24 * 60 * 60 * 1000;

export const INITIAL_FILTERS: AnalisisFilters = {
  dates: {
    from: new Date(Date.now() - DAY_MS - 29 * DAY_MS),
    to: new Date(Date.now() - DAY_MS),
  },
  category: "",
  groups: [],
  subgroups: [],
  productIds: [],
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
      (filters.dates.from !== undefined && filters.dates.to !== undefined) ||
      filters.category !== "" ||
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
