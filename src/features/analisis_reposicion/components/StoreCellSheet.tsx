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
  useOrderItemsQuery,
  useCreateOrderItemMutation,
  useUpdateOrderItemMutation,
  useDeleteOrderItemMutation,
} from "@/features/pedidos/queries/pedidos.queries";
import type { Order, OrderItem } from "@/features/pedidos/types/pedido.types";
import { OrderItemType, OrderStatus } from "@/features/pedidos/types/pedido.types";
import { useProductVariants } from "@/queries/productos.queries";
import { useAnalisisStore } from "@/stores/resposicion-analisis.store";
import { useCallback, useEffect, useMemo, useState } from "react";
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

type VariantRow = {
  id: string;
  variant: string;
  quantity: number;
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

function formatVariantChipLabel(variant: string) {
  return variant;
}

function getOrderTitle(order?: Order | null) {
  return order ? `Orden #${order.id}` : "Sin orden";
}

function deriveParsedVariants(raw: unknown[] | undefined) {
  const list = (raw ?? []) as unknown[];
  const sizes = list
    .map((code) => {
      const last3 = String(code).slice(-3);
      if (last3.length < 3) return "";
      return last3.endsWith("0") ? last3.slice(0, 2) : last3;
    })
    .filter(Boolean) as string[];

  return Array.from(new Set(sizes));
}

function makeInitialVariantMatrix(parsedVariants: string[]) {
  if (parsedVariants.length === 0) return [];
  return [{ id: crypto.randomUUID(), variant: parsedVariants[0], quantity: 1 } satisfies VariantRow];
}

function upsertVariantMatrixFromExisting(items: OrderItem[], parsedVariants: string[]) {
  const rows: VariantRow[] = items
    .filter((it) => it.type === OrderItemType.UNIDAD && !!it.variant)
    .map((it) => ({
      id: crypto.randomUUID(),
      variant: it.variant ?? "",
      quantity: it.quantity,
    }));

  const cleaned = rows.filter((r) => parsedVariants.includes(r.variant) && r.quantity > 0);
  if (cleaned.length > 0) return cleaned;
  return makeInitialVariantMatrix(parsedVariants);
}

function VariantChips({ variants }: { variants: string[] }) {
  if (variants.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1 pt-1">
      {variants.map((v) => (
        <span
          key={v}
          className="inline-flex items-center rounded-full border bg-background px-2 py-0.5 text-xs text-muted-foreground"
        >
          {formatVariantChipLabel(v)}
        </span>
      ))}
    </div>
  );
}

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold">{title}</div>
          {subtitle ? <div className="text-sm text-muted-foreground">{subtitle}</div> : null}
        </div>
      </div>
      <div className="pt-3">{children}</div>
    </div>
  );
}

