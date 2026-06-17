"use client"

import { Input, InputNumerico, Textarea } from "@/components/ui/form"
import { CheckboxCard } from "@/components/ui/form/CheckboxCard"
import { ConsultaForm } from "@/lib/schemas/consulta"
import { Baby, ClipboardList, Syringe } from "lucide-react"
import { useFormContext } from "react-hook-form"

export function Etapa5Adicionais() {
  const { register, formState: { errors } } = useFormContext<ConsultaForm>()

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">

      {/* Seção: Observações Técnicas */}
      <div className="bg-card p-4 rounded-3xl border border-border space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
            <ClipboardList size={18} />
          </div>
          <h3 className="text-xs font-bold text-data-label uppercase tracking-widest">Observações Técnicas</h3>
        </div>

        <div className="space-y-4">
          <Textarea
            label="Penalizações"
            registration={register("penalizacoes")}
            placeholder="Ex: 5 carcaças penalizadas por..."
            rows={2}
          />

          <Textarea
            label="D.I.F (Desvio de Inspeção Federal)"
            registration={register("dif")}
            placeholder="Ex: Cisticercose calcificada em 2 carcaças"
            rows={2}
          />

          <Input
            label="Escore Ruminal"
            registration={register("escoreRuminal")}
            placeholder="Ex: 3,5 - 4,0"
          />
        </div>
      </div>

      {/* Seção: Perdas e Contaminações */}
      <div className="grid grid-cols-1 gap-4">
        <div className="flex items-center gap-2 ml-1">
          <Syringe size={16} className="text-primary" />
          <h3 className="text-xs font-bold text-data-label uppercase tracking-widest">Perdas e Sanidade</h3>
        </div>

        <InputNumerico
          label="Perda Vacinal"
          name="perdaVacinalKg"
          error={errors.perdaVacinalKg}
          suffix="kg/cab"
        />

        <div className="grid grid-cols-2 gap-4">
          <InputNumerico
            label="Contaminação GI"
            name="contaminacaoGiKg"
            error={errors.contaminacaoGiKg}
            suffix="kg total"
          />
          <InputNumerico
            label="Hematomas"
            name="hematomasKg"
            error={errors.hematomasKg}
            suffix="kg total"
          />
        </div>
      </div>

      {/* Seção: Bezerros */}
      <div className="bg-muted/10 p-4 rounded-3xl border border-border/50 space-y-4">
        <div className="flex items-center gap-2">
          <Baby size={18} className="text-primary" />
          <h3 className="text-xs font-bold text-data-label uppercase tracking-widest">Bezerros (Prenhez)</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <InputNumerico label="Pequeno" name="bezerrosP" error={errors.bezerrosP} />
          <InputNumerico label="Médio" name="bezerrosM" error={errors.bezerrosM} />
          <InputNumerico label="Grande" name="bezerrosG" error={errors.bezerrosG} />
        </div>
      </div>

      {/* Checkboxes — mantidos nativos, têm estilo customizado específico */}
      <div className="p-2 space-y-3">
        <CheckboxCard
          label="Houve Deslocamento?"
          description="Viagem do consultor até a unidade"
          registration={register("deslocamento")}
        />
        <CheckboxCard
          label="Relatório Disponível?"
          description="Documento oficial do frigorífico"
          registration={register("relatorioAbate")}
        />
      </div>
    </div>
  )
}