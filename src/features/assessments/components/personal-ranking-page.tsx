"use client";

import { Trophy } from "lucide-react";
import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { EmptyPanel, ErrorPanel, LoadingPanel, SummaryChips } from "@/components/shared/admin-screen";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatMetric } from "@/features/assessments/mappers/assessments.mappers";
import { usePersonalRanking } from "@/features/assessments/hooks/use-assessments";
import { getApiErrorMessage } from "@/lib/api/errors";

export function PersonalRankingPage() {
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const params = useMemo(
    () => ({
      data_inicio: dataInicio || undefined,
      data_fim: dataFim || undefined,
    }),
    [dataFim, dataInicio],
  );
  const rankingQuery = usePersonalRanking(params);
  const ranking = rankingQuery.data?.results ?? [];
  const chartData = ranking.map((item) => ({
    name: item.aluno_nome,
    variacao: Number(item.variacao_percentual_gordura),
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="Ranking" description="Compare a variacao de gordura dos alunos com avaliacoes no periodo." />

      <div className="grid gap-3 sm:grid-cols-2 lg:max-w-sm">
        <Input type="date" value={dataInicio} onChange={(event) => setDataInicio(event.target.value)} />
        <Input type="date" value={dataFim} onChange={(event) => setDataFim(event.target.value)} />
      </div>

      <SummaryChips items={[{ label: "Alunos com comparativo", value: ranking.length }]} />

      {rankingQuery.isLoading ? <LoadingPanel /> : null}
      {rankingQuery.isError ? (
        <ErrorPanel description={getApiErrorMessage(rankingQuery.error, "Nao foi possivel carregar ranking.")} />
      ) : null}
      {ranking.length === 0 && !rankingQuery.isLoading ? (
        <EmptyPanel icon={Trophy} title="Ranking ainda vazio" description="O ranking aparece quando alunos possuem ao menos duas avaliacoes com percentual de gordura." />
      ) : null}

      {ranking.length > 0 ? (
        <>
          <Card className="min-w-0 border border-border">
            <CardContent className="min-w-0 p-4">
              <ResponsiveContainer width="100%" height={288} minWidth={0}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="variacao" name="Variacao gordura %" fill="#b8ff57" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aluno</TableHead>
                  <TableHead>Inicial</TableHead>
                  <TableHead>Final</TableHead>
                  <TableHead>Variacao</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ranking.map((item) => (
                  <TableRow key={item.aluno_id}>
                    <TableCell className="font-medium">{item.aluno_nome}</TableCell>
                    <TableCell>{formatMetric(item.percentual_inicial, "%")}</TableCell>
                    <TableCell>{formatMetric(item.percentual_final, "%")}</TableCell>
                    <TableCell>{formatMetric(item.variacao_percentual_gordura, "%")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      ) : null}
    </div>
  );
}
