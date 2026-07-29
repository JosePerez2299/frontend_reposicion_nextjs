import { useMemo } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SapVariant } from "@/schemas/entities/sap-availability.schema";
import { sapSizeLabel, sapSuggestedMax } from "@/lib/sap-variants";
import type { DraftRow, RowValidation } from "@/features/analisis_reposicion/hooks/useSapOrderDraft";
import { SapVariantRow } from "./SapVariantRow";

/**
 * Un grupo (producto, tipo). Las variantes se renderizan en el orden en que las
 * manda el backend, que ya viene por talla natural (40, 41, … / XS, S, M, L …).
 * No se reordena ni se reagrupa nada acá.
 */
export function SapVariantMatrix({
  title,
  emptyLabel,
  variants,
  rows,
  validations,
  rowErrors,
  disabled,
  onAdd,
  onQuantityChange,
  onRemove,
}: {
  title: string;
  emptyLabel: string;
  variants: SapVariant[];
  rows: DraftRow[];
  validations: Record<string, RowValidation>;
  rowErrors: Record<string, string>;
  disabled?: boolean;
  onAdd: (variant: SapVariant) => void;
  onQuantityChange: (key: string, quantity: number) => void;
  onRemove: (key: string) => void;
}) {
  const rowsByKey = useMemo(() => new Map(rows.map((r) => [r.key, r])), [rows]);

  // Orden derivado: primero las variantes publicadas en el orden de SAP, después
  // las filas que no están en la respuesta (ítems viejos o SKU sin disponibilidad).
  const orderedRows = useMemo(() => {
    const seen = new Set<string>();
    const inSapOrder: DraftRow[] = [];

    for (const variant of variants) {
      const row = rowsByKey.get(variant.item_code);
      if (row) {
        inSapOrder.push(row);
        seen.add(row.key);
      }
    }

    const rest = rows
      .filter((r) => !seen.has(r.key))
      .sort((a, b) => (a.existing?.variant ?? a.key).localeCompare(b.existing?.variant ?? b.key));

    return [...inSapOrder, ...rest];
  }, [variants, rows, rowsByKey]);

  const addable = useMemo(
    () => variants.filter((v) => !rowsByKey.has(v.item_code)),
    [variants, rowsByKey],
  );

  const totalPieces = orderedRows.reduce(
    (acc, row) => acc + (validations[row.key]?.totalPieces ?? 0),
    0,
  );

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <Label>
          {title} {orderedRows.length > 0 ? `(${orderedRows.length})` : ""}
        </Label>
        {totalPieces > 0 ? (
          <span className="text-xs text-muted-foreground">Total piezas: {totalPieces}</span>
        ) : null}
      </div>

      {orderedRows.length === 0 && variants.length === 0 ? (
        <div className="text-sm text-muted-foreground">{emptyLabel}</div>
      ) : null}

      {orderedRows.map((row) => (
        <SapVariantRow
          key={row.key}
          row={row}
          validation={validations[row.key] ?? { suggestedMax: null, unitSize: 1, totalPieces: 0, error: null, warning: null }}
          rowError={rowErrors[row.key]}
          disabled={disabled}
          onQuantityChange={(q) => onQuantityChange(row.key, q)}
          onRemove={() => onRemove(row.key)}
        />
      ))}

      {addable.length > 0 ? (
        <Select
          // El Select es solo un disparador de "agregar": no guarda selección
          value=""
          disabled={disabled}
          onValueChange={(itemCode) => {
            const variant = addable.find((v) => v.item_code === itemCode);
            if (variant) onAdd(variant);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={`+ Agregar ${title.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {addable.map((variant) => {
              const max = sapSuggestedMax(variant);
              return (
                <SelectItem key={variant.item_code} value={variant.item_code}>
                  <span className="font-mono">{sapSizeLabel(variant)}</span>
                  {variant.units_per_pack > 1 ? ` · ×${variant.units_per_pack}` : ""}
                  {" · "}
                  {max > 0
                    ? `${max} ${variant.type === "BULTO" ? "bultos" : "u"}`
                    : "sin stock"}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      ) : null}
    </div>
  );
}
