"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutGrid, Thermometer, MapPin } from "lucide-react"

const NAV_ITEMS = [
    {
        href: "/config/categorias",
        label: "Categorias",
        icon: LayoutGrid,
    },
    {
        href: "/config/frigorificos",
        label: "Frigoríficos",
        icon: Thermometer,
    },
    {
        href: "/config/localizacao",
        label: "Localização",
        icon: MapPin,
    },
]

export function ConfigNav() {
    const pathname = usePathname()

    return (
        <nav className="flex gap-1 overflow-x-auto scrollbar-none -mx-1 px-1">
            {NAV_ITEMS.map((item) => {
                const isActive = pathname.startsWith(item.href)
                const Icon = item.icon

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`
                            flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold
                            whitespace-nowrap transition-all shrink-0
                            ${isActive
                                ? "bg-primary text-white shadow-sm shadow-primary/20"
                                : "text-muted hover:text-foreground hover:bg-muted/10"
                            }
                        `}
                    >
                        <Icon size={15} />
                        {item.label}
                    </Link>
                )
            })}
        </nav>
    )
}