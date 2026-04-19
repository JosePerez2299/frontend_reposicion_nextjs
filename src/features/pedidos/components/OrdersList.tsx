"use client";

import { useState } from "react";
import { Order } from "@/features/pedidos/types/pedido.types";
import OrderStatusBadge from "./OrderStatusBadge";
import OrderDetailModal from "./OrderDetailModal";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Clock, Hash, AlignLeft } from "lucide-react";

function OrderRow({ order }: { order: Order }) {
  const [open, setOpen] = useState(false);
  const isPending = order.status === "pending";

  return (
    <>
      <li className="group bg-card border rounded-xl px-5 py-4 hover:border-primary/40 hover:shadow-sm transition-all duration-150">
        <div className="flex items-start gap-4">

          {/* Prioridad como indicador lateral */}
          <div className="flex-shrink-0 mt-0.5">
            <div
              className={`w-1.5 h-10 rounded-full ${
                order.priority >= 3
                  ? "bg-destructive"
                  : order.priority === 2
                  ? "bg-amber-400"
                  : "bg-muted-foreground/30"
              }`}
            />
          </div>

          {/* Bloque principal */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Fila 1: ID + fecha */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-base">Orden #{order.id}</span>
                {isPending && (
                  <span className="text-[10px] uppercase tracking-widest font-medium text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md">
                    Editable
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {new Date(order.created_at).toLocaleString("es-MX", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </div>
            </div>

            {/* Fila 2: descripción */}
            <p className="text-sm text-muted-foreground truncate">
              {order.description || "Sin descripción"}
            </p>

            {/* Fila 3: metadata + acciones */}
            <div className="flex items-center justify-between gap-2 flex-wrap pt-0.5">
              <div className="flex items-center gap-3">
                <OrderStatusBadge status={order.status} />
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Hash className="w-3 h-3" />
                  Prioridad{" "}
                  <span className="font-medium text-foreground">{order.priority}</span>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 gap-1.5 text-xs text-primary hover:text-primary hover:bg-primary/8 px-2.5"
                onClick={() => setOpen(true)}
              >
                Ver detalle
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </li>

      <OrderDetailModal open={open} onOpenChange={setOpen} order={order} />
    </>
  );
}

export function OrdersList({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed rounded-xl">
        <AlignLeft className="w-8 h-8 text-muted-foreground/40 mb-3" />
        <p className="text-sm text-muted-foreground">No hay órdenes para mostrar</p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {orders.map((o) => (
        <OrderRow key={o.id} order={o} />
      ))}
    </ul>
  );
}

export default OrdersList;