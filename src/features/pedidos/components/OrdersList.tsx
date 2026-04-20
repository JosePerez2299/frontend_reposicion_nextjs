"use client";

import { useState } from "react";
import { Order, OrderStatus } from "@/features/pedidos/types/pedido.types";
import OrderStatusBadge from "./OrderStatusBadge";
import OrderDetailModal from "./OrderDetailModal";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Clock, Hash, AlignLeft } from "lucide-react";
import { useUpdateOrderMutation } from "@/features/pedidos/queries/pedidos.queries";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";

const STATUS_RANK: Record<OrderStatus, number> = {
  [OrderStatus.PENDING]: 0,
  [OrderStatus.NOT_APPROVED]: 1,
  [OrderStatus.APPROVED]: 2,
  [OrderStatus.CANCELLED]: 3,
  [OrderStatus.REJECTED]: 3,
  [OrderStatus.COMPLETED]: 4,
};

function getAllowedTransitions(status: OrderStatus): OrderStatus[] {
  switch (status) {
    case OrderStatus.PENDING:
      return [OrderStatus.NOT_APPROVED, OrderStatus.CANCELLED];
    case OrderStatus.NOT_APPROVED:
      return [OrderStatus.APPROVED, OrderStatus.REJECTED, OrderStatus.CANCELLED];
    case OrderStatus.APPROVED:
      return [OrderStatus.COMPLETED];
    case OrderStatus.REJECTED:
    case OrderStatus.CANCELLED:
    case OrderStatus.COMPLETED:
    default:
      return [];
  }
}

function getStatusActionLabel(next: OrderStatus) {
  switch (next) {
    case OrderStatus.NOT_APPROVED:
      return "Procesar";
    case OrderStatus.APPROVED:
      return "Aprobar";
    case OrderStatus.REJECTED:
      return "Rechazar";
    case OrderStatus.CANCELLED:
      return "Cancelar";
    case OrderStatus.COMPLETED:
      return "Completar";
    default:
      return "Actualizar";
  }
}

function OrderRow({ order }: { order: Order }) {
  const [open, setOpen] = useState(false);
  const isPending = order.status === "pending";
  const updateOrderMutation = useUpdateOrderMutation();
  const allowed = getAllowedTransitions(order.status);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingNextStatus, setPendingNextStatus] = useState<OrderStatus | null>(null);

  const requestStatusChange = (next: OrderStatus) => {
    if (next === OrderStatus.CANCELLED) {
      setPendingNextStatus(next);
      setConfirmOpen(true);
      return;
    }
    updateOrderMutation.mutate({ orderId: order.id, input: { status: next } });
  };

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
              <div className="flex items-center gap-2">
                {allowed.map((next) => (
                  <Button
                    key={next}
                    size="sm"
                    variant={next === OrderStatus.CANCELLED ? "destructive" : "outline"}
                    className={
                      next === OrderStatus.CANCELLED
                        ? "h-7 text-xs px-3"
                        : "h-7 text-xs px-3"
                    }
                    onClick={() => requestStatusChange(next)}
                    disabled={updateOrderMutation.isPending}
                  >
                    {updateOrderMutation.isPending && updateOrderMutation.variables?.orderId === order.id
                      ? "..."
                      : getStatusActionLabel(next)}
                  </Button>
                ))}

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
        </div>
      </li>

      <OrderDetailModal open={open} onOpenChange={setOpen} order={order} />

      <DeleteConfirmDialog
        open={confirmOpen}
        onOpenChange={(next) => {
          setConfirmOpen(next);
          if (!next) setPendingNextStatus(null);
        }}
        title="Cancelar orden"
        description="¿Estás seguro que deseas cancelar esta orden? Esta acción no se puede deshacer."
        isPending={updateOrderMutation.isPending}
        confirmLabel="Cancelar"
        onConfirm={async () => {
          if (!pendingNextStatus) return;
          await updateOrderMutation.mutateAsync({
            orderId: order.id,
            input: { status: pendingNextStatus },
          });
          setConfirmOpen(false);
          setPendingNextStatus(null);
        }}
      />
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

  const sorted = [...orders].sort((a, b) => {
    const ra = STATUS_RANK[a.status];
    const rb = STATUS_RANK[b.status];
    if (ra !== rb) return ra - rb;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <ul className="space-y-2">
      {sorted.map((o) => (
        <OrderRow key={o.id} order={o} />
      ))}
    </ul>
  );
}

export default OrdersList;