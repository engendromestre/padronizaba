"use client";

import { dashboardNavigation } from "@/config/navigation";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "../ui/Logo";
import { useSidebar } from "./SidebarContext";

export function Sidebar() {
  const { isCollapsed, toggle } = useSidebar();
  const { data: session } = useSession();
  const pathname = usePathname();

  if (session === undefined) {
    return <div className="w-64 bg-white border-r border-gray-200 h-screen animate-pulse" />;
  }

  if (!session?.user?.role) {
    return null; 
  }

  // Filtra o menu baseado na role guardada na sessão
  const userRole = session!.user!.role;
  const menuItems = dashboardNavigation.filter(item => item.allowedRoles.includes(userRole));

  // Função responsável por limpar os rastros offline e deslogar com segurança
  async function handleLogout() {
    // 1. Remove o cache do dispositivo para evitar falsos positivos offline
    localStorage.removeItem("@padroniza:identity");

    // 2. Destrói o cookie de sessão HTTP-Only e joga o consultor na tela de login
    await signOut({
      redirectTo: "/login"
    });
  }

  return (
    <aside
      className={`hidden md:flex fixed left-0 top-0 h-full flex-col border-r border-border bg-card transition-all duration-300 ease-in-out z-50 ${isCollapsed ? "w-20" : "w-64"
        }`}
    >
      <button
        onClick={toggle}
        className="absolute -right-3 top-10 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted hover:text-primary shadow-sm cursor-pointer"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <div className="p-6 overflow-hidden">
        <Logo showText={!isCollapsed} />
      </div>

      <nav className="flex-1 space-y-2 px-3">
        {menuItems.map((item) => {
          const isActive = item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-all group ${isActive
                ? "bg-primary/10 text-primary font-bold shadow-xs"
                : "text-muted hover:bg-primary/5 hover:text-primary"
                }`}
              title={isCollapsed ? item.label : ""}
            >
              <item.icon
                size={22}
                className={`shrink-0 transition-transform group-hover:scale-110 ${isActive ? "text-primary" : "text-muted group-hover:text-primary"
                  }`}
              />
              <span className={`transition-opacity duration-300 whitespace-nowrap ${isCollapsed ? "opacity-0 w-0" : "opacity-100"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Seção inferior onde fica o botão de logout */}
      <div className="mb-2 h-20 mt-auto border-t border-border overflow-hidden flex items-center px-4">
        <button
          onClick={handleLogout} // 🔌 Acoplado a ação de logout aqui
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-muted hover:bg-red-50 hover:text-red-600 transition-all group cursor-pointer"
          title={isCollapsed ? "Sair do Sistema" : ""}
        >
          <LogOut size={22} className="shrink-0 group-hover:translate-x-1 transition-transform" />
          <span className={`transition-opacity duration-300 whitespace-nowrap ${isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}`}>
            Sair
          </span>
        </button>
      </div>
    </aside>
  );
}