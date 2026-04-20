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
  filters?: { product_id?: string; store_id?: string },
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

export function useOrderItemsByOrderQuery(orderId?: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["pedidos", "orderItemsByOrder", orderId],
    queryFn: () => fetchOrderItems(orderId ?? 0),
    enabled: !!orderId && options?.enabled !== false,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

export function useCreateOrderItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateOrderItemInput) => createOrderItem(input),
    onSuccess: async (_, variables) => {
      const orderId = variables.order_id;
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["pedidos", "orderItems", orderId] }),
        queryClient.invalidateQueries({ queryKey: ["pedidos", "orderItemsByOrder", orderId] }),
      ]);
    },
  });
}

export function useUpdateOrderItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateOrderItemInput) => updateOrderItem(input.item_id, input),
    onSuccess: async (data) => {
      const orderId = data?.order_id;
      if (orderId) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["pedidos", "orderItems", orderId] }),
          queryClient.invalidateQueries({ queryKey: ["pedidos", "orderItemsByOrder", orderId] }),
        ]);
      } else {
        await queryClient.invalidateQueries({ queryKey: ["pedidos", "orderItems"] });
        await queryClient.invalidateQueries({ queryKey: ["pedidos", "orderItemsByOrder"] });
      }
    },
  });
}

export function useDeleteOrderItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    // Accept variables { itemId, orderId? } so callers can provide orderId for targeted invalidation
    mutationFn: (vars: { itemId: number; orderId?: number }) => deleteOrderItem(vars.itemId),
    onSuccess: async (_data, variables) => {
      const orderId = variables?.orderId;
      if (orderId) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["pedidos", "orderItems", orderId] }),
          queryClient.invalidateQueries({ queryKey: ["pedidos", "orderItemsByOrder", orderId] }),
        ]);
      } else {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["pedidos", "orderItems"] }),
          queryClient.invalidateQueries({ queryKey: ["pedidos", "orderItemsByOrder"] }),
        ]);
      }
    },
  });
}
