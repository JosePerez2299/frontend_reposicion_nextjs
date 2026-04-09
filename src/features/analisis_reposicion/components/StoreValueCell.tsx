"use client";

import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { getRotationStyle, getStockCellClass } from "@/lib/utils";

type Props = {
  viewMode: "compact" | "detailed";
  productName: string;
  storeName: string;
  qty_stock: number;
  qty_sold: number;
  transactions: number;
  total_buy: number;
  rotation: number;
};

export function StoreValueCell({
  viewMode,
  productName,
  storeName,
  qty_stock,
  qty_sold,
  transactions,
  total_buy,
  rotation,
}: Props) {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const rotationColors = getRotationStyle(rotation);
  const stockBgClass = getStockCellClass(qty_stock);
  const pct = (rotation * 100).toFixed(1);

  const handleOpenDialog = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTooltipOpen(false);
    setDialogOpen(true);
  };

  return (
    <TooltipProvider delayDuration={500}>
      <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
        <TooltipTrigger asChild>
          <div
            className={`relative group/storecell h-full w-full flex items-center justify-center cursor-help ${stockBgClass} transition-[filter] duration-100 hover:brightness-95`}
          >
            <button
              type="button"
              className="absolute top-1 right-1 opacity-0 group-hover/storecell:opacity-100 transition-opacity duration-150"
              onClick={handleOpenDialog}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-md border border-border bg-background/50 supports-[backdrop-filter]:bg-background/30 backdrop-blur text-muted-foreground hover:bg-background/70">
                <Plus className="h-4 w-4" />
              </span>
            </button>

            {viewMode === "detailed" ? (
              <div className="grid grid-cols-3 w-full">
                <div className={`text-center font-mono font-bold text-[12px] ${rotationColors.textClass}`}>
                  {pct}%
                </div>
                <div className="text-center font-mono text-[11px] text-muted-foreground border-l border-border">
                  {qty_stock.toLocaleString()}
                </div>
                <div className="text-center font-mono font-semibold text-[12px] text-foreground border-l border-border">
                  {qty_sold.toLocaleString()}
                </div>
              </div>
            ) : (
              <div className="text-center">
                <span className={`font-mono font-bold text-[15px] leading-none block ${rotationColors.textClass}`}>
                  {pct}%
                </span>
                <span className="font-mono text-[9px] text-muted-foreground mt-0.5 block">
                  {qty_stock}u
                </span>
              </div>
            )}
          </div>
        </TooltipTrigger>

        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
            <div className="font-semibold text-sm border-b pb-1">
              {productName} — {storeName}
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <div><span className="font-medium">Rotación:</span></div>
              <div className={`font-bold ${rotationColors.textClass}`}>{pct}%</div>
              <div><span className="font-medium">Stock:</span></div>
              <div className="text-muted-foreground">{qty_stock.toLocaleString()}</div>
              <div><span className="font-medium">Ventas:</span></div>
              <div className="font-semibold">{qty_sold.toLocaleString()}</div>
              <div><span className="font-medium">Transacciones:</span></div>
              <div className="text-muted-foreground">{transactions.toLocaleString()}</div>
              <div><span className="font-medium">Total compras:</span></div>
              <div className="font-semibold">${total_buy.toLocaleString()}</div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg [&>[data-state=open]]:duration-0 [&>[data-state=closed]]:duration-0">
          <DialogHeader>
            <DialogTitle>Detalle</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            <div className="font-medium">{productName}</div>
            <div className="text-muted-foreground">Tienda: {storeName}</div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1">
              <div className="text-muted-foreground">Rotación</div>
              <div className={`font-semibold ${rotationColors.textClass}`}>{pct}%</div>
              <div className="text-muted-foreground">Stock</div>
              <div className="font-semibold">{qty_stock.toLocaleString()}</div>
              <div className="text-muted-foreground">Ventas</div>
              <div className="font-semibold">{qty_sold.toLocaleString()}</div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}