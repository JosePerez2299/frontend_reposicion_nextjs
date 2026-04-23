import { useMemo, useState, useCallback, useEffect } from "react";
import { useOrderItemsQuery, useCreateOrderItemMutation, useUpdateOrderItemMutation, useDeleteOrderItemMutation } from "@/features/pedidos/queries/pedidos.queries";
import { useAnalisisStore } from "@/stores/resposicion-analisis.store";
import type { OrderItemResponse } from "@/services/pedidos.service";
import { OrderItemType, OrderStatus } from "@/features/pedidos/types/pedido.types";
import { useProductVariants } from "@/queries/productos.queries";

type StoreCellSheetData = {
  product_id: string;
  product_name: string;
  store_id: string;
  store_name: string;
  rotation_pct: string;
  rotation_text_class: string;
  qty_stock: number;
  qty_sold: number;
};

type VariantRow = {
  variant: string;
  quantity: number;
};

type UseStoreCellSheetOptions = {
  isOpen?: boolean;
};

export function useStoreCellSheetOrderItem(
  sheetData: StoreCellSheetData | null,
  options?: UseStoreCellSheetOptions
) {
  const { selectedOrder } = useAnalisisStore();

  const orderId = selectedOrder?.id ?? undefined;
  const productId = sheetData?.product_id ?? undefined;
  const storeId = sheetData?.store_id ?? undefined;

  const shouldFetchItems = useMemo(() => {
    return (
      options?.isOpen === true &&
      !!orderId &&
      !!productId &&
      !!storeId
    );
  }, [options?.isOpen, orderId, productId, storeId]);

  const { data: orderItems, isLoading: isLoadingItems, isError: isErrorItems, refetch } =
    useOrderItemsQuery(orderId ?? 0, { product_id: productId ?? "", store_id: storeId ?? "" }, { enabled: shouldFetchItems });

  const existingItem: OrderItemResponse | null = useMemo(() => {
    return orderItems && orderItems.length > 0 ? orderItems[0] : null;
  }, [orderItems]);

  const createItemMutation = useCreateOrderItemMutation();
  const updateItemMutation = useUpdateOrderItemMutation();
  const deleteItemMutation = useDeleteOrderItemMutation();

  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [quantity, setQuantity] = useState<number>(() => (sheetData && sheetData.qty_stock > 0 ? sheetData.qty_stock : 1));
  const [unitSize, setUnitSize] = useState<number>(1);
  const [type, setType] = useState<OrderItemType>(OrderItemType.BULTO);
  const [variant, setVariant] = useState<string>("");
  const [variantMatrix, setVariantMatrix] = useState<VariantRow[]>([]);

  const variantsQuery = useProductVariants(productId, {
    enabled: options?.isOpen === true && type === OrderItemType.UNIDAD && !!productId,
  });

  const parsedVariants = useMemo(() => {
    const raw = variantsQuery.data ?? [];
    const sizes = raw
      .map((code) => {
        const last3 = String(code).slice(-3);
        if (last3.length < 3) return "";
        return last3.endsWith("0") ? last3.slice(0, 2) : last3;
      })
      .filter(Boolean);

    return Array.from(new Set(sizes));
  }, [variantsQuery.data]);

  useEffect(() => {
    if (options?.isOpen) {
      if (existingItem) {
        setQuantity(existingItem.quantity);
        setUnitSize(existingItem.unit_size ?? 1);
        setType((existingItem.type as OrderItemType) ?? OrderItemType.BULTO);
        setVariant(existingItem.variant ?? "");
      } else if (sheetData) {
        setQuantity(sheetData.qty_stock > 0 ? sheetData.qty_stock : 1);
        setUnitSize(1);
        setType(OrderItemType.BULTO);
        setVariant("");
      }
    }
  }, [options?.isOpen, existingItem, sheetData]);

  useEffect(() => {
    if (type !== OrderItemType.UNIDAD) {
      setVariant("");
      setVariantMatrix([]);
      return;
    }

    if (!variant && parsedVariants.length > 0) {
      setVariant(parsedVariants[0]);
    }

    if (variantMatrix.length === 0 && parsedVariants.length > 0) {
      setVariantMatrix([
        { variant: parsedVariants[0], quantity: 1 }
      ]);
    }
  }, [type, parsedVariants, variant, variantMatrix.length]);

  const isItemAlreadyAdded = !!existingItem;
  const isPendingOrder = selectedOrder?.status === OrderStatus.PENDING;

  const addVariantRow = useCallback(() => {
    if (parsedVariants.length === 0) return;
    const availableVariant = parsedVariants.find(v => !variantMatrix.some(row => row.variant === v)) || parsedVariants[0];
    setVariantMatrix(prev => [
      ...prev,
      { variant: availableVariant, quantity: 1 }
    ]);
  }, [parsedVariants, variantMatrix]);

  const removeVariantRow = useCallback((variant: string) => {
    setVariantMatrix(prev => prev.filter(row => row.variant !== variant));
  }, []);

  const updateVariantRow = useCallback((variant: string, updates: Partial<VariantRow>) => {
    setVariantMatrix(prev => prev.map(row => 
      row.variant === variant ? { ...row, ...updates } : row
    ));
  }, []);

  const isVariantAvailable = useCallback((variant: string, excludeVariant?: string) => {
    return !variantMatrix.some(row => row.variant === variant && row.variant !== excludeVariant);
  }, [variantMatrix]);

  const resetVariantMatrix = useCallback(() => {
    if (parsedVariants.length > 0) {
      setVariantMatrix([{ variant: parsedVariants[0], quantity: 1 }]);
    } else {
      setVariantMatrix([]);
    }
  }, [parsedVariants]);

  const handleAddItem = useCallback(async () => {
    if (!selectedOrder || !productId || !storeId) return;

    try {
      if (type === OrderItemType.BULTO) {
        if (!quantity) return;
        if (!unitSize || unitSize <= 0) return;
        await createItemMutation.mutateAsync({
          order_id: selectedOrder.id,
          product_id: productId,
          store_id: storeId,
          type,
          quantity,
          unit_size: unitSize,
        });
      } else {
        const validRows = variantMatrix.filter(row => row.quantity > 0);
        if (validRows.length === 0) return;

        await Promise.all(
          validRows.map(row => 
            createItemMutation.mutateAsync({
              order_id: selectedOrder.id,
              product_id: productId,
              store_id: storeId,
              type,
              quantity: row.quantity,
              variant: row.variant,
            })
          )
        );
      }

      setShowAddForm(false);
      resetVariantMatrix();
      refetch();
    } catch (error) {
      console.error("Error adding item to order:", error);
    }
  }, [selectedOrder, productId, storeId, quantity, type, variantMatrix, createItemMutation, refetch, resetVariantMatrix]);

  const handleUpdateItem = useCallback(async () => {
    if (!existingItem || !selectedOrder) return;

    try {
      await updateItemMutation.mutateAsync({
        item_id: existingItem.id,
        type,
        quantity,
        variant: type === OrderItemType.UNIDAD ? variant || undefined : undefined,
        unit_size: type === OrderItemType.BULTO ? unitSize : undefined,
      });
      setShowEditForm(false);
      refetch();
    } catch (error) {
      console.error("Error updating item:", error);
    }
  }, [existingItem, selectedOrder, quantity, type, variant, updateItemMutation, refetch]);

  const handleDeleteItem = useCallback(async () => {
    if (!existingItem) return;

    try {
      await deleteItemMutation.mutateAsync({ itemId: existingItem.id, orderId: selectedOrder?.id });
      setShowEditForm(false);
      setShowAddForm(false);
      refetch();
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  }, [existingItem, deleteItemMutation, refetch]);

  const openEditForm = useCallback(() => {
    if (existingItem) {
      setQuantity(existingItem.quantity);
      setType((existingItem.type as OrderItemType) ?? OrderItemType.BULTO);
      setVariant(existingItem.variant ?? "");
    }
    setShowEditForm(true);
  }, [existingItem]);

  return {
    selectedOrder,
    existingItem,
    orderItems,
    isItemAlreadyAdded,
    isPendingOrder,
    isLoadingItems,
    isErrorItems,
    showAddForm,
    setShowAddForm,
    showEditForm,
    setShowEditForm,
    quantity,
    setQuantity,
    type,
    setType,
    variant,
    setVariant,
    variantMatrix,
    addVariantRow,
    removeVariantRow,
    updateVariantRow,
    resetVariantMatrix,
    isVariantAvailable,
    variantsQuery,
    parsedVariants,
    createItemMutation,
    handleAddItem,
    updateItemMutation,
    handleUpdateItem,
    deleteItemMutation,
    handleDeleteItem,
    openEditForm,
  };
}
