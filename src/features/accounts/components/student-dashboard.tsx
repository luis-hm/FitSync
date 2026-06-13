"use client";

import { Activity, BarChart3, Dumbbell, User } from "lucide-react";
import { ErrorPanel, LoadingPanel } from "@/components/shared/admin-screen";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAssessments, useMyEvolution } from "@/features/assessments/hooks/use-assessments";
import { formatMetric } from "@/features/assessments/mappers/assessments.mappers";
import { useStudentProfile } from "@/features/accounts/hooks/use-student-profile";
import { formatDate } from "@/features/accounts/mappers/accounts.mappers";
import { useWorkouts } from "@/features/workouts/hooks/use-admin-exercises";
import { getApiErrorMessage } from "@/lib/api/errors";

export function StudentDashboard() {
  const profileQuery = useStudentProfile();
  const workoutsQuery = useWorkouts({ ativo: true });
  const assessmentsQuery = useAssessments({ page: 1 });
  const evolutionQuery = useMyEvolution();
  const activeWorkout = workoutsQuery.data?.results[0];
  const lastAssessment = assessmentsQuery.data?.results[0];
  const lastPoint = evolutionQuery.data?.results.at(-1);

  if (profileQuery.isLoading || workoutsQuery.isLoading || assessmentsQuery.isLoading || evolutionQuery.isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Area do aluno" description="Resumo do seu acompanhamento." />
        <LoadingPanel rows={5} />
      </div>
    );
  }

  const error = profileQuery.error || workoutsQuery.error || assessmentsQuery.error || evolutionQuery.error;
  if (profileQuery.isError || workoutsQuery.isError || assessmentsQuery.isError || evolutionQuery.isError) {
    return <ErrorPanel description={getApiErrorMessage(error, "Nao foi possivel carregar sua area.")} />;
  }

  const cards = [
    {
      title: "Treino atual",
      value: activeWorkout?.titulo ?? "Sem treino",
      detail: activeWorkout ? `${activeWorkout.itens?.length ?? 0} exercicios` : "Aguardando personal",
      icon: Dumbbell,
    },
    {
      title: "Avaliacoes",
      value: assessmentsQuery.data?.count ?? 0,
      detail: lastAssessment ? `Ultima em ${formatDate(lastAssessment.data_avaliacao)}` : "Sem historico",
      icon: Activity,
    },
    {
      title: "Gordura atual",
      value: formatMetric(lastPoint?.percentual_gordura, "%"),
      detail: "ultima avaliacao",
      icon: BarChart3,
    },
    {
      title: "Personal",
      value: profileQuery.data?.personal_nome ?? "-",
      detail: profileQuery.data?.objetivo_principal || "Sem objetivo informado",
      icon: User,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Area do aluno" description="Resumo do treino, avaliacoes e progresso." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="border border-border">
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm text-muted-foreground">{card.title}</CardTitle>
                <Icon className="size-4 text-primary" aria-hidden="true" />
              </CardHeader>
              <CardContent>
                <div className="truncate text-2xl font-bold text-foreground">{card.value}</div>
                <p className="mt-1 truncate text-sm text-muted-foreground">{card.detail}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
