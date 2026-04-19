"use client";

import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useAnalisisStore } from "@/stores/resposicion-analisis.store";
import { LayoutGrid, ListFilter, Table, Eye } from "lucide-react";
import { useState } from "react";
import OrderDetailModal from "@/features/pedidos/components/OrderDetailModal";

interface AnalisisTopBarProps {
  title: string;
  subtitle: string;
}

const TOGGLE_ITEM_CLASS = cn(
  "gap-1.5 h-7 px-3 text-xs rounded-sm text-muted-foreground",
  "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground",
);

export function AnalisisTopBar({ title, subtitle }: AnalisisTopBarProps) {
  const {
    viewMode,
    filterPanelOpen,
    hasActiveFilters,
    setViewMode,
    toggleFilterPanel,
  } = useAnalisisStore();

  const { selectedOrder } = useAnalisisStore();
  const [openOrderModal, setOpenOrderModal] = useState(false);

  const hasApplied = hasActiveFilters();
  const handleClickFilter = () => {
    if (hasApplied) {
      toggleFilterPanel();
    }
  };

  return (
    <Topbar title={title} subtitle={subtitle}>
      <div className="flex items-center">
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-muted rounded-md border border-border">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClickFilter}
                  className={cn(
                    TOGGLE_ITEM_CLASS,
                    filterPanelOpen &&
                      "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
                  )}
                >
                  <ListFilter size={13} />
                  Filtrar
                </Button>
              </TooltipTrigger>
              {!hasApplied && (
                <TooltipContent>
                  <p>No hay filtros aplicados</p>
                </TooltipContent>
              )}
            </Tooltip>
          </div>

          <div className="flex items-center bg-muted rounded-md border border-border">
            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={(val) => val && setViewMode(val as "compact" | "detailed")}
              className="gap-0"
            >
              <ToggleGroupItem
                value="compact"
                aria-label="Vista compacta"
                className={TOGGLE_ITEM_CLASS}
              >
                <LayoutGrid size={13} />
                Compacto
              </ToggleGroupItem>
              <ToggleGroupItem
                value="detailed"
                aria-label="Vista detallada"
                className={TOGGLE_ITEM_CLASS}
              >
                <Table size={13} />
                Detallado
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {selectedOrder && (
            <div className="flex items-center bg-muted rounded-md border border-border">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpenOrderModal(true)}
                className={cn(TOGGLE_ITEM_CLASS)}
              >
                <Eye size={13} />
                Ver pedido
              </Button>
              <OrderDetailModal
                open={openOrderModal}
                onOpenChange={setOpenOrderModal}
                order={selectedOrder}
              />
            </div>
          )}
        </div>
      </div>
    </Topbar>
  );
}
