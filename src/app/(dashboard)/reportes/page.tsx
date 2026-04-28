"use client";

import { useEffect } from "react";
import { useAnalisisStore } from "@/stores/resposicion-analisis.store";
import { AnalisisFilterPanel } from "@/features/analisis_reposicion/components/AnalisisFilterPanel";
import { Topbar } from "@/components/layout/Topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent } from "@/components/ui/card";
import { ListFilter, FilterX, FileSpreadsheet, BarChart3, TrendingUp, TriangleAlert, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useExportAllProductsXmlMutation } from "@/features/reportes/queries/reportes.queries";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";

function AppliedFiltersSummary() {
  const { filters, clearFilters, toggleFilterPanel } = useAnalisisStore();

  const hasCategory = filters.category !== "";
  const hasGroups = filters.groups.length > 0;
  const hasSubgroups = filters.subgroups.length > 0;
  const hasProducts = filters.product_codes.length > 0;
  const hasStores = filters.store_ids.length > 0;
  const hasDates = !!filters.dates?.from && !!filters.dates?.to;

  const formatDate = (date: Date) =>
    format(date, "dd MMM yyyy", { locale: es });

  return (
    <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-border bg-secondary/30">
      <span className="text-xs text-muted-foreground font-medium">
        Filtros aplicados:
      </span>

      {hasDates && (
        <Badge variant="secondary">
          {formatDate(filters.dates.from)} — {formatDate(filters.dates.to)}
        </Badge>
      )}

      {hasCategory && (
        <Badge variant="secondary">Categoría: {filters.category}</Badge>
      )}

      {hasGroups && (
        <Badge variant="secondary">Colecciones: {filters.groups.length}</Badge>
      )}

      {hasSubgroups && (
        <Badge variant="secondary">
          Subcolecciones: {filters.subgroups.length}
        </Badge>
      )}

      {hasProducts && (
        <Badge variant="secondary">
          Productos: {filters.product_codes.length}
        </Badge>
      )}

      {hasStores && (
        <Badge variant="secondary">Tiendas: {filters.store_ids.length}</Badge>
      )}


    </div>
  );
}

export default function ReportesPage() {
  const { filters, filtersApplied, reset } = useAnalisisStore();
  const exportMutation = useExportAllProductsXmlMutation();

  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  return (
    <div className="hidden md:flex flex-col h-screen overflow-hidden">
      <div className="flex-none">
        <Topbar title="Reportes" subtitle="Generación de reportes" />
      </div>


        <div className="flex-none">
          <AnalisisFilterPanel />
        </div>
      

      {filtersApplied && <AppliedFiltersSummary />}

      {filtersApplied ? (
        <div className="flex-1 min-h-0 overflow-y-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card size="sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet size={16} className="text-primary" />
                  Ventas por producto
                </CardTitle>
                <CardDescription>
                  Detalle de ventas por producto en el rango seleccionado, compatible con Excel.
                </CardDescription>
              </CardHeader>
              <CardAction>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs mr-1"
                  disabled={exportMutation.isPending}
                  onClick={() => {
                    exportMutation.mutate(filters, {
                      onError: (error) => {
                        toast.error(getErrorMessage(error));
                      },
                    });
                  }}
                >
                  {exportMutation.isPending ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Descargando...
                    </>
                  ) : (
                    "Descargar"
                  )}
                </Button>
              </CardAction>
            </Card>

            <Card size="sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 size={16} className="text-primary" />
                  Rotación por tienda
                </CardTitle>
                <CardDescription>
                  Rotación de inventario por tienda con métricas de velocidad de venta.
                </CardDescription>
              </CardHeader>
              <CardAction>
                <Badge variant="outline" className="gap-1 text-[var(--warning)] border-[var(--warning)]/30 bg-[var(--warning)]/5 text-[10px] font-normal px-1.5 py-0 mr-1">
                  <TriangleAlert size={11} />
                  En desarrollo
                </Badge>
              </CardAction>
            </Card>

            <Card size="sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-primary" />
                  Resumen ejecutivo
                </CardTitle>
                <CardDescription>
                  Resumen consolidado de ventas y rotación con indicadores clave.
                </CardDescription>
              </CardHeader>
              <CardAction>
                <Badge variant="outline" className="gap-1 text-[var(--warning)] border-[var(--warning)]/30 bg-[var(--warning)]/5 text-[10px] font-normal px-1.5 py-0 mr-1">
                  <TriangleAlert size={11} />
                  En desarrollo
                </Badge>
              </CardAction>
            </Card>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center text-center gap-2">
            <div className="flex items-center justify-center size-10 rounded-full bg-secondary border border-border">
              <FilterX size={18} className="text-muted-foreground" />
            </div>
            <h3 className="text-sm font-semibold">No hay filtros aplicados</h3>
            <p className="text-xs text-muted-foreground max-w-[320px]">
              Selecciona un rango de fechas y aplica los filtros para generar el
              reporte.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
