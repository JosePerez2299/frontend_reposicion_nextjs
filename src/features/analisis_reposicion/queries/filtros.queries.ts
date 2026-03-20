import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

// schemas
const SubgroupSchema = z.object({
  id: z.string(),
  name: z.string(),
});

const GroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  subgroups: z.array(SubgroupSchema),
});

const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  groups: z.array(GroupSchema),
});

const FilterOptionsSchema = z.array(CategorySchema);

// tipos inferidos desde los schemas — no necesitas las interfaces
export type Subgroup = z.infer<typeof SubgroupSchema>;
export type Group = z.infer<typeof GroupSchema>;
export type Category = z.infer<typeof CategorySchema>;
export type FilterOptions = z.infer<typeof FilterOptionsSchema>;

// fetch con validación
async function fetchOpcionesFiltros(): Promise<FilterOptions> {
  const res = await fetch(
    "http://localhost:8000/api/v1/products/filter-options",
  );

  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);

  const data = await res.json();

  // valida y parsea — lanza error si el backend devuelve algo inesperado
  return FilterOptionsSchema.parse(data);
}

export function useOpcionesFiltros() {
  return useQuery({
    queryKey: ["analisis-ventas", "filtros-opciones"],
    queryFn: fetchOpcionesFiltros,
    staleTime: 1000 * 60 * 30,
  });
}
