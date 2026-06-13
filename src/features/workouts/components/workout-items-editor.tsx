"use client";

import { Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { WorkoutItemForm } from "@/features/workouts/schemas/workouts.schemas";
import type { Exercise, ExerciseCategory } from "@/features/workouts/types/workouts.types";

type WorkoutItemsEditorProps = {
  items: WorkoutItemForm[];
  exercises: Exercise[];
  categories: ExerciseCategory[];
  onChange: (items: WorkoutItemForm[]) => void;
};

const emptyItem = (order: number): WorkoutItemForm => ({
  exercicio_id: "",
  series: 3,
  repeticoes: "10",
  descanso_segundos: 60,
  ordem_execucao: order,
});

export function WorkoutItemsEditor({ items, exercises, categories, onChange }: WorkoutItemsEditorProps) {
  const [categoryFilter, setCategoryFilter] = useState("");
  const filteredExercises = useMemo(
    () => exercises.filter((exercise) => !categoryFilter || exercise.categoria_id === categoryFilter),
    [categoryFilter, exercises],
  );

  function updateItem(index: number, patch: Partial<WorkoutItemForm>) {
    onChange(items.map((item, currentIndex) => (currentIndex === index ? { ...item, ...patch } : item)));
  }

  function addItem() {
    onChange([...items, emptyItem(items.length + 1)]);
  }

  function removeItem(index: number) {
    const nextItems = items
      .filter((_, currentIndex) => currentIndex !== index)
      .map((item, currentIndex) => ({ ...item, ordem_execucao: currentIndex + 1 }));
    onChange(nextItems.length > 0 ? nextItems : [emptyItem(1)]);
  }

  function getExerciseOptions(item: WorkoutItemForm) {
    const selectedExercise = exercises.find((exercise) => exercise.id === item.exercicio_id);
    if (selectedExercise && !filteredExercises.some((exercise) => exercise.id === selectedExercise.id)) {
      return [selectedExercise, ...filteredExercises];
    }
    return filteredExercises;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-sm font-semibold text-foreground">Exercicios do treino</h3>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm text-foreground sm:w-56"
          >
            <option value="">Todas as categorias</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.nome}
              </option>
            ))}
          </select>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="size-4" aria-hidden="true" />
            Adicionar
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="grid gap-2 rounded-lg border border-border bg-muted/30 p-3 md:grid-cols-[1.5fr_0.5fr_0.8fr_0.7fr_0.5fr_auto]">
            <label className="space-y-1">
              <span className="text-xs text-muted-foreground">Exercicio</span>
              <select
                value={item.exercicio_id}
                onChange={(event) => updateItem(index, { exercicio_id: event.target.value })}
                className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm text-foreground"
                required
              >
                <option value="">Selecione</option>
                {getExerciseOptions(item).map((exercise) => (
                  <option key={exercise.id} value={exercise.id}>
                    {exercise.nome} - {getExerciseCategoryName(exercise)}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-xs text-muted-foreground">Series</span>
              <Input
                type="number"
                min={1}
                value={item.series}
                onChange={(event) => updateItem(index, { series: Number(event.target.value) })}
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs text-muted-foreground">Reps</span>
              <Input value={item.repeticoes} onChange={(event) => updateItem(index, { repeticoes: event.target.value })} />
            </label>
            <label className="space-y-1">
              <span className="text-xs text-muted-foreground">Descanso</span>
              <Input
                type="number"
                min={0}
                value={item.descanso_segundos}
                onChange={(event) => updateItem(index, { descanso_segundos: Number(event.target.value) })}
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs text-muted-foreground">Ordem</span>
              <Input
                type="number"
                min={1}
                value={item.ordem_execucao}
                onChange={(event) => updateItem(index, { ordem_execucao: Number(event.target.value) })}
              />
            </label>
            <div className="flex items-end">
              <Button type="button" variant="outline" size="icon" aria-label="Remover exercicio" onClick={() => removeItem(index)}>
                <Trash2 className="size-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        ))}
      </div>
      {exercises.length === 0 ? (
        <p className="text-xs text-muted-foreground">Nenhum exercicio aprovado carregado para selecao.</p>
      ) : filteredExercises.length === 0 ? (
        <p className="text-xs text-muted-foreground">Nenhum exercicio aprovado nessa categoria.</p>
      ) : null}
    </div>
  );
}

export function createEmptyWorkoutItem(order = 1): WorkoutItemForm {
  return emptyItem(order);
}

function getExerciseCategoryName(exercise: Exercise) {
  return exercise.categoria_nome || exercise.grupo_muscular || "Sem categoria";
}
