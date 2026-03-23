import { useAnalisisStore } from "@/stores/resposicion-analisis.store";
import { AnalisisFilterPanel } from "./AnalisisFilterPanel";
import { AnalisisTable } from "./AnalisisTable";
import { AnalisisStatsCards } from "./AnalisisStatsCards";

export const AnalisisView = () => {
  const { viewMode, filters, hasActiveFilters, filterPanelOpen } =
    useAnalisisStore();
  return (
    <div>
      {/* Filtros */}
      {filterPanelOpen && <AnalisisFilterPanel />}
      {/* Tabla */}
      {hasActiveFilters() ? (
        <>
          <AnalisisStatsCards />
          <AnalisisTable viewMode={viewMode} />
        </>
      ) : (
        <div>No hay filtros aplicados</div>
      )}
    </div>
  );
};
