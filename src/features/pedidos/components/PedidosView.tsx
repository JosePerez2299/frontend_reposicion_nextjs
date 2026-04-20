"use client";

import { useState } from "react";
import OrderForm from "./OrderForm";
import OrdersList from "./OrdersList";
import { useOrdersQuery, useCreateOrderMutation } from "@/features/pedidos/queries/pedidos.queries";
import { OrderStatus } from "@/features/pedidos/types/pedido.types";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

type TabStatus = OrderStatus | "all";

const STATUS_TABS: { value: TabStatus; label: string }[] = [
  { value: "all",                    label: "Todas"       },
  { value: OrderStatus.PENDING,      label: "Pendientes"  },
  { value: OrderStatus.NOT_APPROVED, label: "Sin aprobar" },
  { value: OrderStatus.APPROVED,     label: "Aprobadas"   },
  { value: OrderStatus.REJECTED,     label: "Rechazadas"  },
  { value: OrderStatus.CANCELLED,    label: "Canceladas"  },
  { value: OrderStatus.COMPLETED,    label: "Completadas" },
];

const STATUS_STYLES: Record<TabStatus, { active: string; inactive: string }> = {
  all:                          { active: "bg-foreground text-background",          inactive: "bg-muted text-muted-foreground hover:bg-muted/80"           },
  [OrderStatus.PENDING]:        { active: "bg-yellow-100 text-yellow-800",          inactive: "bg-muted text-muted-foreground hover:bg-yellow-50"          },
  [OrderStatus.NOT_APPROVED]:   { active: "bg-gray-100 text-gray-800",             inactive: "bg-muted text-muted-foreground hover:bg-gray-50"            },
  [OrderStatus.APPROVED]:       { active: "bg-green-100 text-green-800",           inactive: "bg-muted text-muted-foreground hover:bg-green-50"           },
  [OrderStatus.REJECTED]:       { active: "bg-red-100 text-red-800",               inactive: "bg-muted text-muted-foreground hover:bg-red-50"             },
  [OrderStatus.CANCELLED]:      { active: "bg-gray-100 text-gray-800",             inactive: "bg-muted text-muted-foreground hover:bg-gray-50"            },
  [OrderStatus.COMPLETED]:      { active: "bg-blue-100 text-blue-800",             inactive: "bg-muted text-muted-foreground hover:bg-blue-50"            },
};

const OrdersTab = ({ status }: { status: TabStatus }) => {
  const { data, isLoading, error } = useOrdersQuery(
    100,
    status === "all" ? undefined : status
  );

  if (isLoading) return <p className="text-sm text-muted-foreground py-6">Cargando...</p>;
  if (error)     return <p className="text-sm text-destructive py-6">Error cargando órdenes</p>;
  if (!data?.length) return <p className="text-sm text-muted-foreground py-6">No hay órdenes.</p>;

  return <OrdersList orders={data} />;
};

export const PedidosView = () => {
  const [activeTab, setActiveTab] = useState<TabStatus>(OrderStatus.PENDING);
  const createOrderMutation = useCreateOrderMutation();

  const onSubmit = async (formData: any) => {
    await createOrderMutation.mutateAsync({
      description: formData.description,
      priority: formData.priority,
      status: OrderStatus.PENDING,
    });
  };

  return (
    <div className="space-y-6 p-4">
      <OrderForm onSubmit={onSubmit} isSubmitting={createOrderMutation.isPending} />

      <div className="space-y-4">
        <ScrollArea className="w-full">
          <div className="flex gap-2 pb-1">
            {STATUS_TABS.map(({ value, label }) => {
              const isActive = activeTab === value;
              const styles = STATUS_STYLES[value];
              return (
                <button
                  key={value}
                  onClick={() => setActiveTab(value)}
                  className={`
                    inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium
                    whitespace-nowrap transition-colors cursor-pointer
                    ${isActive ? styles.active : styles.inactive}
                  `}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" className="h-0" />
        </ScrollArea>

        <OrdersTab status={activeTab} />
      </div>
    </div>
  );
};

export default PedidosView;