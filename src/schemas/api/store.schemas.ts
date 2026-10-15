import { z } from "zod";

// ── Response schemas ─────────────────────────────────────────────

export const DepotSchema = z.object({
  id: z.string(),
  name: z.string().transform((s) => s.trim()),
  responsible: z.string(),
});

export const AdminStoreSchema = z.object({
  id: z.string(),
  // Algunos nombres del ERP traen "\r\n" al final
  name: z.string().transform((s) => s.trim()),
  erp_active: z.boolean(),
  enabled: z.boolean(),
  main_depot: z.string().nullable(),
  stock_depots: z.array(z.string()),
  available_depots: z.array(DepotSchema),
});

export const AdminStoresResponseSchema = z.array(AdminStoreSchema);

export type Depot = z.infer<typeof DepotSchema>;
export type AdminStore = z.infer<typeof AdminStoreSchema>;

// ── Request types ────────────────────────────────────────────────

export interface StoreDepotsUpdate {
  main_depot_id: string;
  stock_depot_ids: string[];
}
