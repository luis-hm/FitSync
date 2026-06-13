"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getStudentProfile, updateStudentProfile } from "@/features/accounts/api/accounts.api";
import type { StudentProfileUpdatePayload } from "@/features/accounts/types/accounts.types";

export function useStudentProfile() {
  return useQuery({
    queryKey: ["accounts", "student-profile"],
    queryFn: getStudentProfile,
  });
}

export function useUpdateStudentProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: StudentProfileUpdatePayload) => updateStudentProfile(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["accounts", "student-profile"] });
    },
  });
}
