"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { OrderStatus } from "@/features/pedidos/types/pedido.types";

interface OrderStatusConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: number;
  currentStatus: OrderStatus;
  nextStatus: OrderStatus;
  actionLabel: string;
  onConfirm: () => Promise<void>;
  isPending?: boolean;
  error?: string | null;
}

const getStatusMessage = (action: string, nextStatus: OrderStatus) => {
  switch (nextStatus) {
    case OrderStatus.NOT_APPROVED:
      return {
        title: `${action} orden`,
        description: `¿Estás seguro de que deseas ${action.toLowerCase()} esta orden?`,
      };
    case OrderStatus.APPROVED:
      return {
        title: `${action} orden`,
        description: `¿Estás seguro de que deseas ${action.toLowerCase()} esta orden?`,
      };
    case OrderStatus.REJECTED:
      return {
        title: `${action} orden`,
        description: `¿Estás seguro de que deseas ${action.toLowerCase()} esta orden? Esta acción no se puede deshacer.`,
      };
    case OrderStatus.CANCELLED:
      return {
        title: `${action} orden`,
        description: `¿Estás seguro de que deseas ${action.toLowerCase()} esta orden? Esta acción no se puede deshacer.`,
      };
    case OrderStatus.COMPLETED:
      return {
        title: `${action} orden`,
        description: `¿Estás seguro de que deseas ${action.toLowerCase()} esta orden?`,
      };
    default:
      return {
        title: `${action} orden`,
        description: `¿Estás seguro de que deseas ${action.toLowerCase()} esta orden?`,
      };
  }
};

export function OrderStatusConfirmDialog({
  open,
  onOpenChange,
  orderId,
  currentStatus,
  nextStatus,
  actionLabel,
  onConfirm,
  isPending = false,
  error = null,
}: OrderStatusConfirmDialogProps) {
  const [showError, setShowError] = useState(false);

  const messages = getStatusMessage(actionLabel, nextStatus);

  const handleConfirm = async () => {
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (err) {
      setShowError(true);
    }
  };

  const handleClose = () => {
    if (!isPending) {
      setShowError(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        {!showError ? (
          <>
            <DialogHeader>
              <DialogTitle>{messages.title}</DialogTitle>
              <DialogDescription>
                {messages.description}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={isPending}
                variant={nextStatus === OrderStatus.CANCELLED || nextStatus === OrderStatus.REJECTED ? "destructive" : "default"}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  actionLabel
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <DialogTitle className="text-center text-red-700 mb-2">
              Ocurrió un error
            </DialogTitle>
            <DialogDescription className="text-center text-red-600">
              {error || "No se pudo completar la acción. Inténtalo de nuevo."}
            </DialogDescription>
            <Button
              variant="outline"
              onClick={handleClose}
              className="mt-4"
            >
              Cerrar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
