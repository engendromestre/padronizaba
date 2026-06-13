"use client"

import { Input, SubmitButton } from "@/components/ui/form"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"

export default function RedefinirSenhaPage() {
    const { token } = useParams<{ token: string }>()
    const router = useRouter()
    const [novaSenha, setNovaSenha] = useState("")
    const [confirmar, setConfirmar] = useState("")
    const [loading, setLoading] = useState(false)
    const [erro, setErro] = useState("")
    const [sucesso, setSucesso] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (novaSenha !== confirmar) {
            setErro("As senhas não coincidem.")
            return
        }
        if (novaSenha.length < 6) {
            setErro("A senha deve ter no mínimo 6 caracteres.")
            return
        }

        setLoading(true)
        setErro("")

        try {
            const res = await fetch("/api/auth/reset-senha/confirmar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, novaSenha }),
            })

            const json = await res.json()

            if (!res.ok) {
                setErro(json.error ?? "Erro ao redefinir senha.")
                return
            }

            setSucesso(true)
            setTimeout(() => router.push("/login"), 3000)
        } catch {
            setErro("Erro de conexão. Tente novamente.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-sm space-y-6">
                <div className="text-center space-y-1">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center font-black text-xl">P</div>
                        <span className="text-2xl font-black tracking-tight">padroniza<span className="text-primary">.ba</span></span>
                    </div>
                    <h1 className="text-xl font-bold text-gray-900">Nova senha</h1>
                    <p className="text-sm text-gray-500">Escolha uma senha segura para sua conta.</p>
                </div>

                {sucesso ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center space-y-2">
                        <p className="text-2xl">✅</p>
                        <p className="text-sm font-semibold text-emerald-700">Senha redefinida com sucesso!</p>
                        <p className="text-xs text-emerald-600">Redirecionando para o login...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <Input
                                label="Nova senha"
                                type="password"
                                value={novaSenha}
                                onChange={(e) => setNovaSenha(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Input
                                label="Confirmar senha"
                                type="password"
                                value={confirmar}
                                onChange={(e) => setConfirmar(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        {erro && (
                            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">❌ {erro}</p>
                        )}


                        <SubmitButton
                            label="Redefinir senha"
                            loadingLabel="Salvando..."
                            loading={loading}
                        />
                    </form>
                )}

                <p className="text-center text-xs text-gray-400">
                    <Link href="/login" className="text-primary font-semibold hover:underline">Voltar ao login</Link>
                </p>
            </div>
        </main>
    )
}