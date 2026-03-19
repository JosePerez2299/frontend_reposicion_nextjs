import { useAnalisisStore } from "@/stores/resposicion-analisis.store";

export function AnalisisFilterPanel() {
  const { filters, setFilters } = useAnalisisStore();
  const handleSearch = () => {
    setFilters({
      almacen: '1',
      producto: 'PRODUCTO_1',
      proveedor: 'PROVEEDOR_1',
    });
  };


  const onClickSearch = () => {
    handleSearch();
  };

  const handleClear = () => {
    // TODO: Implement clear logic
  };
  return (
    <div className="flex gap-2 w-full bg-secondary p-2 rounded">
      <select value={filters.almacen} onChange={(e) => setFilters({ ...filters, almacen: e.target.value })}>
        <option value="">Todos</option>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
      </select>

      <button onClick={onClickSearch}>Buscar</button>
    </div>
  );
}
