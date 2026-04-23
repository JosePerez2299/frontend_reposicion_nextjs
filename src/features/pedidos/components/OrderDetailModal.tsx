"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { useState } from "react";
import { AlertTriangle, FileDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { downloadPdf } from "@/services/pedidos.service";

import {
  useOrderItemsByOrderQuery,
  useUpdateOrderItemMutation,
  useDeleteOrderItemMutation,
} from "@/features/pedidos/queries/pedidos.queries";
import OrderStatusBadge from "./OrderStatusBadge";
import type { OrderItem } from "@/features/pedidos/types/pedido.types";
import { OrderItemType } from "@/features/pedidos/types/pedido.types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: any;
};

export function OrderDetailModal({ open, onOpenChange, order }: Props) {
  const {
    data: items,
    isLoading,
    isError,
    refetch,
  } = useOrderItemsByOrderQuery(order?.id, {
    enabled: open && !!order?.id,
  });

  const updateMutation = useUpdateOrderItemMutation();
  const deleteMutation = useDeleteOrderItemMutation();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingQty, setEditingQty] = useState<number>(1);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [downloadState, setDownloadState] = useState<"idle" | "loading" | "error">("idle");
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const isPending = order?.status === "pending";
  const isDownloading = downloadState === "loading";

  const startEdit = (it: OrderItem) => {
    setEditingId(it.id);
    setEditingQty(it.quantity);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingQty(1);
  };

  const handleUpdate = async (itemId: number) => {
    try {
      await updateMutation.mutateAsync({ item_id: itemId, quantity: editingQty });
      cancelEdit();
      refetch();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (itemId: number) => {
    try {
      await deleteMutation.mutateAsync({ itemId, orderId: order?.id });
      refetch();
    } catch (e) {
      console.error(e);
    }
  };

  const requestDelete = (itemId: number) => {
    setPendingDeleteId(itemId);
    setDeleteConfirmOpen(true);
  };

  const handleDownload = async () => {
    if (!order?.id) return;
    setDownloadError(null);
    setDownloadState("loading");

    let failed = false;
    try {
      await downloadPdf(order.id);
    } catch (error: any) {
      failed = true;
      const message = error?.message || "Ocurrió un error al descargar el PDF";
      setDownloadError(message);
      setDownloadState("error");
      toast.error(message);
    } finally {
      if (!failed) {
        setDownloadState("idle");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* sm:max-w-lg para un ancho cómodo en desktop */}
      <DialogContent className="fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col gap-0 overflow-hidden p-0">

        {/* ── Header ── */}
        <div className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-start justify-between gap-3">
            <div>
              <DialogTitle className="text-lg font-semibold leading-tight">
                Orden #{order?.id}
              </DialogTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {order?.description || "Sin descripción"}
              </p>
            </div>
            <OrderStatusBadge status={order?.status} />
          </div>
        </div>

        {(downloadState === "loading" || downloadState === "error") && (
          <div className="absolute inset-0 z-20 rounded-2xl bg-background/95 backdrop-blur-sm border border-border flex items-center justify-center p-6">
            <div className="text-center max-w-xs space-y-3">
              {downloadState === "loading" ? (
                <>
                  <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
                  <p className="text-base font-semibold">Generando PDF...</p>
                  <p className="text-sm text-muted-foreground">
                    Espera mientras preparamos la descarga.
                  </p>
                </>
              ) : (
                <>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <p className="text-base font-semibold">Error al descargar</p>
                  <p className="text-sm text-muted-foreground">{downloadError}</p>
                  <Button variant="outline" onClick={() => setDownloadState("idle")}>Cerrar</Button>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── Items (scrolleable) ── */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Items
          </h4>

          {isLoading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Cargando items...
            </div>
          ) : isError ? (
            <div className="py-8 text-center text-sm text-destructive">
              Error al cargar los items
            </div>
          ) : items && items.length > 0 ? (
            <ul className="space-y-2">
              {items.map((it: any) => (
                <li
                  key={it.id}
                  className="rounded-lg border bg-card p-4 space-y-3"
                >
                  {/* Fila superior: nombre + store */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-sm leading-snug">
                        {it.product_name ?? `Producto ${it.product_id}`}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {it.store_name ?? `Tienda ${it.store_id}`}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      ID: {it.id}
                    </span>
                  </div>

                  {/* Fila inferior: cantidad + acciones */}
                  <div className="flex items-center justify-between gap-3">
                    {editingId === it.id ? (
                      /* ── Modo edición ── */
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          type="number"
                          min={1}
                          value={editingQty}
                          onChange={(e) => setEditingQty(Number(e.target.value))}
                          className="w-24 h-8 text-sm"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleUpdate(it.id)}
                          disabled={updateMutation.isPending}
                          className="h-8"
                        >
                          {updateMutation.isPending ? "Guardando..." : "Guardar"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={cancelEdit}
                          className="h-8"
                        >
                          Cancelar
                        </Button>
                      </div>
                    ) : (
                      /* ── Modo lectura ── */
                      <>
                        <div className="text-sm text-muted-foreground">
                          <div>
                            Cantidad:{" "}
                            <span className="font-semibold text-foreground">
                              {it.quantity}
                            </span>
                          </div>
                          <div>
                            Modalidad:{" "}
                            <span className="font-semibold text-foreground">
                              {it.type ?? "-"}
                            </span>
                          </div>                          {it.type === OrderItemType.BULTO ? (
                            <div>
                              Unidad de medida: {" "}
                              <span className="font-semibold text-foreground">
                                {it.unit_size ?? "-"}
                              </span>
                            </div>
                          ) : null}                          {it.type === OrderItemType.UNIDAD && it.variant ? (
                            <div>
                              Variante:{" "}
                              <span className="font-semibold text-foreground">
                                {it.variant}
                              </span>
                            </div>
                          ) : null}
                        </div>

                        {isPending && (
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs px-3"
                              onClick={() => startEdit(it)}
                            >
                              Editar
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-7 text-xs px-3"
                              onClick={() => requestDelete(it.id)}
                              disabled={deleteMutation.isPending}
                            >
                              {deleteMutation.isPending ? "..." : "Eliminar"}
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No hay items en esta orden
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t">
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              className="w-full sm:w-auto gap-2"
              onClick={handleDownload}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Descargando...
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  Descargar PDF
                </>
              )}
            </Button>
            <DialogClose asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                Cerrar
              </Button>
            </DialogClose>
          </DialogFooter>
        </div>

        <DeleteConfirmDialog
          open={deleteConfirmOpen}
          onOpenChange={(next) => {
            setDeleteConfirmOpen(next);
            if (!next) setPendingDeleteId(null);
          }}
          title="Eliminar item"
          description="¿Estás seguro que deseas eliminar este item de la orden? Esta acción no se puede deshacer."
          isPending={deleteMutation.isPending}
          onConfirm={async () => {
            if (pendingDeleteId === null) return;
            await handleDelete(pendingDeleteId);
            setDeleteConfirmOpen(false);
            setPendingDeleteId(null);
          }}
        />

      </DialogContent>
    </Dialog>
  );
}

export default OrderDetailModal;
