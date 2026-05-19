import { ColumnDef } from "@tanstack/react-table";

export interface FilterAPI {
    setColumnFilter: (columnId: string, value: unknown) => void;
    clearColumnFilters: () => void;
    activeFilters: { id: string; value: unknown }[];
}

export interface DataTableProps<TData> {
    columns: ColumnDef<TData>[];
    data: TData[];
    searchPlaceholder?: string;
    onRowClick?: (row: TData) => void;
    hasMore?: boolean;
    onLoadMore?: () => void;
    isLoadingMore?: boolean;
    advancedFilters?: (api: FilterAPI) => React.ReactNode;
    headerActions?: React.ReactNode;
}
