"use client";

import { Controller } from "react-hook-form";
import { Combobox } from "@/components/ui/combobox";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DatePickerWithRange } from "@/components/ui/date-rangepicker";
import { ComboboxAsync } from "@/components/ui/combobox-async";
import { Toggle } from "@/components/ui/toggle";
import { PackageCheck } from "lucide-react";
import { useAnalisisFilterForm } from "../hooks/useAnalisisFilterForm";

function FiltersSkeleton() {
  return (
    <div className="flex gap-3 p-3 border-b border-border">
      {Array.from({ length: 6 }).map((_, i) => (
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
    stores,
    isFetchingProductos,
    control,
    categorySelected,
    groupsSelected,
    subgroupsSelected,
    isValidForm,
    storeSelected,
    submit,
    handleClear,
    handleCategoryChange,
    handleGroupsChange,
    handleSubgroupsChange,
    handleProductSearchChange,
    handleStoreChange,
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
          name="product_codes"
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

      {/* Tiendas */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground">Tiendas</Label>
        <Combobox
          multi
          options={opciones?.stores ?? []}
          value={storeSelected}
          onChange={handleStoreChange}
          placeholder="Todas"
          searchPlaceholder="Buscar tienda..."
          className="w-[160px]"
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
              onChange={(val) => {
                handleClear();
                field.onChange(val);
              }}
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
          options={opciones?.categories ?? []}
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

      {/* Stock en el mayorista */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground">Mayorista</Label>
        <Controller
          control={control}
          name="only_supplier_stock"
          render={({ field }) => (
            <Toggle
              variant="outline"
              className="h-8 text-xs data-[state=on]:border-emerald-600/40 data-[state=on]:bg-emerald-500/10 data-[state=on]:text-emerald-700 dark:data-[state=on]:text-emerald-400"
              pressed={!!field.value}
              onPressedChange={field.onChange}
            >
              <PackageCheck className="h-3.5 w-3.5" />
              Solo con stock
            </Toggle>
          )}
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
