import { useOrdersQuery } from "@/features/pedidos/queries/pedidos.queries";
import type { Order } from "@/features/pedidos/types/pedido.types";

const PedidoItem = ({ order }: { order: Order }) => {
  return (
    <li key={order.id} className="flex flex-col space-y-1 py-2 px-3 bg-white shadow-sm rounded-lg">
      <div className="font-semibold text-lg">ID de la orden: {order.id}</div>
      <div className="text-sm text-muted-foreground">Fecha: {order.created_at}</div>
      <div className="text-sm text-muted-foreground">Estado: {order.status}</div>
    </li>
  );
};

const PedidosView = () => {
  const { data, isLoading, error } = useOrdersQuery();
  return (
    <div>
      PedidosView
      {data && (
        <ul>
          {data.map((order) => (
            <PedidoItem key={order.id} order={order} />
          ))}
        </ul>
      )}
    </div>
  );
};

export default PedidosView;
