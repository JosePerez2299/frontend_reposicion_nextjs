import { useRotationQuery } from "../queries/sales.queries";
import { RotationRequest } from "@/schemas/api/analisis.schemas";
import { useAnalisisStore } from "@/stores/resposicion-analisis.store";

export const useRotation = (enabled?: boolean) => {
  const { filters } = useAnalisisStore();

    const filtersReq: RotationRequest = {
      ...filters,
      dates: {
        from: new Date(filters.dates.from),
        to: new Date(filters.dates.to),
      },
      productIds: filters.productIds,
    };

    return useRotationQuery(filtersReq, enabled);
};
