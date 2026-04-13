import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonTable() {
  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      {/* Skeleton de la tabla — ocupa todo el espacio, scrolleable */}
      <div className="flex-1 min-h-0 overflow-auto rounded-md border border-border bg-background">
        <div className="w-auto min-w-full">
          {/* Header skeleton */}
          <div className="sticky top-0 z-20 bg-muted/80 border-b border-border">
            <div className="flex">
              {/* Columna Producto */}
              <div className="w-[200px] min-w-[200px] max-w-[200px] py-2 px-4 border-r border-border">
                <Skeleton className="h-3 w-16" />
              </div>
              {/* Columna Precio */}
              <div className="w-[80px] min-w-[80px] max-w-[80px] py-2 px-3 border-r border-border">
                <Skeleton className="h-3 w-12 ml-auto" />
              </div>
              {/* Columnas de tiendas (simulando 4 tiendas) */}
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-[170px] min-w-[170px] max-w-[170px] py-2 px-1 border-r border-border">
                  <div className="text-center space-y-1">
                    <Skeleton className="h-3 w-20 mx-auto" />
                    <div className="grid grid-cols-3 gap-1">
                      <Skeleton className="h-2 w-4 mx-auto" />
                      <Skeleton className="h-2 w-4 mx-auto" />
                      <Skeleton className="h-2 w-4 mx-auto" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Body skeleton - filas simuladas */}
          <div className="divide-y divide-border">
            {[...Array(12)].map((_, rowIndex) => (
              <div key={rowIndex} className="flex" style={{ height: '52px' }}>
                {/* Columna Producto */}
                <div className="w-[200px] min-w-[200px] max-w-[200px] py-0 px-4 border-r border-border flex flex-col justify-center">
                  <Skeleton className="h-4 w-[140px]" />
                  <Skeleton className="h-3 w-12 mt-1" />
                </div>
                {/* Columna Precio */}
                <div className="w-[80px] min-w-[80px] max-w-[80px] py-0 px-3 border-r border-border flex items-center justify-end">
                  <Skeleton className="h-4 w-10" />
                </div>
                {/* Columnas de tiendas */}
                {[...Array(4)].map((_, colIndex) => (
                  <div key={colIndex} className="w-[170px] min-w-[170px] max-w-[170px] py-0 border-r border-border flex items-center justify-center">
                    <div className="text-center space-y-1">
                      <Skeleton className="h-4 w-8 mx-auto" />
                      <Skeleton className="h-3 w-6 mx-auto" />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Skeleton de la leyenda — fijo abajo */}
      <div className="flex-none px-1 pt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="h-3 w-16 shrink-0" />
              <div className="flex items-center gap-3 flex-wrap">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="flex items-center gap-1.5">
                    <Skeleton className="w-2.5 h-2.5 rounded-[2px]" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skeleton de la paginación — fijo abajo */}
      <div className="flex-none flex items-center justify-between px-1 py-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-2" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </div>
  )
}
