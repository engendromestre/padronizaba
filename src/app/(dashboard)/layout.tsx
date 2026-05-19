import { SessionProvider } from "next-auth/react";
import { LayoutContent } from "../../components/layout/LayoutContent";
import { SidebarProvider } from "../../components/layout/SidebarContext";
import "@/app/globals.css";


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SidebarProvider>
        <LayoutContent>{children}</LayoutContent>
      </SidebarProvider>
    </SessionProvider>
  );
}