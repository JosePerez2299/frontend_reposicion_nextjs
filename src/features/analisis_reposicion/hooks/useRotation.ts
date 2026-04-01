import { useRotationQuery } from "../queries/sales.queries";
import { RotationRequest } from "@/schemas/api/analisis.schemas";
import { useAnalisisStore } from "@/stores/resposicion-analisis.store";

export const useRotation = (enabled?: boolean, page?: number, limit?: number) => {
  const { filters } = useAnalisisStore();

    const filtersReq: RotationRequest = {
      ...filters,
      dates: {
        from: new Date(filters.dates.from),
        to: new Date(filters.dates.to),
      },
      product_codes: filters.product_codes,
    };

    return useRotationQuery(filtersReq, page || 1, limit || 10, enabled);
};
