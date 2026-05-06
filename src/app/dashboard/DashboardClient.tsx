"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

interface Consulta {
    id: string
    createdAt: Date
    dataAbate: Date
    qtdMachos: number
    qtdFemeas: number
    mediaArroba: number
    rcPercentual: number
    cliente: { nomeProdutor: string }
    fazenda: { nome: string }
    frigorifico: { nome: string }
    categoriaAnimal: { nome: string }
    whatsappLogs: { status: string; sentAt: Date }[]
}

interface Props {
    consultas: Consulta[]
}

export function DashboardClient({ consultas }: Props) {
    const [pendentes, setPendentes] = useState(0)

    useEffect(() => {
        async function contarPendentes() {
            try {
                const request = indexedDB.open("padronizaba-offline", 1)
                request.onsuccess = () => {
                    const db = request.result
                    if (!db.objectStoreNames.contains("consultas-pendentes")) return
                    const tx = db.transaction("consultas-pendentes", "readonly")
                    const store = tx.objectStore("consultas-pendentes")
                    const count = store.count()
                    count.onsuccess = () => setPendentes(count.result)
                }
            } catch { }
        }
        contarPendentes()
    }, [])

    function statusWhatsApp(logs: { status: string }[]) {
        if (logs.length === 0) return { cor: "gray", label: "Não enviado" }
        const status = logs[0].status
        if (status === "SENT") return { cor: "green", label: "Enviado ✅" }
        if (status === "FAILED") return { cor: "red", label: "Falhou ❌" }
        return { cor: "yellow", label: "Pendente ⏳" }
    }

    return (
        <div className="space-y-4 pb-8">
            {pendentes > 0 && (
                <div className="bg-amber-50 border border-amber-200 px-4 py-3 rounded-xl flex items-center gap-3">
                    <span className="text-amber-600 text-lg">📴</span>
                    <div>
                        <p className="text-sm font-medium text-amber-800">
                            {pendentes} consulta{pendentes > 1 ? "s" : ""} salva{pendentes > 1 ? "s" : ""} offline
                        </p>
                        <p className="text-xs text-amber-600">Será sincronizada quando houver conexão</p>
                    </div>
                </div>
            )}

            {consultas.length === 0 ? (
                <div className="text-center py-16">
                    <p className="text-4xl mb-3">🐄</p>
                    <p className="text-gray-500 text-sm">Nenhuma consulta registrada ainda.</p>
                    <Link
                        href="/consulta/nova"
                        className="mt-4 inline-block bg-green-600 text-white px-6 py-3 rounded-xl text-sm font-semibold"
                    >
                        Registrar primeira consulta
                    </Link>
                </div>
            ) : (
                <>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                        Últimas consultas
                    </p>
                    {consultas.map((c) => {
                        const { cor, label } = statusWhatsApp(c.whatsappLogs)
                        const qtdTotal = c.qtdMachos + c.qtdFemeas
                        return (
                            <Link
                                key={c.id}
                                href={`/consulta/${c.id}`}
                                className="block bg-white rounded-2xl border border-gray-100 p-4 shadow-sm"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-900 truncate">
                                            {c.cliente.nomeProdutor}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">
                                            {c.fazenda.nome} · {c.frigorifico.nome}
                                        </p>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full bg-${cor}-100 text-${cor}-700 whitespace-nowrap`}>
                                        {label}
                                    </span>
                                </div>

                                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                                    <div className="bg-gray-50 rounded-xl py-2">
                                        <p className="text-xs text-gray-400">Animais</p>
                                        <p className="font-bold text-gray-800">{qtdTotal}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl py-2">
                                        <p className="text-xs text-gray-400">Média</p>
                                        <p className="font-bold text-gray-800">{c.mediaArroba}@</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl py-2">
                                        <p className="text-xs text-gray-400">RC%</p>
                                        <p className="font-bold text-gray-800">{c.rcPercentual}%</p>
                                    </div>
                                </div>

                                <p className="text-xs text-gray-400 mt-2">
                                    {new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(c.dataAbate))} · {c.categoriaAnimal.nome}
                                </p>
                            </Link>
                        )
                    })}
                </>
            )}
        </div>
    )
}