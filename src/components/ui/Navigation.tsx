import { Home, Plus, ListChecks, RefreshCcw } from "lucide-react";
import Link from "next/link";

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 z-50 h-16 w-full border-t border-border bg-card/90 backdrop-blur-lg md:hidden">
      <div className="grid h-full grid-cols-4 items-center">
        <Link href="/dashboard" className="flex flex-col items-center gap-1 text-muted hover:text-primary">
          <Home size={22} />
          <span className="text-[10px] font-bold">Início</span>
        </Link>
        
        <Link href="/relatorios" className="flex flex-col items-center gap-1 text-muted hover:text-primary">
          <ListChecks size={22} />
          <span className="text-[10px] font-bold">Histórico</span>
        </Link>

        {/* Botão de Ação Centralizado */}
        <Link href="/consulta/nova" className="flex flex-col items-center">
          <div className="flex h-12 w-12 -translate-y-4 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/40 ring-4 ring-background">
            <Plus size={28} strokeWidth={3} />
          </div>
          <span className="text-[10px] font-bold -translate-y-3 text-primary">Novo</span>
        </Link>

        <button className="flex flex-col items-center gap-1 text-muted hover:text-primary">
          <RefreshCcw size={22} />
          <span className="text-[10px] font-bold">Sync</span>
        </button>
      </div>
    </nav>
  );
}