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
import {
  useOrdersQuery,
  useCreateOrderMutation,
} from "@/features/pedidos/queries/pedidos.queries";
import type { Order } from "@/features/pedidos/types/pedido.types";
import { OrderStatus } from "@/features/pedidos/types/pedido.types";
import { useAnalisisStore } from "@/stores/resposicion-analisis.store";
import {
  OrderPicker,
  type OrderFormData,
} from "./store-cell-sheet/OrderPicker";
import { StoreCellSheetItemsEditor } from "./store-cell-sheet/StoreCellSheetItemsEditor";

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

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: StoreCellSheetData | null;
};

export function StoreCellSheet({ open, onOpenChange, data }: Props) {
  const { selectedOrder, setSelectedOrder, clearSelectedOrder } = useAnalisisStore();
  const {
    data: orders,
    isLoading,
    isError,
  } = useOrdersQuery(100, OrderStatus.PENDING);
  const createOrderMutation = useCreateOrderMutation();

  const createOrder = async (formData: OrderFormData) => {
    const newOrder = await createOrderMutation.mutateAsync({
      status: OrderStatus.PENDING,
      description: formData.description,
      priority: formData.priority,
    });
    setSelectedOrder(newOrder as Order);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {/* La clase hay que pisarla con el prefijo de variante, si no twMerge no dedupea */}
      <SheetContent className="overflow-auto data-[side=right]:sm:max-w-2xl">
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
            Elegí las tallas y los bultos según lo que el proveedor tiene disponible.
          </SheetDescription>
        </SheetHeader>

        <div className="grid flex-1 auto-rows-min gap-6 overflow-auto px-4">
          <div className="space-y-4">
            <OrderPicker
              title="Orden"
              orders={orders as Order[] | undefined}
              isLoading={isLoading}
              isError={isError}
              selectedOrder={selectedOrder}
              onSelect={(order) => setSelectedOrder(order)}
              createOrderMutationPending={createOrderMutation.isPending}
              onCreateOrder={createOrder}
            />

            {selectedOrder ? (
              <Button variant="outline" className="w-full" onClick={() => clearSelectedOrder()}>
                Cambiar orden
              </Button>
            ) : null}

            {open && data && selectedOrder ? (
              <StoreCellSheetItemsEditor
                // Remontar al cambiar de celda u orden: el draft no debe sobrevivir el salto
                key={`${selectedOrder.id}|${data.product_id}|${data.store_id}`}
                order={selectedOrder as Order}
                productId={data.product_id}
                productName={data.product_name}
                storeId={data.store_id}
              />
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
