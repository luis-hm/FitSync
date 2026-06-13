"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  activateWorkout,
  archiveExerciseCategory,
  archiveExercise,
  archiveWorkout,
  archiveWorkoutTemplate,
  applyWorkoutTemplate,
  approveExercise,
  approveExercises,
  createExerciseCategory,
  createExercise,
  createWorkout,
  createWorkoutTemplate,
  getExercise,
  listExerciseCategories,
  listExercises,
  listWorkouts,
  listWorkoutTemplates,
  rejectExercise,
  rejectExercises,
  updateExerciseCategory,
  updateExercise,
  updateWorkout,
  updateWorkoutTemplate,
} from "@/features/workouts/api/workouts.api";
import type {
  ExerciseBulkActionPayload,
  ExerciseCategoriesParams,
  ExerciseCategoryCreatePayload,
  ExerciseCategoryUpdatePayload,
  ExerciseCreatePayload,
  ExercisesParams,
  ExerciseUpdatePayload,
  WorkoutCreatePayload,
  WorkoutsParams,
  WorkoutTemplateApplyPayload,
  WorkoutTemplateCreatePayload,
  WorkoutTemplatesParams,
  WorkoutTemplateUpdatePayload,
  WorkoutUpdatePayload,
} from "@/features/workouts/types/workouts.types";

export const exerciseCategoriesQueryKey = (params?: ExerciseCategoriesParams) =>
  ["workouts", "exercise-categories", params] as const;

export function useExerciseCategories(params?: ExerciseCategoriesParams) {
  return useQuery({
    queryKey: exerciseCategoriesQueryKey(params),
    queryFn: () => listExerciseCategories(params),
  });
}

export function useCreateExerciseCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ExerciseCategoryCreatePayload) => createExerciseCategory(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["workouts"] });
    },
  });
}

export function useUpdateExerciseCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ExerciseCategoryUpdatePayload }) =>
      updateExerciseCategory(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["workouts"] });
    },
  });
}

export function useArchiveExerciseCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => archiveExerciseCategory(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["workouts"] });
    },
  });
}

export const adminExercisesQueryKey = (params?: ExercisesParams) =>
  ["workouts", "admin-exercises", params] as const;

export function useAdminExercises(params?: ExercisesParams) {
  return useQuery({
    queryKey: adminExercisesQueryKey(params),
    queryFn: () => listExercises(params),
  });
}

export function useAdminExercise(id?: string) {
  return useQuery({
    queryKey: ["workouts", "admin-exercise", id],
    queryFn: () => getExercise(id ?? ""),
    enabled: Boolean(id),
  });
}

export function useCreateExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ExerciseCreatePayload) => createExercise(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["workouts"] });
    },
  });
}

export function useUpdateExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ExerciseUpdatePayload }) =>
      updateExercise(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["workouts"] });
    },
  });
}

export function useArchiveExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => archiveExercise(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["workouts"] });
    },
  });
}

export function useApproveExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => approveExercise(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["workouts"] });
    },
  });
}

export function useRejectExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => rejectExercise(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["workouts"] });
    },
  });
}

export function useApproveExercises() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ExerciseBulkActionPayload) => approveExercises(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["workouts"] });
    },
  });
}

export function useRejectExercises() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ExerciseBulkActionPayload) => rejectExercises(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["workouts"] });
    },
  });
}

export const workoutTemplatesQueryKey = (params?: WorkoutTemplatesParams) =>
  ["workouts", "templates", params] as const;

export function useWorkoutTemplates(params?: WorkoutTemplatesParams) {
  return useQuery({
    queryKey: workoutTemplatesQueryKey(params),
    queryFn: () => listWorkoutTemplates(params),
  });
}

export function useCreateWorkoutTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: WorkoutTemplateCreatePayload) => createWorkoutTemplate(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["workouts"] });
    },
  });
}

export function useUpdateWorkoutTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: WorkoutTemplateUpdatePayload }) =>
      updateWorkoutTemplate(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["workouts"] });
    },
  });
}

export function useArchiveWorkoutTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => archiveWorkoutTemplate(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["workouts"] });
    },
  });
}

export function useApplyWorkoutTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: WorkoutTemplateApplyPayload }) =>
      applyWorkoutTemplate(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["workouts"] });
    },
  });
}

export const workoutsQueryKey = (params?: WorkoutsParams) => ["workouts", "treinos", params] as const;

export function useWorkouts(params?: WorkoutsParams) {
  return useQuery({
    queryKey: workoutsQueryKey(params),
    queryFn: () => listWorkouts(params),
  });
}

export function useCreateWorkout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: WorkoutCreatePayload) => createWorkout(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["workouts"] });
    },
  });
}

export function useUpdateWorkout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: WorkoutUpdatePayload }) =>
      updateWorkout(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["workouts"] });
    },
  });
}

export function useArchiveWorkout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => archiveWorkout(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["workouts"] });
    },
  });
}

export function useActivateWorkout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => activateWorkout(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["workouts"] });
    },
  });
}
