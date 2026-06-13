"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAdminUser,
  getAdminUser,
  listAdminUsers,
  setAdminUserStatus,
  updateAdminUser,
} from "@/features/accounts/api/accounts.api";
import type {
  AdminUserCreatePayload,
  AdminUsersParams,
  AdminUserUpdatePayload,
  UserStatusAction,
} from "@/features/accounts/types/accounts.types";

export const adminUsersQueryKey = (params?: AdminUsersParams) =>
  ["accounts", "admin-users", params] as const;

export function useAdminUsers(params?: AdminUsersParams) {
  return useQuery({
    queryKey: adminUsersQueryKey(params),
    queryFn: () => listAdminUsers(params),
  });
}

export function useAdminUser(id?: string) {
  return useQuery({
    queryKey: ["accounts", "admin-user", id],
    queryFn: () => getAdminUser(id ?? ""),
    enabled: Boolean(id),
  });
}

export function useCreateAdminUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AdminUserCreatePayload) => createAdminUser(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}

export function useUpdateAdminUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AdminUserUpdatePayload }) =>
      updateAdminUser(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}

export function useSetAdminUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: UserStatusAction }) =>
      setAdminUserStatus(id, action),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}
