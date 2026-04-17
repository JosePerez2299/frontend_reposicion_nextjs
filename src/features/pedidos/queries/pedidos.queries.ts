import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createOrder, fetchOrders } from "@/services/pedidos.service";
import type { CreateOrderInput, Order, OrderStatus } from "@/features/pedidos/types/pedido.types";

export function useOrdersQuery(limit: number = 100, status?: OrderStatus) {
  return useQuery<Order[]>({
    queryKey: ["pedidos", "orders", { limit, status }],
    queryFn: () => fetchOrders(limit, status),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateOrderInput) => createOrder(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["pedidos", "orders"] });
    },
  });
}
