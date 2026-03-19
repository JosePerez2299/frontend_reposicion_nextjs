import { useAnalisisStore } from "@/stores/resposicion-analisis.store";

export const AnalisisView = () => {
  const { viewMode, filterPanelOpen } = useAnalisisStore();
  return (
    <div>
      <div>AnalisisView</div>
      {viewMode === "compact" ? <div>Compact</div> : <div>Full</div>}
      {filterPanelOpen && <div>FilterPanel</div>}
    </div>
  );
};

