"use no memo";

import {
    ColumnDef,
    ColumnFiltersState,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
} from "@tanstack/react-table";
import { useCallback, useState } from "react";

export function useDataTable<TData>(
    columns: ColumnDef<TData>[],
    data: TData[]
) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [rowSelection, setRowSelection] = useState({});

    // eslint-disable-next-line react-hooks/incompatible-library
    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnFilters,
            globalFilter,
            rowSelection,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        enableSortingRemoval: true,
    });

    const setColumnFilter = useCallback((columnId: string, value: unknown) => {
        setColumnFilters((prev) => {
            const outros = prev.filter((f) => f.id !== columnId);
            if (value === "" || value === null || value === undefined) {
                return outros;
            }
            return [...outros, { id: columnId, value }];
        });
    }, []);

    const clearColumnFilters = useCallback(() => {
        setColumnFilters([]);
    }, []);

    return {
        table,
        globalFilter,
        setGlobalFilter,
        columnFilters,
        setColumnFilter,
        clearColumnFilters,
    };
}
