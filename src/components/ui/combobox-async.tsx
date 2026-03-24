"use client";

import { useState } from "react";
import { ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ComboboxVirtualList } from "./combobox-virtual-list";

export interface Option {
  id: string;
  name: string;
}

interface ComboboxAsyncBaseProps {
  onSearchChange: (search: string) => void;
  options: Option[];
  loading?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
}

interface ComboboxAsyncSingleProps extends ComboboxAsyncBaseProps {
  multi?: false;
  value: string;
  onChange: (value: string) => void;
}

interface ComboboxAsyncMultiProps extends ComboboxAsyncBaseProps {
  multi: true;
  value: string[];
  onChange: (value: string[]) => void;
}

type ComboboxAsyncProps = ComboboxAsyncSingleProps | ComboboxAsyncMultiProps;

function Checkbox({
  checked,
  indeterminate = false,
}: {
  checked: boolean;
  indeterminate?: boolean;
}) {
  return (
    <div
      className={cn(
        "w-4 h-4 rounded-[3px] border flex items-center justify-center flex-shrink-0 transition-colors",
        checked || indeterminate
          ? "bg-primary border-primary"
          : "border-border bg-background",
      )}
    >
      {indeterminate && !checked && (
        <div className="w-2 h-[1.5px] bg-primary-foreground rounded-full" />
      )}
      {checked && (
        <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
          <path
            d="M1 3.5L3.5 6L8 1"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );
}

export function ComboboxAsync(props: ComboboxAsyncProps) {
  const {
    onSearchChange,
    options,
    loading = false,
    placeholder = "Seleccionar...",
    searchPlaceholder = "Buscar...",
    emptyText = "Sin resultados",
    disabled = false,
    className,
  } = props;

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const isMulti = props.multi === true;
  const selectedIds = isMulti ? props.value : props.value ? [props.value] : [];
  const count = selectedIds.length;

  // Por estas
  const visibleIds = options.map((o) => o.id);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
  const someVisibleSelected =
    visibleIds.some((id) => selectedIds.includes(id)) && !allVisibleSelected;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    onSearchChange(val);
  };

  const handleSelect = (id: string) => {
    if (!isMulti) {
      props.onChange(props.value === id ? "" : id);
      setOpen(false);
      return;
    }
    props.onChange(
      props.value.includes(id)
        ? props.value.filter((v) => v !== id)
        : [...props.value, id],
    );
  };

  const handleSelectAll = () => {
    if (!isMulti) return;
    if (allVisibleSelected) {
      // deselecciona solo los visibles, mantiene el resto
      props.onChange(props.value.filter((id) => !visibleIds.includes(id)));
    } else {
      // acumula los visibles a los ya seleccionados
      props.onChange(Array.from(new Set([...props.value, ...visibleIds])));
    }
  };

  const handleClear = () => {
    if (isMulti) props.onChange([]);
    else {
      props.onChange("");
      setOpen(false);
    }
  };

  const handleOpenChange = (o: boolean) => {
    setOpen(o);
    if (!o) {
      setSearch("");
      onSearchChange("");
    }
  };

  const triggerContent = () => {
    if (!isMulti) {
      const selected = options.find((o) => o.id === props.value);
      return selected ? (
        <span className="truncate">{selected.name}</span>
      ) : (
        <span className="text-muted-foreground truncate">{placeholder}</span>
      );
    }
    if (count === 0) {
      return (
        <span className="text-muted-foreground truncate">{placeholder}</span>
      );
    }
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/15 text-primary">
          {count}
        </span>
        <span className="text-xs text-muted-foreground truncate">
          {count === 1
            ? options.find((o) => o.id === selectedIds[0])?.name
            : "seleccionados"}
        </span>
      </div>
    );
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "h-8 text-xs justify-between font-normal",
            count > 0 && "border-primary/40",
            className,
          )}
        >
          {triggerContent()}
          <ChevronsUpDown size={11} className="ml-2 flex-shrink-0 opacity-40" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[260px] p-0"
        align="start"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {/* search */}
        <div className="border-b border-border px-2 py-1.5">
          <input
            placeholder={searchPlaceholder}
            value={search}
            onChange={handleSearchChange}
            className={cn(
              "w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground",
              "h-7 px-2 rounded-md border border-border focus:border-primary transition-colors",
            )}
            autoFocus
          />
        </div>

        {/* seleccionar todos — solo multi */}
        {isMulti && options.length > 0 && (
          <div
            className="flex items-center gap-2 px-2 h-8 text-xs cursor-pointer border-b border-border text-muted-foreground hover:bg-secondary transition-colors font-medium select-none"
            onClick={handleSelectAll}
          >
            <Checkbox
              checked={allVisibleSelected}
              indeterminate={someVisibleSelected}
            />
            {`Seleccionar todos (${options.length})`}
          </div>
        )}

        {/* opción todas — solo single */}
        {!isMulti && (
          <div
            className="flex items-center gap-2 px-2 h-8 text-xs cursor-pointer border-b border-border text-muted-foreground hover:bg-secondary transition-colors select-none"
            onClick={handleClear}
          >
            <Checkbox checked={count === 0} />
            Todas
          </div>
        )}

        {/* lista */}
        <div className="max-h-[256px] overflow-auto scrollbar-thin">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground">
              <Loader2 size={12} className="animate-spin" />
              Buscando...
            </div>
          ) : (
            <ComboboxVirtualList
              options={options}
              selectedIds={selectedIds}
              onToggle={handleSelect}
              emptyText={emptyText}
              emptySearch="Escribe para buscar"
            />
          )}
        </div>

        {/* footer conteo — solo multi */}
        {isMulti && count > 0 && (
          <div className="flex items-center justify-between px-3 py-2 border-t border-border">
            <span className="text-xs text-muted-foreground">
              {count} seleccionado{count > 1 ? "s" : ""}
            </span>
            <button
              onClick={handleClear}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              Limpiar
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
