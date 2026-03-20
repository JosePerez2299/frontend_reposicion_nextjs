import { useAnalisisStore } from "@/stores/resposicion-analisis.store";

export function AnalisisFilterPanel() {
  const { filters, applyFilters, setFilters } = useAnalisisStore();

  const onClickFilters = () => {
    applyFilters(filters);
  };

  const handleClear = () => {
    // TODO: Implement clear logic
  };
  return (
    <div className="flex gap-2 w-full bg-secondary p-2 rounded">
      <select
        value={filters.stores}
        onChange={(e) => setFilters({ ...filters, stores: e.target.value })}
      >
        <option value="">Todos</option>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
      </select>

      <button onClick={onClickFilters}>Buscar</button>
    </div>
  );
}
