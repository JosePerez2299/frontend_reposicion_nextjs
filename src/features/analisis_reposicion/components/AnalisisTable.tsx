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
import { getRotationStyle, getStockCellClass, getCompleteLegendConfig } from "@/lib/utils";

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
// Color helpers — matching sole-v5 palette
// ---------------------------------------------------------------------------

/**
 * Returns Tailwind bg + text classes based on rotation value (0–1).
 * Mirrors --s-r/--t-r … --s-g/--t-g from the reference design.
 */

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
              <div className="px-4 py-0 flex flex-col justify-center h-full cursor-default">
                <span className="block truncate w-[172px] text-[13px] font-bold leading-snug font-mono">
                  {name}
                </span>
                <span className="font-mono text-[9px] text-[#9c9790] mt-0.5 tracking-wide">
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
      <span className="block text-right pr-3 font-mono text-[12px] tabular-nums text-[#5c5852]">
        ${getValue<number>().toFixed(2)}
      </span>
    ),
  },
];

function buildStoreColumns(
  stores: StoreHeader[],
  viewMode: "compact" | "detailed"
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
            <div className="border-l border-[#e8e6e2]">Stock</div>
            <div className="border-l border-[#e8e6e2]">Vtas</div>
          </div>
        )}
      </div>
    ),
    size: viewMode === "detailed" ? 170 : 100,
    minSize: viewMode === "detailed" ? 170 : 100,

    // Return the bg color as metadata so TableCell can consume it
    meta: { isCellColored: true },

    cell: ({ row }) => {
      const val = row.original.values[store.id];
      if (!val)
        return (
          <span className="block text-center text-[#bbb] font-mono text-[11px]">—</span>
        );

      const rotationColors = getRotationStyle(val.rotation);
      const stockBgClass = getStockCellClass(val.qty_stock);
      const pct = (val.rotation * 100).toFixed(1);

      return (
        <TooltipProvider delayDuration={500}>
          <Tooltip>
            <TooltipTrigger asChild>
              {/* full-bleed inner — parent TableCell is p-0 */}
              <div
                className={`h-full w-full flex items-center justify-center cursor-help ${stockBgClass} transition-[filter] duration-100 hover:brightness-95`}
              >
                {viewMode === "detailed" ? (
                  <div className="grid grid-cols-3 w-full">
                    <div className={`text-center font-mono font-bold text-[12px] ${rotationColors.textClass}`}>
                      {pct}%
                    </div>
                    <div className="text-center font-mono text-[11px] text-[#9c9790] border-l border-[#e8e6e2]">
                      {val.qty_stock.toLocaleString()}
                    </div>
                    <div className="text-center font-mono font-semibold text-[12px] text-[#1c1a17] border-l border-[#e8e6e2]">
                      {val.qty_sold.toLocaleString()}
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <span className={`font-mono font-bold text-[15px] leading-none block ${rotationColors.textClass}`}>
                      {pct}%
                    </span>
                    <span className="font-mono text-[9px] text-[#9c9790] mt-0.5 block">
                      {val.qty_stock}u
                    </span>
                  </div>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <div className="space-y-2">
                <div className="font-semibold text-sm border-b pb-1">
                  {row.original.product_name} — {store.name}
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <div><span className="font-medium">Rotación:</span></div>
                  <div className={`font-bold ${rotationColors.textClass}`}>{pct}%</div>
                  <div><span className="font-medium">Stock:</span></div>
                  <div className="text-muted-foreground">{val.qty_stock.toLocaleString()}</div>
                  <div><span className="font-medium">Ventas:</span></div>
                  <div className="font-semibold">{val.qty_sold.toLocaleString()}</div>
                  <div><span className="font-medium">Transacciones:</span></div>
                  <div className="text-muted-foreground">{val.transactions.toLocaleString()}</div>
                  <div><span className="font-medium">Total compras:</span></div>
                  <div className="font-semibold">${val.total_buy.toLocaleString()}</div>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  }));
}

function buildColumns(
  stores: StoreHeader[],
  viewMode: "compact" | "detailed"
): ColumnDef<AnalisisRow>[] {
  return [...productColumns, ...buildStoreColumns(stores, viewMode)];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface AnalisisTableProps {
  data: AnalisisResponse;
}

export function AnalisisTable({ data }: AnalisisTableProps) {
  const { viewMode, setPage } = useAnalisisStore();

  const columns = useMemo(
    () => buildColumns(data.stores ?? [], viewMode),
    [data.stores, viewMode]
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
    <div className="flex flex-col gap-3">
      {/* ------------------------------------------------------------------ */}
      {/* Table                                                               */}
      {/* ------------------------------------------------------------------ */}
      <div className="rounded-md border border-border overflow-auto max-h-[600px] bg-background">
        <Table containerClassName="overflow-visible" className="w-auto min-w-full border-collapse">
          {/* HEADER */}
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
                        left:
                          isPinned === "left"
                            ? `${header.column.getStart("left")}px`
                            : undefined,
                      }}
                      className={[
                        "py-2 text-[10px] font-semibold tracking-widest uppercase text-muted-foreground",
                        isPinned === "left"
                          ? "sticky z-30 bg-muted/80 supports-[backdrop-filter]:bg-muted/60 border-r border-border"
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

          {/* BODY */}
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-[#9c9790] font-mono text-xs"
                >
                  Sin resultados.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-b border-[#e8e6e2] hover:bg-[#f2f1ee]/50 group"
                  style={{ height: 52 }}
                >
                  {row.getVisibleCells().map((cell) => {
                    const isPinned = cell.column.getIsPinned();
                    // Store cells are full-bleed — remove all padding so the colored div fills them
                    const isStoreCel = cell.column.id.startsWith("store_");

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
                          // no padding for store cells — inner div fills the whole cell
                          padding: isStoreCel ? 0 : undefined,
                        }}
                        className={[
                          isStoreCel ? "h-[52px]" : "py-0",
                          isPinned === "left"
                            ? "sticky z-10 bg-white border-r-2 border-[#d0cdc8] shadow-[1px_0_0_0_#d0cdc8] cursor-pointer"
                            : "border-r border-[#e8e6e2]/60",
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

      {/* ------------------------------------------------------------------ */}
      {/* Legend                                                              */}
      {/* ------------------------------------------------------------------ */}
      <div className="px-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
          {getCompleteLegendConfig().map((section) => (
            <div key={section.type} className="flex items-start gap-3">
              <div className="shrink-0 text-[10px] font-semibold text-[#9c9790] uppercase tracking-wider pt-[1px]">
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

      {/* ------------------------------------------------------------------ */}
      {/* Pagination                                                          */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-[#9c9790] font-mono">
          Página{" "}
          <span className="font-bold text-[#1c1a17]">{current_page}</span> de{" "}
          <span className="font-bold text-[#1c1a17]">{total_pages}</span>
          <span className="mx-2 text-[#d0cdc8]">·</span>
          <span className="font-bold text-[#1c1a17]">{total_count.toLocaleString()}</span>{" "}
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