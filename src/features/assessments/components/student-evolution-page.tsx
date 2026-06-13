"use client";

import { BarChart3 } from "lucide-react";
import { useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { EmptyPanel, ErrorPanel, LoadingPanel, SummaryChips } from "@/components/shared/admin-screen";
import { PeriodicityStatusBadge } from "@/components/shared/list-badges";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { evolutionChartData, formatDelta, formatMetric, methodLabel } from "@/features/assessments/mappers/assessments.mappers";
import { useMyEvolution } from "@/features/assessments/hooks/use-assessments";
import { formatDate } from "@/features/accounts/mappers/accounts.mappers";
import { getApiErrorMessage } from "@/lib/api/errors";

export function StudentEvolutionPage() {
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const params = useMemo(
    () => ({
      data_inicio: dataInicio || undefined,
      data_fim: dataFim || undefined,
    }),
    [dataFim, dataInicio],
  );
  const evolutionQuery = useMyEvolution(params);
  const points = evolutionQuery.data?.results ?? [];
  const chartData = evolutionChartData(points);

  return (
    <div className="space-y-6">
      <PageHeader title="Minha evolucao" description="Acompanhe seus indicadores ao longo das avaliacoes." />

      <div className="grid gap-3 sm:grid-cols-2 lg:max-w-sm">
        <Input type="date" value={dataInicio} onChange={(event) => setDataInicio(event.target.value)} />
        <Input type="date" value={dataFim} onChange={(event) => setDataFim(event.target.value)} />
      </div>

      <SummaryChips
        items={[
          { label: "Aluno", value: evolutionQuery.data?.aluno_nome ?? "-" },
          { label: "Avaliacoes", value: points.length },
        ]}
      />

      {evolutionQuery.isLoading ? <LoadingPanel /> : null}
      {evolutionQuery.isError ? (
        <ErrorPanel description={getApiErrorMessage(evolutionQuery.error, "Nao foi possivel carregar sua evolucao.")} />
      ) : null}
      {points.length === 0 && !evolutionQuery.isLoading ? (
        <EmptyPanel icon={BarChart3} title="Sem dados de evolucao" description="Sua evolucao aparece quando houver avaliacoes registradas." />
      ) : null}

      {points.length > 0 ? (
        <>
          <Card className="min-w-0 border border-border">
            <CardContent className="min-w-0 p-4">
              <ResponsiveContainer width="100%" height={288} minWidth={0}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="peso" stroke="#b8ff57" name="Peso" strokeWidth={2} />
                  <Line type="monotone" dataKey="imc" stroke="#a78bfa" name="IMC" strokeWidth={2} />
                  <Line type="monotone" dataKey="gordura" stroke="#38bdf8" name="Gordura %" strokeWidth={2} />
                  <Line type="monotone" dataKey="massaMagra" stroke="#f59e0b" name="Massa magra" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Metodo</TableHead>
                  <TableHead>Peso</TableHead>
                  <TableHead>IMC</TableHead>
                  <TableHead>Gordura</TableHead>
                  <TableHead>Delta peso</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {points.map((point) => (
                  <TableRow key={point.id}>
                    <TableCell>{formatDate(point.data_avaliacao)}</TableCell>
                    <TableCell>{methodLabel(point.metodo)}</TableCell>
                    <TableCell>{formatMetric(point.peso_kg, " kg")}</TableCell>
                    <TableCell>{formatMetric(point.imc)}</TableCell>
                    <TableCell>{formatMetric(point.percentual_gordura, "%")}</TableCell>
                    <TableCell>{formatDelta(point.deltas.peso_kg, " kg")}</TableCell>
                    <TableCell>
                      <PeriodicityStatusBadge status={point.status_periodicidade} />
                    </TableCell>
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
