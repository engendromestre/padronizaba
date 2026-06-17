import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  manifest: "/manifest.json",
}

export const viewport: Viewport = {
  themeColor: "#c0392b",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
      <body className="min-h-screen bg-background antialiased">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}