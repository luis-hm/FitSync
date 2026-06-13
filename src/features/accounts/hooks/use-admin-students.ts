"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAdminStudent,
  listAdminStudents,
  updateAdminStudent,
} from "@/features/accounts/api/accounts.api";
import type {
  AdminStudentsParams,
  AdminStudentUpdatePayload,
} from "@/features/accounts/types/accounts.types";

export const adminStudentsQueryKey = (params?: AdminStudentsParams) =>
  ["accounts", "admin-students", params] as const;

export function useAdminStudents(params?: AdminStudentsParams) {
  return useQuery({
    queryKey: adminStudentsQueryKey(params),
    queryFn: () => listAdminStudents(params),
  });
}

export function useAdminStudent(id?: string) {
  return useQuery({
    queryKey: ["accounts", "admin-student", id],
    queryFn: () => getAdminStudent(id ?? ""),
    enabled: Boolean(id),
  });
}

export function useUpdateAdminStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AdminStudentUpdatePayload }) =>
      updateAdminStudent(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}
