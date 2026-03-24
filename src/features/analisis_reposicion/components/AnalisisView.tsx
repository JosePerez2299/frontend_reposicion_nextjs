import { useAnalisisStore } from "@/stores/resposicion-analisis.store";
import { AnalisisFilterPanel } from "./AnalisisFilterPanel";
import { AnalisisTable } from "./AnalisisTable";
import { AnalisisStatsCards } from "./AnalisisStatsCards";
import { FilterX, Info } from "lucide-react";


const NoFiltersMessage = () => {
  return (
    <div className="flex -mt-50 items-center justify-center">
      <div className="flex flex-col items-center text-center gap-2">
        <div className="flex items-center justify-center size-10 rounded-full bg-secondary border border-border">
          <FilterX size={18} className="text-muted-foreground" />
        </div>
        <h3 className="text-sm font-semibold">No hay filtros aplicados</h3>
        <p className="text-xs text-muted-foreground max-w-[320px]">
          Selecciona un rango de fechas y aplica los filtros para ver el análisis.
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
          <Info size={14} />
          <span>El rango permitido es de hasta 365 días hacia atrás.</span>
        </div>
      </div>
    </div>
  );
};

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
        <div className="w-full h-screen flex items-center justify-center">
          <NoFiltersMessage />
        </div>
      )}
    </div>
  );
};
