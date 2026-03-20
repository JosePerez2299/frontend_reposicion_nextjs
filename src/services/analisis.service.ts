import { api } from "@/config/api";
import {
  FilterOptions,
  FilterOptionsSchema,
} from "@/schemas/entities/product.schema";

export async function fetchOpcionesFiltros(): Promise<FilterOptions> {
  const data = await api.get("/products/filter-options");
  return FilterOptionsSchema.parse(data);
}
