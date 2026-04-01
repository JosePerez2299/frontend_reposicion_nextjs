import { api } from "@/config/api";
import {
  FilterOptions,
  FilterOptionsSchema,
} from "@/schemas/entities/product.schema";
import { RotationRequest } from "@/schemas/api/analisis.schemas";
import { Category } from "@/schemas/entities/product.schema";

export async function fetchOpcionesFiltros(): Promise<FilterOptions> {
  const categories: Category[] = await api.get("/products/filter-options");
  const stores: { id: string; name: string }[] = await api.get("/store"); 

  return FilterOptionsSchema.parse({
    categories,
    stores,
  });
}

export async function fetchRotation(filters: RotationRequest, page: number = 1, limit: number = 5 ): Promise<any> {

  console.log("filters", filters);
  console.log("page", page);
  console.log("limit", limit);
  const data = await api.post("sales/rotation", filters, {
    params: {
      current_page: page,
      limit,
    },
  });
  return data;
}

