import type { components, operations } from "@/types/generated/api";

export type Exercise = components["schemas"]["Exercicio"];
export type ExerciseCreatePayload = components["schemas"]["ExercicioRequest"];
export type ExerciseUpdatePayload = components["schemas"]["PatchedExercicioRequest"];
export type ExerciseBulkActionPayload = components["schemas"]["ExercicioBulkActionRequest"];
export type ExerciseBulkActionResponse = components["schemas"]["BulkActionResponse"];
export type ExerciseStatus = components["schemas"]["StatusEnum"];
export type ExerciseOrigin = components["schemas"]["OrigemEnum"];
export type ExerciseCategory = components["schemas"]["CategoriaExercicio"];
export type ExerciseCategoryCreatePayload = components["schemas"]["CategoriaExercicioRequest"];
export type ExerciseCategoryUpdatePayload = components["schemas"]["PatchedCategoriaExercicioRequest"];

export type WorkoutTemplate = components["schemas"]["TreinoTemplate"];
export type WorkoutTemplateCreatePayload = components["schemas"]["TreinoTemplateRequest"];
export type WorkoutTemplateUpdatePayload = components["schemas"]["PatchedTreinoTemplateRequest"];
export type WorkoutTemplateApplyPayload = components["schemas"]["AplicarTemplateRequest"];

export type Workout = components["schemas"]["Treino"];
export type WorkoutCreatePayload = components["schemas"]["TreinoRequest"];
export type WorkoutUpdatePayload = components["schemas"]["PatchedTreinoRequest"];
export type WorkoutDay = components["schemas"]["TreinoDiaSemanaEnum"];
export type WorkoutItemPayload = components["schemas"]["ItemTreinoRequest"];

export type ExercisesParams =
  operations["workouts_exercicios_list"]["parameters"]["query"];
export type ExerciseCategoriesParams =
  operations["workouts_categorias_list"]["parameters"]["query"];
export type WorkoutTemplatesParams =
  operations["workouts_templates_list"]["parameters"]["query"];
export type WorkoutsParams =
  operations["workouts_treinos_list"]["parameters"]["query"];

export type ExerciseCategoriesResponse =
  operations["workouts_categorias_list"]["responses"][200]["content"]["application/json"];
export type ExercisesResponse =
  operations["workouts_exercicios_list"]["responses"][200]["content"]["application/json"];
export type WorkoutTemplatesResponse =
  operations["workouts_templates_list"]["responses"][200]["content"]["application/json"];
export type WorkoutsResponse =
  operations["workouts_treinos_list"]["responses"][200]["content"]["application/json"];
