import { z } from "zod";

export const exerciseSchema = z.object({
  nome: z.string().trim().min(1, "Informe o nome."),
  categoria_id: z.string().min(1, "Selecione a categoria."),
  instrucoes_gerais: z.string().trim().optional(),
  ativo: z.boolean(),
});

export type ExerciseForm = z.infer<typeof exerciseSchema>;

export const exerciseCategorySchema = z.object({
  nome: z.string().trim().min(1, "Informe o nome da categoria."),
  ordem: z.coerce.number().int().min(0, "Informe uma ordem valida."),
  ativo: z.boolean(),
});

export type ExerciseCategoryForm = z.infer<typeof exerciseCategorySchema>;

export const workoutItemSchema = z.object({
  exercicio_id: z.string().min(1, "Selecione um exercicio."),
  series: z.coerce.number().int().min(1, "Informe as series."),
  repeticoes: z.string().trim().min(1, "Informe as repeticoes."),
  descanso_segundos: z.coerce.number().int().min(0, "Informe o descanso."),
  ordem_execucao: z.coerce.number().int().min(1, "Informe a ordem."),
});

export const workoutTemplateSchema = z.object({
  titulo: z.string().trim().min(1, "Informe o titulo."),
  descricao: z.string().trim().optional(),
  ativo: z.boolean(),
  itens: z.array(workoutItemSchema).min(1, "Adicione ao menos um exercicio."),
});

export const workoutSchema = z.object({
  aluno_id: z.string().min(1, "Selecione um aluno."),
  titulo: z.string().trim().min(1, "Informe o titulo."),
  dia_da_semana: z.string().optional(),
  data_inicio: z.string().min(1, "Informe a data de inicio."),
  data_vencimento: z.string().optional(),
  ativo: z.boolean(),
  itens: z.array(workoutItemSchema).min(1, "Adicione ao menos um exercicio."),
});

export const applyTemplateSchema = z.object({
  aluno_id: z.string().min(1, "Selecione um aluno."),
  titulo: z.string().trim().optional(),
  dia_da_semana: z.string().optional(),
  data_inicio: z.string().optional(),
  data_vencimento: z.string().optional(),
  ativo: z.boolean(),
});

export type WorkoutItemForm = z.infer<typeof workoutItemSchema>;
export type WorkoutTemplateForm = z.infer<typeof workoutTemplateSchema>;
export type WorkoutForm = z.infer<typeof workoutSchema>;
export type ApplyTemplateForm = z.infer<typeof applyTemplateSchema>;
