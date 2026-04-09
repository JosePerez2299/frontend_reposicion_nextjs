"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type StoreCellDialogData = {
  product_name: string;
  store_name: string;
  rotation_pct: string;
  rotation_text_class: string;
  qty_stock: number;
  qty_sold: number;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: StoreCellDialogData | null;
};

export function StoreCellDialog({ open, onOpenChange, data }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg [&>[data-state=open]]:duration-0 [&>[data-state=closed]]:duration-0">
        <DialogHeader>
          <DialogTitle>Detalle</DialogTitle>
        </DialogHeader>
        {data && (
          <div className="space-y-2 text-sm">
            <div className="font-medium">{data.product_name}</div>
            <div className="text-muted-foreground">Tienda: {data.store_name}</div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1">
              <div className="text-muted-foreground">Rotación</div>
              <div className={`font-semibold ${data.rotation_text_class}`}>{data.rotation_pct}%</div>
              <div className="text-muted-foreground">Stock</div>
              <div className="font-semibold">{data.qty_stock.toLocaleString()}</div>
              <div className="text-muted-foreground">Ventas</div>
              <div className="font-semibold">{data.qty_sold.toLocaleString()}</div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
