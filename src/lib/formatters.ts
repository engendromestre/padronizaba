export function formatarKg(valor: number | null | undefined): string {
  if (valor === null || valor === undefined) return "-"
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 3,
  }).format(valor) + "kg"
}

export function formatarArroba(valor: number | null | undefined): string {
  if (valor === null || valor === undefined) return "-"
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor) + "@"
}

export function formatarPercentual(valor: number | null | undefined): string {
  if (valor === null || valor === undefined) return "-"
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor) + "%"
}