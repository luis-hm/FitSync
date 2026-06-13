import { http } from "@/lib/api/http";
import type {
  Exercise,
  ExerciseBulkActionPayload,
  ExerciseBulkActionResponse,
  ExerciseCategoriesParams,
  ExerciseCategoriesResponse,
  ExerciseCategory,
  ExerciseCategoryCreatePayload,
  ExerciseCategoryUpdatePayload,
  ExerciseCreatePayload,
  ExercisesParams,
  ExercisesResponse,
  ExerciseUpdatePayload,
  Workout,
  WorkoutCreatePayload,
  WorkoutsParams,
  WorkoutsResponse,
  WorkoutTemplate,
  WorkoutTemplateApplyPayload,
  WorkoutTemplateCreatePayload,
  WorkoutTemplatesParams,
  WorkoutTemplatesResponse,
  WorkoutTemplateUpdatePayload,
  WorkoutUpdatePayload,
} from "@/features/workouts/types/workouts.types";

export async function listExerciseCategories(params?: ExerciseCategoriesParams) {
  const response = await http.get<ExerciseCategoriesResponse>("/api/workouts/categorias/", {
    params,
  });
  return response.data;
}

export async function createExerciseCategory(payload: ExerciseCategoryCreatePayload) {
  const response = await http.post<ExerciseCategory>("/api/workouts/categorias/", payload);
  return response.data;
}

export async function updateExerciseCategory(id: string, payload: ExerciseCategoryUpdatePayload) {
  const response = await http.patch<ExerciseCategory>(`/api/workouts/categorias/${id}/`, payload);
  return response.data;
}

export async function archiveExerciseCategory(id: string) {
  const response = await http.post<ExerciseCategory>(`/api/workouts/categorias/${id}/arquivar/`);
  return response.data;
}

export async function listExercises(params?: ExercisesParams) {
  const response = await http.get<ExercisesResponse>("/api/workouts/exercicios/", {
    params,
  });
  return response.data;
}

export async function getExercise(id: string) {
  const response = await http.get<Exercise>(`/api/workouts/exercicios/${id}/`);
  return response.data;
}

export async function createExercise(payload: ExerciseCreatePayload) {
  const response = await http.post<Exercise>("/api/workouts/exercicios/", payload);
  return response.data;
}

export async function updateExercise(id: string, payload: ExerciseUpdatePayload) {
  const response = await http.patch<Exercise>(`/api/workouts/exercicios/${id}/`, payload);
  return response.data;
}

export async function archiveExercise(id: string) {
  const response = await http.post<Exercise>(`/api/workouts/exercicios/${id}/arquivar/`);
  return response.data;
}

export async function approveExercise(id: string) {
  const response = await http.post<Exercise>(`/api/workouts/exercicios/${id}/aprovar/`);
  return response.data;
}

export async function rejectExercise(id: string) {
  const response = await http.post<Exercise>(`/api/workouts/exercicios/${id}/rejeitar/`);
  return response.data;
}

export async function approveExercises(payload: ExerciseBulkActionPayload) {
  const response = await http.post<ExerciseBulkActionResponse>(
    "/api/workouts/exercicios/aprovar-lote/",
    payload,
  );
  return response.data;
}

export async function rejectExercises(payload: ExerciseBulkActionPayload) {
  const response = await http.post<ExerciseBulkActionResponse>(
    "/api/workouts/exercicios/rejeitar-lote/",
    payload,
  );
  return response.data;
}

export async function listWorkoutTemplates(params?: WorkoutTemplatesParams) {
  const response = await http.get<WorkoutTemplatesResponse>("/api/workouts/templates/", {
    params,
  });
  return response.data;
}

export async function createWorkoutTemplate(payload: WorkoutTemplateCreatePayload) {
  const response = await http.post<WorkoutTemplate>("/api/workouts/templates/", payload);
  return response.data;
}

export async function updateWorkoutTemplate(id: string, payload: WorkoutTemplateUpdatePayload) {
  const response = await http.patch<WorkoutTemplate>(`/api/workouts/templates/${id}/`, payload);
  return response.data;
}

export async function archiveWorkoutTemplate(id: string) {
  const response = await http.post<WorkoutTemplate>(`/api/workouts/templates/${id}/arquivar/`);
  return response.data;
}

export async function applyWorkoutTemplate(id: string, payload: WorkoutTemplateApplyPayload) {
  const response = await http.post<Workout>(`/api/workouts/templates/${id}/aplicar/`, payload);
  return response.data;
}

export async function listWorkouts(params?: WorkoutsParams) {
  const response = await http.get<WorkoutsResponse>("/api/workouts/treinos/", {
    params,
  });
  return response.data;
}

export async function createWorkout(payload: WorkoutCreatePayload) {
  const response = await http.post<Workout>("/api/workouts/treinos/", payload);
  return response.data;
}

export async function updateWorkout(id: string, payload: WorkoutUpdatePayload) {
  const response = await http.patch<Workout>(`/api/workouts/treinos/${id}/`, payload);
  return response.data;
}

export async function archiveWorkout(id: string) {
  const response = await http.post<Workout>(`/api/workouts/treinos/${id}/arquivar/`);
  return response.data;
}

export async function activateWorkout(id: string) {
  const response = await http.post<Workout>(`/api/workouts/treinos/${id}/ativar/`);
  return response.data;
}
