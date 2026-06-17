import { Resend } from "resend"

let resend: Resend | null = null

function getResend() {
    if (!resend) {
        resend = new Resend(process.env.RESEND_API_KEY)
    }
    return resend
}

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

    const { data, error } = await getResend().emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? "Padroniza <onboarding@resend.dev>",
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

export async function enviarEmailResetSenha({
    para,
    nomeUsuario,
    linkReset,
}: {
    para: string
    nomeUsuario: string
    linkReset: string
}) {
    const { resetSenhaEmailHtml, resetSenhaEmailText } = await import("@/lib/emails/resetSenha")

    const { error } = await getResend().emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? "Padroniza <onboarding@resend.dev>",
        to: para,
        subject: "Redefinição de senha — Padroniza.ba",
        html: resetSenhaEmailHtml({ nomeUsuario, linkReset }),
        text: resetSenhaEmailText({ nomeUsuario, linkReset }),
    })

    if (error) {
        console.error("[Resend] Erro ao enviar e-mail de reset:", error)
        throw new Error("Falha ao enviar e-mail de redefinição.")
    }
}