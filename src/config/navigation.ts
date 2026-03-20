import { RolesEnum } from "@/types/auth.types";
import {
  BarChart2,
  AlertTriangle,
  RefreshCw,
  ClipboardList,
  History,
  Download,
  TrendingUp,
  Home,
} from "lucide-react";
import { NavSection } from "@/types/navigation.types";

export const navigation: NavSection[] = [
  {
    section: "Inicio",
    items: [
      {
        id: "home",
        label: "Inicio",
        href: "/",
        icon: Home,
        badge: null,
        roles: [RolesEnum.Reposicion, RolesEnum.Admin],
      },
    ],
  },
  {
    section: "Reposición",
    items: [
      {
        id: "analisis",
        label: "Análisis ventas",
        href: "/reposicion",
        icon: BarChart2,
        badge: null,
        roles: [RolesEnum.Reposicion, RolesEnum.Admin],
      },
      {
        id: "criticos",
        label: "Críticos",
        href: "/reposicion/criticos",
        icon: AlertTriangle,
        badge: { value: 128, variant: "red" },
        roles: [RolesEnum.Reposicion, RolesEnum.Admin],
      },
      {
        id: "rotacion",
        label: "Rotación",
        href: "/reposicion/rotacion",
        icon: RefreshCw,
        badge: null,
        roles: [RolesEnum.Reposicion, RolesEnum.Admin],
      },
    ],
  },
  {
    section: "Pedidos",
    items: [
      {
        id: "pedidos",
        label: "Mis pedidos",
        href: "/pedidos",
        icon: ClipboardList,
        badge: { value: 3, variant: "blue" },
        roles: [RolesEnum.Pedidos, RolesEnum.Admin],
      },
      {
        id: "historial",
        label: "Historial",
        href: "/pedidos/historial",
        icon: History,
        badge: null,
        roles: [RolesEnum.Pedidos, RolesEnum.Admin],
      },
    ],
  },
  {
    section: "Reportes",
    items: [
      {
        id: "exportaciones",
        label: "Exportaciones",
        href: "/desarrollo",
        icon: Download,
        badge: null,
        roles: [RolesEnum.Reposicion, RolesEnum.Admin],
      },
      {
        id: "tendencias",
        label: "Tendencias",
        href: "/desarrollo",
        icon: TrendingUp,
        badge: null,
        roles: [RolesEnum.Reposicion, RolesEnum.Admin],
      },
    ],
  },
];
