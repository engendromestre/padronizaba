"use client"

import { useSidebar } from "./SidebarContext"
import { BottomNav } from "../ui/Navigation"
import { Header } from "./Header"
import { Sidebar } from "./Sidebar"

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar()

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar Fixa Lateral */}
      <Sidebar />

      {/* Container Principal: Ajusta o espaçamento esquerdo dinamicamente */}
      <div 
        className={`
          flex flex-1 flex-col min-w-0
          transition-all duration-300 ease-in-out
          ${isCollapsed ? "md:pl-20" : "md:pl-64"}
        `}
      >
        {/* O Header Global fica fixo aqui, sempre visível no topo da tela */}
        <Header />
        
        {/* Área de conteúdo da página */}
        <main className="flex-1 w-full invisible-scrollbar">
          {children}
        </main>

        {/* Menu inferior para Mobile */}
        <BottomNav />
      </div>
    </div>
  )
}