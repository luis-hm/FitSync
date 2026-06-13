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
import { usePersonalStudents } from "@/features/accounts/hooks/use-personal-students";
import { formatDate } from "@/features/accounts/mappers/accounts.mappers";
import { evolutionChartData, formatDelta, formatMetric, methodLabel } from "@/features/assessments/mappers/assessments.mappers";
import { useStudentEvolution } from "@/features/assessments/hooks/use-assessments";
import { getApiErrorMessage } from "@/lib/api/errors";

export function PersonalEvolutionPage() {
  const [studentId, setStudentId] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const studentsQuery = usePersonalStudents();
  const students = studentsQuery.data?.results ?? [];

  const selectedStudent = students.find((student) => student.id === studentId) ?? students[0];
  const selectedStudentId = studentsQuery.isSuccess ? selectedStudent?.id ?? "" : "";

  const params = useMemo(
    () => ({
      data_inicio: dataInicio || undefined,
      data_fim: dataFim || undefined,
    }),
    [dataFim, dataInicio],
  );
  const evolutionQuery = useStudentEvolution(selectedStudentId, params);
  const points = evolutionQuery.data?.results ?? [];
  const chartData = evolutionChartData(points);

  return (
    <div className="space-y-6">
      <PageHeader title="Evolucao" description="Compare peso, gordura, massa magra e RCQ ao longo das avaliacoes." />

      <div className="grid gap-3 lg:grid-cols-[1fr_160px_160px]">
        <select
          value={selectedStudentId}
          onChange={(event) => setStudentId(event.target.value)}
          className="h-9 rounded-lg border border-input bg-input/30 px-2.5 text-sm"
        >
          <option value="">Selecione um aluno</option>
          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.usuario.nome}
            </option>
          ))}
        </select>
        <Input type="date" value={dataInicio} onChange={(event) => setDataInicio(event.target.value)} />
        <Input type="date" value={dataFim} onChange={(event) => setDataFim(event.target.value)} />
      </div>

      <SummaryChips
        items={[
          { label: "Aluno", value: evolutionQuery.data?.aluno_nome ?? "Selecione" },
          { label: "Avaliacoes", value: points.length },
        ]}
      />

      {studentsQuery.isLoading || evolutionQuery.isLoading ? <LoadingPanel /> : null}
      {studentsQuery.isError ? (
        <ErrorPanel description={getApiErrorMessage(studentsQuery.error, "Nao foi possivel carregar alunos.")} />
      ) : null}
      {evolutionQuery.isError ? (
        <ErrorPanel description={getApiErrorMessage(evolutionQuery.error, "Nao foi possivel carregar evolucao.")} />
      ) : null}
      {students.length === 0 ? (
        <EmptyPanel icon={BarChart3} title="Nenhum aluno vinculado" description="Cadastre alunos para acompanhar evolucao." />
      ) : null}
      {selectedStudentId && points.length === 0 && !evolutionQuery.isLoading ? (
        <EmptyPanel icon={BarChart3} title="Sem historico de evolucao" description="Registre ao menos duas avaliacoes para comparar progresso." />
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
                  <TableHead>Massa magra</TableHead>
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
                    <TableCell>{formatMetric(point.massa_magra_kg, " kg")}</TableCell>
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
