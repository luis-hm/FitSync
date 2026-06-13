"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAdminPersonal,
  listAdminPersonals,
  updateAdminPersonal,
} from "@/features/accounts/api/accounts.api";
import type {
  AdminPersonalsParams,
  AdminPersonalUpdatePayload,
} from "@/features/accounts/types/accounts.types";

export const adminPersonalsQueryKey = (params?: AdminPersonalsParams) =>
  ["accounts", "admin-personals", params] as const;

export function useAdminPersonals(params?: AdminPersonalsParams) {
  return useQuery({
    queryKey: adminPersonalsQueryKey(params),
    queryFn: () => listAdminPersonals(params),
  });
}

export function useAdminPersonal(id?: string) {
  return useQuery({
    queryKey: ["accounts", "admin-personal", id],
    queryFn: () => getAdminPersonal(id ?? ""),
    enabled: Boolean(id),
  });
}

export function useUpdateAdminPersonal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AdminPersonalUpdatePayload }) =>
      updateAdminPersonal(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}
