import { useFormContext } from "react-hook-form";
import { Check } from "lucide-react";

interface Option {
  id: string;
  label: string;
  subLabel?: string;
}

interface MultiSelectCardsProps {
  name: string; // Nome do campo no Zod/React Hook Form (ex: "grupoWhatsappId")
  options: Option[]; // Lista genérica de opções para renderizar
  emptyMessage?: string;
}

export function MultiSelectCards({ 
  name, 
  options, 
  emptyMessage = "Nenhuma opção disponível." 
}: MultiSelectCardsProps) {
  const { watch, setValue, formState: { errors } } = useFormContext();
  
  // Captura o estado atual do array no formulário
  const valoresSelecionados: string[] = watch(name) || [];
  const fieldError = errors[name];

  const handleToggle = (id: string) => {
    if (valoresSelecionados.includes(id)) {
      setValue(
        name, 
        valoresSelecionados.filter((item: string) => item !== id),
        { shouldValidate: true }
      );
    } else {
      setValue(
        name, 
        [...valoresSelecionados, id],
        { shouldValidate: true }
      );
    }
  };

  if (options.length === 0) {
    return (
      <div className="text-sm text-muted-foreground bg-accent/30 rounded-xl p-4 border border-dashed border-border text-center">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((option) => {
          const isSelected = valoresSelecionados.includes(option.id);

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => handleToggle(option.id)}
              className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all active:scale-[0.99] cursor-pointer min-h-64px select-none
                ${isSelected 
                  ? "border-primary bg-primary/5 text-primary font-bold shadow-sm shadow-primary/5" 
                  : "border-border bg-card text-foreground hover:bg-accent/50"}`}
            >
              <div className="flex flex-col pr-2">
                <span className="text-sm leading-tight">{option.label}</span>
                {option.subLabel && (
                  <span className={`text-xs font-normal transition-colors ${isSelected ? 'text-primary/80' : 'text-muted-foreground'}`}>
                    {option.subLabel}
                  </span>
                )}
              </div>

              <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all shrink-0
                ${isSelected ? "bg-primary border-primary text-white" : "border-muted-foreground/30"}`}>
                {isSelected && <Check size={12} strokeWidth={3} />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Exibe o erro do Zod automaticamente caso falte preencher */}
      {fieldError && (
        <p className="text-xs font-medium text-destructive mt-1">
          {String(fieldError.message)}
        </p>
      )}
    </div>
  );
}