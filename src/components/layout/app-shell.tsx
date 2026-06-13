"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { logout } from "@/features/auth/api/auth.api";
import { useAuthStore } from "@/stores/auth-store";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const role = user?.tipo ?? "ALUNO";

  async function handleLogout() {
    try {
      await logout();
    } catch {
      toast.error("Nao foi possivel encerrar a sessao no servidor.");
    } finally {
      queryClient.clear();
      clearSession();
      router.replace("/login");
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0E0E0E] text-[#F5F5F5]">
      <div className="hidden h-screen shrink-0 lg:block">
        <Sidebar user={user} role={role} onLogout={handleLogout} className="h-screen" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar user={user} role={role} onLogout={handleLogout} />
        <main className="min-h-0 flex-1 overflow-y-auto px-4 py-6 md:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
