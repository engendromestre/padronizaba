// src/components/layout/Header.tsx
import { auth } from "@/lib/auth"
import { Logo } from "../ui/Logo"
import { UserMenu } from "../ui/UserMenu"

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

        {user && (
          <UserMenu nome={user.nome} role={user.role} />
        )}
      </div>
    </header>
  )
}