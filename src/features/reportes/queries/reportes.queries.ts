import { useMutation } from "@tanstack/react-query";
import { exportAllProductsDetailsXml } from "@/services/reportes.service";
import { AnalisisFilters } from "@/schemas/api/analisis.schemas";

export function useExportAllProductsXmlMutation() {
  return useMutation({
    mutationFn: (filters: AnalisisFilters) =>
      exportAllProductsDetailsXml(filters),
  });
}
