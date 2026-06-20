import nodemailer from "nodemailer"
import SMTPTransport from "nodemailer/lib/smtp-transport"

let transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo> | null = null

function getTransporter() {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || "587", 10),
            secure: process.env.SMTP_SECURE === "true", 
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        })
    }
    return transporter
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

    try {
        // Correção aqui: Chamando getTransporter()
        const info = await getTransporter().sendMail({
            from: process.env.MAIL_FROM ?? '"Padroniza" <codealta9@gmail.com>',
            to: para,
            subject: `Você foi convidado para o Padroniza`,
            html,
            text,
        })

        return info
    } catch (error) {
        console.error("[SMTP/Brevo] Erro ao enviar e-mail de convite:", error)
        throw new Error("Falha ao enviar e-mail de convite.")
    }
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

    try {
        // Correção aqui: Chamando getTransporter()
        await getTransporter().sendMail({
            from: process.env.MAIL_FROM ?? '"Padroniza" <codealta9@gmail.com>',
            to: para,
            subject: "Redefinição de senha — Padroniza.ba",
            html: resetSenhaEmailHtml({ nomeUsuario, linkReset }),
            text: resetSenhaEmailText({ nomeUsuario, linkReset }),
        })
    } catch (error) {
        console.error("[SMTP/Brevo] Erro ao enviar e-mail de reset:", error)
        throw new Error("Falha ao enviar e-mail de redefinição.")
    }
}