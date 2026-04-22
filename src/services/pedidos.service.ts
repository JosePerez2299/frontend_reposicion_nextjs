import { api } from "@/config/api";
import type { CreateOrderInput, Order, OrderStatus, OrderItem, CreateOrderItemInput, UpdateOrderItemInput, UpdateOrderInput } from "@/features/pedidos/types/pedido.types";
import { z } from "zod";

const OrderItemResponseSchema = z.object({
  id: z.number(),
  order_id: z.number(),
  product_id: z.string(),
  product_name: z.string().nullable(),
  store_id: z.string(),
  type: z.string(),
  quantity: z.number(),
  variant: z.string().nullable().optional(),
  unit_size: z.number().nullable().optional(),
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

// Servicios específicos para cada transición de estado
export async function approveOrder(orderId: number): Promise<Order> {
  const data = await api.post<Order>(`/orders/${orderId}/approve`, {});
  return data;
}

export async function rejectOrder(orderId: number): Promise<Order> {
  const data = await api.post<Order>(`/orders/${orderId}/reject`, {});
  return data;
}

export async function cancelOrder(orderId: number): Promise<Order> {
  const data = await api.post<Order>(`/orders/${orderId}/cancel`, {});
  return data;
}

export async function completeOrder(orderId: number): Promise<Order> {
  const data = await api.post<Order>(`/orders/${orderId}/complete`, {});
  return data;
}

export async function updateOrder(orderId: number, input: UpdateOrderInput): Promise<Order> {
  const data = await api.put<Order>(`/orders/${orderId}`, input);

  console.log(input);
  
  return data;
}

export async function fetchOrderItems(orderId: number, filters?: {
  product_id?: string;
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
  const payload: Partial<Pick<UpdateOrderItemInput, "quantity" | "type" | "variant" | "unit_size">> = {
    quantity: input.quantity,
    type: input.type,
    variant: input.variant,
    unit_size: input.unit_size,
  };
  const data = await api.put<OrderItemResponse>(`/orders/items/${itemId}`, payload);
  return data;
}

export async function deleteOrderItem(itemId: number): Promise<void> {
  await api.delete(`/orders/items/${itemId}`);
}


export const downloadPdf = async (orderId: number) => {
    const res = await api.download(`/orders/${orderId}/pdf`);

    const blob = new Blob([res.data], { type: "application/pdf" });

    // Intentar extraer nombre desde headers (backend)
    const contentDisposition = res.headers["content-disposition"];
    let filename = `order_${orderId}.pdf`;

    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?(.+)"?/);
      if (match?.[1]) filename = match[1];
    }

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();

    URL.revokeObjectURL(url);
  };
