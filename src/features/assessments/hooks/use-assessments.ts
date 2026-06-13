"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  archiveAssessment,
  createAssessment,
  getAssessment,
  getMyEvolution,
  getMyAnamnese,
  getMySummary,
  getPersonalRanking,
  getStudentAnamnese,
  getStudentSummary,
  getStudentEvolution,
  listAssessments,
  updateStudentAnamnese,
  updateAssessment,
} from "@/features/assessments/api/assessments.api";
import type {
  AnamnesePayload,
  AssessmentCreatePayload,
  AssessmentUpdatePayload,
  AssessmentsParams,
  EvolutionParams,
} from "@/features/assessments/types/assessments.types";

export const assessmentsQueryKey = (params?: AssessmentsParams) => ["assessments", "list", params] as const;
export const assessmentQueryKey = (id?: string) => ["assessments", "detail", id] as const;
export const studentSummaryQueryKey = (studentId?: string) => ["assessments", "summary", studentId] as const;
export const mySummaryQueryKey = () => ["assessments", "my-summary"] as const;
export const studentAnamneseQueryKey = (studentId?: string) => ["assessments", "anamnese", studentId] as const;
export const myAnamneseQueryKey = () => ["assessments", "my-anamnese"] as const;
export const studentEvolutionQueryKey = (studentId?: string, params?: EvolutionParams) =>
  ["assessments", "evolution", studentId, params] as const;
export const myEvolutionQueryKey = (params?: EvolutionParams) =>
  ["assessments", "my-evolution", params] as const;
export const personalRankingQueryKey = (params?: EvolutionParams) =>
  ["assessments", "ranking", params] as const;

export function useAssessments(params?: AssessmentsParams) {
  return useQuery({
    queryKey: assessmentsQueryKey(params),
    queryFn: () => listAssessments(params),
  });
}

export function useAssessment(id?: string) {
  return useQuery({
    queryKey: assessmentQueryKey(id),
    queryFn: () => getAssessment(id ?? ""),
    enabled: Boolean(id),
  });
}

export function useStudentSummary(studentId?: string) {
  return useQuery({
    queryKey: studentSummaryQueryKey(studentId),
    queryFn: () => getStudentSummary(studentId ?? ""),
    enabled: Boolean(studentId),
  });
}

export function useMySummary() {
  return useQuery({
    queryKey: mySummaryQueryKey(),
    queryFn: getMySummary,
  });
}

export function useStudentAnamnese(studentId?: string) {
  return useQuery({
    queryKey: studentAnamneseQueryKey(studentId),
    queryFn: () => getStudentAnamnese(studentId ?? ""),
    enabled: Boolean(studentId),
  });
}

export function useUpdateStudentAnamnese() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ studentId, payload }: { studentId: string; payload: AnamnesePayload }) =>
      updateStudentAnamnese(studentId, payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: studentAnamneseQueryKey(variables.studentId) });
      void queryClient.invalidateQueries({ queryKey: studentSummaryQueryKey(variables.studentId) });
      void queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}

export function useMyAnamnese() {
  return useQuery({
    queryKey: myAnamneseQueryKey(),
    queryFn: getMyAnamnese,
  });
}

export function useCreateAssessment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AssessmentCreatePayload) => createAssessment(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["assessments"] });
      void queryClient.invalidateQueries({ queryKey: ["accounts", "personal-dashboard"] });
    },
  });
}

export function useUpdateAssessment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AssessmentUpdatePayload }) =>
      updateAssessment(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["assessments"] });
      void queryClient.invalidateQueries({ queryKey: ["accounts", "personal-dashboard"] });
    },
  });
}

export function useArchiveAssessment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => archiveAssessment(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["assessments"] });
      void queryClient.invalidateQueries({ queryKey: ["accounts", "personal-dashboard"] });
    },
  });
}

export function useStudentEvolution(studentId?: string, params?: EvolutionParams) {
  return useQuery({
    queryKey: studentEvolutionQueryKey(studentId, params),
    queryFn: () => getStudentEvolution(studentId ?? "", params),
    enabled: Boolean(studentId),
  });
}

export function useMyEvolution(params?: EvolutionParams) {
  return useQuery({
    queryKey: myEvolutionQueryKey(params),
    queryFn: () => getMyEvolution(params),
  });
}

export function usePersonalRanking(params?: EvolutionParams) {
  return useQuery({
    queryKey: personalRankingQueryKey(params),
    queryFn: () => getPersonalRanking(params),
  });
}
