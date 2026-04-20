"use client";

import OrderForm from "./OrderForm";
import OrdersList from "./OrdersList";
import { useOrdersQuery, useCreateOrderMutation } from "@/features/pedidos/queries/pedidos.queries";
import { OrderStatus } from "@/features/pedidos/types/pedido.types";

const PedidosView = () => {
  const { data, isLoading, error } = useOrdersQuery(100);
  const createOrderMutation = useCreateOrderMutation();

  const isSubmitting = createOrderMutation.isPending;

  const onSubmit = async (formData: any) => {
    await createOrderMutation.mutateAsync({ description: formData.description, priority: formData.priority, status: OrderStatus.PENDING });
  };

  return (
    <div className="space-y-6">
      <OrderForm onSubmit={onSubmit} isSubmitting={isSubmitting} />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Órdenes</h3>
        </div>

        {isLoading ? <div className="text-sm text-muted-foreground">Cargando...</div> : null}
        {error ? <div className="text-sm text-destructive">Error cargando órdenes</div> : null}

        {data ? <OrdersList orders={data} /> : null}
      </div>
    </div>
  );
};

export default PedidosView;