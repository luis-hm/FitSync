"use client";

import { Activity, Dumbbell, TrendingUp, Users } from "lucide-react";
import { ErrorPanel, LoadingPanel } from "@/components/shared/admin-screen";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePersonalDashboard } from "@/features/accounts/hooks/use-personal-dashboard";
import { plainMetricNumber } from "@/features/accounts/mappers/accounts.mappers";
import { formatMetric } from "@/features/assessments/mappers/assessments.mappers";
import { getApiErrorMessage } from "@/lib/api/errors";

export function PersonalDashboard() {
  const dashboardQuery = usePersonalDashboard();

  if (dashboardQuery.isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Painel do personal" description="Resumo da carteira, treinos e avaliacoes." />
        <LoadingPanel rows={5} />
      </div>
    );
  }

  if (dashboardQuery.isError) {
    return <ErrorPanel description={getApiErrorMessage(dashboardQuery.error, "Nao foi possivel carregar o painel.")} />;
  }

  const data = dashboardQuery.data;
  const cards = [
    {
      title: "Alunos ativos",
      value: plainMetricNumber(data?.alunos, "ativos"),
      detail: `${plainMetricNumber(data?.alunos, "total")} no total`,
      icon: Users,
    },
    {
      title: "Treinos ativos",
      value: plainMetricNumber(data?.treinos, "ativos"),
      detail: `${plainMetricNumber(data?.treinos, "total")} criados`,
      icon: Dumbbell,
    },
    {
      title: "Avaliacoes 30d",
      value: plainMetricNumber(data?.avaliacoes, "recentes_30d"),
      detail: `${plainMetricNumber(data?.avaliacoes, "ativas")} ativas`,
      icon: Activity,
    },
    {
      title: "Ranking",
      value: data?.ranking.length ?? 0,
      detail: "alunos com comparativo",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Painel do personal" description="Indicadores reais dos seus alunos, treinos e avaliacoes." />

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
                <div className="text-3xl font-bold text-foreground">{card.value}</div>
                <p className="mt-1 text-sm text-muted-foreground">{card.detail}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="text-base">Melhores variacoes recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {data?.ranking.length ? (
            <div className="space-y-3">
              {data.ranking.map((item) => (
                <div key={item.aluno_id} className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-3">
                  <div>
                    <div className="font-medium text-foreground">{item.aluno_nome}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatMetric(item.percentual_inicial, "%")} para {formatMetric(item.percentual_final, "%")}
                    </div>
                  </div>
                  <div className="font-semibold text-primary">{formatMetric(item.variacao_percentual_gordura, "%")}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Registre avaliacoes recorrentes para ver comparativos aqui.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
