import { create } from "zustand";
import { DateRange } from "react-day-picker";


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
