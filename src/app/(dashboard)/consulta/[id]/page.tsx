import { auth } from "@/lib/auth"
import { formatarArroba, formatarKg, formatarPercentual } from "@/lib/formatters"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"

interface Props {
    params: Promise<{ id: string }>
}

export default async function ConsultaDetalhe({ params }: Props) {
    const { id } = await params
    const session = await auth()
    if (!session) redirect("/login")

    const consulta = await prisma.consulta.findFirst({
        where: { id, empresaId: session.user.empresaId || "" },
        include: {
            cliente: true,
            fazenda: { include: { cidade: { include: { estado: true } } } },
            frigorifico: { include: { cidade: { include: { estado: true } } } },
            categoriaAnimal: true,
            consultor: true,
            whatsappLogs: { orderBy: { sentAt: "desc" } },
        },
    })

    if (!consulta) notFound()

    const qtdTotal = Number(consulta.qtdAnimais || 0)
    const dataAbate = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(consulta.dataAbate))

    const tipoAnimal = consulta.sexoAnimais === "MACHO" ? "Machos" : "Fêmeas"

    const templateWhatsApp = `📢 Padroniza Informa
🐂 Prévia do abate de ${qtdTotal} ${tipoAnimal} ${consulta.categoriaAnimal.nome} - ${consulta.cliente.nomeProdutor} - ${consulta.fazenda.nome} - ${consulta.frigorifico.nome} - ${consulta.frigorifico.cidade.nome} - ${dataAbate} 
Peso vivo: ${formatarKg(consulta.pesoVivoKg)}
Peso total do lote: ${formatarKg(consulta.pesoTotalLoteKg)}
Carcaça: ${formatarKg(consulta.pesoCarcacaKg)}
Média: ${consulta.mediaArroba}@
RC: ${formatarPercentual(consulta.rcPercentual)}
🦷 Maturidade ${[
            consulta.dentes0 > 0 ? `\n0 dentes: ${consulta.dentes0} animais` : "",
            consulta.dentes2 > 0 ? `\n2 dentes: ${consulta.dentes2} animais` : "",
            consulta.dentes4 > 0 ? `\n4 dentes: ${consulta.dentes4} animais` : "",
            consulta.dentes6 > 0 ? `\n6 dentes: ${consulta.dentes6} animais` : "",
            consulta.dentes8 > 0 ? `\n8 dentes: ${consulta.dentes8} animais` : "",
        ].join("")}
🥩 Acabamento ${[
            consulta.gordura1 > 0 ? `\n1 ausente: ${consulta.gordura1} carcaças` : "",
            consulta.gordura2 > 0 ? `\n2 escasso: ${consulta.gordura2} carcaças` : "",
            consulta.gordura3 > 0 ? `\n3 mediano: ${consulta.gordura3} carcaças` : "",
            consulta.gordura4 > 0 ? `\n4 uniforme: ${consulta.gordura4} carcaças` : "",
            consulta.gordura5 > 0 ? `\n5 excessivo: ${consulta.gordura5} carcaças` : "",
        ].join("")}
🔍 Informações adicionais:
❌ Penalizações:
- ${consulta.penalizacoes || "não houve."}
⚠️ D.I.F
- ${consulta.dif || "não houve."}
❗️ Escore ruminal: ${consulta.escoreRuminal || "-"}
💉 Perda vacinal média/cabeça: ${consulta.perdaVacinalKg ?? "-"}kg/cabeça
🐮 Bezerros:
P - ${consulta.bezerrosP}
M - ${consulta.bezerrosM}
G - ${consulta.bezerrosG}
💰 Contaminações: ${consulta.contaminacaoGiKg ?? "-"}kg
🩸 Hematomas: ${consulta.hematomasKg ?? "-"}kg`

    const ultimoLog = consulta.whatsappLogs[0]

    return (
        <main className="min-h-screen bg-gray-50 pb-8">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-4 z-10">
                <div className="max-w-lg mx-auto flex items-center gap-3">
                    <Link href="/dashboard" className="text-gray-400 hover:text-gray-600">←</Link>
                    <h1 className="text-lg font-semibold text-gray-900">Detalhes da Consulta</h1>
                </div>
            </div>

            <div className="max-w-lg mx-auto px-4 pt-4 space-y-4">

                {/* Status WhatsApp */}
                <div className={`px-4 py-3 rounded-xl text-sm font-medium ${!ultimoLog ? "bg-gray-100 text-gray-600" :
                    ultimoLog.status === "SENT" ? "bg-green-50 text-primary-700" :
                        "bg-red-50 text-red-700"
                    }`}>
                    {!ultimoLog ? "⏳ Mensagem ainda não enviada" :
                        ultimoLog.status === "SENT" ? "✅ Mensagem enviada com sucesso" :
                            "❌ Falha no envio da mensagem"}
                </div>

                {/* Identificação */}
                <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-2">
                    <p className="text-xs text-gray-400 font-medium uppercase">Identificação</p>
                    <p className="font-semibold text-gray-900">{consulta.cliente.nomeProdutor}</p>
                    <p className="text-sm text-gray-600">{consulta.fazenda.nome}</p>
                    <p className="text-sm text-gray-600">{consulta.frigorifico.nome} — {consulta.frigorifico.cidade.nome}/{consulta.frigorifico.cidade.estado.uf}</p>
                    <p className="text-sm text-gray-600">{dataAbate} · {consulta.categoriaAnimal.nome}</p>
                </div>

                {/* Peso e Rendimento */}
                <div className="bg-white rounded-2xl border border-gray-100 p-4">
                    <p className="text-xs text-gray-400 font-medium uppercase mb-3">Peso e Rendimento</p>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { label: "Animais", value: `${qtdTotal} cab ${tipoAnimal}` },
                            { label: "Peso Vivo Médio", value: formatarKg(consulta.pesoVivoKg) },
                            { label: "Peso Total Lote", value: formatarKg(consulta.pesoTotalLoteKg) },
                            { label: "Carcaça Média", value: formatarKg(consulta.pesoCarcacaKg) },
                            { label: "Média", value: formatarArroba(consulta.mediaArroba) },
                            { label: "RC%", value: formatarPercentual(consulta.rcPercentual) },
                        ].map((item) => (
                            <div key={item.label} className="bg-gray-50 rounded-xl p-3">
                                <p className="text-xs text-gray-400">{item.label}</p>
                                <p className="font-bold text-gray-900">{item.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Template WhatsApp */}
                <div className="bg-white rounded-2xl border border-gray-100 p-4">
                    <p className="text-xs text-gray-400 font-medium uppercase mb-3">Preview da Mensagem</p>
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans bg-gray-50 p-3 rounded-xl">
                        {templateWhatsApp}
                    </pre>
                </div>

            </div>
        </main>
    )
}