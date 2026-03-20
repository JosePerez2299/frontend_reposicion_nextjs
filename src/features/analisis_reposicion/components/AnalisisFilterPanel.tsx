import { useAnalisisStore } from "@/stores/resposicion-analisis.store";

export function AnalisisFilterPanel() {
  const { filters, applyFilters,  appliedFilters, setFilters } = useAnalisisStore();

  const onClickFilters = () => {
    applyFilters(filters);
  };

  return (


    <div className="flex gap-2 w-full bg-secondary p-2 rounded">

      <h2>Filtros aplicados:</h2>
      {Object.keys(appliedFilters).map((key) => (
        <div key={key}>
          {key}: {appliedFilters[key as keyof typeof appliedFilters]}
        </div>
      ))} 
      <button onClick={onClickFilters}>Buscar</button>
    </div>
  );
}
