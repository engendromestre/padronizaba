// src/app/(dashboard)/config/empresas/page.tsx
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { EmpresasClient } from "./components/EmpresasClient"


export default async function EmpresasPage() {
  const session = await auth()

  if (!session?.user || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
    redirect("/dashboard")
  }

  const isSuperAdmin = session.user.role === "SUPER_ADMIN"

  const where = isSuperAdmin
    ? { deletedAt: null }
    : { id: session.user.empresaId ?? "", deletedAt: null }

  const [empresas, estados] = await Promise.all([
    prisma.empresa.findMany({
      where,
      include: { estado: { select: { nome: true, uf: true } } },
      orderBy: { nome: "asc" },
    }),
    prisma.estado.findMany({
      orderBy: { nome: "asc" },
      select: { id: true, nome: true, uf: true },
    }),
  ])

  return (
    <EmpresasClient
      initialEmpresas={empresas}
      estados={estados}
      isSuperAdmin={isSuperAdmin}
    />
  )
}