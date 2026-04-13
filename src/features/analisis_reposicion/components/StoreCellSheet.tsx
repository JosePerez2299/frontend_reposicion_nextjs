"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type StoreCellSheetData = {
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
  data: StoreCellSheetData | null;
};

export function StoreCellSheet({ open, onOpenChange, data }: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Detalles del Producto</SheetTitle>
        </SheetHeader>
        
        {data && (
          <div className="space-y-6">
            {/* Información del producto */}
            <div className="space-y-2 text-sm">
              <div className="font-medium text-base">{data.product_name}</div>
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

            {/* Formulario dummy */}
            <div className="space-y-4">
              <div className="text-sm font-medium">Ajustar Inventario</div>
              
              <div className="space-y-2">
                <Label htmlFor="stock-adjust">Ajuste de Stock</Label>
                <Input 
                  id="stock-adjust" 
                  type="number" 
                  placeholder="Ingrese cantidad"
                  defaultValue="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reason">Motivo</Label>
                <Input 
                  id="reason" 
                  type="text" 
                  placeholder="Especifique el motivo del ajuste"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notas adicionales</Label>
                <Input 
                  id="notes" 
                  type="text" 
                  placeholder="Notas opcionales"
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button type="button">
                  Aplicar Cambios
                </Button>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
