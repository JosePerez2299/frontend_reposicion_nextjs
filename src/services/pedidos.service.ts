import { api } from "@/config/api";
import type { CreateOrderInput, Order, OrderStatus } from "@/features/pedidos/types/pedido.types";

export async function fetchOrders(limit: number = 10000, status?: OrderStatus): Promise<Order[]> {
  const data = await api.get<Order[]>("/orders/", { limit, status });
  return data;
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const data = await api.post<Order>("/orders/", input);
  return data;
}
