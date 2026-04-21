export enum OrderStatus {
  PENDING = "pending",
  NOT_APPROVED = "not_approved",
  APPROVED = "approved",
  REJECTED = "rejected",
  CANCELLED = "cancelled",
  COMPLETED = "completed",
}

export enum OrderItemType {
  BULTO = "BULTO",
  UNIDAD = "UNIDAD",
}

export type CreateOrderInput = {
  status?: OrderStatus;
  description?: string;
  priority: number;
};

export type UpdateOrderInput = {
  status?: OrderStatus;
  description?: string;
  priority?: number;
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
  type: OrderItemType;
  quantity: number;
  variant?: string;
  created_at: string;
  updated_at: string;
};

export type CreateOrderItemInput = {
  order_id: number;
  product_id: string;
  store_id: string;
  type: OrderItemType;
  quantity: number;
  variant?: string;
};

export type UpdateOrderItemInput = {
  product_id?: string;
  store_id?: string;
  type?: OrderItemType;
  quantity?: number;
  variant?: string;
  item_id: number;
};
