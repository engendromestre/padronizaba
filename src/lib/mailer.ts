import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

interface EnviarConviteProps {
    para: string
    nomeConvidado: string
    nomeQuemConvidou: string
    role: string
    linkAtivacao: string
}

export async function enviarEmailConvite({
    para,
    nomeConvidado,
    nomeQuemConvidou,
    role,
    linkAtivacao,
}: EnviarConviteProps) {
    const { conviteEmailHtml, conviteEmailText } = await import("@/lib/emails/convite")

    const html = conviteEmailHtml({ nomeConvidado, nomeQuemConvidou, role, linkAtivacao })
    const text = conviteEmailText({ nomeConvidado, nomeQuemConvidou, role, linkAtivacao })

    const { data, error } = await resend.emails.send({
        from: "Padroniza <onboarding@resend.dev>", // ⚠️ Trocar pelo domínio verificado em produção
        to: para,
        subject: `Você foi convidado para o Padroniza`,
        html,
        text,
    })

    if (error) {
        console.error("[Resend] Erro ao enviar e-mail de convite:", error)
        throw new Error("Falha ao enviar e-mail de convite.")
    }

    return data
}