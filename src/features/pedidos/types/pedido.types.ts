export type OrderStatus = "pending" | "approved" | "rejected" | "cancelled" | "completed" | string;

export type Order = {
  id: number;
  user_id: number;
  priority: number;
  description: string;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
};
