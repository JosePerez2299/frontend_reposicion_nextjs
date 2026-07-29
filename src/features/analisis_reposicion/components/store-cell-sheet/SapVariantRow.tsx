import { Fragment } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { sapBreakdownEntries, sapSizeLabel } from "@/lib/sap-variants";
import type { DraftRow, RowValidation } from "@/features/analisis_reposicion/hooks/useSapOrderDraft";

function StockDetail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <>
      <span className="text-background/70">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </>
  );
}

function CurvaPopover({ row }: { row: DraftRow }) {
  const entries = sapBreakdownEntries(row.sap!);
  if (entries.length === 0) return null;

  const sum = entries.reduce((acc, [, qty]) => acc + qty, 0);
  const declared = row.sap!.prepack.total_units;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-6 px-1.5 text-xs">
          Ver curva
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56">
        <div className="text-xs font-medium">Distribución del bulto</div>
        <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
          {entries.map(([size, qty]) => (
            <Fragment key={size}>
              <span className="text-muted-foreground">{size}</span>
              <span className="text-right font-medium">{qty}</span>
            </Fragment>
          ))}
          <span className="border-t pt-1 text-muted-foreground">Σ</span>
          <span className="border-t pt-1 text-right font-medium">{sum}</span>
        </div>
        {declared !== null && declared !== sum ? (
          <div className="mt-2 text-xs text-muted-foreground">
            El catálogo declara {declared} piezas para este preempaque.
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

export function SapVariantRow({
  row,
  validation,
  rowError,
  disabled,
  onQuantityChange,
  onRemove,
}: {
  row: DraftRow;
  validation: RowValidation;
  rowError?: string;
  disabled?: boolean;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
}) {
  const sap = row.sap;
  const soldOut = validation.suggestedMax === 0;
  const isLegacy = row.source === "legacy";
  // Un ítem con SKU cuya disponibilidad no vino en la respuesta: agotado y filtrado,
  // o dado de baja en SAP. Se muestra igual, nunca desaparece un ítem persistido.
  const unpublished = row.source === "sap" && !sap;

  const label = sap
    ? sapSizeLabel(sap)
    : row.existing?.variant || row.itemCode?.slice(-3) || "—";

  const secondary = sap
    ? sap.prepack.name ?? sap.sales_uom ?? null
    : isLegacy
      ? `Pedido anterior a SAP · u/m ${row.existing?.unit_size ?? 1}`
      : `${row.itemCode} · sin disponibilidad publicada`;

  return (
    <div className={cn("space-y-1 rounded-md border p-2", soldOut && "opacity-70")}>
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-sm font-semibold">{label}</span>

            {sap && sap.units_per_pack > 1 ? (
              <Badge variant="outline">×{sap.units_per_pack}</Badge>
            ) : null}

            {sap?.prepack.kind ? (
              <Badge variant="secondary">{sap.prepack.kind}</Badge>
            ) : null}

            {isLegacy ? <Badge variant="secondary">Pedido anterior a SAP</Badge> : null}
            {unpublished ? <Badge variant="secondary">Sin disponibilidad</Badge> : null}

            {soldOut ? <Badge variant="destructive">Sin stock en el proveedor</Badge> : null}

            {sap?.prepack_mismatch ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400">
                    Preempaque dudoso
                  </Badge>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  El preempaque del proveedor no coincide con SalFactor2
                  {sap.prepack_suggests ? ` (sugiere ${sap.prepack_suggests})` : ""}. Es un dato
                  mal cargado de su lado: verificá antes de pedir y reportáselo.
                </TooltipContent>
              </Tooltip>
            ) : null}
          </div>

          {secondary ? (
            <div className="truncate text-xs text-muted-foreground">{secondary}</div>
          ) : null}

          <div className="flex items-center gap-1">
            {sap ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-help text-xs text-muted-foreground underline decoration-dotted">
                    {sap.type === "BULTO"
                      ? `${sap.available_packs} bultos`
                      : `${sap.available} ${sap.inventory_uom ?? "u"}`}
                  </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
                    <StockDetail label="Existencia" value={sap.on_hand} />
                    <StockDetail label="Comprometido (otros clientes)" value={sap.committed} />
                    <StockDetail label="En tránsito" value={sap.on_order} />
                    <StockDetail
                      label="Disponible"
                      value={
                        <span className={sap.available < 0 ? "text-red-400" : undefined}>
                          {sap.available}
                        </span>
                      }
                    />
                    <StockDetail label="Bultos completos" value={sap.available_packs} />
                    <StockDetail label="Almacén" value={sap.warehouse_code} />
                    <StockDetail label="U. venta" value={sap.sales_uom ?? "—"} />
                    <StockDetail label="U. inventario" value={sap.inventory_uom ?? "—"} />
                    <StockDetail label="SKU" value={sap.item_code} />
                  </div>
                </TooltipContent>
              </Tooltip>
            ) : null}
            {sap ? <CurvaPopover row={row} /> : null}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <div className="text-right">
            <Input
              type="number"
              min={1}
              // Sin `max`: el tope del proveedor es una sugerencia, no una garantía
              value={row.quantity}
              disabled={disabled}
              aria-invalid={!!validation.error}
              onChange={(e) => onQuantityChange(Number(e.target.value))}
              className="w-20"
            />
            <div className="pt-0.5 text-[11px] text-muted-foreground">
              = {validation.totalPieces} u
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-destructive"
            disabled={disabled}
            onClick={onRemove}
            aria-label="Quitar"
          >
            ×
          </Button>
        </div>
      </div>

      {validation.error ? (
        <div className="text-xs text-destructive">{validation.error}</div>
      ) : validation.warning ? (
        <div className="text-xs text-amber-600 dark:text-amber-400">{validation.warning}</div>
      ) : null}

      {rowError ? <div className="text-xs text-destructive">{rowError}</div> : null}
    </div>
  );
}
