// services/reportes.service.ts
import { AnalisisFilters } from "@/schemas/api/analisis.schemas";
import { ApiError } from "@/config/api";
import { format } from "date-fns";
import Cookies from "js-cookie";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

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

export async function exportAllProductsDetailsXml(
  filters: AnalisisFilters,
): Promise<void> {
  const requestBody = mapFiltersToExportRequest(filters);
  const token = Cookies.get("auth_token");

  const response = await fetch(
    `${BASE_URL}sales/export-all-products-details-xml`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(requestBody),
    },
  );

  if (!response.ok) {
    const text = await response.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      data = { detail: text };
    }
    throw ApiError.fromResponse(response.status, data);
  }

  const reader = response.body!.getReader();
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  const blob = new Blob(chunks as unknown as BlobPart[], { type: "application/xml" });
  const dateStr = format(filters.dates.from, "yyyy-MM-dd");

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `ventas-productos-${dateStr}.xml`;
  link.click();
  URL.revokeObjectURL(url);
}