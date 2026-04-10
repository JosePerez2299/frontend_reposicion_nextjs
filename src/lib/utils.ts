import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const normalizeAllToEmpty = (
  selected: string[],
  allOptionsLength: number,
) => {
  return selected.length === allOptionsLength ? [] : selected;
};

// ---------------------------------------------------------------------------
// Color helpers — matching sole-v5 palette
// ---------------------------------------------------------------------------

const STOCK_LEVELS = [
  {
    label: "Sin stock",
    maxExclusive: 1,
    bg: "bg-[var(--stock-none-bg)]",
    text: "text-[var(--stock-none-text)]",
    border: "border-[var(--stock-none-border)]",
  },
  {
    label: "Stock < 10",
    maxExclusive: 10,
    bg: "bg-[var(--stock-low-bg)]",
    text: "text-[var(--stock-low-text)]",
    border: "border-[var(--stock-low-border)]",
  },
  {
    label: "Stock 10-49",
    maxExclusive: 50,
    bg: "bg-[var(--stock-medium-bg)]",
    text: "text-[var(--stock-medium-text)]",
    border: "border-[var(--stock-medium-border)]",
  },
  {
    label: "Stock >= 50",
    maxExclusive: Number.POSITIVE_INFINITY,
    bg: "bg-[var(--stock-high-bg)]",
    text: "text-[var(--stock-high-text)]",
    border: "border-[var(--stock-high-border)]",
  },
] as const;

const ROTATION_LEVELS = [
  {
    label: "Rotación <=15%",
    maxInclusive: 0.15,
    bg: "bg-[var(--stock-none-bg)]",
    text: "text-[var(--rotation-critical-text)]",
    border: "border-[var(--stock-none-border)]",
  },
  {
    label: "Rotación 15-35%",
    maxInclusive: 0.35,
    bg: "bg-[var(--stock-low-bg)]",
    text: "text-[var(--rotation-high-text)]",
    border: "border-[var(--stock-low-border)]",
  },
  {
    label: "Rotación 35-60%",
    maxInclusive: 0.6,
    bg: "bg-[var(--stock-medium-bg)]",
    text: "text-[var(--rotation-medium-text)]",
    border: "border-[var(--stock-medium-border)]",
  },
  {
    label: "Rotación >60%",
    maxInclusive: Number.POSITIVE_INFINITY,
    bg: "bg-[var(--stock-high-bg)]",
    text: "text-[var(--rotation-good-text)]",
    border: "border-[var(--stock-high-border)]",
  },
] as const;

/**
 * Returns Tailwind bg + text classes based on rotation value (0–1).
 * Mirrors --s-r/--t-r … --s-g/--t-g from the reference design.
 */
export function getRotationStyle(rotation: number): {
  bgClass: string;   // Tailwind background
  textClass: string; // Tailwind text color
} {
  const level = ROTATION_LEVELS.find((l) => rotation <= l.maxInclusive) ?? ROTATION_LEVELS[ROTATION_LEVELS.length - 1];
  return { bgClass: level.bg, textClass: level.text };
}

/** Background colors based on stock levels - matching sole-v5 palette */
export function getStockCellClass(qty_stock: number): string {
  const level = STOCK_LEVELS.find((l) => qty_stock < l.maxExclusive) ?? STOCK_LEVELS[STOCK_LEVELS.length - 1];
  return level.bg;
}

/** Legend configuration for stock levels - uses standardized colors */
export function getStockLegendConfig() {
  return STOCK_LEVELS.map(({ label, bg, text, border }) => ({
    bg,
    text,
    border,
    label,
  }));
}

/** Legend configuration for rotation levels - uses standardized colors */
export function getRotationLegendConfig() {
  return ROTATION_LEVELS.map(({ label, bg, text, border }) => ({
    bg,
    text,
    border,
    label,
  }));
}

/** Complete legend configuration with both stock and rotation */
export function getCompleteLegendConfig() {
  return [
    { type: "stock", title: "Colores de fondo (Stock):", items: getStockLegendConfig() },
    { type: "rotation", title: "Colores de texto (Rotación):", items: getRotationLegendConfig() },
  ];
}

