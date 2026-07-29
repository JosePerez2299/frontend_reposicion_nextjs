import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ApiError } from "@/config/api";
import {
  fetchSapItemAvailability,
  isValidSapProductCode,
  normalizeSapCode,
} from "@/services/sap.service";
import type { SapAvailability } from "@/schemas/entities/sap-availability.schema";

export function useSapItemAvailability(
  productCode?: string,
  options?: { onlyAvailable?: boolean; enabled?: boolean },
) {
  const code = normalizeSapCode(productCode ?? "");
  const onlyAvailable = options?.onlyAvailable ?? true;

  return useQuery<SapAvailability>({
    queryKey: ["sap", "availability", code, onlyAvailable],
    queryFn: () => fetchSapItemAvailability({ itemCode: code, onlyAvailable }),
    // Un código que no mide 10 no se consulta: el backend responde 400 y no hay nada que reintentar
    enabled: isValidSapProductCode(code) && options?.enabled !== false,
    staleTime: 1000 * 60 * 2,
    // Cambiar only_available no debe blanquear la matriz mientras llega la respuesta
    placeholderData: keepPreviousData,
    // El default global es retry: 1, así que un 404 se dispararía (y toastearía) dos veces
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false;
      return failureCount < 1;
    },
  });
}
