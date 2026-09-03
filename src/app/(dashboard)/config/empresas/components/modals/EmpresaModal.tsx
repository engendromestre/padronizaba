"use client"

import { Input, SelectField, SubmitButton } from "@/components/ui/form"
import { EmpresaForm, empresaSchema } from "@/lib/validacoes/empresa"
import { zodResolver } from "@hookform/resolvers/zod"
import { X } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"


interface Estado {
    id: string
    nome: string
    uf: string
}

interface EmpresaItem {
    id: string
    nome: string
    estadoId: string
}

interface EmpresaModalProps {
    empresa?: EmpresaItem | null
    estados: Estado[]
    onClose: () => void
    onSuccess: () => void
}

export function EmpresaModal({ empresa, estados, onClose, onSuccess }: EmpresaModalProps) {
    const isEditing = !!empresa
    const [apiError, setApiError] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<EmpresaForm>({
        resolver: zodResolver(empresaSchema),
        defaultValues: {
            nome: empresa?.nome ?? "",
            estadoId: empresa?.estadoId ?? "",
        },
    })

    useEffect(() => {
        reset({
            nome: empresa?.nome ?? "",
            estadoId: empresa?.estadoId ?? "",
        })
    }, [empresa, reset])

    async function onSubmit(data: EmpresaForm) {
        setApiError(null)
        try {
            const url = isEditing ? `/api/empresas/${empresa.id}` : "/api/empresas"
            const method = isEditing ? "PUT" : "POST"

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })

            const json = await res.json()

            if (!res.ok) {
                setApiError(json.error ?? "Erro ao salvar empresa.")
                return
            }

            onSuccess()
            onClose()
        } catch {
            setApiError("Erro de conexão. Tente novamente.")
        }
    }

    const estadosOptions = estados.map((e) => ({
        value: e.id,
        label: `${e.nome} (${e.uf})`,
    }))

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-xl animate-in fade-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-border">
                    <div>
                        <h2 className="text-sm font-bold text-foreground">
                            {isEditing ? "Editar Empresa" : "Nova Empresa"}
                        </h2>
                        <p className="text-xs text-muted mt-0.5">
                            {isEditing ? "Atualize os dados da empresa." : "Preencha os dados para cadastrar."}
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
                    <Input
                        label="Nome da empresa"
                        registration={register("nome")}
                        error={errors.nome}
                        placeholder="Ex: Agropecuária Vale Verde"
                        required
                    />

                    <SelectField
                        label="Estado"
                        registration={register("estadoId")}
                        error={errors.estadoId}
                        options={estadosOptions}
                        placeholder="Selecione o estado"
                        required
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
                                label={isEditing ? "Salvar alterações" : "Cadastrar empresa"}
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