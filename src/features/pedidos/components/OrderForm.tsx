"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2 } from "lucide-react";

const orderFormSchema = z.object({
  description: z.string().optional(),
  priority: z.number().min(0, "La prioridad debe ser un número positivo"),
});

type OrderFormData = z.infer<typeof orderFormSchema>;

type Props = {
  onSubmit: (data: OrderFormData) => Promise<void> | void;
  defaultValues?: Partial<OrderFormData>;
  isSubmitting?: boolean;
};

export function OrderForm({ onSubmit, defaultValues, isSubmitting }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      description: "",
      priority: 0,
      ...defaultValues,
    },
  });

  const handle = async (data: OrderFormData) => {
    await onSubmit(data);
    reset();
  };

  return (
    <div className="rounded-xl border bg-muted/50 p-5 shadow-sm  ">
      <h3 className="text-sm font-semibold mb-4">Nueva orden</h3>

      <form onSubmit={handleSubmit(handle)}>
        {/* Campos en fila en desktop, columna en mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px] gap-3">
          {/* Descripción */}
          <div className="space-y-1.5">
            <Label htmlFor="order-description" className="text-xs text-muted-foreground">
              Descripción <span className="text-muted-foreground/50">(opcional)</span>
            </Label>
            <Input
              id="order-description"
              {...register("description")}
              placeholder="Ej. Reposición sucursal norte"
              className="h-9 text-sm"
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description.message}</p>
            )}
          </div>

          {/* Prioridad */}
          <div className="space-y-1.5">
            <Label htmlFor="order-priority" className="text-xs text-muted-foreground">
              Prioridad
            </Label>
            <Input
              id="order-priority"
              type="number"
              min={0}
              {...register("priority", { valueAsNumber: true })}
              className="h-9 text-sm"
            />
            {errors.priority && (
              <p className="text-xs text-destructive">{errors.priority.message}</p>
            )}
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button type="submit" size="sm" disabled={isSubmitting} className="gap-1.5">
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Creando...
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                Crear orden
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default OrderForm;