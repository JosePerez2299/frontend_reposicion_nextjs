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
  /**
   * SKU de 13 del proveedor. `null` en los ítems creados antes de la integración
   * con SAP: son los que guardan tallas de Stellar de 2 caracteres ("35", "36")
   * o directamente ningún variant. Es el discriminador entre las dos épocas.
   */
  sap_item_code: string | null;
  product_id: string;
  store_id: string;
  type: OrderItemType;
  product_name: string | null;
  /** Preempaque de SAP de 3 chars ("C41", "400") en los ítems nuevos. */
  variant: string | null;
  /** Bultos si type es BULTO, unidades si es UNIDAD. */
  quantity: number;
  /** Piezas por bulto (SalFactor2). Lo deriva el backend del SKU. */
  unit_size: number | null;
  created_at: string;
  updated_at: string;
};

/**
 * Se manda el SKU de 13 y el backend deriva product_id, variant, type, unit_size
 * y product_name consultando SAP. No mandes esos campos: los rechaza.
 */
export type CreateOrderItemInput = {
  order_id: number;
  store_id: string;
  item_code: string;
  quantity: number;
};

/** Cambiar `item_code` rederiva product_id, variant, unit_size y type juntos. */
export type UpdateOrderItemInput = {
  item_id: number;
  quantity?: number;
  item_code?: string;
};
