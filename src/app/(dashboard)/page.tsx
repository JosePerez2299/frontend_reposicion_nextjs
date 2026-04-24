"use client";

import Link from "next/link";
import { useAuthStore } from "@/stores/auth.store";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ClipboardList,
  RefreshCw,
  TrendingUp,
  BarChart2,
  History,
  ArrowRight,
  Clock,
  AlertCircle,
  Package,
  Warehouse,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

const kpis = [
  {
    label: "Modelos Críticos",
    value: "128",
    icon: AlertTriangle,
    badge: { text: "Urgente", variant: "destructive" as const },
    color: "text-rotation-critical-text",
    bg: "bg-stock-none-bg",
  },
  {
    label: "Pedidos Activos",
    value: "3",
    icon: ClipboardList,
    badge: { text: "En proceso", variant: "default" as const },
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    label: "Tallas Buenas",
    value: "842",
    icon: RefreshCw,
    badge: { text: "+12%", variant: "secondary" as const },
    color: "text-rotation-good-text",
    bg: "bg-stock-high-bg",
  },
  {
    label: "Ventas Semana",
    value: "$12.4M",
    icon: TrendingUp,
    badge: { text: "+8.2%", variant: "secondary" as const },
    color: "text-primary",
    bg: "bg-primary/10",
  },
];

const quickActions = [
  {
    label: "Análisis de Ventas",
    description: "Explora métricas y tendencias de venta por modelo y talla",
    href: "/reposicion",
    icon: BarChart2,
  },
  {
    label: "Modelos Críticos",
    description: "Calzado con stock bajo que requiere reposición urgente",
    href: "/reposicion/criticos",
    icon: AlertTriangle,
  },
  {
    label: "Mis Pedidos",
    description: "Gestiona y haz seguimiento de tus pedidos de calzado",
    href: "/pedidos",
    icon: ClipboardList,
  },
  {
    label: "Historial",
    description: "Revisa el historial completo de pedidos anteriores",
    href: "/pedidos/historial",
    icon: History,
  },
];

const branches = [
  { name: "Sucursal Central", value: 4200000, pct: 100 },
  { name: "Sucursal Norte", value: 3100000, pct: 74 },
  { name: "Sucursal Sur", value: 2400000, pct: 57 },
  { name: "Sucursal Este", value: 1800000, pct: 43 },
  { name: "Sucursal Oeste", value: 1200000, pct: 29 },
  { name: "Sucursal Centro", value: 900000, pct: 21 },
];

const recentActivity = [
  {
    product: "Zapatilla Running Air Max",
    sku: "ZAP-RUN-AM42",
    stock: 12,
    rotation: "Alta",
    status: "Crítico",
  },
  {
    product: "Botín Cuero Clásico Negro",
    sku: "BOT-CUE-CLN",
    stock: 45,
    rotation: "Media",
    status: "Normal",
  },
  {
    product: "Sandalia Verano Beige",
    sku: "SAN-VER-BG38",
    stock: 3,
    rotation: "Alta",
    status: "Crítico",
  },
  {
    product: "Tennis Casual Blanco",
    sku: "TEN-CAS-BLC",
    stock: 120,
    rotation: "Baja",
    status: "Sobrestock",
  },
  {
    product: "Zapato Formal Oxford",
    sku: "ZAP-FOR-OX41",
    stock: 28,
    rotation: "Media",
    status: "Normal",
  },
];

const alerts = [
  {
    title: "3 modelos sin stock en Sucursal Norte",
    severity: "critical",
    time: "Hace 15 min",
  },
  {
    title: "Pedido #1247 requiere aprobación",
    severity: "warning",
    time: "Hace 1 hora",
  },
  {
    title: "Rotación baja detectada en 18 tallas",
    severity: "info",
    time: "Hace 3 horas",
  },
  {
    title: "Recepción de nueva colección programada mañana 08:00",
    severity: "info",
    time: "Hace 5 horas",
  },
];

const statusStyles: Record<string, string> = {
  Crítico: "bg-stock-none-bg text-stock-none-text border border-stock-none-border",
  Normal: "bg-stock-high-bg text-stock-high-text border border-stock-high-border",
  Sobrestock: "bg-stock-medium-bg text-stock-medium-text border border-stock-medium-border",
};

const severityStyles: Record<string, string> = {
  critical: "bg-stock-none-bg text-stock-none-text border border-stock-none-border",
  warning: "bg-stock-low-bg text-stock-low-text border border-stock-low-border",
  info: "bg-primary/10 text-primary border border-primary/20",
};

