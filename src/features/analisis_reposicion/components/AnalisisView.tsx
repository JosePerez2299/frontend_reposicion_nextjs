import { useAnalisisStore } from "@/stores/resposicion-analisis.store";
import { AnalisisFilterPanel } from "./AnalisisFilterPanel";
import { AnalisisStatsCards } from "./AnalisisStatsCards";
import { useRotation } from "../hooks/useRotation";
import { AnalisisTable } from "./AnalisisTable";
import { SkeletonTable } from "./SkeletonTable";
import { NoFiltersMessage } from "./NoFilterMessage";


export const AnalisisView = () => {
  const { page, filterPanelOpen, filtersApplied } = useAnalisisStore();

  const { data, isLoading, isError } = useRotation(
    filtersApplied,
    page,
    10
  );

  if (isLoading) {
    return <SkeletonTable />;
  }

  if (isError) {
    return <div>Error</div>;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Filtros */}
      {filterPanelOpen && (
        <div className="flex-none">
          <AnalisisFilterPanel />
        </div>
      )}

      {filtersApplied && data ? (
        <>
          {/* Stats */}
          <div className="flex-none">
            <AnalisisStatsCards />
          </div>
          {/* Tabla */}
          <div className="flex-1 min-h-0">
            <AnalisisTable data={data} />
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <NoFiltersMessage />
        </div>
      )}
    </div>
  );
};
