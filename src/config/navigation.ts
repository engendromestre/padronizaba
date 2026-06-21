import { LayoutDashboard, PlusCircle, FileText, Users, LucideIcon, MapPin } from "lucide-react";

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

// Itens administrativos — vivem no dropdown do avatar (Header), não no menu lateral
export interface AdminMenuItem {
  icon: LucideIcon;
  label: string;
  href: string;
  allowedRoles: ("SUPER_ADMIN" | "ADMIN")[];
}

export const adminMenuItems: AdminMenuItem[] = [
  {
    icon: Users,
    label: "Usuários",
    href: "/usuarios",
    allowedRoles: ["SUPER_ADMIN", "ADMIN"]
  },
  {
    icon: MapPin,
    label: "Localização",
    href: "/config/localizacao",
    allowedRoles: ["SUPER_ADMIN", "ADMIN"]
  },
];