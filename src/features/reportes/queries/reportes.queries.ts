import { useMutation } from "@tanstack/react-query";
import { exportAllProductsDetailsXlsx } from "@/services/reportes.service";
import { AnalisisFilters } from "@/schemas/api/analisis.schemas";

export function useExportAllProductsXlsxMutation() {
  return useMutation({
    mutationFn: (filters: AnalisisFilters) =>
      exportAllProductsDetailsXlsx(filters),
  });
}
