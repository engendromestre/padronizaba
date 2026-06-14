import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
        }

        const { id } = await params
        const { role, id: userId, empresaId, clienteId } = session.user

        // Filtro por role
        const filtroRole = (() => {
            switch (role) {
                case "SUPER_ADMIN":
                    return {}
                case "ADMIN":
                    return { empresaId: empresaId! }
                case "CONSULTOR":
                    return { empresaId: empresaId!, consultorId: userId }
                case "CLIENTE":
                    return { clienteId: clienteId! }
                default:
                    return { id: "none" }
            }
        })()

        const consulta = await prisma.consulta.findFirst({
            where: {
                id,
                ...filtroRole,
                status: "ENVIADA",  // 👈 não retorna canceladas
                deletedAt: null,    // 👈 soft delete
            },
            include: {
                cliente: {
                    include: {
                        grupos: { where: { ativo: true } },
                    },
                },
                fazenda: {
                    include: {
                        cidade: { include: { estado: true } }
                    }
                },
                frigorifico: { include: { cidade: true } },
                categoriaAnimal: true,
                consultor: {
                    select: {
                        id: true,
                        nome: true,
                        email: true
                    }
                },
            },
        })

        if (!consulta) {
            return NextResponse.json({ error: "Consulta não encontrada" }, { status: 404 })
        }

        return NextResponse.json(consulta)
    } catch (error) {
        console.error("Erro ao buscar consulta detalhada:", error)
        return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 })
    }
}