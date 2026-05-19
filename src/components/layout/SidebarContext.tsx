"use client"
import { createContext, useContext, useState, ReactNode } from "react"

const SidebarContext = createContext({
  isCollapsed: false,
  toggle: () => {},
})

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const toggle = () => setIsCollapsed(prev => !prev)

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggle }}>
      {children}
    </SidebarContext.Provider>
  )
}

export const useSidebar = () => useContext(SidebarContext)