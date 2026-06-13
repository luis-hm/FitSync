import type {
  ExerciseCategoryCreatePayload,
  ExerciseCategoryUpdatePayload,
  ExerciseCreatePayload,
  ExerciseUpdatePayload,
  WorkoutCreatePayload,
  WorkoutDay,
  WorkoutTemplateApplyPayload,
  WorkoutTemplateCreatePayload,
  WorkoutTemplateUpdatePayload,
  WorkoutUpdatePayload,
} from "@/features/workouts/types/workouts.types";
import type {
  ApplyTemplateForm,
  ExerciseCategoryForm,
  ExerciseForm,
  WorkoutForm,
  WorkoutItemForm,
  WorkoutTemplateForm,
} from "@/features/workouts/schemas/workouts.schemas";

export function toExercisePayload(form: ExerciseForm): ExerciseCreatePayload {
  return {
    nome: form.nome,
    categoria_id: form.categoria_id,
    instrucoes_gerais: form.instrucoes_gerais || undefined,
    ativo: form.ativo,
  };
}

export function toExerciseUpdatePayload(form: ExerciseForm): ExerciseUpdatePayload {
  return toExercisePayload(form);
}

export function toExerciseCategoryPayload(form: ExerciseCategoryForm): ExerciseCategoryCreatePayload {
  return {
    nome: form.nome,
    ordem: form.ordem,
    ativo: form.ativo,
  };
}

export function toExerciseCategoryUpdatePayload(form: ExerciseCategoryForm): ExerciseCategoryUpdatePayload {
  return toExerciseCategoryPayload(form);
}

function toWorkoutItems(items: WorkoutItemForm[]) {
  return items.map((item, index) => ({
    exercicio_id: item.exercicio_id,
    series: item.series,
    repeticoes: item.repeticoes,
    descanso_segundos: item.descanso_segundos,
    ordem_execucao: item.ordem_execucao || index + 1,
  }));
}

function toWorkoutDay(value?: string): WorkoutDay | "" | undefined {
  return (value || undefined) as WorkoutDay | "" | undefined;
}

export function toWorkoutTemplatePayload(form: WorkoutTemplateForm): WorkoutTemplateCreatePayload {
  return {
    titulo: form.titulo,
    descricao: form.descricao || undefined,
    ativo: form.ativo,
    itens: toWorkoutItems(form.itens),
  };
}

export function toWorkoutTemplateUpdatePayload(form: WorkoutTemplateForm): WorkoutTemplateUpdatePayload {
  return toWorkoutTemplatePayload(form);
}

export function toWorkoutPayload(form: WorkoutForm): WorkoutCreatePayload {
  return {
    aluno_id: form.aluno_id,
    titulo: form.titulo,
    dia_da_semana: toWorkoutDay(form.dia_da_semana),
    data_inicio: form.data_inicio,
    data_vencimento: form.data_vencimento || null,
    ativo: form.ativo,
    itens: toWorkoutItems(form.itens),
  };
}

export function toWorkoutUpdatePayload(form: WorkoutForm): WorkoutUpdatePayload {
  return {
    titulo: form.titulo,
    dia_da_semana: toWorkoutDay(form.dia_da_semana),
    data_inicio: form.data_inicio,
    data_vencimento: form.data_vencimento || null,
    ativo: form.ativo,
    itens: toWorkoutItems(form.itens),
  };
}

export function toApplyTemplatePayload(form: ApplyTemplateForm): WorkoutTemplateApplyPayload {
  return {
    aluno_id: form.aluno_id,
    titulo: form.titulo || undefined,
    dia_da_semana: toWorkoutDay(form.dia_da_semana),
    data_inicio: form.data_inicio || undefined,
    data_vencimento: form.data_vencimento || null,
    ativo: form.ativo,
  };
}
