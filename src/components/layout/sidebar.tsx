"use client";

import { Dumbbell, LogOut } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { AuthUser, UserRole } from "@/features/auth/types/auth.types";
import { getRoleHome } from "@/lib/auth/role-routes";
import { cn } from "@/lib/utils";
import { getRoleLabel } from "./navigation";
import { NavigationList } from "./navigation-list";

type SidebarProps = {
  user: AuthUser | null;
  role: UserRole;
  onLogout: () => void;
  onNavigate?: () => void;
  className?: string;
};

export function Sidebar({ user, role, onLogout, onNavigate, className }: SidebarProps) {
  return (
    <aside className={cn("flex h-full w-60 shrink-0 flex-col border-r border-[#2A2A2A] bg-[#141414]", className)}>
      <div className="flex h-20 items-center border-b border-[#2A2A2A] px-5">
        <Link
          href={getRoleHome(role)}
          onClick={onNavigate}
          className="flex items-center gap-2 text-xl font-bold tracking-normal text-[#F5F5F5]"
        >
          <span className="flex size-9 items-center justify-center rounded-lg bg-[#B8FF57]">
            <Dumbbell className="size-5 text-[#0E0E0E]" aria-hidden="true" />
          </span>
          <span>FitSync</span>
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <NavigationList role={role} onNavigate={onNavigate} />
      </div>
      <div className="border-t border-[#2A2A2A] p-4">
        <div className="mb-4 flex min-w-0 items-center gap-3 rounded-lg p-2">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#333333] text-sm font-bold text-[#F5F5F5]">
            {user?.nome?.slice(0, 2).toUpperCase() || "FS"}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-[#F5F5F5]">{user?.nome}</p>
            <p className="truncate text-xs text-[#888888]">{getRoleLabel(role)}</p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start gap-2 border-[#2A2A2A] bg-[#1A1A1A] text-[#F5F5F5] hover:bg-[#1E1E1E]"
          onClick={onLogout}
        >
          <LogOut className="size-4" aria-hidden="true" />
          Sair
        </Button>
      </div>
    </aside>
  );
}
