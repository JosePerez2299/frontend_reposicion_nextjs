import { useMemo } from "react";
import { useOrderItemsQuery } from "@/features/pedidos/queries/pedidos.queries";
import type { OrderItemResponse } from "@/services/pedidos.service";
import { assortedProductIdFor } from "@/lib/sap-variants";

/**
 * Los ítems del pedido para esta celda. Son DOS queries porque un pedido de
 * colores surtidos vive bajo otro product_id (modelo + 9999) y
 * `useOrderItemsQuery` filtra por product_id.
 *
 * `assortedProductId` se deriva del model_code, no del primer item_code surtido:
 * con only_available=true los arrays de surtido pueden venir vacíos aunque haya
 * ítems ya pedidos, y derivarlo de los arrays cambiaría la query key en cada
 * flip del toggle y esconderá esos ítems.
 */
export function useStoreCellSheetItems({
  orderId,
  storeId,
  cellProductId,
  modelCode,
  enabled,
}: {
  orderId: number;
  storeId: string;
  cellProductId: string;
  modelCode?: string;
  enabled: boolean;
}) {
  const assortedProductId = modelCode ? assortedProductIdFor(modelCode) : "";
  const assortedEnabled = !!assortedProductId && assortedProductId !== cellProductId;

  const exactQuery = useOrderItemsQuery(
    orderId,
    { product_id: cellProductId, store_id: storeId },
    { enabled: enabled && !!cellProductId },
  );

  const assortedQuery = useOrderItemsQuery(
    orderId,
    { product_id: assortedProductId, store_id: storeId },
    { enabled: enabled && assortedEnabled },
  );

  // Memoizados por separado para que `allItems` no cambie de identidad en cada render
  const exactItems = useMemo(
    () => (exactQuery.data ?? []) as OrderItemResponse[],
    [exactQuery.data],
  );
  const assortedItems = useMemo(
    () => (assortedQuery.data ?? []) as OrderItemResponse[],
    [assortedQuery.data],
  );

  const allItems = useMemo(
    () => [...exactItems, ...assortedItems],
    [exactItems, assortedItems],
  );

  return {
    assortedProductId,
    assortedEnabled,
    exactItems,
    assortedItems,
    allItems,
    isLoading: exactQuery.isLoading || (assortedEnabled && assortedQuery.isLoading),
    isError: exactQuery.isError || (assortedEnabled && assortedQuery.isError),
    error: exactQuery.error ?? assortedQuery.error,
    /** Los ítems ya están cargados y se puede sembrar el draft sin pisar nada. */
    itemsReady: exactQuery.isSuccess && (!assortedEnabled || assortedQuery.isSuccess),
  };
}
