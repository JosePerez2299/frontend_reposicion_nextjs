import { Card } from "@/components/ui/card";
import { useAnalisisStore } from "@/stores/resposicion-analisis.store";

function StatCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="bg-primary/5 p-2" size="sm">
      <div className="space-y-1">
        <h3 className="text-primary font-bold font-mono text-xs">{title}</h3>
        <div>{children}</div>
      </div>
    </Card>
  );
}

export function AnalisisStatsCards() {
  const { filters } = useAnalisisStore();

  // Dummy stats data for inventory analysis
  const dummyStats = {
    stock: 1245,
    ventas: 487,
    total_productos: 89,
    rotacion: 2.8,
  };

  return (
    <>
      <div className="p-3 grid bg-secondary/50 grid-cols-4 gap-3">
        <StatCard title="STOCK">
          <p className="font-bold text-success text-base">
            {dummyStats.stock.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">Unidades totales</p>
        </StatCard>
        <StatCard title="VENTAS">
          <p className="font-bold text-destructive text-base">
            {dummyStats.ventas.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">Últimos 30 días</p>
        </StatCard>
        <StatCard title="PRODUCTOS">
          <p className="font-bold text-blue-600 text-base">
            {dummyStats.total_productos.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">Total de productos</p>
        </StatCard>
        <StatCard title="ROTACIÓN PROMEDIO">
          <p className="font-bold text-amber-600 text-base">
            {dummyStats.rotacion}x
          </p>
          <p className="text-xs text-muted-foreground">Veces al mes</p>
        </StatCard>
      </div>
      <hr />
    </>
  );
}
