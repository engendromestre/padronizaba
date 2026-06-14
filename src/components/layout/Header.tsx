// src/components/layout/Header.tsx
import { auth } from "@/lib/auth"
import { logout } from "@/lib/actions/auth"
import { LogOut, UserCircle } from "lucide-react"
import { Logo } from "../ui/Logo"

const roleLabel: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Administrador",
  CONSULTOR: "Consultor",
  CLIENTE: "Cliente",
}

export async function Header() {
  const session = await auth()
  const user = session?.user

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 md:px-8">

        <div className="md:hidden flex items-center">
          <Logo />
        </div>

        <div className="hidden md:block">
          <h2 className="text-sm font-medium text-muted">Painel Administrativo</h2>
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <div className="hidden sm:flex flex-col items-end text-right">
              <span className="text-xs font-bold text-foreground leading-none">
                {user.nome}
              </span>
              <span className="text-[10px] text-muted">
                {roleLabel[user.role] ?? user.role}
              </span>
            </div>
          )}

          <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            {user?.nome ? (
              <span className="text-xs font-black text-primary">
                {user.nome.charAt(0).toUpperCase()}
              </span>
            ) : (
              <UserCircle size={20} className="text-muted" />
            )}
          </div>

          {user && (
            <form action={logout}>
              <button
                type="submit"
                className="p-2 rounded-xl text-muted hover:text-primary hover:bg-primary/5 transition-all cursor-pointer"
                aria-label="Sair"
                title="Sair"
              >
                <LogOut size={17} />
              </button>
            </form>
          )}
        </div>

      </div>
    </header>
  )
}