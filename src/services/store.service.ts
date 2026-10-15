import { api } from "@/config/api";
import {
  AdminStoresResponseSchema,
  type AdminStore,
  type StoreDepotsUpdate,
} from "@/schemas/api/store.schemas";

/** GET /store/admin — todas las sucursales del ERP con su configuración (solo admin). */
export async function fetchAdminStores(): Promise<AdminStore[]> {
  const data = await api.get("/store/admin");
  return AdminStoresResponseSchema.parse(data);
}

/** PUT /store/admin — reemplaza la lista completa de tiendas habilitadas. */
export async function updateEnabledStores(storeIds: string[]): Promise<AdminStore[]> {
  const data = await api.put("/store/admin", { store_ids: storeIds });
  return AdminStoresResponseSchema.parse(data);
}

/** PUT /store/admin/{id}/depots — reemplaza el almacén principal y los extra de una tienda. */
export async function updateStoreDepots(
  storeId: string,
  body: StoreDepotsUpdate,
): Promise<AdminStore[]> {
  const data = await api.put(`/store/admin/${encodeURIComponent(storeId)}/depots`, body);
  return AdminStoresResponseSchema.parse(data);
}
