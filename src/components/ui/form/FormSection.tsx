import { LucideProps } from "lucide-react"
import { ElementType, ReactNode } from "react"

interface FormSectionProps {
    title: string
    description?: string
    icon?: ElementType<LucideProps>
    children: ReactNode
    className?: string
}

export function FormSection({
    title,
    description,
    icon: Icon,
    children,
    className,
}: FormSectionProps) {
    return (
        <fieldset className={`bg-card p-4 rounded-3xl border border-border space-y-4 shadow-sm ${className ?? ""}`}>
            <div className="flex items-center gap-2">
                {Icon && (
                    <div className="p-1.5 bg-primary/10 rounded-lg text-primary shrink-0">
                        <Icon size={16} />
                    </div>
                )}
                <div>
                    <legend className="text-xs font-bold text-data-label uppercase tracking-widest">
                        {title}
                    </legend>
                    {description && (
                        <p className="text-[10px] text-muted font-medium mt-0.5">{description}</p>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                {children}
            </div>
        </fieldset>
    )
}