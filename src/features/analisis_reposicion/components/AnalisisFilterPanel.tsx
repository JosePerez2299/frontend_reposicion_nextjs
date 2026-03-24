"use client";

import { Controller } from "react-hook-form";
import { Combobox } from "@/components/ui/combobox";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DatePickerWithRange } from "@/components/ui/date-rangepicker";
import { ComboboxAsync } from "@/components/ui/combobox-async";
import { useAnalisisFilterForm } from "../hooks/useAnalisisFilterForm";

function FiltersSkeleton() {
  return (
    <div className="flex gap-3 p-3 border-b border-border">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-1.5">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-8 w-[160px]" />
        </div>
      ))}
    </div>
  );
}

export function AnalisisFilterPanel() {
  const {
    opciones,
    isLoading,
    isError,
    maxDate,
    minDate,
    groups,
    subgroups,
    productos,
    isFetchingProductos,
    control,
    categorySelected,
    groupsSelected,
    subgroupsSelected,
    isValidForm,
    submit,
    handleClear,
    handleCategoryChange,
    handleGroupsChange,
    handleSubgroupsChange,
    handleProductSearchChange,
  } = useAnalisisFilterForm();

  if (isError)
    return (
      <div className="p-3 text-sm text-destructive border-b border-border">
        Error al cargar los filtros
      </div>
    );

  if (isLoading) return <FiltersSkeleton />;

  return (
    <form
      onSubmit={submit}
      className="flex flex-wrap items-end gap-3 bg-secondary/50 border-b border-border p-3"
    >
      {/* Producto */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground">Producto</Label>
        <Controller
          control={control}
          name="productIds"
          render={({ field }) => (
            <ComboboxAsync
              multi
              value={field.value}
              onChange={field.onChange}
              onSearchChange={handleProductSearchChange}
              options={productos}
              loading={isFetchingProductos}
              placeholder="Todas"
              searchPlaceholder="Buscar producto..."
              className="w-[200px]"
            />
          )}
        />
      </div>

      {/* Rango de fechas */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground">Rango de fechas</Label>
        <Controller
          control={control}
          name="dates"
          render={({ field }) => (
            <DatePickerWithRange
              value={field.value}
              minDate={minDate}
              maxDate={maxDate}
              onChange={field.onChange}
              placeholder="Todas"
              className="w-[200px]"
            />
          )}
        />
      </div>

      {/* Categoría */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground">Categoría</Label>
        <Combobox
          options={opciones ?? []}
          value={categorySelected}
          onChange={handleCategoryChange}
          placeholder="Todas"
          searchPlaceholder="Buscar categoría..."
          className="w-[160px]"
        />
      </div>

      {/* Colección */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground">Colección</Label>
        <Combobox
          multi
          options={groups}
          value={groupsSelected}
          onChange={handleGroupsChange}
          placeholder={!categorySelected ? "Selecciona cat." : "Todas"}
          searchPlaceholder="Buscar colección..."
          disabled={!categorySelected}
          className="w-[200px]"
        />
      </div>

      {/* Subcolección */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground">Subcolección</Label>
        <Combobox
          multi
          options={subgroups}
          value={subgroupsSelected}
          onChange={handleSubgroupsChange}
          placeholder={!groupsSelected.length ? "Selecciona col." : "Todas"}
          searchPlaceholder="Buscar subcolección..."
          disabled={!groupsSelected.length}
          className="w-[200px]"
        />
      </div>

      {/* Acciones */}
      <div className="flex items-end gap-2 ml-auto">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 text-xs"
          onClick={handleClear}
        >
          Limpiar
        </Button>
        <Button
          type="submit"
          size="sm"
          className="h-8 text-xs"
          disabled={!isValidForm}
        >
          Aplicar
        </Button>
      </div>
    </form>
  );
}
