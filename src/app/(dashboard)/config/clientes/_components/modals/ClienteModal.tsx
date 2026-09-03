"use client"

import { Input, SelectField, SubmitButton } from "@/components/ui/form"
import { ClienteForm, clienteSchema } from "@/lib/validacoes/cliente"
import { zodResolver } from "@hookform/resolvers/zod"
import { RefreshCw, Trash2, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { ClienteItem } from "../columns"
import { MaskedField } from "@/components/ui/form/MaskedInput"

interface Empresa {
    id: string
    nome: string
}

interface ClienteModalProps {
    cliente?: ClienteItem | null
    empresas: Empresa[]
    onClose: () => void
    onSuccess: () => void
}

interface GrupoDisponivel {
    groupIdWhatsapp: string
    nomeGrupo: string
    vinculadoA: string | null
}

interface GrupoVinculado {
    id: string
    nomeGrupo: string
    groupIdWhatsapp: string
}

function GruposWhatsappSection({ clienteId }: { clienteId: string }) {
    const [gruposVinculados, setGruposVinculados] = useState<GrupoVinculado[]>([])
    const [gruposDisponiveis, setGruposDisponiveis] = useState<GrupoDisponivel[]>([])
    const [carregandoInicial, setCarregandoInicial] = useState(true)
    const [vinculando, setVinculando] = useState(false)
    const [sincronizando, setSincronizando] = useState(false)
    const [selecionado, setSelecionado] = useState("")
    const [erro, setErro] = useState<string | null>(null)

    const requisicaoIdRef = useRef(0)

    async function carregar(mostrarLoadingInicial: boolean) {
        const idDestaChamada = ++requisicaoIdRef.current

        if (mostrarLoadingInicial) setCarregandoInicial(true)
        try {
            const [resVinculados, resDisponiveis] = await Promise.all([
                fetch(`/api/clientes/${clienteId}/grupos`),
                fetch(`/api/evolution/grupos`),
            ])

            if (idDestaChamada !== requisicaoIdRef.current) return

            if (resVinculados.ok) setGruposVinculados(await resVinculados.json())
            if (resDisponiveis.ok) setGruposDisponiveis(await resDisponiveis.json())
        } finally {
            if (mostrarLoadingInicial && idDestaChamada === requisicaoIdRef.current) {
                setCarregandoInicial(false)
            }
        }
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch inicial com loading state; padrão intencional
        carregar(true)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [clienteId])

    async function vincular(groupIdWhatsapp: string, nomeGrupo: string) {
        setVinculando(true)
        setErro(null)
        try {
            const res = await fetch(`/api/clientes/${clienteId}/grupos`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ groupIdWhatsapp, nomeGrupo }),
            })
            const json = await res.json().catch(() => ({}))

            if (!res.ok) {
                setErro(json.error ?? "Erro ao vincular grupo.")
                setSelecionado("")
                return
            }

            setSelecionado("")
            await carregar(false)
        } catch {
            setErro("Erro de conexão ao vincular grupo.")
            setSelecionado("")
        } finally {
            setVinculando(false)
        }
    }

    async function desvincular(grupoId: string) {
        setErro(null)

        const backup = gruposVinculados
        setGruposVinculados((atual) => atual.filter((g) => g.id !== grupoId))

        const res = await fetch(`/api/clientes/${clienteId}/grupos/${grupoId}`, { method: "DELETE" })

        if (!res.ok) {
            setGruposVinculados(backup)
            const json = await res.json().catch(() => ({}))
            setErro(json.error ?? "Erro ao desvincular grupo.")
            return
        }

        await carregar(false)
    }

    async function sincronizar() {
        setSincronizando(true)
        setErro(null)
        try {
            const res = await fetch("/api/evolution/grupos/sincronizar", { method: "POST" })
            const json = await res.json().catch(() => ({}))
            if (!res.ok) {
                setErro(json.error ?? "Erro ao sincronizar grupos.")
                return
            }
            await carregar(false)
        } catch {
            setErro("Erro de conexão ao sincronizar.")
        } finally {
            setSincronizando(false)
        }
    }

    const idsJaVinculadosGlobalmente = new Set(
        gruposDisponiveis.filter((g) => g.vinculadoA).map((g) => g.groupIdWhatsapp)
    )
    const idsJaVinculadosAoCliente = new Set(gruposVinculados.map((g) => g.groupIdWhatsapp))

    const opcoesParaAdicionar = gruposDisponiveis.filter(
        (g) => !idsJaVinculadosGlobalmente.has(g.groupIdWhatsapp) && !idsJaVinculadosAoCliente.has(g.groupIdWhatsapp)
    )

    return (
        <div className="space-y-3 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-data-label uppercase tracking-wider ml-1">
                    Grupos de WhatsApp
                </label>
                <button
                    type="button"
                    onClick={sincronizar}
                    disabled={sincronizando}
                    className="flex items-center gap-1 text-[10px] font-semibold text-primary hover:underline disabled:opacity-50 cursor-pointer"
                >
                    <RefreshCw size={11} className={sincronizando ? "animate-spin" : ""} />
                    {sincronizando ? "Sincronizando..." : "Sincronizar"}
                </button>
            </div>

            {carregandoInicial ? (
                <p className="text-xs text-muted">Carregando grupos...</p>
            ) : (
                <>
                    {gruposVinculados.length > 0 && (
                        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                            {gruposVinculados.map((g) => (
                                <div
                                    key={g.id}
                                    className="flex items-center justify-between p-3 rounded-xl border border-primary bg-primary/5"
                                >
                                    <span className="text-sm font-bold text-slate-900">{g.nomeGrupo}</span>
                                    <button
                                        type="button"
                                        onClick={() => desvincular(g.id)}
                                        className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {opcoesParaAdicionar.length > 0 ? (
                        <select
                            disabled={vinculando}
                            value={selecionado}
                            onChange={(e) => {
                                const id = e.target.value
                                setSelecionado(id)
                                const grupo = opcoesParaAdicionar.find((g) => g.groupIdWhatsapp === id)
                                if (grupo) vincular(grupo.groupIdWhatsapp, grupo.nomeGrupo)
                            }}
                            className="w-full border border-dashed border-primary/40 bg-primary/5 text-primary text-sm rounded-xl p-2.5"
                        >
                            <option value="" disabled>+ Vincular grupo do WhatsApp</option>
                            {opcoesParaAdicionar.map((g) => (
                                <option key={g.groupIdWhatsapp} value={g.groupIdWhatsapp}>
                                    {g.nomeGrupo}
                                </option>
                            ))}
                        </select>
                    ) : (
                        gruposDisponiveis.length === 0 && (
                            <p className="text-xs text-muted">
                                Nenhum grupo sincronizado ainda. Clique em &quot;Sincronizar&quot; para buscar os grupos do WhatsApp.
                            </p>
                        )
                    )}

                    {erro && (
                        <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl">
                            <p className="text-xs font-bold text-primary">⚠️ {erro}</p>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export function ClienteModal({ cliente, empresas, onClose, onSuccess }: ClienteModalProps) {
    const isEditing = !!cliente
    const [apiError, setApiError] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<ClienteForm>({
        resolver: zodResolver(clienteSchema),
        defaultValues: {
            nomeProdutor: cliente?.nomeProdutor ?? "",
            empresaId: cliente?.empresaId ?? "",
            documento: cliente?.documento ?? "",
        },
    })

    useEffect(() => {
        reset({
            nomeProdutor: cliente?.nomeProdutor ?? "",
            empresaId: cliente?.empresaId ?? "",
            documento: cliente?.documento ?? "",
        })
    }, [cliente, reset])

    async function onSubmit(data: ClienteForm) {
        setApiError(null)
        try {
            const url = isEditing ? `/api/clientes/${cliente.id}` : "/api/clientes"
            const method = isEditing ? "PUT" : "POST"

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })

            const json = await res.json()

            if (!res.ok) {
                setApiError(json.error ?? "Erro ao salvar cliente.")
                return
            }

            onSuccess()
            onClose()
        } catch {
            setApiError("Erro de conexão. Tente novamente.")
        }
    }

    const empresasOptions = empresas.map((e) => ({
        value: e.id,
        label: `${e.nome}`,
    }))

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-border">
                    <div>
                        <h2 className="text-sm font-bold text-foreground">
                            {isEditing ? "Editar Cliente" : "Novo Cliente"}
                        </h2>
                        <p className="text-xs text-muted mt-0.5">
                            {isEditing ? "Atualize os dados do cliente." : "Preencha os dados para cadastrar."}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-xl text-muted hover:text-foreground hover:bg-muted/10 transition-all cursor-pointer"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
                    <MaskedField
                        mask="cpf-cnpj"
                        label="CPF / CNPJ do Produtor"
                        registration={register("documento")}
                        error={errors.documento}
                        placeholder="000.000.000-00 ou 00.000.000/0000-00"
                        required
                    />

                    <Input
                        label="Nome do Cliente"
                        registration={register("nomeProdutor")}
                        error={errors.nomeProdutor}
                        placeholder="Ex: José da Silva"
                        required
                    />

                    <SelectField
                        label="Empresa" // 💡 Corrigido de "Estado" para "Empresa"
                        registration={register("empresaId")}
                        error={errors.empresaId}
                        options={empresasOptions}
                        placeholder="Selecione a empresa deste Cliente"
                        required
                    />

                    {isEditing && cliente && (
                        <GruposWhatsappSection clienteId={cliente.id} />
                    )}

                    {apiError && (
                        <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl">
                            <p className="text-xs font-bold text-primary">⚠️ {apiError}</p>
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 border border-border rounded-2xl text-sm font-semibold text-muted hover:bg-muted/5 transition-all cursor-pointer"
                        >
                            Cancelar
                        </button>
                        <div className="flex-1">
                            <SubmitButton
                                label={isEditing ? "Salvar alterações" : "Cadastrar cliente"}
                                loadingLabel="Salvando..."
                                loading={isSubmitting}
                            />
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}