import { useCallback, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";
import {
  useCreateOrderItemMutation,
  useDeleteOrderItemMutation,
  useUpdateOrderItemMutation,
} from "@/features/pedidos/queries/pedidos.queries";
import type { OrderItemResponse } from "@/services/pedidos.service";
import type { SapVariant } from "@/schemas/entities/sap-availability.schema";
import { sapProductId, sapSuggestedMax } from "@/lib/sap-variants";

/**
 * Lo que se guarda de cada línea. La identidad (`key`) es INMUTABLE:
 *  - filas del proveedor → el SKU de 13, que es también lo que va en el POST
 *  - filas anteriores a SAP → `legacy:${id}`, para que dos ítems viejos del mismo
 *    producto nunca colisionen (la tabla no tiene unique constraint)
 *
 * Cambiar de talla es quitar una fila y agregar otra, nunca mutar la identidad.
 * A propósito NO guarda la variante de SAP: se resuelve en derivación contra un
 * índice acumulado, así flipear only_available no deja filas sin datos.
 */
export type StoredRow = {
  key: string;
  productId: string;
  /** El SKU que va al POST. null en filas anteriores a la integración. */
  itemCode: string | null;
  quantity: number;
  existing: OrderItemResponse | null;
  source: "sap" | "legacy";
};

/** Una fila con su disponibilidad ya resuelta. Es lo que ve la UI. */
export type DraftRow = StoredRow & { sap: SapVariant | null };

export type DraftState = Record<string, StoredRow>;

export type RowValidation = {
  /** Lo que el proveedor puede despachar hoy, en la unidad en que se pide. */
  suggestedMax: number | null;
  unitSize: number;
  totalPieces: number;
  /** Bloquea el guardado. */
  error: string | null;
  /** Avisa sin bloquear. */
  warning: string | null;
};

export type CommitPlan = {
  toCreate: StoredRow[];
  toUpdate: { row: StoredRow; itemId: number; quantity: number }[];
  toDelete: { itemId: number; label: string }[];
};

// ── Funciones puras ──────────────────────────────────────────────────

export function buildDraft(existing: OrderItemResponse[]): DraftState {
  const draft: DraftState = {};

  for (const item of existing) {
    // sap_item_code null = ítem anterior a la integración con SAP
    const baseKey = item.sap_item_code ? item.sap_item_code : `legacy:${item.id}`;
    // Dos ítems con el mismo SKU no deberían existir, pero si existen no se pierde ninguno
    const key = draft[baseKey] ? `${baseKey}#${item.id}` : baseKey;

    draft[key] = {
      key,
      productId: item.product_id,
      itemCode: item.sap_item_code ?? null,
      quantity: item.quantity,
      existing: item,
      source: item.sap_item_code ? "sap" : "legacy",
    };
  }

  return draft;
}

export function validateRow(row: DraftRow): RowValidation {
  const unitSize = row.sap?.units_per_pack ?? row.existing?.unit_size ?? 1;
  const totalPieces = row.quantity * unitSize;

  // Lo único que el backend rechaza es cantidad <= 0
  const error =
    !Number.isFinite(row.quantity) || row.quantity < 1
      ? "La cantidad debe ser mayor que cero"
      : null;

  if (!row.sap) {
    return { suggestedMax: null, unitSize, totalPieces, error, warning: null };
  }

  const suggestedMax = sapSuggestedMax(row.sap);
  const unitLabel = row.sap.type === "BULTO" ? "bultos" : "unidades";

  // Advertencia, no bloqueo: no hay reserva y la foto del proveedor puede quedar
  // vieja entre que se arma el pedido y se aprueba. El backend tampoco valida.
  const warning =
    !error && row.quantity > suggestedMax
      ? suggestedMax === 0
        ? "El proveedor no tiene stock de este SKU ahora"
        : `El proveedor tiene ${suggestedMax} ${unitLabel} disponibles ahora`
      : null;

  return { suggestedMax, unitSize, totalPieces, error, warning };
}

export function buildCommitPlan(
  draft: DraftState,
  seededExisting: OrderItemResponse[],
): CommitPlan {
  const toCreate: CommitPlan["toCreate"] = [];
  const toUpdate: CommitPlan["toUpdate"] = [];
  const keptItemIds = new Set<number>();

  for (const row of Object.values(draft)) {
    const quantity = Math.floor(row.quantity);

    if (!row.existing) {
      // Las filas anteriores a SAP no tienen SKU, así que nunca se crean
      if (row.source === "sap" && row.itemCode && quantity >= 1) toCreate.push(row);
      continue;
    }

    if (quantity < 1) continue; // sin id que conservar → cae en toDelete

    keptItemIds.add(row.existing.id);
    if (quantity !== row.existing.quantity) {
      toUpdate.push({ row, itemId: row.existing.id, quantity });
    }
  }

  const toDelete = seededExisting
    .filter((item) => !keptItemIds.has(item.id))
    .map((item) => ({
      itemId: item.id,
      label: item.sap_item_code ?? item.variant ?? item.product_id,
    }));

  return { toCreate, toUpdate, toDelete };
}

// ── Hook ─────────────────────────────────────────────────────────────

export function useSapOrderDraft({
  orderId,
  storeId,
  sapIndex,
  existingItems,
  readyToSeed,
  seedScope,
}: {
  orderId: number;
  storeId: string;
  /** Índice acumulado por SKU. Acumulado a propósito: ver el comentario en el editor. */
  sapIndex: Map<string, SapVariant>;
  existingItems: OrderItemResponse[];
  readyToSeed: boolean;
  /** Cambia cuando cambia la celda/orden: fuerza un resembrado. */
  seedScope: string;
}) {
  const [draft, setDraft] = useState<DraftState>({});
  const [seededExisting, setSeededExisting] = useState<OrderItemResponse[]>([]);
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});
  const [seededFor, setSeededFor] = useState<string | null>(null);
  const [reseedToken, setReseedToken] = useState(0);
  const [isCommitting, setIsCommitting] = useState(false);

  const createMutation = useCreateOrderItemMutation();
  const updateMutation = useUpdateOrderItemMutation();
  const deleteMutation = useDeleteOrderItemMutation();
  const queryClient = useQueryClient();

  // Sembrado durante el render, no en un useEffect: la firma excluye a propósito
  // `dataUpdatedAt` y `onlyAvailable`, así un refetch de fondo o un flip del toggle
  // no borra lo que la persona está tipeando.
  const seedSignature = `${seedScope}|${reseedToken}`;
  if (readyToSeed && seededFor !== seedSignature) {
    setSeededFor(seedSignature);
    setDraft(buildDraft(existingItems));
    setSeededExisting(existingItems);
    setRowErrors({});
  }

  const rows = useMemo<DraftRow[]>(
    () =>
      Object.values(draft).map((row) => ({
        ...row,
        sap: row.itemCode ? sapIndex.get(row.itemCode) ?? null : null,
      })),
    [draft, sapIndex],
  );

  const validations = useMemo(() => {
    const map: Record<string, RowValidation> = {};
    for (const row of rows) map[row.key] = validateRow(row);
    return map;
  }, [rows]);

  const plan = useMemo(() => buildCommitPlan(draft, seededExisting), [draft, seededExisting]);

  const pendingChanges = plan.toCreate.length + plan.toUpdate.length + plan.toDelete.length;
  const hasBlockingError = rows.some((row) => validations[row.key]?.error);

  const setQuantity = useCallback((key: string, quantity: number) => {
    setDraft((prev) => {
      const row = prev[key];
      if (!row) return prev;
      return { ...prev, [key]: { ...row, quantity } };
    });
  }, []);

  const addVariant = useCallback((variant: SapVariant) => {
    setDraft((prev) => {
      if (prev[variant.item_code]) return prev;
      return {
        ...prev,
        [variant.item_code]: {
          key: variant.item_code,
          productId: sapProductId(variant.item_code),
          itemCode: variant.item_code,
          quantity: 1,
          existing: null,
          source: "sap",
        },
      };
    });
  }, []);

  const removeRow = useCallback((key: string) => {
    setDraft((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setRowErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const removeAllRows = useCallback(() => {
    setDraft({});
    setRowErrors({});
  }, []);

  const discard = useCallback(() => {
    setReseedToken((n) => n + 1);
  }, []);

  /**
   * Ids que la caché todavía reconoce. Nunca se manda un PUT/DELETE contra un id
   * que ya no existe (lo pudo borrar OrderDetailModal en otra pestaña).
   * Devuelve null si no hay datos en caché, y entonces no se filtra nada.
   */
  const liveItemIds = useCallback((): Set<number> | null => {
    const entries = queryClient.getQueriesData<OrderItemResponse[]>({
      queryKey: ["pedidos", "orderItems", orderId],
    });
    const ids = new Set<number>();
    let sawData = false;
    for (const [, data] of entries) {
      if (!Array.isArray(data)) continue;
      sawData = true;
      for (const item of data) ids.add(item.id);
    }
    return sawData ? ids : null;
  }, [queryClient, orderId]);

  const commit = useCallback(async () => {
    if (hasBlockingError || pendingChanges === 0) return;

    const live = liveItemIds();
    const stillThere = (itemId: number) => (live ? live.has(itemId) : true);

    type Op =
      | { kind: "create"; row: StoredRow }
      | { kind: "update"; row: StoredRow; itemId: number }
      | { kind: "delete"; itemId: number };

    const ops: Op[] = [
      // Los deletes primero: cambiar de talla no debe duplicar transitoriamente un SKU
      ...plan.toDelete
        .filter((d) => stillThere(d.itemId))
        .map((d): Op => ({ kind: "delete", itemId: d.itemId })),
      ...plan.toUpdate
        .filter((u) => stillThere(u.itemId))
        .map((u): Op => ({ kind: "update", row: u.row, itemId: u.itemId })),
      ...plan.toCreate
        .filter((row) => !!row.itemCode)
        .map((row): Op => ({ kind: "create", row })),
    ];

    if (ops.length === 0) return;

    setIsCommitting(true);
    setRowErrors({});

    const results = await Promise.allSettled(
      ops.map((op) => {
        if (op.kind === "delete") {
          return deleteMutation.mutateAsync({ itemId: op.itemId, orderId });
        }
        if (op.kind === "update") {
          return updateMutation.mutateAsync({
            item_id: op.itemId,
            quantity: Math.floor(op.row.quantity),
          });
        }
        return createMutation.mutateAsync({
          order_id: orderId,
          store_id: storeId,
          item_code: op.row.itemCode!,
          quantity: Math.floor(op.row.quantity),
        });
      }),
    );

    const nextRowErrors: Record<string, string> = {};
    const failedMessages = new Set<string>();
    let okCount = 0;

    // Se aplica el resultado op por op: si el commit fue parcial, un reintento
    // tiene que hacer UPDATE de lo que sí se creó, no crearlo de nuevo.
    const createdByKey = new Map<string, OrderItemResponse>();
    const updatedByKey = new Map<string, number>();
    const deletedIds = new Set<number>();

    results.forEach((result, i) => {
      const op = ops[i];
      if (result.status === "fulfilled") {
        okCount += 1;
        if (op.kind === "create") createdByKey.set(op.row.key, result.value as OrderItemResponse);
        if (op.kind === "update") updatedByKey.set(op.row.key, Math.floor(op.row.quantity));
        if (op.kind === "delete") deletedIds.add(op.itemId);
        return;
      }

      const message = getErrorMessage(result.reason);
      failedMessages.add(message);
      if (op.kind !== "delete") nextRowErrors[op.row.key] = message;
    });

    if (createdByKey.size > 0 || updatedByKey.size > 0) {
      setDraft((prev) => {
        const next = { ...prev };
        for (const [key, created] of createdByKey) {
          if (next[key]) next[key] = { ...next[key], existing: created, quantity: created.quantity };
        }
        for (const [key, quantity] of updatedByKey) {
          const row = next[key];
          if (row?.existing) next[key] = { ...row, existing: { ...row.existing, quantity } };
        }
        return next;
      });
    }

    setSeededExisting((prev) => {
      const kept = prev.filter((item) => !deletedIds.has(item.id));
      const patched = kept.map((item) => {
        const key = item.sap_item_code ?? `legacy:${item.id}`;
        const quantity = updatedByKey.get(key);
        return quantity === undefined ? item : { ...item, quantity };
      });
      return [...patched, ...createdByKey.values()];
    });

    setRowErrors(nextRowErrors);
    setIsCommitting(false);

    if (okCount > 0) {
      toast.success(`${okCount} ${okCount === 1 ? "cambio guardado" : "cambios guardados"}`);
    }
    for (const message of failedMessages) toast.error(message);

    // Solo se resiembra si no quedó nada colgado, para no perder las filas fallidas
    if (failedMessages.size === 0) setReseedToken((n) => n + 1);
  }, [
    hasBlockingError,
    pendingChanges,
    plan,
    liveItemIds,
    orderId,
    storeId,
    createMutation,
    updateMutation,
    deleteMutation,
  ]);

  return {
    rows,
    validations,
    rowErrors,
    plan,
    pendingChanges,
    hasBlockingError,
    isCommitting,
    setQuantity,
    addVariant,
    removeRow,
    removeAllRows,
    discard,
    commit,
  };
}
