"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPersonalStudent,
  getPersonalStudent,
  listPersonalStudents,
  updatePersonalStudent,
} from "@/features/accounts/api/accounts.api";
import type {
  PersonalStudentCreatePayload,
  PersonalStudentsParams,
  PersonalStudentUpdatePayload,
} from "@/features/accounts/types/accounts.types";

export const personalStudentsQueryKey = (params?: PersonalStudentsParams) =>
  ["accounts", "personal-students", params] as const;
export const personalStudentQueryKey = (id?: string) =>
  ["accounts", "personal-student", id] as const;

export function usePersonalStudents(params?: PersonalStudentsParams) {
  return useQuery({
    queryKey: personalStudentsQueryKey(params),
    queryFn: () => listPersonalStudents(params),
  });
}

export function usePersonalStudent(id?: string) {
  return useQuery({
    queryKey: personalStudentQueryKey(id),
    queryFn: () => getPersonalStudent(id ?? ""),
    enabled: Boolean(id),
  });
}

export function useCreatePersonalStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PersonalStudentCreatePayload) => createPersonalStudent(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}

export function useUpdatePersonalStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: PersonalStudentUpdatePayload }) =>
      updatePersonalStudent(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}
