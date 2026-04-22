import { create } from "zustand";
import { AnalisisFilters } from "@/schemas/api/analisis.schemas";
import type { Order } from "@/features/pedidos/types/pedido.types";

export type StoreCellSheetData = {
  product_id: string;
  product_name: string;
  store_id: string;
  store_name: string;
  rotation_pct: string;
  rotation_text_class: string;
  qty_stock: number;
  qty_sold: number;
};

interface AnalisisStore {
  // UI
  viewMode: "compact" | "detailed";
  filterPanelOpen: boolean;
  storeCellSheetOpen: boolean;
  storeCellSheetData: StoreCellSheetData | null;

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
  openStoreCellSheet: (data: StoreCellSheetData) => void;
  closeStoreCellSheet: () => void;
  setStoreCellSheetOpen: (open: boolean) => void;

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
  storeCellSheetOpen: false,
  storeCellSheetData: null,

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
  openStoreCellSheet: (data) => set({ storeCellSheetOpen: true, storeCellSheetData: data }),
  closeStoreCellSheet: () => set({ storeCellSheetOpen: false, storeCellSheetData: null }),
  setStoreCellSheetOpen: (open) =>
    set((state) => ({
      storeCellSheetOpen: open,
      storeCellSheetData: open ? state.storeCellSheetData : null,
    })),

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
      storeCellSheetOpen: false,
      storeCellSheetData: null,
      filters: INITIAL_FILTERS,
      filtersApplied: false,
      page: 1,
      selectedOrder: null,
    }),

  // acciones orden
  setSelectedOrder: (order) => set({ selectedOrder: order }),
  clearSelectedOrder: () => set({ selectedOrder: null }),
}));
