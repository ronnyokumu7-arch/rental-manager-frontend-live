"use client";
import React, { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from "@tanstack/react-table";
import { ArrowUpDown, ArrowUp, ArrowDown, Inbox } from "lucide-react";
import Pagination from "./Pagination"; // Assuming you have this

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T, any>[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  enableSorting?: boolean;
  // Pagination props
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
}

export default function DataTable<T>({
  data,
  columns,
  loading = false,
  emptyMessage = "No data found",
  onRowClick,
  enableSorting = true,
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableSorting,
    manualPagination: true, // We handle pagination externally/via props
  });

  if (loading) {
    return (
      <div className="border border-surface-border rounded-xl bg-surface-card overflow-hidden">
        <div className="p-12 flex flex-col items-center justify-center text-ink-muted">
          <div className="w-8 h-8 border-2 border-accent-dark border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm">Loading data...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="border border-surface-border rounded-xl bg-surface-card p-12 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-full bg-surface-hover flex items-center justify-center mb-4">
          <Inbox size={20} className="text-ink-subtle" />
        </div>
        <p className="text-sm font-semibold text-ink mb-1">{emptyMessage}</p>
        <p className="text-xs text-ink-muted">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="border border-surface-border rounded-xl bg-surface-card flex flex-col overflow-hidden shadow-[var(--shadow-card)]">
      {/* Scrollable Table Container */}
      <div className="overflow-auto max-h-[calc(100vh-280px)]">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-ink-muted uppercase bg-surface sticky top-0 z-10 shadow-sm">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      className={`px-6 py-3.5 font-semibold tracking-wide whitespace-nowrap ${
                        canSort ? "cursor-pointer select-none hover:text-ink transition-colors" : ""
                      }`}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                    >
                      <div className="flex items-center gap-1.5">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {canSort && (
                          <span className="text-ink-subtle">
                            {sorted === "asc" ? <ArrowUp size={14} /> : sorted === "desc" ? <ArrowDown size={14} /> : <ArrowUpDown size={14} />}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-surface-border">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={`transition-colors ${
                  onRowClick ? "cursor-pointer hover:bg-surface-hover" : ""
                }`}
                onClick={() => onRowClick?.(row.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-6 py-4 text-ink whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Integrated Pagination Footer */}
      {totalPages > 1 && onPageChange && (
        <div className="border-t border-surface-border bg-surface-card p-3">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}
