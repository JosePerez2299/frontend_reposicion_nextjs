import { useQuery } from "@tanstack/react-query";
import { fetchOpcionesFiltros } from "@/services/analisis.service";

export function useOpcionesFiltros() {
  return useQuery({
    queryKey: ["analisis", "reposicion", "filtros", "opciones"],
    queryFn: fetchOpcionesFiltros,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}
