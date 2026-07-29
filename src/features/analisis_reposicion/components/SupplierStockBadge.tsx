import { Boxes, CircleHelp, Layers, PackageCheck, PackageX } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Resumen de disponibilidad del proveedor que viene por producto en la respuesta
 * de rotación. Sale del último snapshot (se refresca cada 4 horas), no en vivo.
 */
export type SupplierAvailability = {
  /**
   * `available_assorted` = el color exacto no tiene SKU propio en SAP, pero el
   * modelo tiene surtido (color comodín 9999) con disponibilidad. Se puede pedir
   * igual, desde el bloque "Colores surtidos" del sheet.
   */
  status: "available" | "available_assorted" | "in_catalog" | "unknown";
  has_stock: boolean;
  has_packs: boolean;
  variants_with_stock: number;
  packs_with_stock: number;
  available_units: number;
  snapshot_date: string | null;
  /** Opcionales: un backend anterior al fallback de surtido no los manda. */
  is_assorted?: boolean;
  assorted_code?: string | null;
};

const CONFIG = {
  available: {
    Icon: PackageCheck,
    className: "border-emerald-600/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    label: "El proveedor puede despachar",
  },
  // Ámbar + Layers ya significa "surtido" en las celdas de tienda y en el sheet
  available_assorted: {
    Icon: Layers,
    className: "border-amber-600/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
    label: "Disponible solo como color surtido",
  },
  in_catalog: {
    Icon: PackageX,
    className: "border-border bg-muted/50 text-muted-foreground",
    label: "En el catálogo del proveedor, sin disponibilidad",
  },
  unknown: {
    Icon: CircleHelp,
    // Deliberadamente el más apagado: "no sé" no es "agotado", y no debe leerse como tal
    className: "border-transparent bg-transparent text-muted-foreground/40",
    label: "No está en el catálogo del proveedor, o el snapshot todavía no corrió",
  },
} as const;

/** Los dos estados en los que el proveedor puede despachar algo. */
function isOrderable(status: SupplierAvailability["status"]) {
  return status === "available" || status === "available_assorted";
}

/** Marca compacta para la celda de producto. El detalle va en el tooltip de la celda. */
export function SupplierStockMarker({
  supplier,
}: {
  supplier?: SupplierAvailability | null;
}) {
  const status = supplier?.status ?? "unknown";
  const { Icon, className } = CONFIG[status];

  return (
    <span
      className={cn(
        "inline-flex h-3.5 shrink-0 items-center gap-0.5 rounded border px-1 font-mono text-[9px] leading-none",
        className,
      )}
    >
      <Icon className="h-2.5 w-2.5" />
      {/* El detalle de bultos lo explica el tooltip de la celda */}
      {isOrderable(status) && supplier?.has_packs ? <Boxes className="h-2.5 w-2.5" /> : null}
    </span>
  );
}

/**
 * Filas de detalle para el tooltip que ya existe en la celda de producto. Se
 * agregan ahí en vez de abrir un tooltip propio: anidar uno dentro de un
 * TooltipTrigger pelea con el hover del de afuera.
 */
export function SupplierTooltipDetail({
  supplier,
}: {
  supplier?: SupplierAvailability | null;
}) {
  const status = supplier?.status ?? "unknown";
  const { label } = CONFIG[status];

  return (
    <div className="space-y-0.5 border-t border-background/20 pt-1">
      <p className="text-xs font-medium">Proveedor: {label}</p>

      {status === "available_assorted" ? (
        <p className="text-xs text-muted-foreground">
          Este color no existe en SAP
          {supplier?.assorted_code ? (
            <>
              ; el stock es del surtido{" "}
              <span className="font-mono">{supplier.assorted_code}</span>
            </>
          ) : (
            "; el stock es del surtido del modelo"
          )}
          . Se pide desde &quot;Colores surtidos&quot;.
        </p>
      ) : null}

      {status !== "unknown" && supplier ? (
        <>
          <p className="text-xs text-muted-foreground">
            Variantes con stock: {supplier.variants_with_stock}
            {supplier.packs_with_stock > 0 ? ` · bultos: ${supplier.packs_with_stock}` : ""}
          </p>
          <p className="text-xs text-muted-foreground">
            Disponible: {supplier.available_units.toLocaleString()} u
          </p>
        </>
      ) : null}

      <p className="text-xs text-muted-foreground">
        {supplier?.snapshot_date
          ? `Snapshot del ${supplier.snapshot_date}`
          : "Sin snapshot todavía"}
      </p>
    </div>
  );
}
