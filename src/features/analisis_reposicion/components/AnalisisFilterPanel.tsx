"use client";

import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useAnalisisStore } from "@/stores/resposicion-analisis.store";
import { useOpcionesFiltros } from "../queries/filtros.queries";
import { Combobox } from "@/components/ui/combobox";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { Category, Group } from "@/schemas/entities/product.schema";
import type { AnalisisFilters } from "@/stores/resposicion-analisis.store";
import { normalizeAllToEmpty } from "@/lib/utils";

import { DatePickerWithRange } from "@/components/ui/date-rangepicker";
import type { DateRange } from "react-day-picker";
import { format, parseISO } from "date-fns";
type FilterForm = AnalisisFilters;

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
  const { filters, setFilters, clearFilters, toggleFilterPanel } =
    useAnalisisStore();
  const { data: opciones, isLoading, isError } = useOpcionesFiltros();

  const maxDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const minDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);

  const { control, setValue, handleSubmit, reset } = useForm<FilterForm>({
    defaultValues: filters,
  });

  useEffect(() => {
    reset(filters);
  }, [filters, reset]);

  const categorySelected = useWatch({ control, name: "category" });
  const groupsSelected = useWatch({ control, name: "groups" });
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
      })),
    );

  const isValidForm = () => {
    return filters.dates.start && filters.dates.end;
  };
  const onSubmit = (values: FilterForm) => {
    if (!isValidForm()) return;

    const normalizedValues: FilterForm = {
      ...values,
      groups: normalizeAllToEmpty(values.groups, groups.length),
      subgroups: normalizeAllToEmpty(values.subgroups, subgroups.length),
    };

    toggleFilterPanel();
    setFilters(normalizedValues);
  };

  const onClear = () => {
    clearFilters(); // limpia el store → el useEffect resetea el form
  };

  if (isError)
    return (
      <div className="p-3 text-sm text-destructive border-b border-border">
        Error al cargar los filtros
      </div>
    );

  if (isLoading) return <FiltersSkeleton />;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-wrap items-end gap-3 bg-secondary/50 border-b border-border p-3"
    >
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground">Rango de fechas</Label>
        <Controller
          control={control}
          name="dates"
          render={({ field }) => {
            const currentRange: DateRange | undefined = field.value?.start
              ? {
                  from: parseISO(field.value.start),
                  to: field.value?.end ? parseISO(field.value.end) : undefined,
                }
              : undefined;

            return (
              <DatePickerWithRange
                value={currentRange}
                minDate={minDate}
                maxDate={maxDate}
                onChange={(range) => {
                  const start = range?.from
                    ? format(range.from, "yyyy-MM-dd")
                    : "";
                  const end = range?.to
                    ? format(range.to, "yyyy-MM-dd")
                    : start;

                  field.onChange({ start, end });
                }}
                placeholder="Todas"
                className="w-[200px]"
              />
            );
          }}
        />
      </div>
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
              subgroupsSelected.filter((id) => validSubIds.includes(id)),
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

      <div className="flex items-end gap-2 ml-auto">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 text-xs"
          onClick={onClear}
        >
          Limpiar
        </Button>
        <Button
          type="submit"
          size="sm"
          className="h-8 text-xs"
          disabled={!isValidForm()}
        >
          Aplicar
        </Button>
      </div>
    </form>
  );
}
