import { create } from "zustand";
import type { AuthUser } from "@/features/auth/types/auth.types";

type AuthState = {
  accessToken: string | null;
  user: AuthUser | null;
  isBootstrapping: boolean;
  setBootstrapping: (isBootstrapping: boolean) => void;
  setAccessToken: (accessToken: string | null) => void;
  setUser: (user: AuthUser | null) => void;
  setSession: (accessToken: string, user: AuthUser) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isBootstrapping: true,
  setBootstrapping: (isBootstrapping) => set({ isBootstrapping }),
  setAccessToken: (accessToken) => set({ accessToken }),
  setUser: (user) => set({ user }),
  setSession: (accessToken, user) => set({ accessToken, user, isBootstrapping: false }),
  clearSession: () => set({ accessToken: null, user: null, isBootstrapping: false }),
}));
