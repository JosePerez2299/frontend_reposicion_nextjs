import { useRotationQuery } from "../queries/sales.queries";
import { RotationRequest } from "@/schemas/api/analisis.schemas";
import { useAnalisisStore } from "@/stores/resposicion-analisis.store";

export const useRotation = (enabled?: boolean) => {
  const { filters } = useAnalisisStore();

    const filtersReq: RotationRequest = {
      ...filters,
      dates: {
        start: filters.dates?.from ? new Date(filters.dates.from).toISOString().split('T')[0] + 'T00:00:00.000Z' : undefined,
        end: filters.dates?.to ? new Date(filters.dates.to).toISOString().split('T')[0] + 'T00:00:00.000Z' : undefined,
      },
      product_codes: filters.productIds,
    };

    return useRotationQuery(filtersReq, enabled);
};
