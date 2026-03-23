import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const normalizeAllToEmpty = (selected: string[], allOptionsLength: number) => {
  return selected.length === allOptionsLength ? [] : selected;
};
