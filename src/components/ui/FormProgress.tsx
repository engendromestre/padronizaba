"use client"

interface FormProgressProps {
  etapaAtual: number
  totalEtapas: number
}

const etapas = [
  "Identificação",
  "Peso",
  "Maturidade",
  "Acabamento",
  "Adicionais",
]

export function FormProgress({ etapaAtual, totalEtapas }: FormProgressProps) {
  return (
    <div className="w-full space-y-4 animate-in fade-in duration-500">
      {/* Cabeçalho do Progresso */}
      <div className="flex items-end justify-between px-1">
        <div className="space-y-0.5">
          <p className="text-[10px] font-bold text-muted uppercase tracking-widest">
            Progresso da Consulta
          </p>
          <h2 className="text-lg font-black text-foreground leading-none">
            {etapas[etapaAtual - 1]}
          </h2>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
            {etapaAtual} / {totalEtapas}
          </span>
        </div>
      </div>

      {/* Barra de Progresso Segmentada */}
      <div className="flex gap-1.5 h-1.5 w-full">
        {Array.from({ length: totalEtapas }).map((_, idx) => {
          const stepNumber = idx + 1;
          const isCompleted = stepNumber < etapaAtual;
          const isCurrent = stepNumber === etapaAtual;

          return (
            <div
              key={idx}
              className={`h-full rounded-full transition-all duration-500 ease-out flex-1 ${
                isCompleted 
                  ? "bg-primary" 
                  : isCurrent 
                    ? "bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.4)]" 
                    : "bg-border"
              }`}
            />
          );
        })}
      </div>
    </div>
  )
}