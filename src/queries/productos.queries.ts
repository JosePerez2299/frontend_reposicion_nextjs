import { fetchProductosByName } from "@/services/productos.service";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "@/schemas/entities/product.schema";

export function useBuscarProductos(search: string) {
  return useQuery<Product[]>({
    queryKey: ["productos", "search", search],
    queryFn: () => fetchProductosByName(search),
    enabled: search.length >= 2, // no busca hasta tener 2+ chars
    staleTime: 1000 * 30,
  });
}