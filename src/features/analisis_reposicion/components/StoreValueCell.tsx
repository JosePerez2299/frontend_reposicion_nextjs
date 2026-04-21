"use client";

import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { StoreCellSheet } from "./StoreCellSheet";
import { StoreCellModal } from "./StoreCellModal";
import { Check, Plus } from "lucide-react";
import { getRotationStyle, getStockIndicatorClass } from "@/lib/utils";

type Props = {
  viewMode: "compact" | "detailed";
  productId: string;
  productName: string;
  storeId: string;
  storeName: string;
  qty_stock: number;
  qty_sold: number;
  transactions: number;
  total_buy: number;
  rotation: number;
  hasOrder?: boolean;
};

export function StoreValueCell({
  viewMode,
  productId,
  productName,
  storeId,
  storeName,
  qty_stock,
  qty_sold,
  transactions,
  total_buy,
  rotation,
  hasOrder,
}: Props) {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const rotationColors = getRotationStyle(rotation);
  const stockIndicatorClass = getStockIndicatorClass(qty_stock);
  const pct = (rotation * 100).toFixed(1);

  const handleOpenDialog = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTooltipOpen(false);
    setModalOpen(false);
    setDialogOpen(true);
  };

  const handleOpenModal = () => {
    setTooltipOpen(false);
    setDialogOpen(false);
    setModalOpen(true);
  };

  return (
    <TooltipProvider delayDuration={500}>
      <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
        <TooltipTrigger asChild>
          <div
            className="relative group/storecell h-full w-full flex items-center justify-center cursor-help bg-background transition-[filter] duration-100 hover:brightness-95"
            onClick={handleOpenModal}
          >
            {hasOrder ? (
              <button
                type="button"
                className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-md border border-emerald-600/30 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/15"
                onClick={handleOpenDialog}
                aria-label="Abrir pedido"
                title="Abrir pedido"
              >
                <Check className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                className="absolute top-1 right-1 opacity-0 group-hover/storecell:opacity-100 transition-opacity duration-150"
                onClick={handleOpenDialog}
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-md border border-border bg-background/50 supports-[backdrop-filter]:bg-background/30 backdrop-blur text-muted-foreground hover:bg-background/70">
                  <Plus className="h-4 w-4" />
                </span>
              </button>
            )}

            {viewMode === "detailed" ? (
              <div className="grid grid-cols-3 w-full">
                <div className={`text-center font-mono font-bold text-[12px] ${rotationColors.textClass}`}>
                  {pct}%
                </div>
                <div className="text-center font-mono text-[11px] text-muted-foreground border-l border-border relative">
                  <div className={`absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full ${stockIndicatorClass}`} />
                  {qty_stock.toLocaleString()}
                </div>
                <div className="text-center font-mono font-semibold text-[12px] text-foreground border-l border-border">
                  {qty_sold.toLocaleString()}
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${stockIndicatorClass}`} />
                  <span className={`font-mono font-bold text-[15px] leading-none ${rotationColors.textClass}`}>
                    {pct}%
                  </span>
                </div>
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
      
      {dialogOpen && (
        <StoreCellSheet
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          data={{
            product_id: productId,
            product_name: productName,
            store_id: storeId,
            store_name: storeName,
            rotation_pct: pct,
            rotation_text_class: rotationColors.textClass,
            qty_stock,
            qty_sold,
          }}
        />
      )}

      {modalOpen && (
        <StoreCellModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          data={{
            product_name: productName,
            store_name: storeName,
            rotation_pct: pct,
            rotation_text_class: rotationColors.textClass,
            qty_stock,
            qty_sold,
            transactions,
            total_buy,
          }}
        />
      )}
    </TooltipProvider>
  );
}