function OrderPicker({
  title,
  orders,
  isLoading,
  isError,
  selectedOrder,
  onSelect,
  createOrderMutationPending,
  onCreateOrder,
}: {
  title: string;
  orders: Order[] | undefined;
  isLoading: boolean;
  isError: boolean;
  selectedOrder: Order | null;
  onSelect: (order: Order) => void;
  createOrderMutationPending: boolean;
  onCreateOrder: (data: OrderFormData) => Promise<void>;
}) {
  const [showCreateForm, setShowCreateForm] = useState(false);
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

  const onSubmit = async (formData: OrderFormData) => {
    await onCreateOrder(formData);
    setShowCreateForm(false);
    reset();
  };

  return (
    <SectionCard
      title={title}
      subtitle={selectedOrder ? `Seleccionada: ${getOrderTitle(selectedOrder)}` : "Seleccioná o creá una orden"}
    >
      {selectedOrder ? (
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between gap-2">
            <div className="text-muted-foreground">Estado: {selectedOrder.status}</div>
            <div className="text-muted-foreground">Prioridad: {selectedOrder.priority}</div>
          </div>
          <div className="text-muted-foreground">
            {selectedOrder.description ? selectedOrder.description : "Sin descripción"}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="space-y-2">
            {isLoading ? (
              <div className="text-sm text-muted-foreground">Cargando órdenes...</div>
            ) : isError ? (
              <div className="text-sm text-destructive">Error cargando órdenes</div>
            ) : orders && orders.length > 0 ? (
              <div className="space-y-2 max-h-44 overflow-y-auto">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => onSelect(order)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">Orden #{order.id}</div>
                        <div className="text-sm text-muted-foreground">
                          {order.description || "Sin descripción"}
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <div className="font-medium">Prioridad: {order.priority}</div>
                        <div className="text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No hay órdenes pendientes</div>
            )}
          </div>

          <div className="pt-3 border-t">
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
                    <div className="text-sm text-destructive">{errors.description.message}</div>
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
                    <div className="text-sm text-destructive">{errors.priority.message}</div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting || createOrderMutationPending}
                    className="flex-1"
                  >
                    {isSubmitting || createOrderMutationPending ? "Creando..." : "Crear Orden"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            ) : (
              <Button className="w-full" onClick={() => setShowCreateForm(true)}>
                Crear Nueva Orden
              </Button>
            )}
          </div>
        </div>
      )}
    </SectionCard>
  );
}

function ItemEditorBulto({
  enabled,
  order,
  sheetData,
}: {
  enabled: boolean;
  order: Order | null;
  sheetData: StoreCellSheetData | null;
}) {
  const productId = sheetData?.product_id ?? "";
  const storeId = sheetData?.store_id ?? "";

  const { data: orderItems, isLoading, isError, refetch } = useOrderItemsQuery(
    order?.id ?? 0,
    { product_id: productId, store_id: storeId },
    { enabled }
  );

  const bultoItem = useMemo(() => {
    const list = (orderItems ?? []) as OrderItem[];
    return list.find((it) => it.type === OrderItemType.BULTO) ?? null;
  }, [orderItems]);

  const createItemMutation = useCreateOrderItemMutation();
  const updateItemMutation = useUpdateOrderItemMutation();
  const deleteItemMutation = useDeleteOrderItemMutation();

  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [quantity, setQuantity] = useState<number>(1);

  useEffect(() => {
    if (!enabled) return;
    if (bultoItem) {
      setQuantity(bultoItem.quantity);
    } else {
      setQuantity(1);
    }
  }, [enabled, bultoItem, sheetData]);

  useEffect(() => {
    if (!enabled) return;
    if (order?.status !== OrderStatus.PENDING) return;
    if (!bultoItem) setShowAddForm(true);
  }, [enabled, order?.status, bultoItem]);

  const handleAdd = async () => {
    if (!order || !sheetData) return;
    if (!quantity || quantity <= 0) return;
    await createItemMutation.mutateAsync({
      order_id: order.id,
      product_id: sheetData.product_id,
      store_id: sheetData.store_id,
      type: OrderItemType.BULTO,
      quantity,
    });
    setShowAddForm(false);
    await refetch();
  };

  const handleUpdate = async () => {
    if (!bultoItem) return;
    await updateItemMutation.mutateAsync({
      item_id: bultoItem.id,
      type: OrderItemType.BULTO,
      quantity,
    });
    setShowEditForm(false);
    await refetch();
  };

  const handleDelete = async () => {
    if (!bultoItem) return;
    await deleteItemMutation.mutateAsync({ itemId: bultoItem.id, orderId: order?.id });
    setShowEditForm(false);
    setShowAddForm(false);
    await refetch();
  };

  const pending = order?.status === OrderStatus.PENDING;

  return (
    <SectionCard title="Pedido por bulto" subtitle={order ? getOrderTitle(order) : "Elegí una orden de bulto"}>
      {!order ? (
        <div className="text-sm text-muted-foreground">Seleccioná o creá una orden de bulto.</div>
      ) : !pending ? (
        <div className="text-sm text-muted-foreground">La orden no está pendiente (no se puede editar).</div>
      ) : isLoading ? (
        <div className="text-sm text-muted-foreground text-center">Verificando item...</div>
      ) : isError ? (
        <div className="text-sm text-destructive text-center">Error verificando item</div>
      ) : bultoItem ? (
        showEditForm ? (
          <div className="space-y-2">
            <div className="grid gap-1">
              <Label htmlFor="bulto-qty">Cantidad</Label>
              <Input
                id="bulto-qty"
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUpdate} disabled={updateItemMutation.isPending} className="flex-1">
                {updateItemMutation.isPending ? "Actualizando..." : "Actualizar"}
              </Button>
              <Button variant="outline" onClick={() => setShowEditForm(false)}>
                Cancelar
              </Button>
            </div>
            <div className="pt-1">
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteItemMutation.isPending}
                className="w-full"
              >
                {deleteItemMutation.isPending ? "Eliminando..." : "Eliminar"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2 text-sm">
            <div className="font-semibold text-green-600">✓ Item ya agregado</div>
            <div>
              <span className="font-medium">Cantidad:</span> {bultoItem.quantity}
            </div>
            <div className="flex gap-2 pt-1">
              <Button className="flex-1" variant="outline" onClick={() => setShowEditForm(true)}>
                Editar
              </Button>
              <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
                Eliminar
              </Button>
            </div>

            <DeleteConfirmDialog
              open={confirmOpen}
              onOpenChange={setConfirmOpen}
              title="Eliminar item"
              description="¿Estás seguro que deseas eliminar este item de la orden? Esta acción no se puede deshacer."
              isPending={deleteItemMutation.isPending}
              onConfirm={async () => {
                await handleDelete();
                setConfirmOpen(false);
              }}
            />
          </div>
        )
      ) : showAddForm ? (
        <div className="space-y-3">
          <div className="grid gap-1">
            <Label htmlFor="bulto-qty-add">Cantidad</Label>
            <Input
              id="bulto-qty-add"
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAdd} disabled={createItemMutation.isPending} className="flex-1">
              {createItemMutation.isPending ? "Agregando..." : "Agregar a Orden"}
            </Button>
            <Button variant="outline" onClick={() => setShowAddForm(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <Button className="w-full" onClick={() => setShowAddForm(true)}>
          + Agregar a Orden
        </Button>
      )}
    </SectionCard>
  );
}

