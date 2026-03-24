import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useAnalisisStore } from "@/stores/resposicion-analisis.store";
import { cn } from "@/lib/utils";

function StatCard({
  title,
  value,
  footer,
  variant = "default",
}: {
  title: string;
  value?: string;
  footer?: string;
  variant?: "default" | "success" | "destructive" | "warning";
}) {
  return (
    <Card className="bg-primary/5 p-2" size="sm">
      <div className="space-y-1">
        <h3 className="text-primary font-bold font-mono text-xs">{title}</h3>
        <div>
          <p className={`font-bold text-${variant} text-base`}>{value}</p>
          <p className="text-xs text-muted-foreground">{footer}</p>
        </div>
      </div>
    </Card>
  );
}

export function AnalisisStatsCards() {
  const { filters } = useAnalisisStore();
  const [open, setOpen] = useState(true);

  const days_diff =
    filters.dates?.to && filters.dates?.from
      ? Math.ceil(
          (filters.dates.to.getTime() - filters.dates.from.getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : 0;

  const dummyStats = [
    {
      title: "STOCK",
      value: "1245",
      footer: "Unidades totales",
      variant: "success",
    },
    {
      title: "VENTAS",
      value: "487",
      footer: "Periodo de " + days_diff + " días",
      variant: "destructive",
    },
    {
      title: "PRODUCTOS",
      value: "89",
      footer: "Total de productos",
      variant: "default",
    },
    {
      title: "ROTACIÓN PROMEDIO",
      value: "2.8x",
      footer: "Veces al mes",
      variant: "warning",
    },
    {
      title: "PERIODO",
      value: days_diff + " días",
      footer: "Desde el " + (filters.dates?.from?.toLocaleDateString() || ""),
      variant: "default",
    },
  ];

  return (
    <>
      <div className="bg-secondary/50 border-b border-border">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1.5 w-full px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronDown
            size={13}
            className={cn(
              "transition-transform duration-200",
              !open && "-rotate-90",
            )}
          />
          {open ? "Ocultar resumen" : "Mostrar resumen"}
        </button>

        {open && (
          <div className="px-3 pb-3 grid grid-cols-5 gap-3">
            {dummyStats.map((stat, index) => (
              <StatCard
                key={index}
                title={stat.title}
                value={stat.value}
                footer={stat.footer}
                variant={
                  stat.variant as
                    | "default"
                    | "success"
                    | "destructive"
                    | "warning"
                }
              />
            ))}
          </div>
        )}
      </div>
      <hr />
    </>
  );
}