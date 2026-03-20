"use client";

import { useForm, useWatch } from "react-hook-form";
import { useAnalisisStore } from "@/stores/resposicion-analisis.store";
import { useOpcionesFiltros } from "../queries/filtros.queries";
import { Combobox } from "@/components/ui/combobox";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import type { Category, Group } from "@/schemas/entities/product.schema";

interface FilterForm {
  category: string;
  groups: string[];
  subgroups: string[];
}

function FiltersSkeleton() {
  return (
    <div className="flex gap-3 p-3 border-b border-border">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-1.5">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-8 w-[160px]" />
        </div>
      ))}
    </div>
  );
}

export function AnalisisFilterPanel() {
  const { appliedFilters } = useAnalisisStore();
  const { data: opciones, isLoading, isError } = useOpcionesFiltros();

  const { control, setValue } = useForm<FilterForm>({
    defaultValues: {
      category:  appliedFilters?.category  ?? "",
      groups:    appliedFilters?.groups    ?? [],
      subgroups: appliedFilters?.subgroups ?? [],
    },
  });

  const categorySelected  = useWatch({ control, name: "category" });
  const groupsSelected    = useWatch({ control, name: "groups" });
  const subgroupsSelected = useWatch({ control, name: "subgroups" });

  const groups: Group[] =
    opciones?.find((c: Category) => c.id === categorySelected)?.groups ?? [];

  const subgroups = groups
    .filter((g) => groupsSelected.includes(g.id))
    .flatMap((g) =>
      g.subgroups.map((s: { id: string; name: string }) => ({
        id: s.id,
        name: `${g.id} · ${s.name}`,
        groupId: g.id,
      }))
    );

  if (isError) return (
    <div className="p-3 text-sm text-destructive border-b border-border">
      Error al cargar los filtros
    </div>
  );

  if (isLoading) return <FiltersSkeleton />;

  return (
    <div className="flex flex-wrap items-end gap-3 bg-secondary/50 border-b border-border p-3">

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground">Categoría</Label>
        <Combobox
          options={opciones ?? []}
          value={categorySelected}
          onChange={(val) => {
            setValue("category", val);
            setValue("groups", []);
            setValue("subgroups", []);
          }}
          placeholder="Todas"
          searchPlaceholder="Buscar categoría..."
          className="w-[160px]"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground">Colección</Label>
        <Combobox
          multi
          options={groups}
          value={groupsSelected}
          onChange={(val) => {
            setValue("groups", val);
            const validSubIds = groups
              .filter((g) => val.includes(g.id))
              .flatMap((g) => g.subgroups.map((s) => s.id));
            setValue(
              "subgroups",
              subgroupsSelected.filter((id) => validSubIds.includes(id))
            );
          }}
          placeholder={!categorySelected ? "Selecciona cat." : "Todas"}
          searchPlaceholder="Buscar colección..."
          disabled={!categorySelected}
          className="w-[200px]"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground">Subcolección</Label>
        <Combobox
          multi
          options={subgroups}
          value={subgroupsSelected}
          onChange={(val) => setValue("subgroups", val)}
          placeholder={!groupsSelected.length ? "Selecciona col." : "Todas"}
          searchPlaceholder="Buscar subcolección..."
          disabled={!groupsSelected.length}
          className="w-[200px]"
        />
      </div>

    </div>
  );
}