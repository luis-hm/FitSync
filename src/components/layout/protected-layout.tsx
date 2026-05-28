"use client";

import { Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { useSessionBootstrap } from "@/features/auth/hooks/use-session-bootstrap";
import { getRoleHome } from "@/lib/auth/role-routes";
import { useAuthStore } from "@/stores/auth-store";

export function ProtectedLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const bootstrap = useSessionBootstrap();
  const user = useAuthStore((state) => state.user);
  const isBootstrapping = useAuthStore((state) => state.isBootstrapping);

  useEffect(() => {
    let cancelled = false;

    if (!user) {
      bootstrap().then((bootstrappedUser) => {
        if (cancelled) return;
        if (!bootstrappedUser) {
          router.replace("/login");
          return;
        }

        const home = getRoleHome(bootstrappedUser.tipo);
        if (!pathname.startsWith(home)) {
          router.replace(home);
        }
      });
      return () => {
        cancelled = true;
      };
    }

    const home = getRoleHome(user.tipo);
    if (!pathname.startsWith(home)) {
      router.replace(home);
    }

    return () => {
      cancelled = true;
    };
  }, [bootstrap, pathname, router, user]);

  if (isBootstrapping || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
          <Loader2 className="size-5 animate-spin" aria-hidden="true" />
          Preparando sua area FitSync
        </div>
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
