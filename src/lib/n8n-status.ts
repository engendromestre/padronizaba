export type StatusN8nConsulta = "PENDENTE" | "ENVIANDO" | "ENVIADO" | "FALHOU"

export function rotuloEnvio(consulta: {
  n8nStatus: StatusN8nConsulta | string
  whatsappLogs: { status: string }[]
}): { bg: string; text: string; label: string } {
  const log = consulta.whatsappLogs[0]
  if (log?.status === "SENT") {
    return { bg: "bg-success/10", text: "text-success", label: "Enviado" }
  }
  if (log?.status === "FAILED") {
    return { bg: "bg-primary/10", text: "text-primary-700", label: "Falhou" }
  }
  if (log) {
    return { bg: "bg-warning/10", text: "text-warning", label: "Pendente" }
  }
  if (consulta.n8nStatus === "ENVIADO") {
    return { bg: "bg-success/10", text: "text-success", label: "Enviado" }
  }
  if (consulta.n8nStatus === "FALHOU") {
    return { bg: "bg-primary/10", text: "text-primary-700", label: "Falhou" }
  }
  if (consulta.n8nStatus === "ENVIANDO") {
    return { bg: "bg-warning/10", text: "text-warning", label: "Pendente" }
  }
  return { bg: "bg-muted/10", text: "text-muted", label: "Não enviado" }
}

export function precisaSincronizarN8n(status: string) {
  return status === "PENDENTE" || status === "FALHOU" || status === "ENVIANDO"
}
