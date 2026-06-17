import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg"],

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        search: "",
      },
    ],
  },

  // ✅ Desabilita o React Compiler (para evitar warnings com TanStack Table)
  reactCompiler: false,
}

export default nextConfig