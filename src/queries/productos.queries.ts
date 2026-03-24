import { fetchProductosByName } from "@/services/productos.service";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "@/schemas/entities/product.schema";

export function useBuscarProductos(
  search: string,
  categoryId: string,
  groups: string[],
  subgroups: string[],
) {
  const q = search.trim();
  return useQuery<Product[]>({
    queryKey: ["productos", "search", q, categoryId, groups, subgroups],
    queryFn: () => fetchProductosByName(q, categoryId, groups, subgroups),
    enabled: q.length >= 2, // no busca hasta tener 2+ chars (ignora espacios)
    staleTime: 1000 * 30,
  });
}
