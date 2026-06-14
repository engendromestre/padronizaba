"use client"

import { useSidebar } from "./SidebarContext"
import { BottomNav } from "../ui/Navigation"
import { Sidebar } from "./Sidebar"
import { ReactNode } from "react"

interface LayoutContentProps {
  children: ReactNode
  header: ReactNode  // Header vem de fora como prop — Server Component safe
}

export function LayoutContent({ children, header }: LayoutContentProps) {
  const { isCollapsed } = useSidebar()

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <div
        className={`
          flex flex-1 flex-col min-w-0
          transition-all duration-300 ease-in-out
          ${isCollapsed ? "md:pl-20" : "md:pl-64"}
        `}
      >
        {header}

        <main className="flex-1 w-full invisible-scrollbar">
          {children}
        </main>

        <div className="h-30 w-full shrink-0 block md:hidden" aria-hidden="true" />

        <BottomNav />
      </div>
    </div>
  )
}