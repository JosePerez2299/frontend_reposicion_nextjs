import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createOrder, fetchOrders, fetchOrderItems, createOrderItem, updateOrderItem, deleteOrderItem } from "@/services/pedidos.service";
import type { CreateOrderInput, Order, OrderStatus, CreateOrderItemInput, UpdateOrderItemInput } from "@/features/pedidos/types/pedido.types";

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

export function useOrderItemsQuery(
  orderId: number,
  filters?: { product_id?: number; store_id?: string },
  options?: { enabled?: boolean }
) {
  const hasFilters = !!filters?.product_id && !!filters?.store_id;
  return useQuery({
    queryKey: ["pedidos", "orderItems", orderId, filters],
    queryFn: () => fetchOrderItems(orderId, filters),
    enabled: !!orderId && hasFilters && options?.enabled !== false,
    staleTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function useCreateOrderItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateOrderItemInput) => createOrderItem(input),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["pedidos", "orderItems", variables.order_id],
      });
    },
  });
}

export function useUpdateOrderItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateOrderItemInput) => updateOrderItem(input.item_id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["pedidos", "orderItems"] });
    },
  });
}

export function useDeleteOrderItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: number) => deleteOrderItem(itemId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["pedidos", "orderItems"] });
    },
  });
}
