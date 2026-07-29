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
import { Check, Layers, Plus } from "lucide-react";
import { useAnalisisStore } from "@/stores/resposicion-analisis.store";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { StoreValueCell } from "@/features/analisis_reposicion/components/StoreValueCell";
import { StoreCellSheet } from "@/features/analisis_reposicion/components/StoreCellSheet";
import { getCompleteLegendConfig } from "@/lib/utils";
import { useOrderItemsByOrderQuery } from "@/features/pedidos/queries/pedidos.queries";
import type { OrderItemResponse } from "@/services/pedidos.service";
import {
  SupplierStockMarker,
  SupplierTooltipDetail,
  type SupplierAvailability,
} from "@/features/analisis_reposicion/components/SupplierStockBadge";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface StoreValue {
  qty_sold: number;
  qty_stock: number;
  qty_stock_until_date: number;
  transactions: number;
  total_buy: number;
  rotation: number;
}

export interface AnalisisRow {
  product_code: string;
  product_name: string;

  price: number;
  cost: number;
  /** Disponibilidad en el mayorista, del último snapshot. Ausente si el backend es viejo. */
  supplier?: SupplierAvailability | null;
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
                <span className="mt-0.5 flex items-center gap-1">
                  <span className="font-mono text-[9px] text-muted-foreground tracking-wide">
                    {row.original.product_code}
                  </span>
                  <SupplierStockMarker supplier={row.original.supplier} />
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
                <SupplierTooltipDetail supplier={row.original.supplier} />
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

function EmptyStoreCell({
  productId,
  productName,
  storeId,
  storeName,
  hasOrder,
  hasAssorted,
}: {
  productId: string;
  productName: string;
  storeId: string;
  storeName: string;
  hasOrder?: boolean;
  hasAssorted?: boolean;
}) {
  const openStoreCellSheet = useAnalisisStore((s) => s.openStoreCellSheet);
  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    openStoreCellSheet({
      product_id: productId,
      product_name: productName,
      store_id: storeId,
      store_name: storeName,
      rotation_pct: "0.0",
      rotation_text_class: "text-muted-foreground",
      qty_stock: 0,
      qty_sold: 0,
    });
  };
  return (
    <div className="relative group/storecell h-full w-full flex items-center justify-center">
      <span className="text-muted-foreground font-mono text-[11px]">—</span>
      {hasAssorted ? (
        <span
          className="absolute top-1 left-1 flex h-4 w-4 items-center justify-center rounded border border-amber-600/30 bg-amber-500/10 text-amber-700"
          title="Hay un pedido de colores surtidos de este modelo"
        >
          <Layers className="h-3 w-3" />
        </span>
      ) : null}
      {hasOrder ? (
        <button
          type="button"
          className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-md border border-emerald-600/30 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/15"
          onClick={handleOpen}
          aria-label="Abrir pedido"
          title="Abrir pedido"
        >
          <Check className="h-4 w-4" />
        </button>
      ) : (
        <button
          type="button"
          className="absolute top-1 right-1 opacity-0 group-hover/storecell:opacity-100 transition-opacity duration-150"
          onClick={handleOpen}
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-md border border-border bg-background/50 supports-[backdrop-filter]:bg-background/30 backdrop-blur text-muted-foreground hover:bg-background/70">
            <Plus className="h-4 w-4" />
          </span>
        </button>
      )}
    </div>
  );
}

export type CellFlags = { hasOrder: boolean; hasAssorted: boolean };

function buildStoreColumns(
  stores: StoreHeader[],
  viewMode: "compact" | "detailed",
  cellFlags: (productId: string, storeId: string) => CellFlags
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
      const flags = cellFlags(row.original.product_code, store.id);

      if (!val)
        return (
          <EmptyStoreCell
            productId={row.original.product_code}
            productName={row.original.product_name}
            storeId={store.id}
            storeName={store.name}
            hasOrder={flags.hasOrder}
            hasAssorted={flags.hasAssorted}
          />
        );

      return (
        <StoreValueCell
          viewMode={viewMode}
          productId={row.original.product_code}
          productName={row.original.product_name}
          storeId={store.id}
          storeName={store.name}
          qty_stock={val.qty_stock}
          qty_stock_until_date={val.qty_stock_until_date}
          qty_sold={val.qty_sold}
          transactions={val.transactions}
          total_buy={val.total_buy}
          rotation={val.rotation}
          hasOrder={flags.hasOrder}
          hasAssorted={flags.hasAssorted}
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
  const {
    viewMode,
    setPage,
    selectedOrder,
    storeCellSheetOpen,
    storeCellSheetData,
    setStoreCellSheetOpen,
  } = useAnalisisStore();

  const { data: orderItems } = useOrderItemsByOrderQuery(selectedOrder?.id, {
    enabled: !!selectedOrder?.id,
  });

  /**
   * Dos señales por celda en un solo memo, para no reconstruir las columnas dos
   * veces por cada mutación de items:
   *  - hasOrder: pedido de este product_id exacto
   *  - hasAssorted: pedido de colores surtidos (color 9999) del mismo modelo, que
   *    vive bajo otro product_id y por eso no prende el check exacto
   */
  const cellFlags = useMemo(() => {
    const exact = new Set<string>();
    const assortedByModel = new Set<string>();
    const items = (orderItems ?? []) as OrderItemResponse[];

    for (const it of items) {
      if (!it?.product_id || !it?.store_id) continue;
      exact.add(`${it.product_id}|${it.store_id}`);
      if (it.product_id.endsWith("9999")) {
        assortedByModel.add(`${it.product_id.slice(0, 6)}|${it.store_id}`);
      }
    }

    return (productId: string, storeId: string) => ({
      hasOrder: exact.has(`${productId}|${storeId}`),
      hasAssorted: assortedByModel.has(`${productId.slice(0, 6)}|${storeId}`),
    });
  }, [orderItems]);

  const columns = useMemo(
    () => [
      ...productColumns,
      ...buildStoreColumns(data.stores ?? [], viewMode, cellFlags),
    ],
    [data.stores, viewMode, cellFlags]
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

      <StoreCellSheet open={storeCellSheetOpen} onOpenChange={setStoreCellSheetOpen} data={storeCellSheetData} />

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