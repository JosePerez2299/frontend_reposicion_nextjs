import { useAnalisisStore } from "@/stores/resposicion-analisis.store";
import { AnalisisFilterPanel } from "./AnalisisFilterPanel";
import { AnalisisTable } from "./AnalisisTable";
import { AnalisisStatsCards } from "./AnalisisStatsCards";
import { DatePickerWithRange } from "@/components/ui/date-rangepicker";

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
        <div className="flex items-center justify-center h-full">
          <div>No hay filtros aplicados</div>
        </div>
      )}
    </div>
  );
};
