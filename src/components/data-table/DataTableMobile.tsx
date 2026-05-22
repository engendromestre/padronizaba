"use client";

import { flexRender, Row, Table } from "@tanstack/react-table";

interface DataTableMobileProps<TData> {
  rows: Row<TData>[]
  // Table passada para acessar os headers e montar os labels
  table: Table<TData>
  onRowClick?: (row: TData) => void
}

export function DataTableMobile<TData>({
  rows,
  table,
  onRowClick,
}: DataTableMobileProps<TData>) {
  // Headers planos (sem grupos) para usar como labels das células
  const headers = table
    .getHeaderGroups()
    .flatMap((hg) => hg.headers)
    .filter((h) => !h.isPlaceholder)

  if (rows.length === 0) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center text-sm text-gray-400">
        Nenhum resultado encontrado.
      </div>
    )
  }

  {/* ... Dentro do DataTableMobile.tsx, localize o mapeamento dos rows ... */ }

  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <div
          key={row.id}
          onClick={() => onRowClick?.(row.original)}
          /* 🟢 MODIFICADO: 
             - Adicionado 'relative': Cria o quadrado de ancoragem correto para o action menu interno.
             - Adicionado 'z-10 focus-within:z-40 hover:z-40': Isso é o segredo! Quando o usuário clicar 
               no menu de ações, o card ativo ganha prioridade máxima de empilhamento e passa por cima de todos os outros.
          */
          className={`bg-white border border-gray-100 rounded-2xl p-5 shadow-xs space-y-4 transition-all relative z-10 focus-within:z-40 hover:z-40 ${onRowClick
              ? "cursor-pointer hover:border-primary/30 active:scale-[0.985]"
              : ""
            }`}
        >
          {row.getVisibleCells().map((cell, index) => {
            const header = headers[index];
            const labelContent = header
              ? flexRender(header.column.columnDef.header, header.getContext())
              : null;

            // Verifica se é o campo de ações para aplicar ajuste de layout se necessário
            const isAcoes = header?.column.id === "acoes";

            return (
              <div key={cell.id} className={isAcoes ? "relative" : ""}>
                {/* Label da coluna */}
                {labelContent && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                    {labelContent}
                  </span>
                )}
                {/* Valor da célula */}
                <div className="text-sm text-gray-800">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
