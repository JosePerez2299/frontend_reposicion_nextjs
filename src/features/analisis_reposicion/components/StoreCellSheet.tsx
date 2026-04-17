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
  useOrdersQuery,
  useCreateOrderMutation,
} from "@/features/pedidos/queries/pedidos.queries";
import { useAnalisisStore } from "@/stores/resposicion-analisis.store";
import { OrderStatus } from "@/features/pedidos/types/pedido.types";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

type StoreCellSheetData = {
  product_name: string;
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
                <p className="text-sm text-muted-foreground text-center">
                  Aquí se agregarán los items de la orden (funcionalidad futura)
                </p>
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
