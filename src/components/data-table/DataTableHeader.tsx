"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";

interface DataTableHeaderProps {
    globalFilter: string;
    onGlobalFilterChange: (value: string) => void;
    searchPlaceholder?: string;
    filtersNode?: React.ReactNode;
    activeFilterCount?: number;
    onClearFilters?: () => void;
    headerActions?: React.ReactNode;
}

export function DataTableHeader({
    globalFilter,
    onGlobalFilterChange,
    searchPlaceholder = "Buscar...",
    filtersNode,
    activeFilterCount = 0,
    onClearFilters,
    headerActions,
}: DataTableHeaderProps) {
    const [filtersOpen, setFiltersOpen] = useState(false);

    function handleToggleFilters() {
        if (filtersOpen && activeFilterCount > 0) {
            onClearFilters?.();
        }
        setFiltersOpen((prev) => !prev);
    }

    return (
        <div className="space-y-2">
            <div className="flex gap-3 items-center w-full bg-white border border-gray-100 rounded-2xl p-4 shadow-xs">
                <div className="relative flex-1">
                    <Search
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                        size={18}
                    />
                    <input
                        type="text"
                        value={globalFilter ?? ""}
                        onChange={(e) => onGlobalFilterChange(e.target.value)}
                        placeholder={searchPlaceholder}
                        className="w-full pl-11 pr-10 py-3 bg-gray-50/60 border border-transparent rounded-xl text-sm placeholder-gray-400 text-gray-900 focus:bg-white focus:border-gray-200 outline-none transition-all"
                    />
                    {globalFilter && (
                        <button
                            onClick={() => onGlobalFilterChange("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>

                {filtersNode !== undefined && (
                    <button
                        onClick={handleToggleFilters}
                        className={`relative flex items-center gap-2 px-5 py-3 border rounded-xl text-sm font-medium transition-all cursor-pointer ${filtersOpen || activeFilterCount > 0
                                ? "bg-primary/5 border-primary/30 text-primary"
                                : "border-gray-200 text-gray-600 hover:bg-gray-50"
                            }`}
                    >
                        <SlidersHorizontal size={16} />
                        <span className="hidden sm:inline">Filtros</span>
                        {activeFilterCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-4 h-4 rounded-full bg-primary text-white text-[10px] font-bold leading-none">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>
                )}

                {headerActions}
            </div>

            {filtersNode !== undefined && (
                <div
                    className={`overflow-hidden transition-all duration-200 ease-in-out ${filtersOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                        }`}
                >
                    <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4">
                        {filtersNode}
                        {activeFilterCount > 0 && (
                            <div className="flex justify-end mt-4 pt-3 border-t border-gray-100">
                                <button
                                    onClick={onClearFilters}
                                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-primary transition-colors cursor-pointer"
                                >
                                    <X size={13} />
                                    Limpar {activeFilterCount} filtro{activeFilterCount > 1 ? "s" : ""}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}