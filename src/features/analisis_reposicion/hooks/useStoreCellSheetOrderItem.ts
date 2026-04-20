import { useMemo, useState, useCallback, useEffect } from "react";
import { useOrderItemsQuery, useCreateOrderItemMutation, useUpdateOrderItemMutation, useDeleteOrderItemMutation } from "@/features/pedidos/queries/pedidos.queries";
import { useAnalisisStore } from "@/stores/resposicion-analisis.store";
import type { OrderItemResponse } from "@/services/pedidos.service";

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
      !!storeId &&
      selectedOrder?.status === "pending"
    );
  }, [options?.isOpen, orderId, productId, storeId, selectedOrder?.status]);

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

  // Sync quantity when sheet opens or when sheetData/existingItem changes.
  useEffect(() => {
    if (options?.isOpen) {
      if (existingItem) {
        setQuantity(existingItem.quantity);
      } else if (sheetData) {
        setQuantity(sheetData.qty_stock > 0 ? sheetData.qty_stock : 1);
      }
    }
  }, [options?.isOpen, existingItem, sheetData]);

  const isItemAlreadyAdded = !!existingItem;
  const isPendingOrder = selectedOrder?.status === "pending";

  const handleAddItem = useCallback(async () => {
    if (!selectedOrder || !productId || !storeId || !quantity) return;

    try {
      await createItemMutation.mutateAsync({
        order_id: selectedOrder.id,
        product_id: productId,
        store_id: storeId,
        quantity,
      });
      setShowAddForm(false);
      refetch();
    } catch (error) {
      console.error("Error adding item to order:", error);
    }
  }, [selectedOrder, productId, storeId, quantity, createItemMutation, refetch]);

  const handleUpdateItem = useCallback(async () => {
    if (!existingItem || !selectedOrder) return;

    try {
      await updateItemMutation.mutateAsync({
        item_id: existingItem.id,
        quantity,
      });
      setShowEditForm(false);
      refetch();
    } catch (error) {
      console.error("Error updating item:", error);
    }
  }, [existingItem, selectedOrder, quantity, updateItemMutation, refetch]);

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
    if (existingItem) setQuantity(existingItem.quantity);
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
    createItemMutation,
    handleAddItem,
    updateItemMutation,
    handleUpdateItem,
    deleteItemMutation,
    handleDeleteItem,
    openEditForm,
  };
}