import { fetchProductosByName } from "@/services/productos.service";
import { useQuery } from "@tanstack/react-query";

export function useBuscarProductos(search: string) {
  return useQuery({
    queryKey: ["productos", "search", search],
    queryFn: () => fetchProductosByName(search),
    enabled: search.length >= 2, // no busca hasta tener 2+ chars
    staleTime: 1000 * 30,
  });
}