"use client"

import { Input } from "@/components/ui/form"
import { Button } from "@/components/ui/form/Button"
import { SelectControlled } from "@/components/ui/form/Select"
import { X } from "lucide-react"
import { useEffect, useState } from "react"
import { FrigorificoItem } from "../columns"

interface EditFrigorificoModalProps {
    frigorifico?: FrigorificoItem | null
    onClose: () => void
    onSalvo: (frigorifico: FrigorificoItem) => void
    addToast: (type: "success" | "error", message: string) => void
}

interface EstadoOption {
    id: string
    nome: string
    uf: string
}

interface CidadeOption {
    id: string
    nome: string
}

export function EditFrigorificoModal({ frigorifico, onClose, onSalvo, addToast }: EditFrigorificoModalProps) {
    const [nome, setNome] = useState(frigorifico?.nome ?? "")
    const [cnpj, setCnpj] = useState(frigorifico?.cnpj ?? "")
    const [estadoId, setEstadoId] = useState(frigorifico?.cidade.estado.id ?? "")
    const [cidadeId, setCidadeId] = useState(frigorifico?.cidade.id ?? "")
    const [estados, setEstados] = useState<EstadoOption[]>([])
    const [cidades, setCidades] = useState<CidadeOption[]>([])
    const [loading, setLoading] = useState(false)
    const isEdicao = !!frigorifico

    useEffect(() => {
        fetch("/api/estados")
            .then((r) => r.json())
            .then(setEstados)
            .catch(() => addToast("error", "Erro ao carregar estados."))
    }, [addToast])

    useEffect(() => {
        if (!estadoId) return
        fetch(`/api/estados/${estadoId}/cidades`)
            .then((r) => r.json())
            .then(setCidades)
            .catch(() => addToast("error", "Erro ao carregar cidades."))
    }, [estadoId, addToast])

    async function handleSalvar() {
        if (!nome.trim() || !cidadeId) return

        setLoading(true)
        try {
            const res = await fetch(
                isEdicao ? `/api/frigorificos/${frigorifico.id}` : "/api/frigorificos",
                {
                    method: isEdicao ? "PATCH" : "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ nome: nome.trim(), cnpj: cnpj.trim() || null, cidadeId }),
                }
            )

            const json = await res.json()

            if (!res.ok) {
                addToast("error", json.error ?? "Erro ao salvar frigorífico.")
                return
            }

            addToast("success", isEdicao ? "Frigorífico atualizado." : "Frigorífico criado.")
            onSalvo(json)
            onClose()
        } catch {
            addToast("error", "Erro de conexão. Tente novamente.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900">
                        {isEdicao ? "Editar Frigorífico" : "Novo Frigorífico"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                    >
                        <X size={15} />
                    </button>
                </div>

                <Input
                    label="Nome do Frigorífico"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Frigobom, JBS, Marfrig..."
                    autoComplete="off"
                />

                <Input
                    label="CNPJ (opcional)"
                    value={cnpj}
                    onChange={(e) => setCnpj(e.target.value)}
                    placeholder="00.000.000/0000-00"
                    autoComplete="off"
                />

                <SelectControlled
                    label="Estado"
                    value={estadoId}
                    onChange={(e) => { setEstadoId(e.target.value); setCidades([]); setCidadeId("") }}
                    options={estados.map((e) => ({ value: e.id, label: `${e.nome} (${e.uf})` }))}
                    placeholder="Selecione um estado..."
                />

                <SelectControlled
                    label="Cidade"
                    value={cidadeId}
                    onChange={(e) => setCidadeId(e.target.value)}
                    options={cidades.map((c) => ({ value: c.id, label: c.nome }))}
                    placeholder="Selecione uma cidade..."
                    disabled={!estadoId}
                />

                <div className="flex gap-3 pt-2">
                    <Button variant="outline" onClick={onClose} disabled={loading} fullWidth>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSalvar}
                        loading={loading}
                        disabled={!nome.trim() || !cidadeId}
                        fullWidth
                    >
                        {isEdicao ? "Salvar" : "Criar"}
                    </Button>
                </div>
            </div>
        </div>
    )
}