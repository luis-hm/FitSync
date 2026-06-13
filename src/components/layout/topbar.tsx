"use client";

import type { AuthUser, UserRole } from "@/features/auth/types/auth.types";
import { getRoleLabel } from "./navigation";
import { MobileSidebar } from "./mobile-sidebar";
import { ThemeToggle } from "./theme-toggle";

type TopbarProps = {
  user: AuthUser | null;
  role: UserRole;
  onLogout: () => void;
};

export function Topbar({ user, role, onLogout }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-[#2A2A2A] bg-[#0E0E0E]/95 px-4 backdrop-blur md:px-8 lg:justify-end">
      <MobileSidebar user={user} role={role} onLogout={onLogout} />
      <div className="flex items-center gap-3 text-right">
        <ThemeToggle />
        <div className="hidden sm:block">
          <p className="text-sm font-medium text-[#F5F5F5]">{user?.nome}</p>
          <p className="text-xs text-[#888888]">{getRoleLabel(role)}</p>
        </div>
        <span className="flex size-10 items-center justify-center rounded-full bg-[#333333] text-sm font-semibold text-[#F5F5F5]">
          {user?.nome?.slice(0, 1).toUpperCase() || "F"}
        </span>
      </div>
    </header>
  );
}
