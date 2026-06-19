"use client"

import { Input, SubmitButton } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signIn } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
})

type LoginForm = z.infer<typeof loginSchema>

interface UserCacheInput {
  id: string
  nome: string
  role: "SUPER_ADMIN" | "ADMIN" | "CONSULTOR" | "CLIENTE"
  empresaId?: string | null
  clienteId?: string | null
}

function mapearCacheIdentidade(user: UserCacheInput, expiresAtFromAuth: string) {
  return {
    id: user.id,
    nome: user.nome,
    role: user.role,
    empresaId: user.empresaId,
    cachedAt: new Date().toISOString(),
    expiresAt: expiresAtFromAuth,
  }
}

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginForm) {
    setLoading(true)
    setError("")

    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    })

    if (result?.error) {
      const codigo = result.code ?? result.error

      const mensagens: Record<string, string> = {
        rate_limit: "Muitas tentativas sem sucesso. Aguarde 15 minutos.",
        aguarda_ativacao: "Sua conta aguarda ativação pelo link do convite.",
        conta_suspensa: "Conta suspensa. Entre em contato com o administrador.",
        senha_incorreta: "E-mail ou senha inválidos. Verifique suas credenciais.",
        CredentialsSignin: "E-mail ou senha inválidos. Verifique suas credenciais.",
      }

      setError(mensagens[codigo] ?? "Erro ao autenticar. Tente novamente.")
      setLoading(false)
      return
    }

    try {
      const sessionResponse = await fetch("/api/auth/session")
      const sessionData = await sessionResponse.json()
      if (sessionData?.user) {
        const identityCache = mapearCacheIdentidade(sessionData.user, sessionData.expires)
        localStorage.setItem("@padroniza:identity", JSON.stringify(identityCache))
      }
    } catch (cacheError) {
      console.warn("Não foi possível gerar o cache de identidade offline:", cacheError)
    }

    router.push("/dashboard")
  }

  return (
    <main className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-background antialiased">

      <div className="lg:col-span-5 flex flex-col justify-between p-8 sm:p-12 md:p-16 my-auto bg-card">
        <div className="w-full max-w-sm mx-auto space-y-8">

          {/* Marca */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden">
                <Image
                  src="/images/icon.png"
                  alt="Padroniza"
                  width={40}
                  height={40}
                  style={{ width: 'auto', height: '100%' }}
                />
              </div>
              <span className="text-2xl font-black tracking-tight text-foreground">
                padroniza<span className="text-primary">.ba</span>
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Acesse sua conta</h1>
            <p className="text-sm text-muted mt-1">Painel de Gestão e Relatórios de Abate</p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Endereço de E-mail"
              type="email"
              registration={register("email")}
              error={errors.email}
              autoComplete="email"
              placeholder="consultor@padronizaba.com.br"
            />

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted">Senha de Acesso</span>
                <Link href="/login/recuperar-acesso" className="text-xs font-semibold text-primary hover:text-primary-700 transition-colors">
                  Esqueceu a senha?
                </Link>
              </div>
              <Input
                type="password"
                registration={register("password")}
                error={errors.password}
                autoComplete="current-password"
                placeholder="••••••••"
              />
            </div>

            {/* Checkbox modo campo */}
            <div className="flex items-center gap-2">
              <input
                id="remember"
                type="checkbox"
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20 accent-primary"
                defaultChecked
                disabled
              />
              <label htmlFor="remember" className="text-sm text-muted select-none">
                Manter conectado por 30 dias (Modo Campo ativo)
              </label>
            </div>

            {error && (
              <div className="bg-primary/5 border border-primary/20 text-primary text-xs font-medium p-3.5 rounded-xl flex items-start gap-2">
                <span>⚠️</span>
                <p className="leading-relaxed">{error}</p>
              </div>
            )}

            <SubmitButton
              label="Entrar no Sistema"
              loadingLabel="Autenticando..."
              loading={loading}
            />
          </form>
        </div>

        <div className="text-center text-xs text-muted mt-12 lg:mt-0">
          &copy; 2026 Padroniza.ba. Todos os direitos reservados.
        </div>
      </div>

      {/* Coluna direita */}
      <div className="hidden lg:block lg:col-span-7 relative bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-tr from-gray-950 via-gray-950/40 to-transparent z-10" />
        <Image
          src="/images/login_fundo.png"
          alt="Pecuária de Precisão e Padronização de Carcaça"
          fill
          priority
          sizes="(min-width: 1024px) 58vw, 100vw"
          className="object-cover object-[90%_center]"
        />
        <div className="absolute bottom-16 left-16 right-16 z-20 text-white space-y-4">
          <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase inline-block border border-white/20">
            Pecuária de Precisão
          </div>
          <blockquote className="text-3xl font-bold leading-tight tracking-tight max-w-xl">
            &ldquo;Padronização e clareza nos relatórios de abate, transformando dados de carcaça em inteligência estratégica para o produtor.&rdquo;
          </blockquote>
          <p className="text-sm text-gray-300 font-medium">
            Módulo de Monitoramento de Rendimento e Maturidade Animal.
          </p>
        </div>
      </div>
    </main>
  )
}