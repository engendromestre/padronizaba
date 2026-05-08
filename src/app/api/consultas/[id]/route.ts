import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params

    const consulta = await prisma.consulta.findUnique({
        where: { id },
        include: {
            cliente: {
                include: {
                    grupos: { where: { ativo: true } },
                },
            },
            fazenda: { include: { cidade: { include: { estado: true } } } },
            frigorifico: { include: { cidade: true } },
            categoriaAnimal: true,
            consultor: true,
        },
    })

    if (!consulta) return NextResponse.json({ error: "Not found" }, { status: 404 })

    return NextResponse.json(consulta)
}