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
import { StoreValueCell } from "@/features/analisis_reposicion/components/StoreValueCell";
import { getCompleteLegendConfig } from "@/lib/utils";
import { useOrderItemsByOrderQuery } from "@/features/pedidos/queries/pedidos.queries";
import type { OrderItemResponse } from "@/services/pedidos.service";

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
  product_code: string;
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
        <TooltipProvider delayDuration={900}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="px-4 py-0 flex flex-col justify-center h-full cursor-default min-w-0">
                <span className="block truncate text-[12px] font-bold leading-snug font-mono">
                  {name}
                </span>
                <span className="font-mono text-[9px] text-muted-foreground mt-0.5 tracking-wide">
                  {row.original.product_code}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                <p className="font-semibold">{name}</p>
                <p className="text-xs text-muted-foreground">ID: {row.original.product_code}</p>
                <p className="text-xs text-muted-foreground">Precio: ${price.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Costo: ${row.original.cost.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">
                  Margen: ${(price - row.original.cost).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">Colección: {row.original.group_name}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: "price",
    header: () => <span className="block text-right pr-3">Precio</span>,
    size: 80,
    minSize: 80,
    maxSize: 80,
    cell: ({ getValue }) => (
      <span className="block text-right pr-3 font-mono text-[12px] tabular-nums text-foreground">
        ${getValue<number>().toFixed(2)}
      </span>
    ),
  },
];

function buildStoreColumns(
  stores: StoreHeader[],
  viewMode: "compact" | "detailed",
  hasOrderForCell: (productId: string, storeId: string) => boolean
): ColumnDef<AnalisisRow>[] {
  return (stores ?? []).map((store) => ({
    id: `store_${store.id}`,
    header: () => (
      <div className="text-center leading-tight px-1">
        <div className="text-[11px] font-bold truncate mx-auto max-w-fit" title={store.name}>
          {store.name}
        </div>
        {viewMode === "detailed" && (
          <div className="grid grid-cols-3 text-[9px] font-semibold text-muted-foreground border-t border-border pt-1 mt-1">
            <div>Rot.</div>
            <div className="border-l border-border">Stock</div>
            <div className="border-l border-border">Vtas</div>
          </div>
        )}
      </div>
    ),
    size: viewMode === "detailed" ? 170 : 100,
    minSize: viewMode === "detailed" ? 170 : 100,
    maxSize: viewMode === "detailed" ? 170 : 100,
    meta: { isCellColored: true },
    cell: ({ row }) => {
      const val = row.original.values[store.id];
      if (!val)
        return (
          <span className="block text-center text-muted-foreground font-mono text-[11px]">—</span>
        );

      return (
        <StoreValueCell
          viewMode={viewMode}
          productId={row.original.product_code}
          productName={row.original.product_name}
          storeId={store.id}
          storeName={store.name}
          qty_stock={val.qty_stock}
          qty_sold={val.qty_sold}
          transactions={val.transactions}
          total_buy={val.total_buy}
          rotation={val.rotation}
          hasOrder={hasOrderForCell(row.original.product_code, store.id)}
        />
      );
    },
  }));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface AnalisisTableProps {
  data: AnalisisResponse;
}

export function AnalisisTable({ data }: AnalisisTableProps) {
  const { viewMode, setPage, selectedOrder } = useAnalisisStore();

  const { data: orderItems } = useOrderItemsByOrderQuery(selectedOrder?.id, {
    enabled: !!selectedOrder?.id,
  });

  const hasOrderSet = useMemo(() => {
    const set = new Set<string>();
    const items = (orderItems ?? []) as OrderItemResponse[];
    for (const it of items) {
      if (!it?.product_id || !it?.store_id) continue;
      set.add(`${it.product_id}|${it.store_id}`);
    }
    return set;
  }, [orderItems]);

  const hasOrderForCell = useMemo(() => {
    return (productId: string, storeId: string) => hasOrderSet.has(`${productId}|${storeId}`);
  }, [hasOrderSet]);

  const columns = useMemo(
    () => [
      ...productColumns,
      ...buildStoreColumns(data.stores ?? [], viewMode, hasOrderForCell),
    ],
    [data.stores, viewMode, hasOrderForCell]
  );

  const table = useReactTable({
    data: data.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    enableColumnPinning: true,
    initialState: {
      columnPinning: { left: ["product_name"] },
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
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-1 min-h-0 overflow-auto rounded-md border border-border bg-background">
        <Table containerClassName="overflow-visible" className="w-auto min-w-full border-collapse">
          <TableHeader className="sticky top-0 z-20 bg-muted/80 supports-[backdrop-filter]:bg-muted/60 backdrop-blur">
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="border-b border-border">
                {hg.headers.map((header) => {
                  const isPinned = header.column.getIsPinned();
                  return (
                    <TableHead
                      key={header.id}
                      style={{
                        width: header.getSize(),
                        minWidth: header.getSize(),
                        maxWidth: header.getSize(),
                        left: isPinned === "left" ? `${header.column.getStart("left")}px` : undefined,
                      }}
                      className={[
                        "py-2 text-[10px] font-semibold tracking-widest uppercase text-muted-foreground",
                        isPinned === "left"
                          ? "sticky z-30 bg-muted border-r border-border"
                          : "border-r border-border",
                      ].join(" ")}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
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
                  className="h-24 text-center text-muted-foreground font-mono text-xs"
                >
                  Sin resultados.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-b border-border hover:bg-muted/50"
                  style={{ height: 52 }}
                >
                  {row.getVisibleCells().map((cell) => {
                    const isPinned = cell.column.getIsPinned();
                    const isStoreCell = cell.column.id.startsWith("store_");

                    return (
                      <TableCell
                        key={cell.id}
                        style={{
                          width: cell.column.getSize(),
                          minWidth: cell.column.getSize(),
                          maxWidth: cell.column.getSize(),
                          left: isPinned === "left" ? `${cell.column.getStart("left")}px` : undefined,
                          padding: isStoreCell ? 0 : undefined,
                        }}
                        className={[
                          isStoreCell ? "h-[52px]" : "py-0",
                          isPinned === "left"
                            ? "sticky z-10 bg-[var(--product-column-bg)] border-r-2 border-[var(--product-column-border)] shadow-[1px_0_0_0_var(--product-column-border)] cursor-pointer"
                            : "border-r border-border/60",
                        ].join(" ")}
                        onClick={() => {
                          if (isPinned === "left") {
                            alert(`Producto: ${cell.getValue()}`);
                          }
                        }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Leyendas — fijas abajo, no scrolleables */}
      <div className="flex-none px-1 pt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
          {getCompleteLegendConfig().map((section) => (
            <div key={section.type} className="flex items-start gap-3">
              <div className="shrink-0 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider pt-[1px]">
                {section.title}
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                {section.items.map(({ bg, text, border, label }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <div className={`w-2.5 h-2.5 rounded-[2px] border ${bg} ${border}`} />
                    <span className={`text-[10px] font-semibold ${text}`}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Paginación — fija abajo */}
      <div className="flex-none flex items-center justify-between px-1 py-2">
        <p className="text-xs text-muted-foreground font-mono">
          Página{" "}
          <span className="font-bold text-foreground">{current_page}</span> de{" "}
          <span className="font-bold text-foreground">{total_pages}</span>
          <span className="mx-2 text-border">·</span>
          <span className="font-bold text-foreground">{total_count.toLocaleString()}</span>{" "}
          productos
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={!has_prev} onClick={() => table.previousPage()}>
            Anterior
          </Button>
          <Button variant="outline" size="sm" disabled={!has_next} onClick={() => table.nextPage()}>
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}