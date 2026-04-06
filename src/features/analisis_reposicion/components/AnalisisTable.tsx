"use client";

import { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useAnalisisStore } from "@/stores/resposicion-analisis.store";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Eye } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface StoreValue {
  qty_sold: number;
  qty_stock: number;
  transactions: number;
  total_buy: number;
  rotation: number;
}

export interface AnalisisRow {
  product_name: string;
  group_id: string;
  group_name: string;
  subgroup_id: string;
  subgroup_name: string;
  price: number;
  cost: number;
  values: Record<string, StoreValue>;
}

export interface StoreHeader {
  id: string;
  name: string;
}

export interface AnalisisResponse {
  stores: StoreHeader[];
  data: AnalisisRow[];
  pagination: {
    current_page: number;
    limit: number;
    total_count: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

// ---------------------------------------------------------------------------
// Column builders
// ---------------------------------------------------------------------------
const productColumns: ColumnDef<AnalisisRow>[] = [
  {
    accessorKey: "product_name",
    header: "Producto",
    size: 200,
    minSize: 200,
    maxSize: 200,
    cell: ({ row, getValue }) => {
      const name = getValue<string>();
      const price = row.original.price;
      return (
        <div>
          <TooltipProvider delayDuration={900}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="block truncate w-[180px] text-ellipsis text-sm font-mono font-semibold">
                  {name}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-1">
                  <p className="font-medium">{name}</p>
                  <p className="text-sm text-muted-foreground">
                    Precio: ${price.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Costo: ${row.original.cost.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Margen: ${(price - row.original.cost).toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Colección: {row.original.group_name}
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      );
    },
  },
  {
    accessorKey: "price",
    header: () => <span className="block text-right">Precio</span>,
    size: 80,
    minSize: 80,
    maxSize: 80,
    cell: ({ getValue }) => (
      <span className="block text-right tabular-nums">
        ${getValue<number>().toFixed(2)}
      </span>
    ),
  },
];

function buildStoreColumns(stores: StoreHeader[]): ColumnDef<AnalisisRow>[] {
  return (stores ?? []).map((store) => ({
    id: `store_${store.id}`,
    header: () => (
      <div className="text-center leading-tight">
        <div
          className="text-xs font-semibold truncate mx-auto max-w-[120px]"
          title={store.name}
        >
          {store.name}
        </div>
        <div className="text-[10px] text-muted-foreground font-normal">
          {store.id}
        </div>
      </div>
    ),
    size: 130,
    cell: ({ row }) => {
      const val = row.original.values[store.id];
      if (!val)
        return (
          <span className="block text-center text-muted-foreground">—</span>
        );

      const rotPct = (val.rotation * 100).toFixed(1);
      const rotColor =
        val.rotation >= 0.7
          ? "text-emerald-600 dark:text-emerald-400"
          : val.rotation >= 0.4
            ? "text-amber-600 dark:text-amber-400"
            : "text-muted-foreground";

      return (
        <div className="text-center tabular-nums text-xs space-y-0.5 py-0.5">
          <div className="font-semibold text-foreground">
            {val.qty_sold.toLocaleString()}
          </div>
          <div className="text-muted-foreground">
            stk: {val.qty_stock.toLocaleString()}
          </div>
          <div className={rotColor}>rot: {rotPct}%</div>
        </div>
      );
    },
  }));
}

function buildColumns(stores: StoreHeader[]): ColumnDef<AnalisisRow>[] {
  return [...productColumns, ...buildStoreColumns(stores)];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface AnalisisTableProps {
  data: AnalisisResponse;
}

export function AnalisisTable({ data }: AnalisisTableProps) {
  const { setPage } = useAnalisisStore();

  const columns = useMemo(() => buildColumns(data.stores ?? []), [data.stores]);

  const table = useReactTable({
    data: data.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    enableColumnPinning: true,
    initialState: {
      columnPinning: {
        left: ["product_name"],
      },
    },
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
          : updater;
      setPage(next.pageIndex + 1);
    },
  });

  const { current_page, total_pages, total_count, has_prev, has_next } =
    data.pagination;

  return (
    <div className="flex flex-col gap-3">
      {/* ------------------------------------------------------------------ */}
      {/* Table                                                               */}
      {/* ------------------------------------------------------------------ */}
      <div className="rounded-md border overflow-auto max-h-[600px]">
        <Table
          containerClassName="overflow-visible"
          className="w-auto min-w-full"
        >
          <TableHeader className="sticky top-0 z-20 bg-background">
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => {
                  const isPinned = header.column.getIsPinned();
                  return (
                    <TableHead
                      key={header.id}
                      style={{
                        width: header.getSize(),
                        minWidth: header.getSize(),
                        maxWidth: header.getSize(),
                        left:
                          isPinned === "left"
                            ? `${header.column.getStart("left")}px`
                            : undefined,
                      }}
                      className={
                        isPinned === "left"
                          ? "sticky z-30 bg-background border-r shadow-[1px_0_0_0_hsl(var(--border))] "
                          : ""
                      }
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
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
                    const isPinned = cell.column.getIsPinned();
                    return (
                      <TableCell
                        key={cell.id}
                        style={{
                          width: cell.column.getSize(),
                          minWidth: cell.column.getSize(),
                          maxWidth: cell.column.getSize(),
                          left:
                            isPinned === "left"
                              ? `${cell.column.getStart("left")}px`
                              : undefined,
                        }}
                        className={
                          isPinned === "left"
                            ? "sticky z-10 bg-primary/10 border-r shadow-[1px_0_0_0_hsl(var(--border))] cursor-pointer backdrop-blur-md"
                            : ""
                        }
                        onClick={() => {
                          if (isPinned === "left") {
                            alert(`Columna fijada clickeada: ${cell.getValue()}`);
                          }
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    );
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
          <span className="font-medium text-foreground">{current_page}</span> de{" "}
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
  );
}
