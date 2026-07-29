import { useAnalisisStore } from "@/stores/resposicion-analisis.store";
import { AnalisisFilterPanel } from "./AnalisisFilterPanel";
import { AnalisisStatsCards } from "./AnalisisStatsCards";
import { useRotation } from "../hooks/useRotation";
import { AnalisisTable } from "./AnalisisTable";
import { SkeletonTable } from "./SkeletonTable";
import { NoFiltersMessage } from "./NoFilterMessage";
import { Button } from "@/components/ui/button";


export const AnalisisView = () => {
  const { page, filterPanelOpen, filtersApplied, filters, setFilters } =
    useAnalisisStore();

  const { data, isLoading, isError } = useRotation(
    filtersApplied,
    page,
    10
  );

  const isEmpty = !!data && (data.pagination?.total_count ?? 0) === 0;

  if (isLoading) {
    return <SkeletonTable />;
  }

  if (isError) {
    return <div>Error</div>;
  }

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      {/* Filtros */}
      {filterPanelOpen && (
        <div className="flex-none">
          <AnalisisFilterPanel />
        </div>
      )}

      {filtersApplied && data && isEmpty ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-md space-y-3 text-center">
            <p className="text-sm font-medium">
              Ningún producto coincide con estos filtros
            </p>
            {filters.only_supplier_stock ? (
              <>
                <p className="text-sm text-muted-foreground">
                  El filtro <strong>Solo con stock</strong> del mayorista está activo, así que
                  se descartaron los productos sin disponibilidad en el proveedor. Si esperabas
                  ver resultados, puede que el snapshot de disponibilidad no haya corrido
                  todavía.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters({ ...filters, only_supplier_stock: false })}
                >
                  Quitar el filtro de mayorista
                </Button>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Probá ampliar el rango de fechas o quitar alguna categoría.
              </p>
            )}
          </div>
        </div>
      ) : filtersApplied && data ? (
        <>
          {/* Stats */}
          <div className="flex-none">
            <AnalisisStatsCards />
          </div>
          {/* Tabla — ocupa todo el espacio restante, scrolleable internamente */}
          <div className="flex-1 min-h-0 overflow-hidden px-4 pb-4">
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
