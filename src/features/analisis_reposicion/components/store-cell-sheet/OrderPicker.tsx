import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Order } from "@/features/pedidos/types/pedido.types";
import { SectionCard } from "./SectionCard";

export const orderFormSchema = z.object({
  description: z.string().optional(),
  priority: z.number().min(0, "La prioridad debe ser un número positivo"),
});

export type OrderFormData = z.infer<typeof orderFormSchema>;

export function getOrderTitle(order?: Order | null) {
  return order ? `Orden #${order.id}` : "Sin orden";
}

export function OrderPicker({
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
      subtitle={
        selectedOrder
          ? `Seleccionada: ${getOrderTitle(selectedOrder)}`
          : "Seleccioná o creá una orden"
      }
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