const severityIcons: Record<string, typeof AlertCircle> = {
  critical: AlertTriangle,
  warning: AlertCircle,
  info: Clock,
};

function formatCurrency(n: number) {
  return `$${(n / 1000000).toFixed(1)}M`;
}

export default function Home() {
  const user = useAuthStore((state) => state.user);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex flex-col gap-6 p-4 md:p-6 overflow-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-48 mb-2"></div>
          <div className="h-4 bg-muted rounded w-32"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 overflow-auto">
      {/* ── Header ── */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Bienvenido, {user?.nombre || "Usuario"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Resumen del sistema — 22 de abril, 2026
          </p>
        </div>
        <Badge variant="outline" className="w-fit mt-1 sm:mt-0">
          <Warehouse size={12} />
          Rol: {user?.role === "reposicion" ? "Reposición" : user?.role || "Desconocido"}
        </Badge>
      </div>

      <Separator />

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label}>
              <CardHeader>
                <CardDescription className="flex items-center gap-1.5">
                  <Icon size={14} strokeWidth={1.5} className={kpi.color} />
                  {kpi.label}
                </CardDescription>
                <CardTitle className="text-2xl tabular-nums">
                  {kpi.value}
                </CardTitle>
                <CardAction>
                  <Badge variant={kpi.badge.variant}>{kpi.badge.text}</Badge>
                </CardAction>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {/* ── Bar Chart + Quick Actions ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Bar Chart */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 size={16} strokeWidth={1.5} className="text-primary" />
              Ventas por Sucursal
            </CardTitle>
            <CardDescription>Última semana — comparativa</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {branches.map((b) => (
              <div key={b.name} className="flex items-center gap-3">
                <span className="w-32 text-xs text-muted-foreground truncate shrink-0">
                  {b.name}
                </span>
                <div className="flex-1 h-6 rounded-md bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-md bg-primary/80 transition-all"
                    style={{ width: `${b.pct}%` }}
                  />
                </div>
                <span className="text-xs font-mono tabular-nums text-foreground w-16 text-right shrink-0">
                  {formatCurrency(b.value)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="lg:col-span-2 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Card key={action.label} className="group hover:ring-primary/30 transition-all">
                <Link href={action.href} className="flex flex-col gap-2 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10">
                        <Icon size={16} strokeWidth={1.5} className="text-primary" />
                      </div>
                      <span className="text-sm font-medium">{action.label}</span>
                    </div>
                    <ArrowRight
                      size={14}
                      className="text-muted-foreground group-hover:translate-x-0.5 transition-transform"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {action.description}
                  </p>
                </Link>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ── Tabs: Actividad + Alertas ── */}
      <Tabs defaultValue="activity">
        <TabsList>
          <TabsTrigger value="activity">
            <Clock size={14} />
            Actividad Reciente
          </TabsTrigger>
          <TabsTrigger value="alerts">
            <AlertCircle size={14} />
            Alertas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package size={16} strokeWidth={1.5} className="text-primary" />
                Últimos modelos analizados
              </CardTitle>
              <CardDescription>Calzado con actividad reciente en el sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Modelo</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead>Rotación</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentActivity.map((row) => (
                    <TableRow key={row.sku}>
                      <TableCell className="font-medium">{row.product}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {row.sku}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{row.stock}</TableCell>
                      <TableCell>{row.rotation}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${statusStyles[row.status] ?? ""}`}
                        >
                          {row.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle size={16} strokeWidth={1.5} className="text-rotation-critical-text" />
                Alertas del sistema
              </CardTitle>
              <CardDescription>Notificaciones que requieren atención</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {alerts.map((alert, i) => {
                const Icon = severityIcons[alert.severity];
                return (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-lg border border-border p-3"
                  >
                    <div
                      className={`flex items-center justify-center size-7 rounded-md shrink-0 ${severityStyles[alert.severity]}`}
                    >
                      <Icon size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{alert.title}</p>
                      <p className="text-xs text-muted-foreground">{alert.time}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-[10px] capitalize ${severityStyles[alert.severity]}`}
                    >
                      {alert.severity === "critical"
                        ? "Crítica"
                        : alert.severity === "warning"
                          ? "Advertencia"
                          : "Info"}
                    </Badge>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Footer ── */}
      <div className="text-center text-xs text-muted-foreground pt-2 pb-4">
        RS Stellar v1.0 — Sistema de Reposición
      </div>
    </div>
  );
}
