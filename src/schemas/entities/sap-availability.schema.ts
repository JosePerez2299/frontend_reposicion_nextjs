import { z } from "zod";

/**
 * Disponibilidad de items en el SAP Business One del proveedor.
 *
 * Todo lo que describen estos schemas es inventario DEL PROVEEDOR, no propio:
 * `available` es cuánto puede despachar hoy y `committed` lo que ya comprometió
 * con otros clientes.
 *
 * Ningún objeto usa `.strict()`: si el backend agrega campos, el sheet no debe caerse.
 */

export const SapOrderItemTypeSchema = z.enum(["BULTO", "UNIDAD"]);
export const PrepackKindSchema = z.enum(["unidad", "curva", "paquete", "ambiguo"]);

/**
 * Preempaque. `code` y `name` vienen de SAP; el resto de un catálogo interno ya
 * parseado. Si el código no está en ese catálogo, `name` sigue llegando y lo
 * demás queda en null (~8,6% de los SKU no tienen preempaque cargado).
 */
const PrepackSchema = z.object({
  code: z.string().nullable(),
  /** Texto libre del proveedor, formato irregular. Se muestra tal cual. */
  name: z.string().nullable(),
  // .catch(null) para que un kind nuevo del backend no invalide la respuesta entera
  kind: PrepackKindSchema.nullable().catch(null),
  total_units: z.number().nullable(),
  /** Talla puntual si el desglose tiene una sola entrada; null en curvas. */
  size: z.string().nullable(),
  size_range: z.string().nullable(),
  /** Desglose talla → cantidad, ej. { "40": 2, "41": 3 }. */
  breakdown: z.record(z.string(), z.number()).nullable(),
});

const SapVariantSchema = z.object({
  /** SKU de 13 caracteres: modelo (6) + color (4) + talla/preempaque (3). */
  item_code: z.string(),
  name: z.string().nullable(),
  type: SapOrderItemTypeSchema,
  /** Piezas que trae el bulto (SalFactor2). 1 para unidades sueltas. */
  units_per_pack: z.number(),
  prepack: PrepackSchema,
  sales_uom: z.string().nullable(),
  inventory_uom: z.string().nullable(),
  warehouse_code: z.string(),
  on_hand: z.number(),
  /** Lo que el proveedor ya comprometió con otros clientes. */
  committed: z.number(),
  on_order: z.number(),
  /** on_hand - committed. Puede ser negativo si el proveedor tiene sobreventa. */
  available: z.number(),
  /** floor(available / units_per_pack), acotado a 0. */
  available_packs: z.number(),
  /** true = dato mal cargado del lado del proveedor, no un bug del endpoint. */
  prepack_mismatch: z.boolean(),
  prepack_suggests: SapOrderItemTypeSchema.nullable().catch(null),
});

const SapVariantGroupsSchema = z.object({
  unidades: z.array(SapVariantSchema),
  bultos: z.array(SapVariantSchema),
});

export const SapAvailabilitySchema = z.object({
  product_code: z.string(),
  model_code: z.string(),
  color_code: z.string(),
  warehouse_code: z.string(),
  /** Match exacto de los 10 caracteres. */
  variants: SapVariantGroupsSchema,
  /** Mismo modelo con color 9999 ("COLORES SURTIDOS"). Nunca se solapa con `variants`. */
  assorted: SapVariantGroupsSchema,
  has_assorted_match: z.boolean(),
});

export type SapOrderItemType = z.infer<typeof SapOrderItemTypeSchema>;
export type PrepackKind = z.infer<typeof PrepackKindSchema>;
export type Prepack = z.infer<typeof PrepackSchema>;
export type SapVariant = z.infer<typeof SapVariantSchema>;
export type SapVariantGroups = z.infer<typeof SapVariantGroupsSchema>;
export type SapAvailability = z.infer<typeof SapAvailabilitySchema>;
