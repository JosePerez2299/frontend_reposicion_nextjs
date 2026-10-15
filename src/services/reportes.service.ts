// services/reportes.service.ts
import { AnalisisFilters } from "@/schemas/api/analisis.schemas";
import { api } from "@/config/api";
import { format } from "date-fns";

const XLSX_MIME =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

function mapFiltersToExportRequest(filters: AnalisisFilters) {
  return {
    body: {
      product_codes: filters.product_codes,
      store_ids: filters.store_ids,
      category_id: filters.category,
      group_ids: filters.groups,
      subgroup_ids: filters.subgroups,
      only_supplier_stock: filters.only_supplier_stock,
    },
    dates: {
      start: format(filters.dates.from, "yyyy-MM-dd"),
      end: format(filters.dates.to, "yyyy-MM-dd"),
    },
  };
}

/**
 * Descarga el detalle de productos como .xlsx. El backend arma el archivo
 * completo antes de responder, así que no hay progreso parcial.
 */
export async function exportAllProductsDetailsXlsx(
  filters: AnalisisFilters,
): Promise<void> {
  const res = await api.postDownload(
    "/sales/export-all-products-details-xlsx",
    mapFiltersToExportRequest(filters),
  );

  const blob = new Blob([res.data], { type: XLSX_MIME });

  const contentDisposition: string | undefined = res.headers["content-disposition"];
  const filename =
    contentDisposition?.match(/filename="?([^";]+)"?/)?.[1] ??
    `detalle_productos_${format(filters.dates.from, "yyyyMMdd")}_${format(filters.dates.to, "yyyyMMdd")}.xlsx`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
