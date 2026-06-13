"use client"

import { Input, SubmitButton } from "@/components/ui/form"
import Link from "next/link"
import { useState } from "react"

export default function EsqueciSenhaPage() {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [enviado, setEnviado] = useState(false)
    const [erro, setErro] = useState("")

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setErro("")

        try {
            await fetch("/api/auth/reset-senha/solicitar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            })
            setEnviado(true) // sempre mostra sucesso — não revela se e-mail existe
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
                    <h1 className="text-xl font-bold text-gray-900">Esqueceu a senha?</h1>
                    <p className="text-sm text-gray-500">Informe seu e-mail e enviaremos um link para redefinição.</p>
                </div>

                {enviado ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center space-y-2">
                        <p className="text-2xl">✉️</p>
                        <p className="text-sm font-semibold text-emerald-700">Instruções enviadas!</p>
                        <p className="text-xs text-emerald-600">Se este e-mail estiver cadastrado, você receberá o link em breve. Verifique também a caixa de spam.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <Input
                                label="E-mail"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="seu@email.com"
                                required
                            />
                        </div>

                        {erro && (
                            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">❌ {erro}</p>
                        )}

                        <SubmitButton
                            label="Enviar link de redefinição"
                            loadingLabel="Enviando..."
                            loading={loading}
                        />
                    </form>
                )}

                <p className="text-center text-xs text-gray-400">
                    Lembrou a senha?{" "}
                    <Link href="/login" className="text-primary font-semibold hover:underline">Voltar ao login</Link>
                </p>
            </div>
        </main>
    )
}