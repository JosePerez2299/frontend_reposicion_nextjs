import { create } from "zustand";
import { DateRange } from "react-day-picker";

type ViewMode = "compact" | "full";

interface AnalisisStore {
  // UI
  viewMode: ViewMode;
  filterPanelOpen: boolean;

  // estado efectivo (source of truth)
  filters: AnalisisFilters;

  // paginación
  page: number;

  // acciones UI
  setViewMode: (mode: ViewMode) => void;
  toggleFilterPanel: () => void;
  closeFilterPanel: () => void;
  hasActiveFilters: () => boolean;

  // acciones filtros
  setFilters: (filters: AnalisisFilters) => void;
  clearFilters: () => void;

  // acciones paginación
  setPage: (page: number) => void;
}

export interface AnalisisFilters {
  dates: DateRange;
  category: string;
  groups: string[];
  subgroups: string[];
  productIds: string[];
}

export const INITIAL_FILTERS: AnalisisFilters = {
  dates: {
    from: undefined,
    to: undefined,
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

  // paginación
  page: 1,

  // acciones UI
  setViewMode: (mode) => set({ viewMode: mode }),
  toggleFilterPanel: () =>
    set((state) => ({ filterPanelOpen: !state.filterPanelOpen })),
  closeFilterPanel: () => set({ filterPanelOpen: false }),
  hasActiveFilters: () => {
    const { filters } = get();
    return (
      filters.productIds.length > 0 ||
      (filters.dates.from !== undefined && filters.dates.to !== undefined) ||
      filters.category !== "" ||
      filters.groups.length > 0 ||
      filters.subgroups.length > 0
    );
  },

  // acciones filtros
  // Al aplicar nuevos filtros, resetea la página a 1
  setFilters: (filters) => set({ filters, page: 1 }),
  clearFilters: () => set({ filters: INITIAL_FILTERS, page: 1 }),

  // acciones paginación
  setPage: (page) => set({ page }),
}));
