import { useMemo } from "react";
import type { SapVariant, SapVariantGroups } from "@/schemas/entities/sap-availability.schema";
import type { DraftRow, RowValidation } from "@/features/analisis_reposicion/hooks/useSapOrderDraft";
import { OrderItemType } from "@/features/pedidos/types/pedido.types";
import { SectionCard } from "./SectionCard";
import { SapVariantMatrix } from "./SapVariantMatrix";
import { SapEmptyGroups } from "./SapAvailabilityStates";

/**
 * Un bloque = un product_id de 10. Hay dos: el de la celda del análisis y, cuando
 * existe, el de colores surtidos del mismo modelo (modelo + 9999).
 */
export function SapProductBlock({
  title,
  subtitle,
  productId,
  groups,
  rows,
  validations,
  rowErrors,
  disabled,
  onlyAvailable,
  hasAnyVariant,
  assortedFallbackAvailable = false,
  onShowSoldOut,
  onAdd,
  onQuantityChange,
  onRemove,
}: {
  title: string;
  subtitle?: string;
  productId: string;
  /** Grupos ya filtrados por el toggle. */
  groups: SapVariantGroups;
  rows: DraftRow[];
  validations: Record<string, RowValidation>;
  rowErrors: Record<string, string>;
  disabled?: boolean;
  onlyAvailable: boolean;
  /** Contado sobre la respuesta SIN filtrar: distingue "no existe" de "agotado". */
  hasAnyVariant: boolean;
  assortedFallbackAvailable?: boolean;
  onShowSoldOut: () => void;
  onAdd: (variant: SapVariant) => void;
  onQuantityChange: (key: string, quantity: number) => void;
  onRemove: (key: string) => void;
}) {
  const blockRows = useMemo(
    () => rows.filter((row) => row.productId === productId),
    [rows, productId],
  );

  // El tipo sale del snapshot de SAP; para las filas viejas, del ítem guardado.
  const rowType = (row: DraftRow): OrderItemType =>
    row.sap
      ? row.sap.type === "BULTO"
        ? OrderItemType.BULTO
        : OrderItemType.UNIDAD
      : (row.existing?.type as OrderItemType) ?? OrderItemType.UNIDAD;

  const unidadRows = blockRows.filter((r) => rowType(r) === OrderItemType.UNIDAD);
  const bultoRows = blockRows.filter((r) => rowType(r) === OrderItemType.BULTO);

  const bothEmpty =
    groups.unidades.length === 0 &&
    groups.bultos.length === 0 &&
    blockRows.length === 0;

  return (
    <SectionCard title={title} subtitle={subtitle}>
      {bothEmpty ? (
        <SapEmptyGroups
          onlyAvailable={onlyAvailable}
          hasAnyVariant={hasAnyVariant}
          assortedFallbackAvailable={assortedFallbackAvailable}
          onShowSoldOut={onShowSoldOut}
        />
      ) : (
        <div className="space-y-4">
          <SapVariantMatrix
            title="Unidades"
            emptyLabel="El proveedor no tiene unidades con stock"
            variants={groups.unidades}
            rows={unidadRows}
            validations={validations}
            rowErrors={rowErrors}
            disabled={disabled}
            onAdd={onAdd}
            onQuantityChange={onQuantityChange}
            onRemove={onRemove}
          />

          <SapVariantMatrix
            title="Bultos"
            emptyLabel="El proveedor no tiene bultos con stock"
            variants={groups.bultos}
            rows={bultoRows}
            validations={validations}
            rowErrors={rowErrors}
            disabled={disabled}
            onAdd={onAdd}
            onQuantityChange={onQuantityChange}
            onRemove={onRemove}
          />
        </div>
      )}
    </SectionCard>
  );
}
