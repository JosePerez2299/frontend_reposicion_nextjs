"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCreateOrderMutation,
  useOrdersQuery,
} from "@/features/pedidos/queries/pedidos.queries";
import { CreateOrderInput, Order, OrderStatus } from "@/features/pedidos/types/pedido.types";

const orderFormSchema = z.object({
  description: z.string().optional(),
  priority: z.number().min(0, "La prioridad debe ser un número positivo"),
});

type OrderFormData = z.infer<typeof orderFormSchema>;

const PedidoItem = ({ order }: { order: Order }) => {
  return (
    <li key={order.id} className="flex flex-col space-y-1 py-2 px-3 bg-white shadow-sm rounded-lg">
      <div className="font-semibold text-lg">ID de la orden: {order.id}</div>
      <div className="text-sm text-muted-foreground">Prioridad: {order.priority}</div>
      <div className="text-sm text-muted-foreground">Descripción: {order.description}</div>
      <div className="text-sm text-muted-foreground">Fecha: {order.created_at}</div>
      <div className="text-sm text-muted-foreground">Estado: {order.status}</div>
    </li>
  );
};

const PedidosView = () => {
  const { data, isLoading, error } = useOrdersQuery(100, OrderStatus.PENDING);
  const createOrderMutation = useCreateOrderMutation();

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
    const payload: CreateOrderInput = {
      description: formData.description,
      priority: formData.priority,
    };

    await createOrderMutation.mutateAsync(payload);
    reset();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3 rounded-lg border border-border p-4">
        <div className="font-semibold">Crear orden</div>

        <form className="grid gap-3" onSubmit={handleSubmit(onSubmit)}>
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

          
          <div className="flex items-center gap-2">
            <Button type="submit" disabled={isSubmitting || createOrderMutation.isPending}>
              Crear
            </Button>
            {createOrderMutation.isError ? (
              <div className="text-sm text-destructive">
                Error creando orden
              </div>
            ) : null}
            {createOrderMutation.isSuccess ? (
              <div className="text-sm text-muted-foreground">Orden creada</div>
            ) : null}
          </div>
        </form>
      </div>

      <div className="space-y-3">
        <div className="font-semibold">Órdenes</div>
        {isLoading ? <div className="text-sm text-muted-foreground">Cargando...</div> : null}
        {error ? <div className="text-sm text-destructive">Error cargando órdenes</div> : null}

        {data ? (
          <ul className="space-y-2">
            {data.map((order) => (
              <PedidoItem key={order.id} order={order} />
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
};

export default PedidosView;
