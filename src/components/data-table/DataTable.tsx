"use client";

import { useMemo } from "react";
import { ColumnDef, flexRender } from "@tanstack/react-table";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { useDataTable } from "./useDataTable";
import { DataTableHeader } from "./DataTableHeader";
import { DataTableMobile } from "./DataTableMobile";
import { FilterAPI } from "./types";
import { DataTableSkeleton } from "./DataTableSkeleton";

interface DataTableProps<TData> {
    columns: ColumnDef<TData>[];
    data: TData[];
    searchPlaceholder?: string;
    onRowClick?: (row: TData) => void;
    isLoading?: boolean;
    skeletonRows?: number;
    hasMore?: boolean;
    onLoadMore?: () => void;
    isLoadingMore?: boolean;
    advancedFilters?: (api: FilterAPI) => React.ReactNode;
    headerActions?: React.ReactNode;
}

export function DataTable<TData>({
    columns,
    data,
    searchPlaceholder = "Buscar...",
    onRowClick,
    isLoading = false,
    skeletonRows = 6,
    hasMore = false,
    onLoadMore,
    isLoadingMore = false,
    advancedFilters,
    headerActions,
}: DataTableProps<TData>) {
    const {
        table,
        globalFilter,
        setGlobalFilter,
        columnFilters,
        setColumnFilter,
        clearColumnFilters,
    } = useDataTable(columns, data);

    const filterAPI: FilterAPI = useMemo(() => ({
        setColumnFilter,
        clearColumnFilters,
        activeFilters: columnFilters,
    }), [setColumnFilter, clearColumnFilters, columnFilters]);

    const filtersNode = advancedFilters?.(filterAPI);

    return (
        <div className="space-y-3">
            <DataTableHeader
                globalFilter={globalFilter}
                onGlobalFilterChange={setGlobalFilter}
                searchPlaceholder={searchPlaceholder}
                filtersNode={filtersNode}
                activeFilterCount={columnFilters.length}
                onClearFilters={clearColumnFilters}
                headerActions={headerActions}
            />

            {isLoading ? (
                <DataTableSkeleton
                    columnCount={columns.length}
                    rowCount={skeletonRows}
                />
            ) : (
                <>
                    {/* Desktop */}
                    <div className="hidden md:block bg-white border border-gray-100 rounded-2xl shadow-xs overflow-hidden">
                        <div className="overflow-x-auto min-h-80 pb-36 transition-all duration-200">
                            <table className="w-full border-collapse text-left">
                                <thead>
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <tr key={headerGroup.id} className="border-b border-gray-100 bg-gray-50/60">
                                            {headerGroup.headers.map((header) => {
                                                const canSort = header.column.getCanSort();
                                                const sorted = header.column.getIsSorted();

                                                return (
                                                    <th
                                                        key={header.id}
                                                        className="px-6 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap"
                                                    >
                                                        {header.isPlaceholder ? null : (
                                                            <div
                                                                className={`flex items-center gap-1 ${canSort ? "cursor-pointer select-none hover:text-gray-600 transition-colors" : ""}`}
                                                                onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                                                            >
                                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                                                {canSort && (
                                                                    <span className="text-gray-300">
                                                                        {sorted === "asc"
                                                                            ? <ChevronUp size={13} className="text-primary" />
                                                                            : sorted === "desc"
                                                                                ? <ChevronDown size={13} className="text-primary" />
                                                                                : <ChevronsUpDown size={13} />
                                                                        }
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </th>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {table.getRowModel().rows.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={columns.length}
                                                className="px-6 py-16 text-center text-sm text-gray-400 font-medium"
                                            >
                                                Nenhum resultado encontrado.
                                            </td>
                                        </tr>
                                    ) : (
                                        table.getRowModel().rows.map((row) => (
                                            <tr
                                                key={row.id}
                                                onClick={() => onRowClick?.(row.original)}
                                                className={`transition-all group/row ${onRowClick ? "cursor-pointer hover:bg-gray-50/50" : ""}`}
                                            >
                                                {row.getVisibleCells().map((cell) => {
                                                    const isAcoesColumn = cell.column.id === "acoes";
                                                    return (
                                                        <td
                                                            key={cell.id}
                                                            className={`px-6 py-4.5 text-sm text-gray-600 font-medium relative whitespace-nowrap z-20 group-hover/row:z-30 ${isAcoesColumn ? "text-right" : ""}`}
                                                        >
                                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mobile */}
                    <div className="md:hidden">
                        <DataTableMobile
                            rows={table.getRowModel().rows}
                            table={table}
                            onRowClick={onRowClick}
                        />
                        {hasMore && (
                            <button
                                onClick={onLoadMore}
                                disabled={isLoadingMore}
                                className="w-full mt-3 py-3 border-2 border-gray-300 text-gray-500 text-center rounded-xl text-sm font-bold bg-white active:scale-95 transition-all"
                            >
                                {isLoadingMore ? "Carregando..." : "Carregar mais resultados"}
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}