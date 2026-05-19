// src/app/components/layout/Header.tsx
import { UserCircle } from "lucide-react"; // Removido LogOut que não era usado aqui
import { Logo } from "../ui/Logo";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 md:px-8">
        {/* Logo otimizado para evitar problemas de LCP */}
        <div className="md:hidden flex items-center">
          {/* <Image 
            src="/padroniza-logo.png" 
            alt="Padroniza" 
            width={120} 
            height={32} 
            priority // Prioriza o carregamento por ser um elemento de topo
            className="h-8 w-auto object-contain"
          /> */}
          <Logo />
        </div>

        {/* Removido o conflito entre 'hidden' e 'flex' */}
        <div className="hidden md:block">
          <h2 className="text-sm font-medium text-muted">Painel Administrativo</h2>
        </div>

        <div className="flex items-center gap-4">
          {/* Removido 'hidden' e 'flex' simultâneos; agora usa sm:flex apenas para telas maiores */}
          <div className="hidden sm:flex flex-col items-end text-right">
            <span className="text-xs font-bold text-foreground leading-none">Consultor Master</span>
            <span className="text-[10px] text-muted">nara.adm</span>
          </div>
          
          <button className="rounded-full bg-muted/20 p-1 text-muted hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20">
            <UserCircle size={28} />
          </button>
        </div>
      </div>
    </header>
  );
}