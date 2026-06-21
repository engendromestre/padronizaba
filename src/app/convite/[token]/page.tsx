import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { FormAtivacao } from "./_components/FormAtivacao";

interface ConvitePageProps {
  params: Promise<{ token: string }>;
}

export const dynamic = "force-dynamic";

export default async function ConvitePage({ params }: ConvitePageProps) {
  const { token } = await params;

  // 🔍 Procura o utilizador com o token correspondente
  const user = await prisma.user.findFirst({
    where: {
      activationToken: token,
    },
    select: {
      id: true,
      nome: true,
      email: true,
      tokenExpires: true,
    },
  });

  // 🚫 Se o utilizador não existir, devolve 404
  if (!user) {
    notFound();
  }

  // ⏱️ Valida se o token já expirou
  const agora = new Date();
  const expirou = user.tokenExpires ? agora > new Date(user.tokenExpires) : true;

  if (expirou) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-gray-200 max-w-md w-full text-center shadow-xs">
          <span className="text-4xl">⏰</span>
          <h2 className="text-xl font-bold text-gray-900 mt-4">Convite Expirado</h2>
          <p className="text-sm text-gray-500 mt-2">
            Este link de ativação expirou por motivos de segurança (validade de 48h). 
            Por favor, solicite um novo convite ao administrador do sistema.
          </p>
        </div>
      </div>
    );
  }

  // 🟢 Se estiver tudo válido, renderiza o formulário de cliente passando o ID do utilizador
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl border border-gray-200 max-w-md w-full shadow-md">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-gray-900">Ativação de Conta</h1>
          <p className="text-xs text-gray-500 mt-1">
            Olá, <span className="font-semibold text-gray-700">{user.nome}</span> ({user.email}). 
            Defina a sua senha de acesso abaixo para ativar o seu perfil no Padroniza.ba.
          </p>
        </div>

        <FormAtivacao userId={user.id} token={token} />
      </div>
    </div>
  );
}