import { AnalisisCompactTable } from "./AnalisisCompactTable";
import { AnalisisExtendTable } from "./AnalisisExtendTable";

export function AnalisisTable({ viewMode }: { viewMode: "compact" | "full" }) {
  if (viewMode === "compact") {
    return <AnalisisCompactTable />;
  }
  return <AnalisisExtendTable />;
}
