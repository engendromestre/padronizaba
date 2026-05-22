interface ConviteEmailProps {
    nomeConvidado: string
    nomeQuemConvidou: string
    role: string
    linkAtivacao: string
}

const roleLabel: Record<string, string> = {
    ADMIN: "Administrador",
    CONSULTOR: "Consultor",
    CLIENTE: "Cliente",
    SUPER_ADMIN: "Super Administrador",
}

export function conviteEmailHtml({
    nomeConvidado,
    nomeQuemConvidou,
    role,
    linkAtivacao,
}: ConviteEmailProps): string {
    const cargo = roleLabel[role] ?? role

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Convite Padroniza</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e4e4e7;">

          <!-- Header -->
          <tr>
            <td style="background:#7f1d1d;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">
                🐄 Padroniza
              </h1>
              <p style="margin:6px 0 0;color:#fca5a5;font-size:13px;">
                Sistema de Gestão de Consultas
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 8px;font-size:13px;color:#71717a;text-transform:uppercase;letter-spacing:0.05em;font-weight:600;">
                Você foi convidado
              </p>
              <h2 style="margin:0 0 24px;font-size:20px;color:#18181b;font-weight:700;">
                Olá, ${nomeConvidado} 👋
              </h2>

              <p style="margin:0 0 24px;font-size:14px;color:#52525b;line-height:1.6;">
                <strong style="color:#18181b;">${nomeQuemConvidou}</strong> convidou você para acessar o 
                <strong style="color:#18181b;">Padroniza</strong> com o perfil de 
                <strong style="color:#7f1d1d;">${cargo}</strong>.
              </p>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
                <tr>
                  <td style="background:#7f1d1d;border-radius:10px;">
                    <a href="${linkAtivacao}" 
                       style="display:inline-block;padding:14px 32px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;">
                      Ativar minha conta →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Aviso de expiração -->
              <table cellpadding="0" cellspacing="0" width="100%" style="background:#fef9c3;border:1px solid #fde68a;border-radius:10px;margin-bottom:24px;">
                <tr>
                  <td style="padding:14px 16px;">
                    <p style="margin:0;font-size:13px;color:#92400e;">
                      ⏱️ <strong>Este link expira em 48 horas.</strong> Após isso, solicite um novo convite ao administrador.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Link fallback -->
              <p style="margin:0 0 4px;font-size:12px;color:#a1a1aa;">
                Se o botão não funcionar, copie e cole este link no navegador:
              </p>
              <p style="margin:0;font-size:12px;color:#7f1d1d;word-break:break-all;">
                ${linkAtivacao}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f4f4f5;padding:24px 40px;border-top:1px solid #e4e4e7;text-align:center;">
              <p style="margin:0;font-size:12px;color:#a1a1aa;">
                Se você não esperava este convite, pode ignorar este e-mail com segurança.
              </p>
              <p style="margin:6px 0 0;font-size:12px;color:#d4d4d8;">
                © ${new Date().getFullYear()} Padroniza · Todos os direitos reservados
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

export function conviteEmailText({
    nomeConvidado,
    nomeQuemConvidou,
    role,
    linkAtivacao,
}: ConviteEmailProps): string {
    const cargo = roleLabel[role] ?? role
    return `
Olá, ${nomeConvidado}!

${nomeQuemConvidou} convidou você para acessar o Padroniza com o perfil de ${cargo}.

Para ativar sua conta e definir sua senha, acesse o link abaixo:
${linkAtivacao}

⚠️ Este link expira em 48 horas.

Se você não esperava este convite, ignore este e-mail.

© ${new Date().getFullYear()} Padroniza
  `.trim()
}