"use client";

import { useCallback } from "react";
import { getMe, refreshSession } from "@/features/auth/api/auth.api";
import { useAuthStore } from "@/stores/auth-store";

export function useSessionBootstrap() {
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const setBootstrapping = useAuthStore((state) => state.setBootstrapping);
  const setUser = useAuthStore((state) => state.setUser);
  const clearSession = useAuthStore((state) => state.clearSession);

  return useCallback(async () => {
    setBootstrapping(true);

    try {
      const refreshed = await refreshSession();
      setAccessToken(refreshed.access);
      const user = await getMe();
      setUser(user);
      return user;
    } catch {
      clearSession();
      return null;
    } finally {
      setBootstrapping(false);
    }
  }, [clearSession, setAccessToken, setBootstrapping, setUser]);
}
