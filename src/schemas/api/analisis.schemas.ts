import { z } from "zod";

export const RotationRequest = z.object({
  dates: z.object({
    from: z.date(),
    to: z.date(),
  }),
  category: z.string(),
  groups: z.array(z.string()),
  subgroups: z.array(z.string()),
  product_codes: z.array(z.string()),
  store_ids: z.array(z.string()),
  /**
   * Deja solo los productos con al menos una variante disponible en el almacén
   * de bultos del proveedor, según el último snapshot. Default false.
   *
   * No distingue bultos de unidades: un producto con solo unidades sueltas pasa
   * el filtro. Para eso está `supplier.has_packs` en cada fila.
   */
  only_supplier_stock: z.boolean().default(false),
});

export type AnalisisFilters = z.infer<typeof RotationRequest>;

export type RotationRequest = z.infer<typeof RotationRequest>;