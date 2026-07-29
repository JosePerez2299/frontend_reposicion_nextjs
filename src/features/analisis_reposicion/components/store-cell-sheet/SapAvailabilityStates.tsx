import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SAP_WAREHOUSE_LABEL } from "@/services/sap.service";

export function SapLoadingRows({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 w-20" />
        </div>
      ))}
    </div>
  );
}

export function SapInvalidCode({ code }: { code: string }) {
  return (
    <div className="text-sm text-destructive">
      Código de producto inválido: se esperan 10 caracteres alfanuméricos
      {code ? ` (recibido "${code}", ${code.length})` : ""}.
    </div>
  );
}

export function SapNotFound({ code }: { code: string }) {
  return (
    <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm">
      <div className="font-medium text-destructive">Producto no encontrado en SAP</div>
      <div className="text-muted-foreground">
        El proveedor no tiene ninguna variante activa con el prefijo {code}.
      </div>
    </div>
  );
}

export function SapGenericError({
  message,
  onRetry,
  isRetrying,
}: {
  message: string;
  onRetry: () => void;
  isRetrying?: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="text-sm text-destructive">{message}</div>
      <Button variant="outline" size="sm" onClick={onRetry} disabled={isRetrying}>
        {isRetrying ? "Reintentando..." : "Reintentar"}
      </Button>
    </div>
  );
}

export function SapEmptyGroups({
  onlyAvailable,
  hasAnyVariant,
  assortedFallbackAvailable,
  onShowSoldOut,
}: {
  onlyAvailable: boolean;
  /** Si el proveedor tiene ALGÚN SKU de este código, agotado o no. */
  hasAnyVariant: boolean;
  /** El modelo tiene surtido con stock, así que hay una alternativa real abajo. */
  assortedFallbackAvailable: boolean;
  onShowSoldOut: () => void;
}) {
  // El color no existe en SAP: el toggle de agotados no va a revelar nada
  if (!hasAnyVariant) {
    return (
      <div className="space-y-1 text-sm text-muted-foreground">
        <div>Este color no existe en el catálogo del proveedor.</div>
        {assortedFallbackAvailable ? (
          <div>Se puede pedir como color surtido, en la sección de abajo.</div>
        ) : null}
      </div>
    );
  }

  if (onlyAvailable) {
    return (
      <div className="space-y-2 text-sm text-muted-foreground">
        <div>
          El proveedor no tiene stock de este producto en {SAP_WAREHOUSE_LABEL}.
        </div>
        <Button variant="outline" size="sm" onClick={onShowSoldOut}>
          Mostrar agotados
        </Button>
      </div>
    );
  }

  return (
    <div className="text-sm text-muted-foreground">
      El producto existe en SAP pero no tiene variantes en este almacén.
    </div>
  );
}
