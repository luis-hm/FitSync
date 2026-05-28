import type { UserRole } from "@/features/auth/types/auth.types";

export const roleHome: Record<UserRole, string> = {
  ADMIN: "/admin",
  PERSONAL: "/personal",
  ALUNO: "/aluno",
};

export function getRoleHome(role?: UserRole | null) {
  return role ? roleHome[role] : "/login";
}
