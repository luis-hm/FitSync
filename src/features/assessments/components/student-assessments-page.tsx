"use client";

import { Activity, Eye } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { EmptyPanel, ErrorPanel, LoadingPanel, PaginationFooter, SummaryChips } from "@/components/shared/admin-screen";
import { PeriodicityStatusBadge } from "@/components/shared/list-badges";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatMetric, methodLabel } from "@/features/assessments/mappers/assessments.mappers";
import { useAssessments } from "@/features/assessments/hooks/use-assessments";
import type { AssessmentsParams } from "@/features/assessments/types/assessments.types";
import { formatDate } from "@/features/accounts/mappers/accounts.mappers";
import { getApiErrorMessage } from "@/lib/api/errors";

export function StudentAssessmentsPage() {
  const [page, setPage] = useState(1);
  const [methodFilter, setMethodFilter] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const params = useMemo<AssessmentsParams>(
    () => ({
      page,
      metodo: methodFilter || undefined,
      data_inicio: dataInicio || undefined,
      data_fim: dataFim || undefined,
    }),
    [dataFim, dataInicio, methodFilter, page],
  );
  const assessmentsQuery = useAssessments(params);
  const assessments = assessmentsQuery.data?.results ?? [];

  return (
    <div className="space-y-6">
      <PageHeader title="Minhas avaliacoes" description="Historico de medidas e feedbacks registrados pelo personal." />

      <div className="grid gap-3 sm:grid-cols-3">
        <select
          value={methodFilter}
          onChange={(event) => {
            setMethodFilter(event.target.value);
            setPage(1);
          }}
          className="h-9 rounded-lg border border-input bg-input/30 px-2.5 text-sm"
        >
          <option value="">Todos os metodos</option>
          <option value="DOBRAS">Dobras</option>
          <option value="BIOIMPEDANCIA">Bioimpedancia</option>
          <option value="CIRCUNFERENCIAS">Circunferencias</option>
          <option value="COMBINADO">Combinado</option>
        </select>
        <Input type="date" value={dataInicio} onChange={(event) => setDataInicio(event.target.value)} />
        <Input type="date" value={dataFim} onChange={(event) => setDataFim(event.target.value)} />
      </div>

      <SummaryChips items={[{ label: "Avaliacoes", value: assessmentsQuery.data?.count ?? 0 }]} />

      {assessmentsQuery.isLoading ? <LoadingPanel /> : null}
      {assessmentsQuery.isError ? (
        <ErrorPanel description={getApiErrorMessage(assessmentsQuery.error, "Nao foi possivel carregar suas avaliacoes.")} />
      ) : null}
      {assessments.length === 0 && !assessmentsQuery.isLoading ? (
        <EmptyPanel icon={Activity} title="Nenhuma avaliacao registrada" description="Quando seu personal registrar uma avaliacao, ela aparecera aqui." />
      ) : null}

      {assessments.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Metodo</TableHead>
                <TableHead>Peso</TableHead>
                <TableHead>IMC</TableHead>
                <TableHead>Gordura</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Detalhes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assessments.map((assessment) => (
                <TableRow key={assessment.id}>
                  <TableCell>{formatDate(assessment.data_avaliacao)}</TableCell>
                  <TableCell>{methodLabel(assessment.metodo)}</TableCell>
                  <TableCell>{formatMetric(assessment.peso_kg, " kg")}</TableCell>
                  <TableCell>{formatMetric(assessment.imc)}</TableCell>
                  <TableCell>{formatMetric(assessment.percentual_gordura, "%")}</TableCell>
                  <TableCell>
                    <PeriodicityStatusBadge status={assessment.status_periodicidade} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/aluno/avaliacoes/${assessment.id}`}>
                        <Eye className="size-3.5" aria-hidden="true" />
                        Ver
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}

      {assessmentsQuery.data ? (
        <PaginationFooter
          count={assessmentsQuery.data.count}
          page={page}
          hasPrevious={Boolean(assessmentsQuery.data.previous)}
          hasNext={Boolean(assessmentsQuery.data.next)}
          onPrevious={() => setPage((current) => Math.max(1, current - 1))}
          onNext={() => setPage((current) => current + 1)}
        />
      ) : null}
    </div>
  );
}
