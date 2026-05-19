"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, CheckCircle2 } from "lucide-react";

interface FormAtivacaoProps {
  userId: string;
  token: string;
}

export function FormAtivacao({ userId, token }: FormAtivacaoProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sucesso, setSucesso] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas digitadas não coincidem.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao ativar a conta.");
      }

      setSucesso(true);
      
      // Aguarda 3 segundos e redireciona para a tela de login
      setTimeout(() => {
        router.push("/login");
      }, 3000);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  if (sucesso) {
    return (
      <div className="text-center py-4 space-y-3 animate-in fade-in zoom-in-95">
        <div className="w-12 h-12 bg-green-50 text-green-600 border border-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 size={24} />
        </div>
        <h3 className="font-bold text-gray-900 text-base">Conta Ativada!</h3>
        <p className="text-xs text-gray-500">
          A sua senha foi configurada com sucesso. Estamos a redirecioná-lo para a tela de login...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Nova Senha</label>
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-gray-400">
            <Lock size={16} />
          </span>
          <input
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-9 pr-10 py-2 rounded-xl border border-gray-300 bg-white text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Confirmar Nova Senha</label>
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-gray-400">
            <Lock size={16} />
          </span>
          <input
            type={showPassword ? "text" : "password"}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full pl-9 pr-10 py-2 rounded-xl border border-gray-300 bg-white text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
            placeholder="••••••••"
          />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl font-medium">
          ⚠️ {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-2.5 rounded-xl text-sm transition-all cursor-pointer shadow-sm text-center"
      >
        {loading ? "A processar..." : "Definir Senha e Ativar Conta"}
      </button>
    </form>
  );
}