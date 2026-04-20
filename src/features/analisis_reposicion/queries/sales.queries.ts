import { useQuery } from "@tanstack/react-query";
import { fetchRotation } from "@/services/analisis.service";
import { RotationRequest } from "@/schemas/api/analisis.schemas";

export const useRotationQuery = (
  filters: RotationRequest,
  page: number,
  limit: number,
  enabled?: boolean,
) => {
  return useQuery({
    queryKey: ["analisis", "rotation", filters, page, limit],
    queryFn: () => fetchRotation(filters, page, limit),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled:
      enabled !== undefined
        ? enabled
        : Object.keys(filters).length > 0 &&
          !!filters.dates?.from &&
          !!filters.dates?.to,
  });
};
