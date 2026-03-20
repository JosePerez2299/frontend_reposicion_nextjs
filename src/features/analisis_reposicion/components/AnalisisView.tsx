import { useAnalisisStore } from "@/stores/resposicion-analisis.store";
import { AnalisisFilterPanel } from "./AnalisisFilterPanel";
import { AnalisisTable } from "./AnalisisTable";

export const AnalisisView = () => {
  const { viewMode, hasApplied, filterPanelOpen } =
    useAnalisisStore();
  return (
    <div>
      {/* Filtros */}
      {filterPanelOpen && <AnalisisFilterPanel />}

      {/* Tabla */}
      {hasApplied ? (
        <>
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
