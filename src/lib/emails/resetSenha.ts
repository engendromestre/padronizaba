interface ResetSenhaProps {
    nomeUsuario: string
    linkReset: string
}

export function resetSenhaEmailHtml({ nomeUsuario, linkReset }: ResetSenhaProps) {
    return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
    <body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
        <tr><td align="center">
          <table width="100%" style="max-width:480px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
            <tr>
              <td style="background:#c0392b;padding:28px 32px;">
                <span style="font-size:22px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">
                  padroniza<span style="opacity:0.75;">.ba</span>
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#111827;">Redefinição de Senha</h1>
                <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.6;">
                  Olá, <strong>${nomeUsuario}</strong>. Recebemos uma solicitação para redefinir a senha da sua conta.
                  Clique no botão abaixo para criar uma nova senha. O link expira em <strong>1 hora</strong>.
                </p>
                <a href="${linkReset}" style="display:inline-block;background:#c0392b;color:#ffffff;font-size:14px;font-weight:700;padding:14px 28px;border-radius:12px;text-decoration:none;">
                  Redefinir Senha
                </a>
                <p style="margin:24px 0 0;font-size:12px;color:#9ca3af;line-height:1.6;">
                  Se você não solicitou a redefinição, ignore este e-mail. Sua senha permanece a mesma.<br/>
                  Por segurança, nunca compartilhe este link.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px;border-top:1px solid #f3f4f6;">
                <p style="margin:0;font-size:11px;color:#d1d5db;text-align:center;">
                  © 2026 Padroniza.ba — Todos os direitos reservados.
                </p>
              </td>
            </tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
    `
}

export function resetSenhaEmailText({ nomeUsuario, linkReset }: ResetSenhaProps) {
    return `Olá, ${nomeUsuario}.\n\nClique no link abaixo para redefinir sua senha (expira em 1 hora):\n\n${linkReset}\n\nSe você não solicitou isso, ignore este e-mail.\n\n© 2026 Padroniza.ba`
}