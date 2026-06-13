"use client";

import { Activity, Dumbbell, TrendingUp, UserRoundCheck, Users } from "lucide-react";
import { AdminPageHeader, ErrorPanel, LoadingPanel } from "@/components/shared/admin-screen";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminDashboard } from "@/features/accounts/hooks/use-admin-dashboard";
import { metricNumber } from "@/features/accounts/mappers/accounts.mappers";
import { getApiErrorMessage } from "@/lib/api/errors";

export function AdminDashboard() {
  const dashboardQuery = useAdminDashboard();

  if (dashboardQuery.isLoading) {
    return (
      <div className="space-y-6">
        <AdminPageHeader title="Painel administrativo" description="Indicadores operacionais da plataforma." />
        <LoadingPanel rows={5} />
      </div>
    );
  }

  if (dashboardQuery.isError) {
    return (
      <ErrorPanel
        description={getApiErrorMessage(dashboardQuery.error, "Nao foi possivel carregar o dashboard.")}
      />
    );
  }

  const data = dashboardQuery.data;
  const cards = [
    {
      title: "Usuarios",
      value: metricNumber(data?.usuarios, "total"),
      detail: `${metricNumber(data?.usuarios, "ativos")} ativos`,
      icon: Users,
    },
    {
      title: "Personais",
      value: metricNumber(data?.personais, "total"),
      detail: `${metricNumber(data?.personais, "inativos")} inativos`,
      icon: UserRoundCheck,
    },
    {
      title: "Alunos",
      value: metricNumber(data?.alunos, "total"),
      detail: `${metricNumber(data?.alunos, "ativos")} ativos`,
      icon: Activity,
    },
    {
      title: "Exercicios",
      value: metricNumber(data?.exercicios, "total"),
      detail: `${metricNumber(data?.exercicios, "ativos")} ativos`,
      icon: Dumbbell,
    },
    {
      title: "Avaliacoes 30d",
      value: metricNumber(data?.avaliacoes, "recentes_30d"),
      detail: `${metricNumber(data?.treinos, "ativos")} treinos ativos`,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Painel administrativo"
        description="Visao real de usuarios, personais, alunos e cadastros base."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="border border-border">
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm text-muted-foreground">{card.title}</CardTitle>
                <Icon className="size-4 text-primary" aria-hidden="true" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{card.value}</div>
                <p className="mt-1 text-sm text-muted-foreground">{card.detail}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
