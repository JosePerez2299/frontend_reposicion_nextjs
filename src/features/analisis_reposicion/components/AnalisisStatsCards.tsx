import { Card } from "@/components/ui/card";
import { useAnalisisStore } from "@/stores/resposicion-analisis.store";

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

  const days_diff = filters.dates?.to && filters.dates?.from ? Math.ceil((filters.dates.to.getTime() - filters.dates.from.getTime()) / (1000 * 60 * 60 * 24)) : 0;

  // Dummy stats data for inventory analysis
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
      <div className="p-3 grid bg-secondary/50 grid-cols-5 gap-3">
        {dummyStats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            footer={stat.footer}
            variant={
              stat.variant as "default" | "success" | "destructive" | "warning"
            }
          />
        ))}
      </div>
      <hr />
    </>
  );
}
