import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user?.empresaId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params

        const consulta = await prisma.consulta.findUnique({
            where: { 
                id,
                // Segurança: Garante que o consultor só veja consultas da própria empresa
                empresaId: session.user.empresaId 
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
                    select: { // Segurança: Não expor o hash da senha por acidente
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