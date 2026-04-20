export enum OrderStatus {
  PENDING = "pending",
  NOT_APPROVED = "not_approved",
  APPROVED = "approved",
  REJECTED = "rejected",
  CANCELLED = "cancelled",
  COMPLETED = "completed",
}

export type CreateOrderInput = {
  status?: OrderStatus;
  description?: string;
  priority: number;
};

export type Order = {
  id: number;
  user_id: number;
  priority: number;
  description: string;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: number;
  order_id: number;
  product_id: string;
  store_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
};

export type CreateOrderItemInput = {
  order_id: number;
  product_id: string;
  store_id: string;
  quantity: number;
};

export type UpdateOrderItemInput = {
  product_id?: string;
  store_id?: string;
  quantity?: number;
  item_id: number;
};
