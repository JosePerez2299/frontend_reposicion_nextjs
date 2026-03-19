import { create } from "zustand";

type ViewMode = "compact" | "full";

interface AnalisisStore {
  viewMode: ViewMode;
  filterPanelOpen: boolean;
  filters: Record<string, any>;
  setViewMode: (mode: ViewMode) => void;
  toggleFilterPanel: () => void;
  closeFilterPanel: () => void;
  setFilters: (filters: Record<string, any>) => void;
}

export const useAnalisisStore = create<AnalisisStore>((set) => ({
  // estado inicial
  viewMode: "compact",
  filterPanelOpen: true,
  filters: {
    almacen: "",
    producto: "",
    proveedor: "",
  },

  // acciones
  setViewMode: (mode) => set({ viewMode: mode }),
  toggleFilterPanel: () =>
    set((state) => ({ filterPanelOpen: !state.filterPanelOpen })),
  closeFilterPanel: () => set({ filterPanelOpen: false }),
  setFilters: (filters) => set({ filters }),
}));
