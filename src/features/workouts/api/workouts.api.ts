import { http } from "@/lib/api/http";

export async function listExercises() {
  const response = await http.get("/api/workouts/exercicios/");
  return response.data;
}

export async function listWorkoutTemplates() {
  const response = await http.get("/api/workouts/templates/");
  return response.data;
}

export async function listWorkouts() {
  const response = await http.get("/api/workouts/treinos/");
  return response.data;
}
