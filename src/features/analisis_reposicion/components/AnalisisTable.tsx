import { AnalisisCompactTable } from "./AnalisisCompactTable";
import { AnalisisExtendTable } from "./AnalisisExtendTable";
import { useAnalisisStore } from "@/stores/resposicion-analisis.store";

export function AnalisisTable({ viewMode }: { viewMode: "compact" | "full" }) {
  const { filters } = useAnalisisStore();

  return (
    <>
      {JSON.stringify(filters)}
      {viewMode === "compact" ? (
        <AnalisisCompactTable />
      ) : (
        <AnalisisExtendTable />
      )}
    </>
  );
}
