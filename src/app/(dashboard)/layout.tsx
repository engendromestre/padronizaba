// src/app/(dashboard)/layout.tsx
import "@/app/globals.css"
import { SessionProvider } from "next-auth/react"
import { Header } from "../../components/layout/Header"
import { LayoutContent } from "../../components/layout/LayoutContent"
import { SidebarProvider } from "../../components/layout/SidebarContext"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SidebarProvider>
        <LayoutContent header={<Header />}>
          {children}
        </LayoutContent>
      </SidebarProvider>
    </SessionProvider>
  )
}