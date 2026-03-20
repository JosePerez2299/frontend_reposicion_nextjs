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
  group: string;
  subgroup: string;
}
function FiltersSkeleton() {
  return (
    <div className="flex gap-3 p-3">
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
      category: appliedFilters?.category ?? "",
      group: appliedFilters?.group ?? "",
      subgroup: appliedFilters?.subgroup ?? "",
    },
  });

  const categorySelected = useWatch({ control, name: "category" });
  const groupSelected = useWatch({ control, name: "group" });

  const groups: Group[] =
    opciones?.find((c: Category) => c.id === categorySelected)?.groups ?? [];

  const subgroups = groups.find((g) => g.id === groupSelected)?.subgroups ?? [];

  if (isError)
    return (
      <div className="p-3 text-sm text-destructive">
        Error al cargar los filtros
      </div>
    );

  if (isLoading) return <FiltersSkeleton />;

  return (
    <div className="flex flex-wrap items-end gap-3 w-full bg-secondary/50 border-b border-border p-3">
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground">Categoría</Label>
        <Combobox
          options={opciones ?? []}
          value={categorySelected}
          onChange={(val) => {
            setValue("category", val);
            setValue("group", "");
            setValue("subgroup", "");
          }}
          placeholder="Todas"
          searchPlaceholder="Buscar categoría..."
          className="w-[160px]"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground">Colección</Label>
        <Combobox
          options={groups}
          value={groupSelected}
          onChange={(val) => {
            setValue("group", val);
            setValue("subgroup", "");
          }}
          placeholder={!categorySelected ? "Selecciona cat." : "Todas"}
          searchPlaceholder="Buscar colección..."
          disabled={!categorySelected}
          className="w-[160px]"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground">Subcolección</Label>
        <Combobox
          options={subgroups}
          value={useWatch({ control, name: "subgroup" })}
          onChange={(val) => setValue("subgroup", val)}
          placeholder={!groupSelected ? "Selecciona col." : "Todas"}
          searchPlaceholder="Buscar subcolección..."
          disabled={!groupSelected}
          className="w-[160px]"
        />
      </div>
    </div>
  );
}
