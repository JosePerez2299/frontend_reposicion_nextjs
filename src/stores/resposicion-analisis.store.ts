import { create } from "zustand";
import { AnalisisFilters } from "@/schemas/api/analisis.schemas";
import type { Order } from "@/features/pedidos/types/pedido.types";

interface AnalisisStore {
  // UI
  viewMode: "compact" | "detailed";
  filterPanelOpen: boolean;

  // datos
  filters: AnalisisFilters;
  filtersApplied: boolean;

  // paginación
  page: number;

  // order selection
  selectedOrder: Order | null;

  // acciones UI
  setViewMode: (mode: "compact" | "detailed") => void;
  toggleFilterPanel: () => void;
  closeFilterPanel: () => void;
  hasActiveFilters: () => boolean;

  // acciones filtros
  setFilters: (filters: AnalisisFilters) => void;
  clearFilters: () => void;
  setFiltersApplied: (applied: boolean) => void;
  resetFiltersApplied: () => void;

  // acciones paginación
  setPage: (page: number) => void;
  reset: () => void;

  // acciones orden
  setSelectedOrder: (order: Order | null) => void;
  clearSelectedOrder: () => void;
}


export const INITIAL_FILTERS: AnalisisFilters = {
  dates: {
    from: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    to: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  category: "",
  groups: [],
  subgroups: [],
  product_codes: [],
  store_ids: [],
};

export const useAnalisisStore = create<AnalisisStore>((set, get) => ({
  // UI
  viewMode: "compact",
  filterPanelOpen: true,

  // datos
  filters: INITIAL_FILTERS,
  filtersApplied: false,

  // paginación
  page: 1,

  // order selection
  selectedOrder: null,

  // acciones UI
  setViewMode: (mode) => set({ viewMode: mode }),
  toggleFilterPanel: () =>
    set((state) => ({ filterPanelOpen: !state.filterPanelOpen })),
  closeFilterPanel: () => set({ filterPanelOpen: false }),
  hasActiveFilters: () => {
    const { filters } = get();
    return (
      filters.product_codes.length > 0 ||
      (filters.dates.from !== undefined && filters.dates.to !== undefined) ||
      filters.category !== "" ||
      filters.groups.length > 0 ||
      filters.subgroups.length > 0
    );
  },

  // acciones filtros
  // Al aplicar nuevos filtros, resetea la página a 1
  setFilters: (filters) => set({ filters, page: 1 }),
  clearFilters: () => set({ filters: INITIAL_FILTERS, page: 1, filtersApplied: false }),
  setFiltersApplied: (applied) => set({ filtersApplied: applied }),
  resetFiltersApplied: () => set({ filtersApplied: false }),

  // acciones paginación
  setPage: (page) => set({ page }),
  reset: () =>
    set({
      viewMode: "compact",
      filterPanelOpen: true,
      filters: INITIAL_FILTERS,
      filtersApplied: false,
      page: 1,
      selectedOrder: null,
    }),

  // acciones orden
  setSelectedOrder: (order) => set({ selectedOrder: order }),
  clearSelectedOrder: () => set({ selectedOrder: null }),
}));
