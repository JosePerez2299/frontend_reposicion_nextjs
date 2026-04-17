import { api } from "@/config/api";
import type { Order } from "@/features/pedidos/types/pedido.types";

export async function fetchOrders(limit: number = 10000): Promise<Order[]> {
  const data = await api.get<Order[]>("/orders/", { limit });
  return data;
}
