import {
  Activity,
  BarChart3,
  ClipboardList,
  Dumbbell,
  FileText,
  Home,
  Settings,
  Trophy,
  User,
  UserRoundCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { UserRole } from "@/features/auth/types/auth.types";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  roles: UserRole[];
  exact?: boolean;
};

export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: Home, roles: ["ADMIN"], exact: true },
  { label: "Usuarios", href: "/admin/usuarios", icon: Users, roles: ["ADMIN"] },
  { label: "Personais", href: "/admin/personais", icon: UserRoundCheck, roles: ["ADMIN"] },
  { label: "Alunos", href: "/admin/alunos", icon: Users, roles: ["ADMIN"] },
  { label: "Exercicios", href: "/admin/exercicios", icon: Dumbbell, roles: ["ADMIN"] },
  { label: "Configuracoes", href: "/admin/configuracoes", icon: Settings, roles: ["ADMIN"] },
  { label: "Dashboard", href: "/personal", icon: Home, roles: ["PERSONAL"], exact: true },
  { label: "Alunos", href: "/personal/alunos", icon: Users, roles: ["PERSONAL"] },
  { label: "Exercicios", href: "/personal/exercicios", icon: Dumbbell, roles: ["PERSONAL"] },
  { label: "Templates", href: "/personal/templates", icon: ClipboardList, roles: ["PERSONAL"] },
  { label: "Treinos", href: "/personal/treinos", icon: FileText, roles: ["PERSONAL"] },
  { label: "Avaliacoes", href: "/personal/avaliacoes", icon: Activity, roles: ["PERSONAL"] },
  { label: "Evolucao", href: "/personal/evolucao", icon: BarChart3, roles: ["PERSONAL"] },
  { label: "Ranking", href: "/personal/ranking", icon: Trophy, roles: ["PERSONAL"] },
  { label: "Dashboard", href: "/aluno", icon: Home, roles: ["ALUNO"], exact: true },
  { label: "Meu perfil", href: "/aluno/perfil", icon: User, roles: ["ALUNO"] },
  { label: "Meu treino", href: "/aluno/treino", icon: Dumbbell, roles: ["ALUNO"] },
  { label: "Avaliacoes", href: "/aluno/avaliacoes", icon: Activity, roles: ["ALUNO"] },
  { label: "Evolucao", href: "/aluno/evolucao", icon: BarChart3, roles: ["ALUNO"] },
];

export function getNavigationItems(role: UserRole) {
  return navItems.filter((item) => item.roles.includes(role));
}

export function getRoleLabel(role?: UserRole | null) {
  if (role === "ADMIN") return "Administrador";
  if (role === "PERSONAL") return "Personal";
  if (role === "ALUNO") return "Aluno";
  return "FitSync";
}

export function isNavItemActive(pathname: string, item: NavItem) {
  if (item.exact) {
    return pathname === item.href;
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
