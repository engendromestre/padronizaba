"use client"

import { useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { Mail, User, CheckCircle2, Copy, Check } from "lucide-react"
import { conviteSchema, ConviteForm } from "@/lib/schemas/convite"
import {
  Input,
  Select,
  FormSection,
  SubmitButton,
} from "@/components/ui/form"

interface Empresa {
  id: string
  nome: string
}

interface Cliente {
  id: string
  nomeProdutor: string
  empresaId: string
}

interface FormConviteProps {
  empresas: Empresa[]
  clientes: Cliente[]
}

const ROLE_OPTIONS = [
  { value: "ADMIN", label: "Administrador" },
  { value: "CONSULTOR", label: "Consultor" },
  { value: "CLIENTE", label: "Cliente" },
]

export function FormConvite({ empresas, clientes }: FormConviteProps) {
  const router = useRouter()
  const [linkAtivacao, setLinkAtivacao] = useState<string | null>(null)
  const [emailEnviado, setEmailEnviado] = useState(false)
  const [copiado, setCopiado] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ConviteForm>({
    resolver: zodResolver(conviteSchema),
    defaultValues: { nome: "", email: "", role: undefined, empresaId: "", clienteId: "" },
  })

  // useWatch é compatível com o React Compiler (watch() não é)
  const role = useWatch({ control, name: "role" })
  const empresaId = useWatch({ control, name: "empresaId" })

  const clientesDaEmpresa = clientes.filter((c) => c.empresaId === empresaId)
  const empresasOptions = empresas.map((e) => ({ value: e.id, label: e.nome }))
  const clientesOptions = clientesDaEmpresa.map((c) => ({ value: c.id, label: c.nomeProdutor }))

  const precisaEmpresa = ["ADMIN", "CONSULTOR", "CLIENTE"].includes(role)
  const precisaCliente = role === "CLIENTE"

  async function onSubmit(data: ConviteForm) {
    setApiError(null)
    try {
      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const json = await res.json()

      if (!res.ok) {
        setApiError(json.error ?? "Erro ao enviar convite.")
        return
      }

      setLinkAtivacao(json.linkAtivacao)
      setEmailEnviado(json.emailEnviado)
    } catch {
      setApiError("Erro de conexão. Tente novamente.")
    }
  }

  async function copiarLink() {
    if (!linkAtivacao) return
    await navigator.clipboard.writeText(linkAtivacao)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2500)
  }

  // ── Tela de sucesso ──────────────────────────────────────────────
  if (linkAtivacao) {
    return (
      <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center text-center gap-3 py-4">
          <div className="w-14 h-14 bg-success/10 border border-success/20 rounded-full flex items-center justify-center">
            <CheckCircle2 size={28} className="text-success" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Convite enviado!</h3>
            <p className="text-xs text-muted mt-1">
              {emailEnviado
                ? "Um e-mail foi enviado com o link de ativação."
                : "O e-mail não pôde ser enviado. Compartilhe o link abaixo manualmente."}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-data-label ml-1">
            Link de Ativação
          </p>
          <div className="flex items-center gap-2 p-3 bg-muted/5 border border-border rounded-2xl">
            <p className="text-xs text-muted font-medium flex-1 break-all leading-relaxed">
              {linkAtivacao}
            </p>
            <button
              type="button"
              onClick={copiarLink}
              className="shrink-0 p-2 bg-card border border-border rounded-xl hover:bg-muted/10 transition-all cursor-pointer"
              aria-label="Copiar link"
            >
              {copiado
                ? <Check size={15} className="text-success" />
                : <Copy size={15} className="text-muted" />
              }
            </button>
          </div>
          <p className="text-[10px] text-muted ml-1">⏱️ Expira em 48 horas</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.push("/usuarios")}
            className="flex-1 py-3 border border-border rounded-2xl text-sm font-semibold text-muted hover:bg-muted/5 transition-all cursor-pointer text-center"
          >
            Ver usuários
          </button>
          <button
            type="button"
            onClick={() => { setLinkAtivacao(null); setEmailEnviado(false) }}
            className="flex-1 py-3 bg-primary text-white rounded-2xl text-sm font-semibold hover:bg-primary-700 active:scale-[0.98] transition-all cursor-pointer text-center"
          >
            Novo convite
          </button>
        </div>
      </div>
    )
  }

  // ── Formulário ───────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

      <FormSection title="Dados do Convidado" icon={User}>
        <Input
          label="Nome completo"
          registration={register("nome")}
          error={errors.nome}
          placeholder="Ex: João da Silva"
          required
          icon={User}
        />
        <Input
          label="E-mail"
          registration={register("email")}
          error={errors.email}
          type="email"
          placeholder="joao@empresa.com.br"
          required
          icon={Mail}
        />
      </FormSection>

      <FormSection title="Perfil de Acesso" icon={Mail}>
        <Select
          label="Tipo de perfil"
          registration={register("role")}
          error={errors.role}
          options={ROLE_OPTIONS}
          placeholder="Selecione o perfil"
          required
        />

        {precisaEmpresa && (
          <Select
            label="Empresa vinculada"
            registration={register("empresaId")}
            error={errors.empresaId}
            options={empresasOptions}
            placeholder="Selecione a empresa"
            required
          />
        )}

        {precisaCliente && (
          <Select
            label="Cliente vinculado"
            registration={register("clienteId")}
            error={errors.clienteId}
            options={clientesOptions}
            placeholder={
              !empresaId
                ? "Selecione a empresa primeiro"
                : clientesOptions.length === 0
                  ? "Nenhum cliente nesta empresa"
                  : "Selecione o cliente"
            }
            disabled={!empresaId || clientesOptions.length === 0}
            required
          />
        )}
      </FormSection>

      {apiError && (
        <div className="p-3.5 bg-primary/5 border border-primary/20 rounded-2xl">
          <p className="text-xs font-bold text-primary">⚠️ {apiError}</p>
        </div>
      )}

      <SubmitButton
        label="Enviar Convite"
        loadingLabel="Enviando..."
        loading={isSubmitting}
      />
    </form>
  )
}