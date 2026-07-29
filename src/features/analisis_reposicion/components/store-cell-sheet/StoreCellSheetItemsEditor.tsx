import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { getErrorMessage } from "@/lib/errors";
import { useSapItemAvailability } from "@/queries/sap.queries";
import {
  SAP_WAREHOUSE_LABEL,
  isValidSapProductCode,
  normalizeSapCode,
} from "@/services/sap.service";
import { buildSapIndex, filterAvailableGroups } from "@/lib/sap-variants";
import { ApiError } from "@/config/api";
import type { SapVariantGroups } from "@/schemas/entities/sap-availability.schema";
import { OrderStatus, type Order } from "@/features/pedidos/types/pedido.types";
import { useStoreCellSheetItems } from "@/features/analisis_reposicion/hooks/useStoreCellSheetItems";
import { useSapOrderDraft } from "@/features/analisis_reposicion/hooks/useSapOrderDraft";
import { SapProductBlock } from "./SapProductBlock";
import {
  SapGenericError,
  SapInvalidCode,
  SapLoadingRows,
  SapNotFound,
} from "./SapAvailabilityStates";

const EMPTY_GROUPS: SapVariantGroups = { unidades: [], bultos: [] };

export function StoreCellSheetItemsEditor({
  order,
  productId,
  productName,
  storeId,
}: {
  order: Order;
  productId: string;
  productName: string;
  storeId: string;
}) {
  const [onlyAvailable, setOnlyAvailable] = useState(true);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  const code = normalizeSapCode(productId);
  const codeIsValid = isValidSapProductCode(code);

  // Siempre se pide la respuesta completa y el toggle filtra en el cliente:
  // así no hay refetch al flipearlo y el índice de SKUs queda siempre completo.
  const availabilityQuery = useSapItemAvailability(code, { onlyAvailable: false });
  const availability = availabilityQuery.data;

  const itemsState = useStoreCellSheetItems({
    orderId: order.id,
    storeId,
    cellProductId: code,
    modelCode: availability?.model_code,
    enabled: true,
  });

  // El índice se arma sobre la respuesta SIN filtrar, así una fila ya pedida de un
  // SKU agotado sigue mostrando su disponibilidad aunque el toggle la esconda.
  const sapIndex = useMemo(() => buildSapIndex(availability), [availability]);

  const visibleGroups = useMemo(
    () => ({
      variants: filterAvailableGroups(availability?.variants ?? EMPTY_GROUPS, onlyAvailable),
      assorted: filterAvailableGroups(availability?.assorted ?? EMPTY_GROUPS, onlyAvailable),
    }),
    [availability, onlyAvailable],
  );

  // Un código inválido no dispara la query, así que isFetched nunca se pondría en true
  const availabilityReady = !codeIsValid || availabilityQuery.isFetched;

  const draft = useSapOrderDraft({
    orderId: order.id,
    storeId,
    sapIndex,
    existingItems: itemsState.allItems,
    readyToSeed: availabilityReady && itemsState.itemsReady,
    seedScope: `${order.id}|${code}|${storeId}`,
  });

  const isPending = order.status === OrderStatus.PENDING;
  const notFound =
    availabilityQuery.error instanceof ApiError && availabilityQuery.error.status === 404;
  const otherError = availabilityQuery.isError && !notFound;

  const showAssortedBlock =
    itemsState.assortedEnabled &&
    (availability?.has_assorted_match ||
      (availability?.assorted.unidades.length ?? 0) > 0 ||
      (availability?.assorted.bultos.length ?? 0) > 0 ||
      itemsState.assortedItems.length > 0);

  if (!isPending) {
    return (
      <div className="rounded-lg border p-4 text-sm text-muted-foreground">
        La orden no está pendiente, no se pueden editar sus items.
      </div>
    );
  }

  if (!codeIsValid) {
    return (
      <div className="rounded-lg border p-4">
        <SapInvalidCode code={code} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div className="text-xs text-muted-foreground">
          Disponibilidad del proveedor en {SAP_WAREHOUSE_LABEL}. No es stock propio: lo
          comprometido es lo que el proveedor ya asignó a otros clientes, y puede cambiar sin
          aviso porque no hay reserva.
        </div>
        <Toggle
          variant="outline"
          size="sm"
          className="shrink-0"
          pressed={!onlyAvailable}
          onPressedChange={(pressed) => setOnlyAvailable(!pressed)}
        >
          Mostrar agotados
        </Toggle>
      </div>

      {otherError ? (
        <div className="rounded-lg border p-4">
          <SapGenericError
            message={getErrorMessage(availabilityQuery.error)}
            onRetry={() => availabilityQuery.refetch()}
            isRetrying={availabilityQuery.isFetching}
          />
        </div>
      ) : null}

      {notFound ? <SapNotFound code={code} /> : null}

      {availabilityQuery.isPending || itemsState.isLoading ? (
        <div className="rounded-lg border p-4">
          <SapLoadingRows />
        </div>
      ) : (
        <>
          <SapProductBlock
            title={productName || code}
            subtitle={code}
            productId={code}
            groups={visibleGroups.variants}
            hasAnyVariant={
              (availability?.variants.unidades.length ?? 0) +
                (availability?.variants.bultos.length ?? 0) >
              0
            }
            assortedFallbackAvailable={!!showAssortedBlock}
            rows={draft.rows}
            validations={draft.validations}
            rowErrors={draft.rowErrors}
            disabled={draft.isCommitting}
            onlyAvailable={onlyAvailable}
            onShowSoldOut={() => setOnlyAvailable(false)}
            onAdd={draft.addVariant}
            onQuantityChange={draft.setQuantity}
            onRemove={draft.removeRow}
          />

          {showAssortedBlock ? (
            <SapProductBlock
              title="Colores surtidos"
              subtitle={`${itemsState.assortedProductId} — COLORES SURTIDOS`}
              productId={itemsState.assortedProductId}
              groups={visibleGroups.assorted}
              hasAnyVariant={
                (availability?.assorted.unidades.length ?? 0) +
                  (availability?.assorted.bultos.length ?? 0) >
                0
              }
              rows={draft.rows}
              validations={draft.validations}
              rowErrors={draft.rowErrors}
              disabled={draft.isCommitting}
              onlyAvailable={onlyAvailable}
              onShowSoldOut={() => setOnlyAvailable(false)}
              onAdd={draft.addVariant}
              onQuantityChange={draft.setQuantity}
              onRemove={draft.removeRow}
            />
          ) : null}
        </>
      )}

      <div className="sticky bottom-0 space-y-2 border-t bg-background pt-3">
        <div className="flex gap-2">
          <Button
            className="flex-1"
            onClick={draft.commit}
            disabled={
              draft.isCommitting || draft.pendingChanges === 0 || draft.hasBlockingError
            }
          >
            {draft.isCommitting
              ? "Guardando..."
              : draft.pendingChanges > 0
                ? `Guardar cambios (${draft.pendingChanges})`
                : "Sin cambios"}
          </Button>
          <Button
            variant="outline"
            onClick={draft.discard}
            disabled={draft.isCommitting || draft.pendingChanges === 0}
          >
            Descartar
          </Button>
        </div>

        {draft.rows.length > 0 ? (
          <Button
            variant="destructive"
            className="w-full"
            disabled={draft.isCommitting}
            onClick={() => setConfirmClearOpen(true)}
          >
            Quitar todos los items de este producto
          </Button>
        ) : null}

        <DeleteConfirmDialog
          open={confirmClearOpen}
          onOpenChange={setConfirmClearOpen}
          title="Quitar todos los items"
          description="Se quitarán todas las líneas de este producto del pedido. Todavía tenés que apretar Guardar cambios para que se aplique."
          isPending={false}
          onConfirm={async () => {
            draft.removeAllRows();
            setConfirmClearOpen(false);
          }}
        />
      </div>
    </div>
  );
}
