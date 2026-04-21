import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createOrder, fetchOrders, fetchOrderItems, createOrderItem, updateOrder, updateOrderItem, deleteOrderItem, approveOrder, rejectOrder, cancelOrder, completeOrder } from "@/services/pedidos.service";
import type { CreateOrderInput, Order, OrderStatus, CreateOrderItemInput, UpdateOrderInput, UpdateOrderItemInput } from "@/features/pedidos/types/pedido.types";
import type { OrderItemResponse } from "@/services/pedidos.service";

export function useOrdersQuery(limit: number = 100, status?: OrderStatus) {
  return useQuery<Order[]>({
    queryKey: ["pedidos", "orders", { limit, status }],
    queryFn: () => fetchOrders(limit, status),
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vars: { orderId: number; input: UpdateOrderInput }) =>
      updateOrder(vars.orderId, vars.input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["pedidos", "orders"] });
    },
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
      // Mantener actualizado el cache global de items por orden para permitir UI reactiva (checks)
      queryClient.setQueryData(
        ["pedidos", "orderItemsByOrder", orderId],
        (prev: OrderItemResponse[] | undefined) => {
          const existing = prev ?? [];
          // Evitar duplicados por id si el backend retorna el item creado
          const created = _ as OrderItemResponse;
          if (!created?.id) return existing;
          if (existing.some((it) => it.id === created.id)) return existing;
          return [...existing, created];
        }
      );

      // Mantener coherencia de vistas filtradas (sheet) si existen, sin tocar la lista completa.
      await queryClient.invalidateQueries({ queryKey: ["pedidos", "orderItems", orderId] });
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
        queryClient.setQueryData(
          ["pedidos", "orderItemsByOrder", orderId],
          (prev: OrderItemResponse[] | undefined) => {
            const existing = prev ?? [];
            if (!data?.id) return existing;
            return existing.map((it) => (it.id === data.id ? (data as OrderItemResponse) : it));
          }
        );
        await queryClient.invalidateQueries({ queryKey: ["pedidos", "orderItems", orderId] });
      } else {
        await queryClient.invalidateQueries({ queryKey: ["pedidos", "orderItems"] });
        await queryClient.invalidateQueries({ queryKey: ["pedidos", "orderItemsByOrder"] });
      }
    },
  });
}

export function useApproveOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: number) => approveOrder(orderId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["pedidos", "orders"] });
    },
  });
}

export function useRejectOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: number) => rejectOrder(orderId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["pedidos", "orders"] });
    },
  });
}

export function useCancelOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: number) => cancelOrder(orderId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["pedidos", "orders"] });
    },
  });
}

export function useCompleteOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: number) => completeOrder(orderId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["pedidos", "orders"] });
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
        queryClient.setQueryData(
          ["pedidos", "orderItemsByOrder", orderId],
          (prev: OrderItemResponse[] | undefined) => {
            const existing = prev ?? [];
            return existing.filter((it) => it.id !== variables.itemId);
          }
        );
        await queryClient.invalidateQueries({ queryKey: ["pedidos", "orderItems", orderId] });
      } else {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["pedidos", "orderItems"] }),
          queryClient.invalidateQueries({ queryKey: ["pedidos", "orderItemsByOrder"] }),
        ]);
      }
    },
  });
}
