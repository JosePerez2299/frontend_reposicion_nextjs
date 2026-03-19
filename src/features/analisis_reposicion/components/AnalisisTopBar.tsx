"use client";

import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { useAnalisisStore } from "@/stores/resposicion-analisis.store";
import { LayoutGrid, ListFilter, Table } from "lucide-react";

const TOGGLE_ITEM_CLASS = cn(
  "gap-1.5 h-7 px-3 text-xs rounded-sm text-muted-foreground",
  "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground",
);

export function AnalisisTopBar({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  const { viewMode, filterPanelOpen, setViewMode, toggleFilterPanel } =
    useAnalisisStore();

  return (
    <Topbar title={title} subtitle={subtitle}>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleFilterPanel}
          className={cn(
            "h-7 gap-1.5 text-xs",
            filterPanelOpen &&
              "bg-primary text-primary-foreground border-primary hover:bg-primary/90 hover:text-primary-foreground",
          )}
        >
          <ListFilter size={13} />
          Filtrar
        </Button>

        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={(val) => val && setViewMode(val as "compact" | "full")}
          className="bg-muted rounded-md p-0.5 gap-0"
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
            value="full"
            aria-label="Vista completa"
            className={TOGGLE_ITEM_CLASS}
          >
            <Table size={13} />
            Completo
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </Topbar>
  );
}
