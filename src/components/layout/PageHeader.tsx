"use client"

import Link from "next/link"
import { Plus } from "lucide-react"

interface PageHeaderProps {
  title: string
  subtitle: string
  action?: {
    label: string
    href: string
  }
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    // Removido o sticky e o w-full com bg para fundir o cabeçalho da página diretamente ao conteúdo
    <div className="w-full border-b border-border/60 bg-card/50 backdrop-blur-sm px-4 py-6">
      <div className="max-w-lg mx-auto flex items-center justify-between">
        <div className="space-y-0.5">
          <h1 className="text-xl font-bold text-foreground tracking-tight">
            {title}
          </h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            {subtitle}
          </p>
        </div>

        {action && (
          <Link
            href={action.href}
            className="bg-primary text-white p-2.5 rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all flex items-center gap-1 pr-4"
          >
            <Plus size={20} strokeWidth={3} />
            <span className="text-xs font-bold uppercase tracking-tight">
              {action.label}
            </span>
          </Link>
        )}
      </div>
    </div>
  )
}