import { useAnalisisStore } from "@/stores/resposicion-analisis.store";
import { useOpcionesFiltros } from "../queries/filtros.queries";

export function AnalisisFilterPanel() {
  const { filters, applyFilters, appliedFilters } = useAnalisisStore();
  const {
    data: opcionesFiltros,
    isLoading: isLoadingFiltros,
    isError,
  } = useOpcionesFiltros();

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Error al cargar los filtros</div>
      </div>
    );
  }

  return (
    <div className="flex gap-2 w-full bg-secondary p-2 rounded">
      <div className="flex gap-2 w-full bg-secondary p-4 rounded">
        <div className="w-full">
          {isLoadingFiltros ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            opcionesFiltros?.map((categoria: any) => (
              <div key={categoria.id} className="mb-6">
                {/* Level 1: Categoria */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <h3 className="font-semibold text-lg">{categoria.name}</h3>
                </div>

                {/* Level 2: Groups */}
                <div className="ml-6 space-y-3">
                  {categoria.groups.map((group: any) => (
                    <div
                      key={group.id}
                      className="border-l-2 border-gray-300 pl-4"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-1.5 bg-secondary rounded-full"></div>
                        <h4 className="font-medium">{group.name}</h4>
                      </div>

                      {/* Level 3: Subgroups */}
                      <div className="ml-4 space-y-1">
                        {group.subgroups.map((subgroup: any) => (
                          <div
                            key={subgroup.id}
                            className="flex items-center gap-2 text-sm text-gray-600"
                          >
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                            <span>{subgroup.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
