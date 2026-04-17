import { useQuery } from "@tanstack/react-query";
import { fetchOrders } from "@/services/pedidos.service";
import type { Order } from "@/features/pedidos/types/pedido.types";

export function useOrdersQuery(limit: number = 100, enabled: boolean = true) {
  return useQuery<Order[]>({
    queryKey: ["pedidos", "orders", { limit }],
    queryFn: () => fetchOrders(limit),
    enabled,
    staleTime: 1000 * 60 * 5,
  });
}
