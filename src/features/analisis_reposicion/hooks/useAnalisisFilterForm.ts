// useAnalisisFilters.ts
"use client";

import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useAnalisisStore } from "@/stores/resposicion-analisis.store";
import { useOpcionesFiltros } from "../queries/filtros.queries";
import { normalizeAllToEmpty } from "@/lib/utils";
import { useBuscarProductos } from "@/queries/productos.queries";
import { useDebounce } from "@/hooks/use-debounce";
import type { Category, Group } from "@/schemas/entities/product.schema";
import type { AnalisisFilters } from "@/stores/resposicion-analisis.store";

type FilterForm = AnalisisFilters;

const ONE_DAY = 24 * 60 * 60 * 1000;

export function useAnalisisFilterForm() {
  const { filters, setFilters, clearFilters, toggleFilterPanel } =
    useAnalisisStore();

  const { data: opciones, isLoading, isError } = useOpcionesFiltros();

  const maxDate = new Date(Date.now() - ONE_DAY);
  const minDate = new Date(Date.now() - 365 * ONE_DAY);

  const { control, setValue, handleSubmit, reset } = useForm<FilterForm>({
    defaultValues: filters,
  });

  useEffect(() => {
    reset(filters);
  }, [filters, reset]);

  const categorySelected = useWatch({ control, name: "category" });
  const groupsSelected = useWatch({ control, name: "groups" });
  const subgroupsSelected = useWatch({ control, name: "subgroups" });
  const datesSelected = useWatch({ control, name: "dates" });

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

  const [productSearch, setProductSearch] = useState("");
  const debouncedSearch = useDebounce(productSearch, 300);

  const {
    data: productos = [],
    isFetching: isFetchingProductos,
  } = useBuscarProductos(
    debouncedSearch,
    categorySelected,
    groupsSelected,
    subgroupsSelected,
  );

  const isValidForm = !!datesSelected?.from && !!datesSelected?.to;

  const submit = handleSubmit((values) => {
    if (!isValidForm) {
      alert("Debes seleccionar una fecha de inicio y fin");
      return;
    }

    const normalizedValues: FilterForm = {
      ...values,
      groups: normalizeAllToEmpty(values.groups, groups.length),
      subgroups: normalizeAllToEmpty(values.subgroups, subgroups.length),
    };

    toggleFilterPanel();
    setFilters(normalizedValues);
  });

  const handleClear = () => {
    clearFilters();
  };

  const handleCategoryChange = (val: string) => {
 
    setValue("category", val);
    setValue("groups", []);
    setValue("subgroups", []);
  };

  const handleGroupsChange = (val: string[]) => {
    setValue("groups", val);
    const validSubIds = groups
      .filter((g) => val.includes(g.id))
      .flatMap((g) => g.subgroups.map((s) => s.id));

    setValue(
      "subgroups",
      subgroupsSelected.filter((id) => validSubIds.includes(id)),
    );
  };

  const handleSubgroupsChange = (val: string[]) => {
    setValue("subgroups", val);
  };

  const handleProductSearchChange = (term: string) => {
    setProductSearch(term);
  };

  return {
    // estado y helpers de datos
    opciones,
    isLoading,
    isError,
    maxDate,
    minDate,
    groups,
    subgroups,
    productos,
    isFetchingProductos,
    // react-hook-form
    control,
    setValue,
    datesSelected,
    categorySelected,
    groupsSelected,
    subgroupsSelected,
    isValidForm,
    // handlers
    submit,
    handleClear,
    handleCategoryChange,
    handleGroupsChange,
    handleSubgroupsChange,
    handleProductSearchChange,
  };
}
