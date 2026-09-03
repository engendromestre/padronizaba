import {
  Beef,
  Building2,
  Factory,
  FileText,
  LayoutDashboard,
  LucideIcon,
  MapPin,
  MessagesSquare,
  PlusCircle,
  ShieldCheck,
  Tractor,
  UserRoundCog,
  Users,
} from "lucide-react"

export interface NavigationItem {
  icon: LucideIcon
  label: string
  href: string
  allowedRoles: ("SUPER_ADMIN" | "ADMIN" | "CONSULTOR" | "CLIENTE")[]
}

export const dashboardNavigation: NavigationItem[] = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    href: "/dashboard",
    allowedRoles: ["SUPER_ADMIN", "ADMIN", "CONSULTOR", "CLIENTE"],
  },
  {
    icon: PlusCircle,
    label: "Nova Consulta",
    href: "/consulta/nova",
    allowedRoles: ["SUPER_ADMIN", "ADMIN", "CONSULTOR"],
  },
  {
    icon: FileText,
    label: "Relatórios",
    href: "/relatorios",
    allowedRoles: ["SUPER_ADMIN", "ADMIN", "CONSULTOR", "CLIENTE"],
  },
  {
    icon: Users,
    label: "Clientes",
    href: "/clientes",
    allowedRoles: ["SUPER_ADMIN", "ADMIN", "CONSULTOR"],
  },
]

export interface AdminCardItem {
  icon: LucideIcon
  label: string
  description: string
  href: string
  allowedRoles: ("SUPER_ADMIN" | "ADMIN")[]
  disponivel: boolean
}

export const adminCards: AdminCardItem[] = [
  {
    icon: UserRoundCog,
    label: "Usuários",
    description: "Gerencie acessos administrativos, consultores e clientes vinculados.",
    href: "/usuarios",
    allowedRoles: ["SUPER_ADMIN", "ADMIN"],
    disponivel: true,
  },
  {
    icon: Building2,
    label: "Empresas",
    description: "Cadastre e gerencie as empresas do sistema.",
    href: "/config/empresas",
    allowedRoles: ["SUPER_ADMIN", "ADMIN"],
    disponivel: true,
  },
  {
    icon: MapPin,
    label: "Localização",
    description: "Importe estados e cidades do IBGE para liberar nos cadastros.",
    href: "/config/localizacao",
    allowedRoles: ["SUPER_ADMIN", "ADMIN"],
    disponivel: true,
  },
  {
    icon: Factory,
    label: "Frigoríficos",
    description: "Cadastre as unidades de abate disponíveis para consulta.",
    href: "/config/frigorificos",
    allowedRoles: ["SUPER_ADMIN", "ADMIN"],
    disponivel: true,
  },
  {
    icon: Beef,
    label: "Categorias de Animal",
    description: "Defina as categorias usadas na classificação do lote.",
    href: "/config/categorias",
    allowedRoles: ["SUPER_ADMIN", "ADMIN"],
    disponivel: true,
  },
  {
    icon: Users,
    label: "Clientes",
    description: "Cadastre produtores e seus dados de contato.",
    href: "/config/clientes",
    allowedRoles: ["SUPER_ADMIN", "ADMIN"],
    disponivel: true,
  },
  {
    icon: MessagesSquare,
    label: "Grupos de WhatsApp",
    description: "Selecione quais grupos ficam disponíveis para vínculo com clientes.",
    href: "/config/grupos-whatsapp",
    allowedRoles: ["SUPER_ADMIN", "ADMIN"],
    disponivel: true,
  },
  {
    icon: Tractor,
    label: "Fazendas",
    description: "Cadastre as propriedades vinculadas a cada cliente.",
    href: "/config/fazendas",
    allowedRoles: ["SUPER_ADMIN", "ADMIN"],
    disponivel: false,
  },
  {
    icon: ShieldCheck,
    label: "Logs de Auditoria",
    description: "Acompanhe ações administrativas realizadas no sistema.",
    href: "/config/auditoria",
    allowedRoles: ["SUPER_ADMIN", "ADMIN"],
    disponivel: false,
  },
]