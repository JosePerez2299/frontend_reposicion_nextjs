import { useAnalisisStore } from "@/stores/resposicion-analisis.store";
import { AnalisisFilterPanel } from "./AnalisisFilterPanel";
import { AnalisisTable } from "./AnalisisTable";

export const AnalisisView = () => {
  const { viewMode, appliedFilters, hasApplied, filterPanelOpen } =
    useAnalisisStore();
  return (
    <div>
      {/* Filtros */}
      {filterPanelOpen && <AnalisisFilterPanel />}

      {/* Tabla */}
      {hasApplied ? (
        <>
          {Object.keys(appliedFilters).map((key) => (
            <div key={key}>
              {key}: {appliedFilters[key as keyof typeof appliedFilters]}
            </div>
          ))}
          <hr className="mb-4" />
          <h2 className="text-lg text-center font-semibold mb-4">Tabla</h2>
          <AnalisisTable viewMode={viewMode} />
        </>
      ) : (
        <div>No hay filtros aplicados</div>
      )}
    </div>
  );
};
