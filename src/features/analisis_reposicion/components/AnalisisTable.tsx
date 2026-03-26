"use client";

import { useEffect, useMemo, type CSSProperties } from "react";
import {
  Column,
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/* =========================
   TYPES & MOCK DATA
========================= */

type Row = {
  modelo: string;
  [key: string]: string | number;
};

const STORE_COUNT = 20;
const storeKeys = Array.from(
  { length: STORE_COUNT },
  (_, i) => `tienda${i + 1}`,
);

const data: Row[] = Array.from({ length: 50 }, (_, rowIndex) => ({
  modelo: `Modelo ${rowIndex + 1}`,
  ...Object.fromEntries(
    storeKeys.map((key, i) => [key, (i + 1) * (rowIndex + 1)]),
  ),
}));

/* =========================
   STYLES (PINNING)
========================= */

const getCommonPinningStyles = (column: Column<Row>): CSSProperties => {
  const isPinned = column.getIsPinned();
  const isLastLeftPinnedColumn =
    isPinned === "left" && column.getIsLastColumn("left");
  const isFirstRightPinnedColumn =
    isPinned === "right" && column.getIsFirstColumn("right");

  return {
    position: isPinned ? "sticky" : "relative",
    left: isPinned === "left" ? `${column.getStart("left")}px` : undefined,
    right: isPinned === "right" ? `${column.getAfter("right")}px` : undefined,
    zIndex: isPinned ? 10 : 0,
    background: isPinned ? "white" : undefined,
    boxShadow: isLastLeftPinnedColumn
      ? "-4px 0 4px -4px gray inset"
      : isFirstRightPinnedColumn
        ? "4px 0 4px -4px gray inset"
        : undefined,
    width: column.getSize(),
  };
};

const getTotalRowCellStyles = (column: Column<Row>): CSSProperties => {
  const base = getCommonPinningStyles(column);
  const isPinned = column.getIsPinned();

  return {
    ...base,
    position: "sticky",
    bottom: 0,
    background: "white",
    zIndex: isPinned ? 30 : 20,
    fontWeight: 600,
  };
};

/* =========================
   HOOK: TOTALS
========================= */

function useTableTotals(data: Row[]) {
  const rowTotals = useMemo(() => {
    return data.map((row) =>
      storeKeys.reduce((sum, key) => sum + Number(row[key] ?? 0), 0),
    );
  }, [data]);

  const storeTotals = useMemo(() => {
    return storeKeys.map((key) =>
      data.reduce((sum, row) => sum + Number(row[key] ?? 0), 0),
    );
  }, [data]);

  const grandTotal = useMemo(() => {
    return storeTotals.reduce((sum, value) => sum + value, 0);
  }, [storeTotals]);

  return { rowTotals, storeTotals, grandTotal };
}

/* =========================
   COMPONENT: PAGINATION
========================= */

function TablePagination({ table }: { table: ReturnType<typeof useReactTable<Row>> }) {
  return (
    <div className="flex items-center justify-between p-2 border-t bg-white">
      <p className="text-sm text-muted-foreground">
        Página{" "}
        <span className="font-medium text-foreground">
          {table.getState().pagination.pageIndex + 1}
        </span>{" "}
        de{" "}
        <span className="font-medium text-foreground">
          {table.getPageCount()}
        </span>
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Anterior
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
}

/* =========================
   MAIN COMPONENT
========================= */

export default function TableSticky() {
  const { rowTotals, storeTotals, grandTotal } = useTableTotals(data);

  const columns = useMemo<ColumnDef<Row>[]>(
    () => [
      {
        accessorKey: "modelo",
        id: "modelo",
        header: "Modelo",
        size: 220,
      },
      ...storeKeys.map<ColumnDef<Row>>((storeKey, index) => ({
        accessorKey: storeKey,
        header: `Tienda ${index + 1}`,
        size: 120,
      })),
      {
        id: "total",
        header: "Total",
        size: 140,
        cell: ({ row }) => {
          const total = storeKeys.reduce((sum, key) => {
            return sum + Number(row.original[key] ?? 0);
          }, 0);
          return total;
        },
        accessorFn: (row) =>
          storeKeys.reduce((sum, key) => sum + Number(row[key] ?? 0), 0),
      },
    ],
    [],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    columnResizeMode: "onChange",
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  });

  useEffect(() => {
    table.getColumn("modelo")?.pin("left");
    table.getColumn("total")?.pin("right");
  }, [table]);

  const { pageIndex, pageSize } = table.getState().pagination;

  return (
    <div className="flex flex-col h-full border rounded-md border-border">
      {/* SCROLLABLE AREA */}
      <div className="flex-1 overflow-auto">
        <Table
          style={{ width: table.getTotalSize() }}
          className="border-separate border-spacing-0"
        >
          <TableHeader className="sticky top-0 z-20">
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    style={getCommonPinningStyles(header.column)}
                    className="border border-border bg-muted text-xs font-medium"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.map((row) => {
              const absoluteIndex = row.index + pageIndex * pageSize;

              return (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      style={getCommonPinningStyles(cell.column)}
                      className="border border-border bg-white text-sm"
                    >
                      {cell.column.id === "modelo"
                        ? flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )
                        : cell.column.id === "total"
                          ? rowTotals[absoluteIndex]
                          : flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}

            {/* TOTAL ROW */}
            <TableRow>
              <TableCell
                style={getTotalRowCellStyles(table.getColumn("modelo")!)}
                className="border border-border text-sm"
              >
                TOTAL
              </TableCell>

              {storeKeys.map((key, index) => {
                const column = table.getColumn(key)!;

                return (
                  <TableCell
                    key={key}
                    style={getTotalRowCellStyles(column)}
                    className="border border-border text-sm text-right"
                  >
                    {storeTotals[index]}
                  </TableCell>
                );
              })}

              <TableCell
                style={getTotalRowCellStyles(table.getColumn("total")!)}
                className="border border-border text-sm text-right"
              >
                {grandTotal}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* FIXED FOOTER */}
      <TablePagination table={table} />
    </div>
  );
}