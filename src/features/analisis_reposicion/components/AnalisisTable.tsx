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

/* =========================
   TYPES & MOCK DATA
========================= */

type Row = {
  modelo: string;
  [key: string]: string | number;
};

const STORE_COUNT = 20;
const storeKeys = Array.from({ length: STORE_COUNT }, (_, i) => `tienda${i + 1}`);

const data: Row[] = Array.from({ length: 50 }, (_, rowIndex) => ({
  modelo: `Modelo ${rowIndex + 1}`,
  ...Object.fromEntries(storeKeys.map((key, i) => [key, (i + 1) * (rowIndex + 1)])),
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
      storeKeys.reduce((sum, key) => sum + Number(row[key] ?? 0), 0)
    );
  }, [data]);

  const storeTotals = useMemo(() => {
    return storeKeys.map((key) =>
      data.reduce((sum, row) => sum + Number(row[key] ?? 0), 0)
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

function TablePagination({ table }: { table: any }) {
  return (
    <div className="flex items-center justify-between p-2 border-t bg-white">
      <div className="text-sm">
        Página {table.getState().pagination.pageIndex + 1} de{" "}
        {table.getPageCount()}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="px-2 py-1 border rounded disabled:opacity-50"
        >
          Anterior
        </button>

        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="px-2 py-1 border rounded disabled:opacity-50"
        >
          Siguiente
        </button>
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
    []
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
    <div className="flex flex-col h-full border border-border">
      {/* SCROLLABLE AREA */}
      <div className="flex-1 overflow-auto">
        <table
          style={{ width: table.getTotalSize() }}
          className="border-separate border-spacing-0"
        >
          <thead className="sticky top-0 z-20">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    style={getCommonPinningStyles(header.column)}
                    className="border border-border px-2 py-2 bg-gray-100 text-xs font-medium text-left"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.map((row) => {
              const absoluteIndex = row.index + pageIndex * pageSize;

              return (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      style={getCommonPinningStyles(cell.column)}
                      className="border border-border px-2 py-1.5 bg-white text-sm"
                    >
                      {cell.column.id === "modelo"
                        ? flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )
                        : cell.column.id === "total"
                          ? rowTotals[absoluteIndex]
                          : flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                    </td>
                  ))}
                </tr>
              );
            })}

            {/* TOTAL ROW */}
            <tr>
              <td
                style={getTotalRowCellStyles(table.getColumn("modelo")!)}
                className="border border-border px-2 py-1.5 text-sm"
              >
                TOTAL
              </td>

              {storeKeys.map((key, index) => {
                const column = table.getColumn(key)!;

                return (
                  <td
                    key={key}
                    style={getTotalRowCellStyles(column)}
                    className="border border-border px-2 py-1.5 text-sm text-right"
                  >
                    {storeTotals[index]}
                  </td>
                );
              })}

              <td
                style={getTotalRowCellStyles(table.getColumn("total")!)}
                className="border border-border px-2 py-1.5 text-sm text-right"
              >
                {grandTotal}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* FIXED FOOTER */}
      <TablePagination table={table} />
    </div>
  );
}