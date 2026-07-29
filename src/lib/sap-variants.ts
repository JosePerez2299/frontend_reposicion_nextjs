import { OrderItemType } from "@/features/pedidos/types/pedido.types";
import type {
  SapAvailability,
  SapOrderItemType,
  SapVariant,
  SapVariantGroups,
} from "@/schemas/entities/sap-availability.schema";

/**
 * Helpers puros sobre las variantes del proveedor. Es el único lugar del front
 * que hace slicing de SKUs.
 *
 *   0 1 7 4 4 1   0 1 9 8   2 4 3
 *   └─ modelo ─┘  └ color ┘  └ talla/preempaque ┘
 *      6 chars     4 chars        3 chars
 */

const SKU_LENGTH = 13;
const PRODUCT_CODE_LENGTH = 10;

/** Los primeros 10: el código canónico que usa el resto de la API. */
export function sapProductId(itemCode: string): string {
  return itemCode.slice(0, PRODUCT_CODE_LENGTH);
}

/** Los últimos 3: talla en Stellar, talla o distribución del bulto en SAP. */
export function sapVariantCode(itemCode: string): string {
  return itemCode.slice(-3);
}

/** El enum nominal de order_items no es asignable desde la unión de literales de SAP. */
export function toOrderItemType(type: SapOrderItemType): OrderItemType {
  return type === "BULTO" ? OrderItemType.BULTO : OrderItemType.UNIDAD;
}

/**
 * Etiqueta corta para la fila. `prepack.size` es null en curvas surtidas, y todo
 * el prepack puede venir null si el código no está en el catálogo interno.
 */
export function sapSizeLabel(variant: SapVariant): string {
  return (
    variant.prepack.size ??
    variant.prepack.size_range ??
    sapVariantCode(variant.item_code)
  );
}

export function sapBreakdownEntries(variant: SapVariant): [string, number][] {
  return Object.entries(variant.prepack.breakdown ?? {});
}

/**
 * Cantidad que el proveedor puede despachar hoy, en la unidad en la que se pide:
 * bultos completos para BULTO, unidades para UNIDAD.
 *
 * Es una sugerencia, no un límite: no hay reserva y la foto puede quedar vieja
 * entre que se arma el pedido y se aprueba. El backend tampoco valida cantidad.
 */
export function sapSuggestedMax(variant: SapVariant): number {
  const raw = variant.type === "BULTO" ? variant.available_packs : variant.available;
  return Math.max(0, Math.floor(raw));
}

/** Piezas totales de la línea. Confundirlo con `quantity` pide 10× o 1/10. */
export function sapTotalPieces(variant: SapVariant, quantity: number): number {
  return quantity * variant.units_per_pack;
}

export function isSoldOut(variant: SapVariant): boolean {
  return sapSuggestedMax(variant) <= 0;
}

/**
 * Réplica en el cliente del filtro `only_available` del backend.
 *
 * El editor pide siempre la respuesta completa (`only_available=false`) y filtra
 * acá: así el toggle es instantáneo, sin refetch, y el índice de SKUs queda
 * siempre completo — una fila ya pedida de un SKU agotado nunca se queda sin datos.
 */
export function filterAvailableGroups(
  groups: SapVariantGroups,
  onlyAvailable: boolean,
): SapVariantGroups {
  if (!onlyAvailable) return groups;
  return {
    unidades: groups.unidades.filter((v) => v.available > 0),
    bultos: groups.bultos.filter((v) => v.available > 0),
  };
}

/** Todas las variantes de la respuesta, exactas y surtidas, en un solo array. */
export function allSapVariants(availability: SapAvailability): SapVariant[] {
  return [
    ...availability.variants.unidades,
    ...availability.variants.bultos,
    ...availability.assorted.unidades,
    ...availability.assorted.bultos,
  ];
}

/**
 * Índice por SKU de 13. La clave es el `item_code` completo, que es también la
 * identidad de fila en el editor y lo que se manda en el POST.
 */
export function buildSapIndex(
  availability: SapAvailability | undefined,
): Map<string, SapVariant> {
  const index = new Map<string, SapVariant>();
  if (!availability) return index;

  for (const variant of allSapVariants(availability)) {
    if (process.env.NODE_ENV !== "production" && variant.item_code.length !== SKU_LENGTH) {
      // slice(0,10) y slice(-3) solo particionan limpio a 13 caracteres
      console.warn(
        `[sap] item_code con largo inesperado (${variant.item_code.length}): ${variant.item_code}`,
      );
    }
    index.set(variant.item_code, variant);
  }

  return index;
}

/** El código surtido del modelo: mismos 6 primeros, color 9999. */
export function assortedProductIdFor(modelCode: string): string {
  return `${modelCode}9999`;
}

export function isAssortedProductId(productId: string): boolean {
  return productId.endsWith("9999");
}
