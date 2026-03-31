import { api } from "@/config/api";
import {
  FilterOptions,
  FilterOptionsSchema,
} from "@/schemas/entities/product.schema";
import { RotationRequest } from "@/schemas/api/analisis.schemas";

export async function fetchOpcionesFiltros(): Promise<FilterOptions> {
  const data = await api.get("/products/filter-options");
  return FilterOptionsSchema.parse(data);
}

export async function fetchRotation(filters: RotationRequest ): Promise<any> {
  const data = await api.post("sales/rotation", filters);
  return data;
}

