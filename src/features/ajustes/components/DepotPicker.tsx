"use client";

import { useState } from "react";
import { Keyboard } from "lucide-react";
import { Combobox } from "@/components/ui/combobox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Depot } from "@/schemas/api/store.schemas";

interface BaseProps {
  availableDepots: Depot[];
  /** Códigos a no ofrecer como opción (p. ej. el principal en el selector de extra). */
  excludeIds?: string[];
  disabled?: boolean;
}

interface SingleProps extends BaseProps {
  mode: "single";
  value: string | null;
  onChange: (value: string | null) => void;
}

interface MultiProps extends BaseProps {
  mode: "multi";
  value: string[];
  onChange: (value: string[]) => void;
}

type Props = SingleProps | MultiProps;

/**
 * Selector de almacenes: opciones de `available_depots` (misma localidad) más
 * entrada manual de código para almacenes de otra localidad. El backend valida el código.
 */
export function DepotPicker(props: Props) {
  const { availableDepots, excludeIds = [], disabled } = props;
  const selected = props.mode === "single" ? (props.value ? [props.value] : []) : props.value;

  const labels = new Map(availableDepots.map((d) => [d.id, `${d.id} — ${d.name}`]));
  // Códigos elegidos fuera de la localidad (manuales o ya guardados) también se muestran
  for (const id of selected) {
    if (!labels.has(id)) labels.set(id, `${id} — (otra localidad)`);
  }
  const options = [...labels.entries()]
    .filter(([id]) => !excludeIds.includes(id))
    .map(([id, name]) => ({ id, name }));

  const hasOptions = options.length > 0;

  const addManual = (code: string) => {
    if (props.mode === "single") props.onChange(code);
    else if (!props.value.includes(code)) props.onChange([...props.value, code]);
  };

  return (
    <div className="flex items-center gap-1">
      {props.mode === "single" ? (
        <Combobox
          options={options}
          value={props.value ?? ""}
          onChange={(v) => props.onChange(v || null)}
          placeholder={hasOptions ? "Sin principal" : "Sin almacenes en la localidad"}
          searchPlaceholder="Buscar almacén..."
          clearLabel="Sin principal"
          disabled={disabled}
          className="w-[220px]"
        />
      ) : (
        <Combobox
          multi
          options={options}
          value={props.value}
          onChange={props.onChange}
          placeholder={hasOptions ? "Ninguno" : "Sin almacenes en la localidad"}
          searchPlaceholder="Buscar almacén..."
          disabled={disabled || !hasOptions}
          className="w-[220px]"
        />
      )}
      <ManualDepotInput
        onSubmit={addManual}
        disabled={disabled}
        label={props.mode === "single" ? "Usar como principal" : "Agregar como extra"}
      />
    </div>
  );
}

function ManualDepotInput({
  onSubmit,
  disabled,
  label,
}: {
  onSubmit: (code: string) => void;
  disabled?: boolean;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");

  const submit = () => {
    const trimmed = code.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setCode("");
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground"
          disabled={disabled}
          title="Escribir código de almacén"
          aria-label="Escribir código de almacén"
        >
          <Keyboard className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] space-y-2" align="start">
        <p className="text-xs text-muted-foreground">
          Código de almacén del ERP. Se valida al guardar.
        </p>
        <form
          className="flex items-center gap-1.5"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Ej. 0102"
            className="h-8 font-mono text-xs"
            autoFocus
          />
          <Button type="submit" size="sm" className="h-8" disabled={!code.trim()} title={label}>
            Usar
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  );
}
