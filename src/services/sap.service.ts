import { api } from "@/config/api";
import {
  SapAvailabilitySchema,
  type SapAvailability,
} from "@/schemas/entities/sap-availability.schema";

/**
 * El único almacén del proveedor con el que se opera. El endpoint ya no acepta
 * `whs_code`: siempre responde por este.
 */
export const SAP_WAREHOUSE = "MD01_001";
export const SAP_WAREHOUSE_LABEL = "Principal (Bultos)";

/** Los códigos de producto canónicos son modelo (6) + color (4). */
export const SAP_PRODUCT_CODE_LENGTH = 10;

/** Normaliza como lo hace el backend (trim + upper) para no depender de él. */
export function normalizeSapCode(code: string): string {
  return code.trim().toUpperCase();
}

export function isValidSapProductCode(code: string): boolean {
  return normalizeSapCode(code).length === SAP_PRODUCT_CODE_LENGTH;
}

/**
 * Disponibilidad del proveedor para un código de 10 caracteres.
 *
 * `only_available` se omite cuando no se pasa: el paramsSerializer de config/api
 * descarta undefined, así que cae en el default del backend (true).
 */
export async function fetchSapItemAvailability(params: {
  itemCode: string;
  onlyAvailable?: boolean;
}): Promise<SapAvailability> {
  const code = normalizeSapCode(params.itemCode);
  const data = await api.get<unknown>(
    `/sap/items/${encodeURIComponent(code)}/availability`,
    { only_available: params.onlyAvailable },
  );
  return SapAvailabilitySchema.parse(data);
}
