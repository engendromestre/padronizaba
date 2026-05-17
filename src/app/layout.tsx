import "./globals.css";
import { SidebarProvider } from "./components/layout/SidebarContext";
import { LayoutContent } from "./components/layout/LayoutContent";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
      <body className="min-h-screen bg-background antialiased">
        <SidebarProvider>
          <LayoutContent>{children}</LayoutContent>
        </SidebarProvider>
      </body>
    </html>
  );
}