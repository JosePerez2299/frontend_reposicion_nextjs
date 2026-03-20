import { LucideIcon } from "lucide-react";
import { RolesEnum } from "./auth.types";

interface NavBadge {
  value: number;
  variant: "red" | "amber" | "blue";
}

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  badge: NavBadge | null;
  roles: RolesEnum[];
}

export interface NavSection {
  section: string;
  items: NavItem[];
}