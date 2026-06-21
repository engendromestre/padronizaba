import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  Users,
  LucideIcon,
  MapPin,
  UserRoundCog,
  Beef, Factory,
  Tractor,
  ShieldCheck
} from "lucide-react";

// Definimos estritamente o tipo para garantir o autocomplete no projeto
export interface NavigationItem {
  icon: LucideIcon;
  label: string;
  href: string;
  allowedRoles: ("SUPER_ADMIN" | "ADMIN" | "CONSULTOR" | "CLIENTE")[];
}

export const dashboardNavigation: NavigationItem[] = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    href: "/dashboard",
    allowedRoles: ["SUPER_ADMIN", "ADMIN", "CONSULTOR", "CLIENTE"]
  },
  {
    icon: PlusCircle,
    label: "Nova Consulta",
    href: "/consulta/nova",
    allowedRoles: ["SUPER_ADMIN", "ADMIN", "CONSULTOR"]
  },
  {
    icon: FileText,
    label: "Relatórios",
    href: "/relatorios",
    allowedRoles: ["SUPER_ADMIN", "ADMIN", "CONSULTOR", "CLIENTE"]
  },
  {
    icon: Users,
    label: "Clientes",
    href: "/clientes",
    allowedRoles: ["SUPER_ADMIN", "ADMIN", "CONSULTOR"]
  },
];

// Itens administrativos — vivem no hub /admin, acessível via dropdown do avatar
export interface AdminCardItem {
  icon: LucideIcon;
  label: string;
  description: string;
  href: string;
  allowedRoles: ("SUPER_ADMIN" | "ADMIN")[];
  disponivel: boolean; // false = mostra "Em breve", sem link ativo
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
    disponivel: false,
  },
  {
    icon: Beef,
    label: "Categorias de Animal",
    description: "Defina as categorias usadas na classificação do lote.",
    href: "/config/categorias",
    allowedRoles: ["SUPER_ADMIN", "ADMIN"],
    disponivel: false,
  },
  {
    icon: Users,
    label: "Clientes",
    description: "Cadastre produtores e seus dados de contato.",
    href: "/config/clientes",
    allowedRoles: ["SUPER_ADMIN", "ADMIN"],
    disponivel: false,
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
];