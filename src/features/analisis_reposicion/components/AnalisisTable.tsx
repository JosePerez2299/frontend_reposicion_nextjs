"use client"

import { useMemo } from "react"
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useAnalisisStore } from "@/stores/resposicion-analisis.store"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface StoreValue {
  qty_sold: number
  qty_stock: number
  transactions: number
  total_buy: number
  rotation: number
}

export interface AnalisisRow {
  product_id: string
  product_name: string
  category_id: string
  category_name: string
  group_id: string
  group_name: string
  subgroup_id: string
  subgroup_name: string
  price: number
  cost: number
  values: Record<string, StoreValue>
}

export interface StoreHeader {
  id: string
  name: string
}

export interface AnalisisResponse {
  stores: StoreHeader[]
  data: AnalisisRow[]
  pagination: {
    current_page: number
    limit: number
    total_count: number
    total_pages: number
    has_next: boolean
    has_prev: boolean
  }
}

// ---------------------------------------------------------------------------
// TanStack Table meta augmentation
// ---------------------------------------------------------------------------

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    sticky?: boolean
    /** pixel offset for multi-column sticky pinning */
    stickyLeft?: number
  }
}

// ---------------------------------------------------------------------------
// Column builders
// ---------------------------------------------------------------------------

const productColumns: ColumnDef<AnalisisRow>[] = [
  {
    accessorKey: "product_id",
    header: "Código",
    size: 160,
    meta: { sticky: true, stickyLeft: 0 },
  },
  {
    accessorKey: "product_name",
    header: "Producto",
    size: 240,
    meta: { sticky: true, stickyLeft: 160 },
  },
  {
    accessorKey: "category_name",
    header: "Categoría",
    size: 150,
  },
  {
    accessorKey: "price",
    header: () => <span className="block text-right">Precio</span>,
    size: 90,
    cell: ({ getValue }) => (
      <span className="block text-right tabular-nums">
        ${(getValue<number>()).toFixed(2)}
      </span>
    ),
  },
]

function buildStoreColumns(stores: StoreHeader[]): ColumnDef<AnalisisRow>[] {
  return stores.map((store) => ({
    id: `store_${store.id}`,
    header: () => (
      <div className="text-center leading-tight">
        <span className="block text-xs font-semibold truncate max-w-[120px]" title={store.name}>
          {store.name}
        </span>
        <span className="block text-[10px] text-muted-foreground font-normal">
          {store.id}
        </span>
      </div>
    ),
    size: 130,
    cell: ({ row }) => {
      const val = row.original.values[store.id]
      if (!val) return <span className="block text-center text-muted-foreground">—</span>

      const rotPct = (val.rotation * 100).toFixed(1)
      const rotColor =
        val.rotation >= 0.7
          ? "text-emerald-600 dark:text-emerald-400"
          : val.rotation >= 0.4
          ? "text-amber-600 dark:text-amber-400"
          : "text-muted-foreground"

      return (
        <div className="text-right tabular-nums text-xs space-y-0.5 py-0.5">
          <div className="font-semibold text-foreground">{val.qty_sold.toLocaleString()}</div>
          <div className="text-muted-foreground">stk: {val.qty_stock.toLocaleString()}</div>
          <div className={rotColor}>rot: {rotPct}%</div>
        </div>
      )
    },
  }))
}

function buildColumns(stores: StoreHeader[]): ColumnDef<AnalisisRow>[] {
  return [...productColumns, ...buildStoreColumns(stores)]
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface AnalisisTableProps {
  data: AnalisisResponse
}

export function AnalisisTable({ data }: AnalisisTableProps) {
  const { page, setPage } = useAnalisisStore()

  const columns = useMemo(() => buildColumns(data.stores), [data.stores])

  const table = useReactTable({
    data: data.data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: data.pagination.total_pages,
    state: {
      pagination: {
        pageIndex: data.pagination.current_page - 1,
        pageSize: data.pagination.limit,
      },
    },
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater({
              pageIndex: data.pagination.current_page - 1,
              pageSize: data.pagination.limit,
            })
          : updater
      setPage(next.pageIndex + 1)
    },
  })

  const { current_page, total_pages, total_count, has_prev, has_next } =
    data.pagination

  return (
    <div className="flex flex-col gap-3">
      {/* ------------------------------------------------------------------ */}
      {/* Table                                                               */}
      {/* ------------------------------------------------------------------ */}
      <div className="rounded-md border overflow-auto max-h-[600px]">
        <Table style={{ minWidth: "max-content" }}>
          <TableHeader className="sticky top-0 z-20 bg-background">
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => {
                  const meta = header.column.columnDef.meta
                  return (
                    <TableHead
                      key={header.id}
                      style={{
                        width: header.getSize(),
                        minWidth: header.getSize(),
                        ...(meta?.sticky
                          ? { left: meta.stickyLeft ?? 0 }
                          : {}),
                      }}
                      className={
                        meta?.sticky
                          ? "sticky z-30 bg-background border-r shadow-[1px_0_0_0_hsl(var(--border))]"
                          : ""
                      }
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  Sin resultados.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/50">
                  {row.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta
                    return (
                      <TableCell
                        key={cell.id}
                        style={{
                          width: cell.column.getSize(),
                          minWidth: cell.column.getSize(),
                          ...(meta?.sticky
                            ? { left: meta.stickyLeft ?? 0 }
                            : {}),
                        }}
                        className={
                          meta?.sticky
                            ? "sticky z-10 bg-background border-r shadow-[1px_0_0_0_hsl(var(--border))]"
                            : ""
                        }
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Pagination                                                          */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-muted-foreground">
          Página{" "}
          <span className="font-medium text-foreground">{current_page}</span>{" "}
          de{" "}
          <span className="font-medium text-foreground">{total_pages}</span>
          <span className="mx-2 text-border">·</span>
          <span className="font-medium text-foreground">
            {total_count.toLocaleString()}
          </span>{" "}
          productos
        </p>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!has_prev}
            onClick={() => table.previousPage()}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!has_next}
            onClick={() => table.nextPage()}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  )
}