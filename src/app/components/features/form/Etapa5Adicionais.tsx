"use client"

import { ConsultaForm } from "@/lib/schemas/consulta"
import { useFormContext } from "react-hook-form"
import { CampoNumerico } from "./CampoNumerico"
import { ClipboardList, Syringe, Baby } from "lucide-react"

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
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-data-label uppercase tracking-wider ml-1">
              Penalizações
            </label>
            <textarea
              {...register("penalizacoes")}
              rows={2}
              placeholder="Ex: 5 carcaças penalizadas por..."
              className="w-full px-4 py-3 rounded-2xl border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-card text-foreground text-sm resize-none transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-data-label uppercase tracking-wider ml-1">
              D.I.F (Desvio de Inspeção Federal)
            </label>
            <textarea
              {...register("dif")}
              rows={2}
              placeholder="Ex: Cisticercose calcificada em 2 carcaças"
              className="w-full px-4 py-3 rounded-2xl border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-card text-foreground text-sm resize-none transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-data-label uppercase tracking-wider ml-1">
              Escore Ruminal
            </label>
            <input
              {...register("escoreRuminal")}
              type="text"
              placeholder="Ex: 3,5 - 4,0"
              className="w-full px-4 py-3 rounded-2xl border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-card text-foreground text-sm transition-all"
            />
          </div>
        </div>
      </div>

      {/* Seção: Perdas e Contaminações */}
      <div className="grid grid-cols-1 gap-4">
        <div className="flex items-center gap-2 ml-1">
          <Syringe size={16} className="text-primary" />
          <h3 className="text-xs font-bold text-data-label uppercase tracking-widest">Perdas e Sanidade</h3>
        </div>
        
        <CampoNumerico
          label="Perda Vacinal"
          name="perdaVacinalKg"
          error={errors.perdaVacinalKg}
          suffix="kg/cab"
        />

        <div className="grid grid-cols-2 gap-4">
          <CampoNumerico
            label="Contaminação GI"
            name="contaminacaoGiKg"
            error={errors.contaminacaoGiKg}
            suffix="kg total"
          />
          <CampoNumerico
            label="Hematomas"
            name="hematomasKg"
            error={errors.hematomasKg}
            suffix="kg total"
          />
        </div>
      </div>

      {/* Seção: Bezerros (Grid Compacto) */}
      <div className="bg-muted/10 p-4 rounded-3xl border border-border/50 space-y-4">
        <div className="flex items-center gap-2">
          <Baby size={18} className="text-primary" />
          <h3 className="text-xs font-bold text-data-label uppercase tracking-widest">Bezerros (Prenhez)</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <CampoNumerico label="Pequeno" name="bezerrosP" error={errors.bezerrosP} />
          <CampoNumerico label="Médio" name="bezerrosM" error={errors.bezerrosM} />
          <CampoNumerico label="Grande" name="bezerrosG" error={errors.bezerrosG} />
        </div>
      </div>

      {/* Checkboxes de Status */}
      <div className="p-2 space-y-3">
        <label className="flex items-center gap-3 p-4 bg-card border border-border rounded-2xl cursor-pointer active:scale-[0.98] transition-all">
          <input
            {...register("deslocamento")}
            type="checkbox"
            className="w-6 h-6 rounded-lg border-border text-primary focus:ring-primary accent-primary"
          />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-foreground">Houve Deslocamento?</span>
            <span className="text-[10px] text-muted uppercase font-medium">Viagem do consultor até a unidade</span>
          </div>
        </label>

        <label className="flex items-center gap-3 p-4 bg-card border border-border rounded-2xl cursor-pointer active:scale-[0.98] transition-all">
          <input
            {...register("relatorioAbate")}
            type="checkbox"
            className="w-6 h-6 rounded-lg border-border text-primary focus:ring-primary accent-primary"
          />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-foreground">Relatório Disponível?</span>
            <span className="text-[10px] text-muted uppercase font-medium">Documento oficial do frigorífico</span>
          </div>
        </label>
      </div>
    </div>
  )
}