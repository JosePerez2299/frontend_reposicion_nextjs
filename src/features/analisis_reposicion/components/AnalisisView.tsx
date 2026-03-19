import { useAnalisisStore } from "@/stores/resposicion-analisis.store";
import { AnalisisFilterPanel } from "./AnalisisFilterPanel";
import { AnalisisTable } from "./AnalisisTable";

export const AnalisisView = () => {
  const { viewMode, filters, filterPanelOpen } = useAnalisisStore();
  return (
    <div>
      {/* Filtros */}
      {filterPanelOpen && <AnalisisFilterPanel />}

      {/* Tabla */}
      {Object.keys(filters).length > 0 && <AnalisisTable viewMode={viewMode} />}
    </div>
  );
};
