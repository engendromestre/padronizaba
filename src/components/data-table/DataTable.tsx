"use client";

import { useMemo } from "react";
import { ColumnDef, flexRender } from "@tanstack/react-table";
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
    // Loading
    isLoading?: boolean;
    skeletonRows?: number;
    // Paginação infinita
    hasMore?: boolean;
    onLoadMore?: () => void;
    isLoadingMore?: boolean;
    // Filtros e ações
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
            {/* Header: busca + filtros + ações — sempre visível, mesmo durante loading */}
            <DataTableHeader
                globalFilter={globalFilter}
                onGlobalFilterChange={setGlobalFilter}
                searchPlaceholder={searchPlaceholder}
                filtersNode={filtersNode}
                activeFilterCount={columnFilters.length}
                onClearFilters={clearColumnFilters}
                headerActions={headerActions}
            />

            {/* Skeleton — enquanto isLoading */}
            {isLoading ? (
                <DataTableSkeleton
                    columnCount={columns.length}
                    rowCount={skeletonRows}
                />
            ) : (
                <>
                    {/* Desktop */}
                    <div className="hidden md:block bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-xs">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left">
                                <thead>
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <tr key={headerGroup.id} className="border-b border-gray-100 bg-gray-50/50">
                                            {headerGroup.headers.map((header) => (
                                                <th
                                                    key={header.id}
                                                    onClick={header.column.getToggleSortingHandler()}
                                                    className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400 select-none cursor-pointer hover:text-gray-700 transition-colors"
                                                >
                                                    <div className="flex items-center gap-1">
                                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                                        {header.column.getIsSorted() && (
                                                            <span className="text-gray-600 font-bold">
                                                                {header.column.getIsSorted() === "asc" ? " ↑" : " ↓"}
                                                            </span>
                                                        )}
                                                    </div>
                                                </th>
                                            ))}
                                        </tr>
                                    ))}
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                                    {table.getRowModel().rows.length === 0 ? (
                                        <tr>
                                            <td colSpan={columns.length} className="px-6 py-16 text-center text-gray-400">
                                                Nenhum resultado encontrado.
                                            </td>
                                        </tr>
                                    ) : (
                                        table.getRowModel().rows.map((row) => (
                                            <tr
                                                key={row.id}
                                                onClick={() => onRowClick?.(row.original)}
                                                className={`transition-colors ${
                                                    onRowClick ? "hover:bg-gray-50/40 cursor-pointer" : ""
                                                } ${row.getIsSelected() ? "bg-blue-50/20" : ""}`}
                                            >
                                                {row.getVisibleCells().map((cell) => (
                                                    <td key={cell.id} className="px-6 py-4">
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {hasMore && (
                            <div className="flex justify-center items-center py-5 border-t border-gray-100 bg-white">
                                <button
                                    onClick={onLoadMore}
                                    disabled={isLoadingMore}
                                    className="px-8 py-2.5 border-2 border-gray-300 text-gray-500 rounded-xl text-sm font-bold bg-white hover:bg-gray-50 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
                                >
                                    {isLoadingMore ? "Carregando..." : "Carregar mais resultados"}
                                </button>
                            </div>
                        )}
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
