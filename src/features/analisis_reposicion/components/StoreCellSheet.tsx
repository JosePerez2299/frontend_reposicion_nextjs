import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import {
  useOrdersQuery,
  useCreateOrderMutation,
} from "@/features/pedidos/queries/pedidos.queries";
import { useAnalisisStore } from "@/stores/resposicion-analisis.store";
import { OrderItemType, OrderStatus } from "@/features/pedidos/types/pedido.types";
import { useStoreCellSheetOrderItem } from "@/features/analisis_reposicion/hooks/useStoreCellSheetOrderItem";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

type StoreCellSheetData = {
  product_id: string;
  product_name: string;
  store_id: string;
  store_name: string;
  rotation_pct: string;
  rotation_text_class: string;
  qty_stock: number;
  qty_sold: number;
};

const orderFormSchema = z.object({
  description: z.string().optional(),
  priority: z.number().min(0, "La prioridad debe ser un número positivo"),
});

type OrderFormData = z.infer<typeof orderFormSchema>;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: StoreCellSheetData | null;
};

export function StoreCellSheet({ open, onOpenChange, data }: Props) {
  const { selectedOrder, setSelectedOrder, clearSelectedOrder } =
    useAnalisisStore();
  const {
    data: orders,
    isLoading,
    isError,
  } = useOrdersQuery(100, OrderStatus.PENDING);
  const createOrderMutation = useCreateOrderMutation();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      description: "",
      priority: 0,
    },
  });

  const handleSelectOrder = (order: any) => {
    setSelectedOrder(order);
  };

  const handleClearOrder = () => {
    clearSelectedOrder();
  };

  const onSubmit = async (formData: OrderFormData) => {
    const payload = {
      status: OrderStatus.PENDING,
      description: formData.description,
      priority: formData.priority,
    };

    try {
      const newOrder = await createOrderMutation.mutateAsync(payload);
      setSelectedOrder(newOrder);
      setShowCreateForm(false);
      reset();
    } catch (error) {
      console.error("Error creating order:", error);
    }
  };

  const orderItemHook = useStoreCellSheetOrderItem(data, { isOpen: open });

  useEffect(() => {
    if (open) {
      // Si la orden está pendiente y NO existe el item, abrir directamente el formulario de agregar
      if (orderItemHook.isPendingOrder && !orderItemHook.existingItem) {
        orderItemHook.setShowAddForm(true);
      }
    } else {
      // Al cerrar, resetear vistas internas
      orderItemHook.setShowAddForm(false);
      orderItemHook.setShowEditForm(false);
    }
  }, [open, orderItemHook.isPendingOrder, orderItemHook.existingItem]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {selectedOrder ? `Orden #${selectedOrder.id}` : "Seleccionar Orden"}
          </SheetTitle>
          <SheetDescription>
            {selectedOrder
              ? "Gestionando items de la orden seleccionada"
              : "Selecciona una orden existente o crea una nueva"}
          </SheetDescription>
        </SheetHeader>

        <div className="grid flex-1 auto-rows-min gap-6 px-4">
          {selectedOrder ? (
            // Order Details View (placeholder for future orderItems functionality)
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-muted/50">
                <h3 className="font-semibold mb-2">Detalles de la Orden</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">ID:</span> {selectedOrder.id}
                  </div>
                  <div>
                    <span className="font-medium">Estado:</span>{" "}
                    {selectedOrder.status}
                  </div>
                  <div>
                    <span className="font-medium">Prioridad:</span>{" "}
                    {selectedOrder.priority}
                  </div>
                  <div>
                    <span className="font-medium">Descripción:</span>{" "}
                    {selectedOrder.description || "Sin descripción"}
                  </div>
                  <div>
                    <span className="font-medium">Creada:</span>{" "}
                    {new Date(selectedOrder.created_at).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg border-dashed border-muted-foreground/25">
                {orderItemHook.isLoadingItems ? (
                  <p className="text-sm text-muted-foreground text-center">
                    Verificando item...
                  </p>
                ) : orderItemHook.isErrorItems ? (
                  <p className="text-sm text-destructive text-center">
                    Error verificando item
                  </p>
                ) : orderItemHook.existingItem ? (
                  orderItemHook.showEditForm ? (
                    <div className="space-y-2">
                      <div className="grid gap-1">
                        <Label htmlFor="item-type">Tipo</Label>
                        <Select
                          value={orderItemHook.type}
                          onValueChange={(v) =>
                            orderItemHook.setType(v as OrderItemType)
                          }
                        >
                          <SelectTrigger id="item-type" className="w-full">
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={OrderItemType.UNIDAD}>
                              Unidad
                            </SelectItem>
                            <SelectItem value={OrderItemType.BULTO}>
                              Bulto
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {orderItemHook.type === OrderItemType.UNIDAD && (
                        <div className="grid gap-1">
                          <Label htmlFor="item-variant">Variante</Label>
                          <Select
                            value={orderItemHook.variant}
                            onValueChange={(v) => orderItemHook.setVariant(v)}
                            disabled={orderItemHook.variantsQuery.isLoading}
                          >
                            <SelectTrigger id="item-variant" className="w-full">
                              <SelectValue
                                placeholder={
                                  orderItemHook.variantsQuery.isLoading
                                    ? "Cargando..."
                                    : "Seleccionar"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {orderItemHook.parsedVariants.length > 0 ? (
                                orderItemHook.parsedVariants.map((v) => (
                                  <SelectItem key={v} value={v}>
                                    {v}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="" disabled>
                                  Sin variantes
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      <div className="grid gap-1">
                        <Label htmlFor="item-quantity">Cantidad</Label>
                        <Input
                          id="item-quantity"
                          type="number"
                          min={1}
                          value={orderItemHook.quantity}
                          onChange={(e) =>
                            orderItemHook.setQuantity(Number(e.target.value))
                          }
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={orderItemHook.handleUpdateItem}
                          disabled={orderItemHook.updateItemMutation.isPending}
                          className="flex-1"
                        >
                          {orderItemHook.updateItemMutation.isPending
                            ? "Actualizando..."
                            : "Actualizar"}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => orderItemHook.setShowEditForm(false)}
                        >
                          Cancelar
                        </Button>
                      </div>
                      <div className="pt-1">
                        <Button
                          variant="destructive"
                          onClick={orderItemHook.handleDeleteItem}
                          disabled={orderItemHook.deleteItemMutation?.isPending}
                          className="w-full"
                        >
                          {orderItemHook.deleteItemMutation?.isPending
                            ? "Eliminando..."
                            : "Eliminar Item"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 text-sm">
                      <div className="font-semibold text-green-600">✓ Item ya agregado</div>
                      <div>
                        <span className="font-medium">Tipo:</span>{" "}
                        {orderItemHook.existingItem.type}
                      </div>
                      {orderItemHook.existingItem.variant && (
                        <div>
                          <span className="font-medium">Variante:</span>{" "}
                          {orderItemHook.existingItem.variant}
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Cantidad:</span>{" "}
                        {orderItemHook.existingItem.quantity}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button
                          className="flex-1"
                          variant="outline"
                          onClick={orderItemHook.openEditForm}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => setConfirmOpen(true)}
                        >
                          Eliminar
                        </Button>
                      </div>

                      <DeleteConfirmDialog
                        open={confirmOpen}
                        onOpenChange={setConfirmOpen}
                        title="Eliminar item"
                        description="¿Estás seguro que deseas eliminar este item de la orden? Esta acción no se puede deshacer."
                        isPending={orderItemHook.deleteItemMutation?.isPending}
                        onConfirm={async () => {
                          await orderItemHook.handleDeleteItem();
                          setConfirmOpen(false);
                        }}
                      />
                    </div>
                  )
                ) : orderItemHook.isPendingOrder ? (
                  <div className="space-y-3">
                    {orderItemHook.showAddForm ? (
                      <div className="space-y-3">
                        {/* Selector de tipo */}
                        <div className="grid gap-1">
                          <Label htmlFor="item-type">Tipo</Label>
                          <Select
                            value={orderItemHook.type}
                            onValueChange={(v) =>
                              orderItemHook.setType(v as OrderItemType)
                            }
                          >
                            <SelectTrigger id="item-type" className="w-full">
                              <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={OrderItemType.UNIDAD}>
                                Unidad
                              </SelectItem>
                              <SelectItem value={OrderItemType.BULTO}>
                                Bulto
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Modo BULTO: solo cantidad */}
                        {orderItemHook.type === OrderItemType.BULTO && (
                          <div className="grid gap-1">
                            <Label htmlFor="item-quantity">Cantidad</Label>
                            <Input
                              id="item-quantity"
                              type="number"
                              min={1}
                              value={orderItemHook.quantity}
                              onChange={(e) =>
                                orderItemHook.setQuantity(Number(e.target.value))
                              }
                            />
                          </div>
                        )}

                        {/* Modo UNIDAD: matriz de variantes */}
                        {orderItemHook.type === OrderItemType.UNIDAD && (
                          <div className="space-y-3">
                            {orderItemHook.variantsQuery.isLoading ? (
                              <div className="text-sm text-muted-foreground text-center py-2">
                                Cargando variantes...
                              </div>
                            ) : orderItemHook.parsedVariants.length === 0 ? (
                              <div className="text-sm text-destructive text-center py-2">
                                No hay variantes disponibles para este producto
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <Label>Variantes y cantidades</Label>
                                {orderItemHook.variantMatrix.map((row, index) => (
                                  <div key={row.id} className="flex gap-2 items-start">
                                    <div className="flex-1">
                                      <Select
                                        value={row.variant}
                                        onValueChange={(v) =>
                                          orderItemHook.updateVariantRow(row.id, { variant: v })
                                        }
                                      >
                                        <SelectTrigger className="w-full">
                                          <SelectValue placeholder="Talla" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {orderItemHook.parsedVariants.map((v) => (
                                            <SelectItem 
                                              key={v} 
                                              value={v}
                                              disabled={!orderItemHook.isVariantAvailable(v, row.id)}
                                            >
                                              {v}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="w-20">
                                      <Input
                                        type="number"
                                        min={1}
                                        value={row.quantity}
                                        onChange={(e) =>
                                          orderItemHook.updateVariantRow(row.id, { quantity: Number(e.target.value) })
                                        }
                                      />
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => orderItemHook.removeVariantRow(row.id)}
                                      disabled={orderItemHook.variantMatrix.length <= 1}
                                      className="text-destructive"
                                    >
                                      ×
                                    </Button>
                                  </div>
                                ))}
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={orderItemHook.addVariantRow}
                                  disabled={orderItemHook.variantMatrix.length >= orderItemHook.parsedVariants.length || !orderItemHook.parsedVariants.some(v => orderItemHook.isVariantAvailable(v))}
                                  className="w-full"
                                >
                                  + Agregar talla
                                </Button>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button
                            onClick={orderItemHook.handleAddItem}
                            disabled={
                              orderItemHook.createItemMutation.isPending ||
                              (orderItemHook.type === OrderItemType.UNIDAD && 
                               orderItemHook.parsedVariants.length === 0)
                            }
                            className="flex-1"
                          >
                            {orderItemHook.createItemMutation.isPending
                              ? "Agregando..."
                              : orderItemHook.type === OrderItemType.UNIDAD
                                ? "Agregar variantes a Orden"
                                : "Agregar a Orden"}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              orderItemHook.setShowAddForm(false);
                              orderItemHook.resetVariantMatrix();
                            }}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        className="w-full"
                        onClick={() => orderItemHook.setShowAddForm(true)}
                      >
                        + Agregar a Orden
                      </Button>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center">
                    Orden no pendiente - no se puede agregar items
                  </p>
                )}
              </div>

              <Button
                onClick={handleClearOrder}
                variant="outline"
                className="w-full"
              >
                Cambiar Orden
              </Button>
            </div>
          ) : (
            // Order Selection View
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Órdenes Pendientes</h3>
                {isLoading ? (
                  <div className="text-sm text-muted-foreground">
                    Cargando órdenes...
                  </div>
                ) : isError ? (
                  <div className="text-sm text-destructive">
                    Error cargando órdenes
                  </div>
                ) : orders && orders.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleSelectOrder(order)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">Orden #{order.id}</div>
                            <div className="text-sm text-muted-foreground">
                              {order.description || "Sin descripción"}
                            </div>
                          </div>
                          <div className="text-right text-sm">
                            <div className="font-medium">
                              Prioridad: {order.priority}
                            </div>
                            <div className="text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    No hay órdenes pendientes
                  </div>
                )}
              </div>

              <div className="pt-4 border-t">
                {showCreateForm ? (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                    <div className="grid gap-1">
                      <Label htmlFor="order-description">Descripción</Label>
                      <Input
                        id="order-description"
                        {...register("description")}
                        placeholder="Descripción de la orden"
                      />
                      {errors.description && (
                        <div className="text-sm text-destructive">
                          {errors.description.message}
                        </div>
                      )}
                    </div>

                    <div className="grid gap-1">
                      <Label htmlFor="order-priority">Prioridad</Label>
                      <Input
                        id="order-priority"
                        type="number"
                        {...register("priority", { valueAsNumber: true })}
                      />
                      {errors.priority && (
                        <div className="text-sm text-destructive">
                          {errors.priority.message}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        disabled={isSubmitting || createOrderMutation.isPending}
                        className="flex-1"
                      >
                        {isSubmitting || createOrderMutation.isPending
                          ? "Creando..."
                          : "Crear Orden"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowCreateForm(false)}
                      >
                        Cancelar
                      </Button>
                    </div>

                    {createOrderMutation.isError && (
                      <div className="text-sm text-destructive">
                        Error creando orden
                      </div>
                    )}
                  </form>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => setShowCreateForm(true)}
                  >
                    Crear Nueva Orden
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Cerrar</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
