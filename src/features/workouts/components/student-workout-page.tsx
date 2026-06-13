"use client";

import { Clock, Dumbbell, Eye, ImageIcon, ListOrdered, Repeat } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { EmptyPanel, ErrorPanel, LoadingPanel, SummaryChips } from "@/components/shared/admin-screen";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useWorkouts } from "@/features/workouts/hooks/use-admin-exercises";
import type { Workout } from "@/features/workouts/types/workouts.types";
import { formatDate } from "@/features/accounts/mappers/accounts.mappers";
import { getApiErrorMessage } from "@/lib/api/errors";

type WorkoutItem = NonNullable<Workout["itens"]>[number];

export function StudentWorkoutPage() {
  const [selectedItem, setSelectedItem] = useState<WorkoutItem | null>(null);
  const workoutsQuery = useWorkouts({ ativo: true });
  const activeWorkout = workoutsQuery.data?.results[0];
  const orderedItems = useMemo(
    () => [...(activeWorkout?.itens ?? [])].sort((a, b) => a.ordem_execucao - b.ordem_execucao),
    [activeWorkout?.itens],
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Meu treino" description="Ficha ativa com parametros de execucao e orientacoes." />

      {activeWorkout ? (
        <SummaryChips
          items={[
            { label: "Ficha", value: activeWorkout.titulo },
            { label: "Inicio", value: formatDate(activeWorkout.data_inicio) },
            { label: "Exercicios", value: orderedItems.length },
          ]}
        />
      ) : null}

      {workoutsQuery.isLoading ? <LoadingPanel /> : null}
      {workoutsQuery.isError ? (
        <ErrorPanel description={getApiErrorMessage(workoutsQuery.error, "Nao foi possivel carregar seu treino.")} />
      ) : null}
      {workoutsQuery.data?.results.length === 0 ? (
        <EmptyPanel icon={Dumbbell} title="Nenhum treino ativo" description="Quando seu personal ativar uma ficha, ela aparecera aqui." />
      ) : null}

      {activeWorkout ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="secondary">{formatDay(activeWorkout.dia_da_semana)}</Badge>
            <span>{activeWorkout.data_vencimento ? `Vence em ${formatDate(activeWorkout.data_vencimento)}` : "Sem vencimento definido"}</span>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            {orderedItems.map((item) => (
              <Card key={item.id} className="rounded-lg">
                <CardHeader className="grid-cols-[1fr_auto]">
                  <div className="min-w-0">
                    <CardTitle className="truncate">{item.exercicio.nome}</CardTitle>
                    <p className="mt-1 text-xs text-muted-foreground">{getExerciseCategoryName(item.exercicio)}</p>
                  </div>
                  <Badge variant="secondary">#{item.ordem_execucao}</Badge>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <Metric icon={ListOrdered} label="Series" value={String(item.series)} />
                    <Metric icon={Repeat} label="Reps" value={item.repeticoes} />
                    <Metric icon={Clock} label="Descanso" value={`${item.descanso_segundos}s`} />
                  </div>
                  <Button type="button" variant="outline" className="mt-4 w-full" onClick={() => setSelectedItem(item)}>
                    <Eye className="size-4" aria-hidden="true" />
                    Ver execucao
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : null}

      <ExecutionDialog item={selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)} />
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof ListOrdered;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-lg border border-border bg-muted/30 p-3">
      <div className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="size-3.5" aria-hidden="true" />
        <span>{label}</span>
      </div>
      <div className="truncate font-semibold text-foreground">{value}</div>
    </div>
  );
}

function ExecutionDialog({
  item,
  onOpenChange,
}: {
  item: WorkoutItem | null;
  onOpenChange: (open: boolean) => void;
}) {
  const exercise = item?.exercicio;

  return (
    <Dialog open={Boolean(item)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{exercise?.nome ?? "Execucao"}</DialogTitle>
          <DialogDescription>{exercise ? getExerciseCategoryName(exercise) : "Orientacoes do exercicio"}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-5 md:grid-cols-[260px_1fr]">
          <div className="flex aspect-square items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
            {exercise?.url_animacao ? (
              <Image
                src={exercise.url_animacao}
                alt={exercise.nome}
                width={520}
                height={520}
                className="h-full w-full object-cover"
              />
            ) : (
              <ImageIcon className="size-12 text-muted-foreground" aria-hidden="true" />
            )}
          </div>
          <div className="space-y-4">
            {item ? (
              <div className="grid grid-cols-3 gap-2">
                <Metric icon={ListOrdered} label="Series" value={String(item.series)} />
                <Metric icon={Repeat} label="Reps" value={item.repeticoes} />
                <Metric icon={Clock} label="Descanso" value={`${item.descanso_segundos}s`} />
              </div>
            ) : null}
            <div>
              <h3 className="mb-2 text-sm font-semibold text-foreground">Instrucoes</h3>
              <p className="whitespace-pre-line text-sm leading-6 text-muted-foreground">
                {exercise?.instrucoes_gerais || "Este exercicio ainda nao possui instrucoes detalhadas."}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function formatDay(value?: string) {
  const labels: Record<string, string> = {
    SEGUNDA: "Segunda-feira",
    TERCA: "Terca-feira",
    QUARTA: "Quarta-feira",
    QUINTA: "Quinta-feira",
    SEXTA: "Sexta-feira",
    SABADO: "Sabado",
    DOMINGO: "Domingo",
  };
  return value ? labels[value] ?? value : "Sem dia fixo";
}

function getExerciseCategoryName(exercise: WorkoutItem["exercicio"]) {
  return exercise.categoria_nome || exercise.grupo_muscular || "Sem categoria";
}
