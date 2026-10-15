import { LucideIcon } from "lucide-react";
import { RolesEnum } from "./auth.types";

interface NavBadge {
  value: number;
  variant: "red" | "amber" | "blue";
}

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  badge: NavBadge | null;
  /** Roles que ven el ítem. Sin definir: cualquier usuario autenticado. */
  roles?: RolesEnum[];
}

export interface NavSection {
  section: string;
  items: NavItem[];
}