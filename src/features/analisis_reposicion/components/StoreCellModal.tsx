import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type StoreCellModalData = {
  product_name: string;
  store_name: string;
  rotation_pct: string;
  rotation_text_class: string;
  qty_stock: number;
  qty_sold: number;
  transactions: number;
  total_buy: number;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: StoreCellModalData | null;
};

export function StoreCellModal({ open, onOpenChange, data }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {data ? `${data.product_name}` : ""}
          </DialogTitle>
          <DialogDescription>
            {data ? "Detalle de indicadores para esta tienda." : ""}
            
          </DialogDescription>
        </DialogHeader>

        {data ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div className="font-medium">Tienda</div>
            <div className="text-muted-foreground">{data.store_name}</div>
            <div className="font-medium">Rotación</div>
            <div className={`font-bold ${data.rotation_text_class}`}>{data.rotation_pct}%</div>

            <div className="font-medium">Stock</div>
            <div className="text-muted-foreground">{data.qty_stock.toLocaleString()}</div>

            <div className="font-medium">Ventas</div>
            <div className="text-muted-foreground">{data.qty_sold.toLocaleString()}</div>

            <div className="font-medium">Transacciones</div>
            <div className="text-muted-foreground">{data.transactions.toLocaleString()}</div>

            <div className="font-medium">Total compras</div>
            <div className="text-muted-foreground">${data.total_buy.toLocaleString()}</div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
