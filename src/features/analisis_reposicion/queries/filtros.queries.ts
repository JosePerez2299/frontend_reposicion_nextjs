import { useQuery } from "@tanstack/react-query"

// features/analisis/queries/filtros.queries.ts
async function fetchOpcionesFiltros() {
  const res = await fetch('http://localhost:8000/api/v1/products/filter-options')
  return res.json()
}

export function useOpcionesFiltros() {
  return useQuery({
    queryKey: ['filtros-opciones'],
    queryFn: fetchOpcionesFiltros,
    staleTime: 1000 * 60 * 30, // 30 min — estructura jerárquica no cambia seguido
  })
}