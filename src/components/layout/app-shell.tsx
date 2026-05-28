"use client";

import {
  Activity,
  BarChart3,
  ClipboardList,
  Dumbbell,
  FileText,
  Home,
  LogOut,
  Menu,
  Settings,
  Trophy,
  User,
  UserRoundCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { logout } from "@/features/auth/api/auth.api";
import type { UserRole } from "@/features/auth/types/auth.types";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

type NavItem = {
  label: string;
  href: string;
  icon: typeof Home;
  roles: UserRole[];
};

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: Home, roles: ["ADMIN"] },
  { label: "Usuarios", href: "/admin/usuarios", icon: Users, roles: ["ADMIN"] },
  { label: "Personais", href: "/admin/personais", icon: UserRoundCheck, roles: ["ADMIN"] },
  { label: "Alunos", href: "/admin/alunos", icon: Users, roles: ["ADMIN"] },
  { label: "Exercicios", href: "/admin/exercicios", icon: Dumbbell, roles: ["ADMIN"] },
  { label: "Configuracoes", href: "/admin/configuracoes", icon: Settings, roles: ["ADMIN"] },
  { label: "Dashboard", href: "/personal", icon: Home, roles: ["PERSONAL"] },
  { label: "Alunos", href: "/personal/alunos", icon: Users, roles: ["PERSONAL"] },
  { label: "Exercicios", href: "/personal/exercicios", icon: Dumbbell, roles: ["PERSONAL"] },
  { label: "Templates", href: "/personal/templates", icon: ClipboardList, roles: ["PERSONAL"] },
  { label: "Treinos", href: "/personal/treinos", icon: FileText, roles: ["PERSONAL"] },
  { label: "Avaliacoes", href: "/personal/avaliacoes", icon: Activity, roles: ["PERSONAL"] },
  { label: "Evolucao", href: "/personal/evolucao", icon: BarChart3, roles: ["PERSONAL"] },
  { label: "Ranking", href: "/personal/ranking", icon: Trophy, roles: ["PERSONAL"] },
  { label: "Dashboard", href: "/aluno", icon: Home, roles: ["ALUNO"] },
  { label: "Meu perfil", href: "/aluno/perfil", icon: User, roles: ["ALUNO"] },
  { label: "Meu treino", href: "/aluno/treino", icon: Dumbbell, roles: ["ALUNO"] },
  { label: "Avaliacoes", href: "/aluno/avaliacoes", icon: Activity, roles: ["ALUNO"] },
  { label: "Evolucao", href: "/aluno/evolucao", icon: BarChart3, roles: ["ALUNO"] },
];

function roleLabel(role?: UserRole) {
  if (role === "ADMIN") return "Administrador";
  if (role === "PERSONAL") return "Personal";
  if (role === "ALUNO") return "Aluno";
  return "FitSync";
}

function NavList({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const visibleItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <nav className="flex flex-col gap-1">
      {visibleItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
              isActive && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const role = user?.tipo ?? "ALUNO";

  async function handleLogout() {
    try {
      await logout();
    } catch {
      toast.error("Nao foi possivel encerrar a sessao no servidor.");
    } finally {
      clearSession();
      router.replace("/login");
    }
  }

  const sidebar = (
    <aside className="flex h-full w-72 flex-col border-r border-border bg-card">
      <div className="border-b border-border px-5 py-5">
        <Link href="/" className="text-lg font-semibold tracking-tight text-card-foreground">
          FitSync
        </Link>
        <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {roleLabel(user?.tipo)}
        </p>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <NavList role={role} />
      </div>
      <div className="border-t border-border p-4">
        <div className="mb-4 min-w-0">
          <p className="truncate text-sm font-medium text-card-foreground">{user?.nome}</p>
          <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
        </div>
        <Button variant="outline" className="w-full justify-start gap-2" onClick={handleLogout}>
          <LogOut className="size-4" aria-hidden="true" />
          Sair
        </Button>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:block">{sidebar}</div>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur md:px-6 lg:justify-end">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden" aria-label="Abrir menu">
                <Menu className="size-5" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <SheetTitle className="sr-only">Menu principal</SheetTitle>
              {sidebar}
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-3 text-right">
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-foreground">{user?.nome}</p>
              <p className="text-xs text-muted-foreground">{roleLabel(user?.tipo)}</p>
            </div>
            <span className="flex size-9 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
              {user?.nome?.slice(0, 1).toUpperCase() || "F"}
            </span>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 md:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