function ItemEditorUnidad({
  enabled,
  order,
  sheetData,
}: {
  enabled: boolean;
  order: Order | null;
  sheetData: StoreCellSheetData | null;
}) {
  const productId = sheetData?.product_id ?? "";
  const storeId = sheetData?.store_id ?? "";

  const { data: orderItems, isLoading, isError, refetch } = useOrderItemsQuery(
    order?.id ?? 0,
    { product_id: productId, store_id: storeId },
    { enabled }
  );

  const unidadItems = useMemo(() => {
    const list = (orderItems ?? []) as OrderItem[];
    return list.filter((it) => it.type === OrderItemType.UNIDAD);
  }, [orderItems]);

  const createItemMutation = useCreateOrderItemMutation();
  const updateItemMutation = useUpdateOrderItemMutation();
  const deleteItemMutation = useDeleteOrderItemMutation();

  const variantsQuery = useProductVariants(productId, {
    enabled: enabled && !!productId,
  });
  const parsedVariants = useMemo(
    () => deriveParsedVariants((variantsQuery.data ?? []) as unknown[]),
    [variantsQuery.data]
  );

  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [variantMatrix, setVariantMatrix] = useState<VariantRow[]>([]);

  useEffect(() => {
    if (!enabled) return;
    if (parsedVariants.length === 0) {
      setVariantMatrix([]);
      return;
    }
    if (unidadItems.length > 0) {
      setVariantMatrix(upsertVariantMatrixFromExisting(unidadItems, parsedVariants));
    } else if (variantMatrix.length === 0) {
      setVariantMatrix(makeInitialVariantMatrix(parsedVariants));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, unidadItems, parsedVariants]);

  useEffect(() => {
    if (!enabled) return;
    if (order?.status !== OrderStatus.PENDING) return;
    if (unidadItems.length === 0) setShowAddForm(true);
  }, [enabled, order?.status, unidadItems.length]);

  const isVariantAvailable = useCallback(
    (variant: string, excludeRowId?: string) => {
      return !variantMatrix.some((row) => row.variant === variant && row.id !== excludeRowId);
    },
    [variantMatrix]
  );

  const addVariantRow = useCallback(() => {
    if (parsedVariants.length === 0) return;
    const available =
      parsedVariants.find((v) => !variantMatrix.some((row) => row.variant === v)) ?? parsedVariants[0];
    setVariantMatrix((prev) => [...prev, { id: crypto.randomUUID(), variant: available, quantity: 1 }]);
  }, [parsedVariants, variantMatrix]);

  const removeVariantRow = useCallback((rowId: string) => {
    setVariantMatrix((prev) => prev.filter((r) => r.id !== rowId));
  }, []);

  const updateVariantRow = useCallback((rowId: string, updates: Partial<Omit<VariantRow, "id">>) => {
    setVariantMatrix((prev) => prev.map((r) => (r.id === rowId ? { ...r, ...updates } : r)));
  }, []);

  const resetVariantMatrix = useCallback(() => {
    setVariantMatrix(makeInitialVariantMatrix(parsedVariants));
  }, [parsedVariants]);

  const handleUpsertMatrix = async () => {
    if (!order || !sheetData) return;
    const validRows = variantMatrix
      .map((r) => ({ ...r, quantity: Number(r.quantity) }))
      .filter((r) => r.variant && r.quantity > 0);

    if (validRows.length === 0) return;

    const existingByVariant = new Map<string, OrderItem>();
    unidadItems.forEach((it) => {
      if (it.variant) existingByVariant.set(it.variant, it);
    });

    const nextVariants = new Set(validRows.map((r) => r.variant));

    const toDelete = unidadItems.filter((it) => it.variant && !nextVariants.has(it.variant));
    const toUpdate = validRows
      .map((row) => {
        const existing = existingByVariant.get(row.variant);
        if (!existing) return null;
        if (existing.quantity === row.quantity) return null;
        return { item: existing, quantity: row.quantity };
      })
      .filter(Boolean) as { item: OrderItem; quantity: number }[];

    const toCreate = validRows.filter((row) => !existingByVariant.has(row.variant));

    await Promise.all([
      ...toDelete.map((it) => deleteItemMutation.mutateAsync({ itemId: it.id, orderId: order.id })),
      ...toUpdate.map(({ item, quantity }) =>
        updateItemMutation.mutateAsync({
          item_id: item.id,
          type: OrderItemType.UNIDAD,
          quantity,
          variant: item.variant,
        })
      ),
      ...toCreate.map((row) =>
        createItemMutation.mutateAsync({
          order_id: order.id,
          product_id: sheetData.product_id,
          store_id: sheetData.store_id,
          type: OrderItemType.UNIDAD,
          quantity: row.quantity,
          variant: row.variant,
        })
      ),
    ]);

    setShowAddForm(false);
    setShowEditForm(false);
    await refetch();
  };

  const handleDeleteAll = async () => {
    if (!order) return;
    if (unidadItems.length === 0) return;
    await Promise.all(
      unidadItems.map((it) => deleteItemMutation.mutateAsync({ itemId: it.id, orderId: order.id }))
    );
    setShowEditForm(false);
    setShowAddForm(false);
    resetVariantMatrix();
    await refetch();
  };

  const pending = order?.status === OrderStatus.PENDING;
  const variantsForList = useMemo(() => unidadItems.map((it) => it.variant).filter(Boolean) as string[], [unidadItems]);
  const totalUnits = useMemo(() => unidadItems.reduce((acc, it) => acc + (it.quantity ?? 0), 0), [unidadItems]);

  const matrixBusy =
    createItemMutation.isPending ||
    updateItemMutation.isPending ||
    deleteItemMutation.isPending ||
    variantsQuery.isLoading;

  const canAddMoreRows =
    variantMatrix.length < parsedVariants.length &&
    parsedVariants.some((v) => isVariantAvailable(v));

  return (
    <SectionCard
      title="Pedido por unidad"
      subtitle={order ? getOrderTitle(order) : "Elegí una orden de unidad"}
    >
      {!order ? (
        <div className="text-sm text-muted-foreground">Seleccioná o creá una orden de unidad.</div>
      ) : !pending ? (
        <div className="text-sm text-muted-foreground">La orden no está pendiente (no se puede editar).</div>
      ) : isLoading ? (
        <div className="text-sm text-muted-foreground text-center">Verificando items...</div>
      ) : isError ? (
        <div className="text-sm text-destructive text-center">Error verificando items</div>
      ) : unidadItems.length > 0 ? (
        showEditForm ? (
          <div className="space-y-3">
            {variantsQuery.isLoading ? (
              <div className="text-sm text-muted-foreground text-center py-2">Cargando variantes...</div>
            ) : parsedVariants.length === 0 ? (
              <div className="text-sm text-destructive text-center py-2">
                No hay variantes disponibles para este producto
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Variantes y cantidades</Label>
                {variantMatrix.map((row) => (
                  <div key={row.id} className="flex gap-2 items-start">
                    <div className="flex-1">
                      <Select
                        value={row.variant}
                        onValueChange={(v) => updateVariantRow(row.id, { variant: v })}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Talla" />
                        </SelectTrigger>
                        <SelectContent>
                          {parsedVariants.map((v) => (
                            <SelectItem key={v} value={v} disabled={!isVariantAvailable(v, row.id)}>
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
                        onChange={(e) => updateVariantRow(row.id, { quantity: Number(e.target.value) })}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeVariantRow(row.id)}
                      disabled={variantMatrix.length <= 1}
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
                  onClick={addVariantRow}
                  disabled={!canAddMoreRows}
                  className="w-full"
                >
                  + Agregar talla
                </Button>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleUpsertMatrix} disabled={matrixBusy || parsedVariants.length === 0} className="flex-1">
                {matrixBusy ? "Guardando..." : "Guardar"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditForm(false);
                  setVariantMatrix(upsertVariantMatrixFromExisting(unidadItems, parsedVariants));
                }}
              >
                Cancelar
              </Button>
            </div>

            <div className="pt-1">
              <Button
                variant="destructive"
                onClick={handleDeleteAll}
                disabled={deleteItemMutation.isPending}
                className="w-full"
              >
                {deleteItemMutation.isPending ? "Eliminando..." : "Eliminar todas las variantes"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2 text-sm">
            <div className="font-semibold text-green-600">✓ Item agregado (por variantes)</div>
            <div className="text-muted-foreground">Total unidades: {totalUnits}</div>
            <VariantChips variants={variantsForList} />
            <div className="flex gap-2 pt-2">
              <Button className="flex-1" variant="outline" onClick={() => setShowEditForm(true)}>
                Editar
              </Button>
              <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
                Eliminar
              </Button>
            </div>

            <DeleteConfirmDialog
              open={confirmOpen}
              onOpenChange={setConfirmOpen}
              title="Eliminar items"
              description="¿Estás seguro que deseas eliminar todas las variantes de esta orden? Esta acción no se puede deshacer."
              isPending={deleteItemMutation.isPending}
              onConfirm={async () => {
                await handleDeleteAll();
                setConfirmOpen(false);
              }}
            />
          </div>
        )
      ) : showAddForm ? (
        <div className="space-y-3">
          {variantsQuery.isLoading ? (
            <div className="text-sm text-muted-foreground text-center py-2">Cargando variantes...</div>
          ) : parsedVariants.length === 0 ? (
            <div className="text-sm text-destructive text-center py-2">
              No hay variantes disponibles para este producto
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Variantes y cantidades</Label>
              {variantMatrix.map((row) => (
                <div key={row.id} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <Select value={row.variant} onValueChange={(v) => updateVariantRow(row.id, { variant: v })}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Talla" />
                      </SelectTrigger>
                      <SelectContent>
                        {parsedVariants.map((v) => (
                          <SelectItem key={v} value={v} disabled={!isVariantAvailable(v, row.id)}>
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
                      onChange={(e) => updateVariantRow(row.id, { quantity: Number(e.target.value) })}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeVariantRow(row.id)}
                    disabled={variantMatrix.length <= 1}
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
                onClick={addVariantRow}
                disabled={!canAddMoreRows}
                className="w-full"
              >
                + Agregar talla
              </Button>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={handleUpsertMatrix} disabled={matrixBusy || parsedVariants.length === 0} className="flex-1">
              {matrixBusy ? "Agregando..." : "Agregar variantes a Orden"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddForm(false);
                resetVariantMatrix();
              }}
            >
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <Button className="w-full" onClick={() => setShowAddForm(true)}>
          + Agregar a Orden
        </Button>
      )}
    </SectionCard>
  );
}

export function StoreCellSheet({ open, onOpenChange, data }: Props) {
  const { selectedOrder, setSelectedOrder, clearSelectedOrder } = useAnalisisStore();
  const {
    data: orders,
    isLoading,
    isError,
  } = useOrdersQuery(100, OrderStatus.PENDING);
  const createOrderMutation = useCreateOrderMutation();

  const handleSelectOrder = (order: Order) => {
    setSelectedOrder(order);
  };

  const handleClearOrder = () => {
    clearSelectedOrder();
  };

  const createOrder = async (formData: OrderFormData) => {
    const payload = {
      status: OrderStatus.PENDING,
      description: formData.description,
      priority: formData.priority,
    };

    const newOrder = await createOrderMutation.mutateAsync(payload);
    setSelectedOrder(newOrder as Order);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {data ? (
              <div>
                <div>{data.product_name}</div>
                <div className="text-sm text-muted-foreground">{data.store_name}</div>
              </div>
            ) : (
              "Producto"
            )}
       
          </SheetTitle>
          <SheetDescription>
            Podés crear/usar como máximo 2 pedidos: uno por unidad y uno por bulto.
          </SheetDescription>
        </SheetHeader>

        <div className="grid flex-1 auto-rows-min gap-6 px-4">
          <div className="space-y-4">
            <OrderPicker
              title="Orden"
              orders={orders as Order[] | undefined}
              isLoading={isLoading}
              isError={isError}
              selectedOrder={selectedOrder}
              onSelect={(o) => handleSelectOrder(o)}
              createOrderMutationPending={createOrderMutation.isPending}
              onCreateOrder={(fd) => createOrder(fd)}
            />

            {selectedOrder ? (
              <Button variant="outline" className="w-full" onClick={() => handleClearOrder()}>
                Cambiar orden
              </Button>
            ) : null}

            {selectedOrder ? (
              <div className="space-y-4">
                <ItemEditorUnidad
                  enabled={open && !!selectedOrder && !!data}
                  order={selectedOrder as Order}
                  sheetData={data}
                />
                <ItemEditorBulto
                  enabled={open && !!selectedOrder && !!data}
                  order={selectedOrder as Order}
                  sheetData={data}
                />
              </div>
            ) : null}
          </div>
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
