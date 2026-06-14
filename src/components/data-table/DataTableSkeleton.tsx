// Skeleton de loading para o DataTable.
// Renderizado via prop isLoading — sem dados reais ainda.

interface DataTableSkeletonProps {
    // Quantas colunas simular (bate com o número de colunas da tabela)
    columnCount?: number
    // Quantas linhas fantasma mostrar
    rowCount?: number
}

function SkeletonCell() {
    return (
        <div className="h-4 bg-gray-200 rounded-md animate-pulse" />
    )
}

export function DataTableSkeleton({
    columnCount = 4,
    rowCount = 6,
}: DataTableSkeletonProps) {
    return (
        <>
            {/* Desktop skeleton */}
            <div className="hidden md:block bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                {Array.from({ length: columnCount }).map((_, i) => (
                                    <th key={i} className="px-6 py-4">
                                        <div className="h-3 w-20 bg-gray-200 rounded-md animate-pulse" />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {Array.from({ length: rowCount }).map((_, rowIndex) => (
                                <tr key={rowIndex}>
                                    {Array.from({ length: columnCount }).map((_, colIndex) => (
                                        <td key={colIndex} className="px-6 py-4">
                                            {/* Primeira coluna tem duas linhas (ex: nome + email) */}
                                            {colIndex === 0 ? (
                                                <div className="space-y-2">
                                                    <div className="h-4 w-32 bg-gray-200 rounded-md animate-pulse" />
                                                    <div className="h-3 w-24 bg-gray-100 rounded-md animate-pulse" />
                                                </div>
                                            ) : (
                                                <SkeletonCell />
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile skeleton — cards */}
            <div className="md:hidden space-y-3">
                {Array.from({ length: rowCount }).map((_, i) => (
                    <div
                        key={i}
                        className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs space-y-4"
                    >
                        {Array.from({ length: columnCount }).map((_, j) => (
                            <div key={j} className="space-y-1.5">
                                {/* Label da coluna */}
                                <div className="h-2.5 w-16 bg-gray-100 rounded animate-pulse" />
                                {/* Valor */}
                                <div className={`h-4 bg-gray-200 rounded-md animate-pulse ${j === 0 ? "w-40" : "w-28"}`} />
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </>
    )
}
