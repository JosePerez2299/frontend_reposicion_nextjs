import { api } from "@/config/api";
import type { CreateOrderInput, Order, OrderStatus, OrderItem, CreateOrderItemInput, UpdateOrderItemInput } from "@/features/pedidos/types/pedido.types";
import { z } from "zod";

const OrderItemResponseSchema = z.object({
  id: z.number(),
  order_id: z.number(),
  product_id: z.number(),
  store_id: z.string(),
  quantity: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type OrderItemResponse = z.infer<typeof OrderItemResponseSchema>;

export async function fetchOrders(limit: number = 10000, status?: OrderStatus): Promise<Order[]> {
  const data = await api.get<Order[]>("/orders/", { limit, status });
  return data;
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const data = await api.post<Order>("/orders/", input);
  return data;
}

export async function fetchOrderItems(orderId: number, filters?: {
  product_id?: number;
  store_id?: string;
}): Promise<OrderItemResponse[]> {
  const data = await api.get<OrderItemResponse[]>(`/orders/items/`, {
    order_id: orderId,
    ...filters,
  });
  return data;
}

export async function createOrderItem(input: CreateOrderItemInput): Promise<OrderItemResponse> {
  const data = await api.post<OrderItemResponse>("/orders/items/", input);
  return data;
}

export async function updateOrderItem(itemId: number, input: Partial<UpdateOrderItemInput>): Promise<OrderItemResponse> {
  const payload: Partial<Pick<UpdateOrderItemInput, 'quantity'>> = {
    quantity: input.quantity,
  };
  const data = await api.put<OrderItemResponse>(`/orders/items/${itemId}`, payload);
  return data;
}

export async function deleteOrderItem(itemId: number): Promise<void> {
  await api.delete(`/orders/items/${itemId}`);
}
