"use client";

import { useState } from "react";
import { Order, OrderStatus } from "@/features/pedidos/types/pedido.types";
import { Button } from "@/components/ui/button";
import { useUpdateOrderMutation, useApproveOrderMutation, useRejectOrderMutation, useCancelOrderMutation, useCompleteOrderMutation } from "@/features/pedidos/queries/pedidos.queries";
import { OrderStatusConfirmDialog } from "@/features/pedidos/components/OrderStatusConfirmDialog";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";

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
      return "Eliminar";
    case OrderStatus.COMPLETED:
      return "Completar";
    default:
      return "Actualizar";
  }
}

type Props = {
  order: Order;
  onStatusChange?: () => void;
  className?: string;
  orderItems?: any[];
};

export function OrderProcessButtons({ order, onStatusChange, className, orderItems = [] }: Props) {
  const updateOrderMutation = useUpdateOrderMutation();
  const approveOrderMutation = useApproveOrderMutation();
  const rejectOrderMutation = useRejectOrderMutation();
  const cancelOrderMutation = useCancelOrderMutation();
  const completeOrderMutation = useCompleteOrderMutation();
  const allowed = getAllowedTransitions(order.status);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingNextStatus, setPendingNextStatus] = useState<OrderStatus | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  const requestStatusChange = (next: OrderStatus) => {
    // Prevent processing from pending to not_approved if there are no items
    if (next === OrderStatus.NOT_APPROVED && orderItems.length === 0) {
      toast.error("No se puede procesar la orden", {
        description: "La orden debe tener al menos un item para poder procesarla",
      });
      return;
    }
    
    setPendingNextStatus(next);
    setConfirmOpen(true);
  };

  const handleStatusConfirm = async () => {
    if (!pendingNextStatus) return;
    setStatusError(null);

    try {
      switch (pendingNextStatus) {
        case OrderStatus.NOT_APPROVED:
          await updateOrderMutation.mutateAsync({ orderId: order.id, input: { status: pendingNextStatus } });
          break;
        case OrderStatus.APPROVED:
          await approveOrderMutation.mutateAsync(order.id);
          break;
        case OrderStatus.REJECTED:
          await rejectOrderMutation.mutateAsync(order.id);
          break;
        case OrderStatus.COMPLETED:
          await completeOrderMutation.mutateAsync(order.id);
          break;
        case OrderStatus.CANCELLED:
          await cancelOrderMutation.mutateAsync(order.id);
          break;
        default:
          await updateOrderMutation.mutateAsync({ orderId: order.id, input: { status: pendingNextStatus } });
      }

      toast.success(`Orden #${order.id} actualizada`, {
        description: `Estado cambiado a: ${getStatusActionLabel(pendingNextStatus)}`,
      });
      
      onStatusChange?.();
    } catch (error) {
      setStatusError(getErrorMessage(error));
      throw error;
    }
  };

  if (allowed.length === 0) {
    return null;
  }

  return (
    <>
      <div className={`flex items-center gap-2 ${className}`}>
        {allowed.map((next) => {
          const isDisabled = updateOrderMutation.isPending || 
                            (next === OrderStatus.NOT_APPROVED && orderItems.length === 0);
          
          return (
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
              disabled={isDisabled}
              title={next === OrderStatus.NOT_APPROVED && orderItems.length === 0 
                ? "La orden debe tener al menos un item para poder procesarla" 
                : undefined}
            >
              {updateOrderMutation.isPending && updateOrderMutation.variables?.orderId === order.id
                ? "..."
                : getStatusActionLabel(next)}
            </Button>
          );
        })}
      </div>

      {pendingNextStatus && (
        <OrderStatusConfirmDialog
          open={confirmOpen}
          onOpenChange={(next) => {
            setConfirmOpen(next);
            if (!next) {
              setPendingNextStatus(null);
              setStatusError(null);
            }
          }}
          orderId={order.id}
          currentStatus={order.status}
          nextStatus={pendingNextStatus}
          actionLabel={getStatusActionLabel(pendingNextStatus)}
          onConfirm={handleStatusConfirm}
          isPending={
            updateOrderMutation.isPending ||
            approveOrderMutation.isPending ||
            rejectOrderMutation.isPending ||
            cancelOrderMutation.isPending ||
            completeOrderMutation.isPending
          }
          error={statusError}
        />
      )}
    </>
  );
}

export default OrderProcessButtons;
