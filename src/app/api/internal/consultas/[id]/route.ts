import { chaveInternaValida } from "@/lib/internal-auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!chaveInternaValida(req)) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id } = await params

    const consulta = await prisma.consulta.findFirst({
        where: { id, status: "ENVIADA", deletedAt: null },
        include: {
            cliente: { select: { id: true, nomeProdutor: true } },
            fazenda: { include: { cidade: { include: { estado: true } } } },
            frigorifico: { include: { cidade: { include: { estado: true } } } },
            categoriaAnimal: true,
            consultor: { select: { id: true, nome: true } },
            // Grupos que devem receber a mensagem: dono + parceiros (calculado no POST)
            gruposNotificados: {
                where: { ativo: true, deletedAt: null },
                select: { id: true, nomeGrupo: true, groupIdWhatsapp: true },
            },
            parceiros: { include: { cliente: { select: { nomeProdutor: true } } } },
        },
    })

    if (!consulta) {
        return NextResponse.json({ error: "Consulta não encontrada" }, { status: 404 })
    }

    return NextResponse.json(consulta)
}