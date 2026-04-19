"use client";

import { OrderStatus } from "@/features/pedidos/types/pedido.types";

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const base = "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium";

  switch (status) {
    case OrderStatus.PENDING:
      return <span className={`${base} bg-yellow-100 text-yellow-800`}>Pendiente</span>;
    case OrderStatus.APPROVED:
      return <span className={`${base} bg-green-100 text-green-800`}>Aprobada</span>;
    case OrderStatus.NOT_APPROVED:
      return <span className={`${base} bg-gray-100 text-gray-800`}>No aprobada</span>;
    case OrderStatus.REJECTED:
      return <span className={`${base} bg-red-100 text-red-800`}>Rechazada</span>;
    case OrderStatus.CANCELLED:
      return <span className={`${base} bg-gray-100 text-gray-800`}>Cancelada</span>;
    case OrderStatus.COMPLETED:
      return <span className={`${base} bg-blue-100 text-blue-800`}>Completada</span>;
    default:
      return <span className={`${base} bg-muted text-muted-foreground`}>{status}</span>;
  }
}

export default OrderStatusBadge;
