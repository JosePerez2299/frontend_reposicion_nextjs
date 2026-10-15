import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchAdminStores,
  updateEnabledStores,
  updateStoreDepots,
} from "@/services/store.service";
import type { AdminStore, StoreDepotsUpdate } from "@/schemas/api/store.schemas";

export const ADMIN_STORES_KEY = ["ajustes", "stores", "admin"] as const;

export function useAdminStoresQuery(enabled: boolean) {
  return useQuery({
    queryKey: ADMIN_STORES_KEY,
    queryFn: fetchAdminStores,
    enabled,
    // 401/403 no se arreglan reintentando
    retry: false,
    refetchOnWindowFocus: false,
  });
}

/** La respuesta de los PUT es la lista completa: reemplaza el cache y refresca lo que depende de las tiendas. */
function useApplyAdminStores() {
  const queryClient = useQueryClient();

  return async (stores: AdminStore[]) => {
    queryClient.setQueryData(ADMIN_STORES_KEY, stores);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["analisis", "reposicion", "filtros", "opciones"] }),
      queryClient.invalidateQueries({ queryKey: ["analisis", "rotation"] }),
    ]);
  };
}

export function useUpdateEnabledStoresMutation() {
  const apply = useApplyAdminStores();

  return useMutation({
    mutationFn: (storeIds: string[]) => updateEnabledStores(storeIds),
    onSuccess: apply,
  });
}

export function useUpdateStoreDepotsMutation() {
  const apply = useApplyAdminStores();

  return useMutation({
    mutationFn: (vars: { storeId: string; body: StoreDepotsUpdate }) =>
      updateStoreDepots(vars.storeId, vars.body),
    onSuccess: apply,
  });
}
