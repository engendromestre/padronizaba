"use client"

import { ComboboxField, Input, SelectField, SubmitButton } from "@/components/ui/form"
import { FazendaForm, fazendaSchema } from "@/lib/validacoes/fazenda"
import { zodResolver } from "@hookform/resolvers/zod"
import { X } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { FazendaItem } from "../columns"

const fazendaModalSchema = fazendaSchema.extend({
    estadoId: z.string().min(1, "Selecione um estado."),
})

type FazendaModalForm = z.infer<typeof fazendaModalSchema>

export interface ClienteOption {
    id: string
    nomeProdutor: string
    documento: string
    empresa?: { nome: string }
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

interface FazendaModalProps {
    fazenda?: FazendaItem | null
    clientes: ClienteOption[]
    estados: EstadoOption[]
    onClose: () => void
    onSalvo: (fazenda: FazendaItem) => void
}

function formatarDocumento(doc: string) {
    const d = doc.replace(/\D/g, "")
    if (d.length === 11) return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
    if (d.length === 14) return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")
    return doc
}

export function FazendaModal({ fazenda, clientes, estados, onClose, onSalvo }: FazendaModalProps) {
    const isEditing = !!fazenda
    const [apiError, setApiError] = useState<string | null>(null)
    const [cidades, setCidades] = useState<CidadeOption[]>(
        fazenda ? [{ id: fazenda.cidadeId, nome: fazenda.cidade.nome }] : []
    )
    const [loadingCidades, setLoadingCidades] = useState(false)

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<FazendaModalForm>({
        resolver: zodResolver(fazendaModalSchema),
        defaultValues: {
            nome: fazenda?.nome ?? "",
            clienteId: fazenda?.clienteId ?? "",
            cidadeId: fazenda?.cidadeId ?? "",
            estadoId: fazenda?.cidade.estado.id ?? "",
        },
    })

    const estadoId = watch("estadoId")
    const estadoInicialRef = useRef(fazenda?.cidade.estado.id ?? "")

    useEffect(() => {
        if (!estadoId) {
            setCidades([])
            return
        }

        if (estadoInicialRef.current !== estadoId) {
            estadoInicialRef.current = estadoId
            setValue("cidadeId", "")
            setCidades([])
        }

        let cancelado = false
        setLoadingCidades(true)

        fetch(`/api/cidades?estadoId=${encodeURIComponent(estadoId)}`)
            .then((res) => res.json())
            .then((data) => {
                if (cancelado) return
                setCidades(Array.isArray(data) ? data : [])
            })
            .catch(() => {
                if (!cancelado) setCidades([])
            })
            .finally(() => {
                if (!cancelado) setLoadingCidades(false)
            })

        return () => {
            cancelado = true
        }
    }, [estadoId, setValue])

    const clientesOptions = useMemo(
        () =>
            clientes.map((c) => ({
                value: c.id,
                label: c.nomeProdutor,
                sublabel: [formatarDocumento(c.documento), c.empresa?.nome].filter(Boolean).join(" · "),
            })),
        [clientes]
    )

    const estadosOptions = estados.map((e) => ({
        value: e.id,
        label: `${e.nome} (${e.uf})`,
    }))

    const cidadesOptions = cidades.map((c) => ({
        value: c.id,
        label: c.nome,
    }))

    async function onSubmit(data: FazendaModalForm) {
        setApiError(null)
        const payload: FazendaForm = {
            nome: data.nome,
            clienteId: data.clienteId,
            cidadeId: data.cidadeId,
        }

        try {
            const url = isEditing ? `/api/fazendas/${fazenda.id}` : "/api/fazendas"
            const method = isEditing ? "PUT" : "POST"

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })

            const json = await res.json()

            if (!res.ok) {
                setApiError(typeof json.error === "string" ? json.error : "Erro ao salvar fazenda.")
                return
            }

            onSalvo(json)
            onClose()
        } catch {
            setApiError("Erro de conexão. Tente novamente.")
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-xl animate-in fade-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 duration-200">
                <div className="flex items-center justify-between p-5 border-b border-border">
                    <div>
                        <h2 className="text-sm font-bold text-foreground">
                            {isEditing ? "Editar Fazenda" : "Nova Fazenda"}
                        </h2>
                        <p className="text-xs text-muted mt-0.5">
                            {isEditing ? "Atualize os dados da propriedade." : "Preencha os dados para cadastrar."}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-xl text-muted hover:text-foreground hover:bg-muted/10 transition-all cursor-pointer"
                    >
                        <X size={16} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
                    <Input
                        label="Nome da fazenda"
                        registration={register("nome")}
                        error={errors.nome}
                        placeholder="Ex: Fazenda Santa Rita"
                        required
                    />

                    <Controller
                        name="clienteId"
                        control={control}
                        render={({ field }) => (
                            <ComboboxField
                                label="Cliente"
                                value={field.value}
                                onChange={field.onChange}
                                error={errors.clienteId}
                                options={clientesOptions}
                                placeholder="Buscar cliente..."
                                emptyMessage="Nenhum cliente cadastrado."
                                required
                            />
                        )}
                    />

                    <SelectField
                        label="Estado"
                        registration={register("estadoId")}
                        error={errors.estadoId}
                        options={estadosOptions}
                        placeholder="Selecione o estado"
                        required
                    />

                    <Controller
                        name="cidadeId"
                        control={control}
                        render={({ field }) => (
                            <ComboboxField
                                label="Cidade"
                                value={field.value}
                                onChange={field.onChange}
                                error={errors.cidadeId}
                                options={cidadesOptions}
                                placeholder={!estadoId ? "Selecione o estado primeiro" : "Buscar cidade..."}
                                emptyMessage="Nenhuma cidade cadastrada neste estado."
                                disabled={!estadoId}
                                loading={loadingCidades}
                                required
                            />
                        )}
                    />

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
                                label={isEditing ? "Salvar alterações" : "Cadastrar fazenda"}
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
