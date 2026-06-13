"use client";

import { Archive, Edit, Eye, Plus, Search, Activity } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  EmptyPanel,
  ErrorPanel,
  LoadingPanel,
  PaginationFooter,
  SummaryChips,
} from "@/components/shared/admin-screen";
import { PeriodicityStatusBadge } from "@/components/shared/list-badges";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePersonalStudents } from "@/features/accounts/hooks/use-personal-students";
import { formatDate } from "@/features/accounts/mappers/accounts.mappers";
import {
  AssessmentFormDialog,
  assessmentMethodOptions,
} from "@/features/assessments/components/assessment-form-dialog";
import {
  assessmentListDeltas,
  deltaStatus,
  formatDelta,
  methodLabel,
  toAssessmentPayload,
  formatMetric,
} from "@/features/assessments/mappers/assessments.mappers";
import type { AssessmentForm } from "@/features/assessments/schemas/assessments.schemas";
import type {
  Assessment,
  AssessmentCreatePayload,
  AssessmentUpdatePayload,
  AssessmentsParams,
} from "@/features/assessments/types/assessments.types";
import {
  useArchiveAssessment,
  useAssessments,
  useCreateAssessment,
  useUpdateAssessment,
} from "@/features/assessments/hooks/use-assessments";
import { getApiErrorMessage } from "@/lib/api/errors";

type ActiveFilter = "ATIVAS" | "ARQUIVADAS" | "TODAS";

export function PersonalAssessmentsPage({ initialStudentFilter = "" }: { initialStudentFilter?: string }) {
  const [page, setPage] = useState(1);
  const [studentFilter, setStudentFilter] = useState(initialStudentFilter);
  const [methodFilter, setMethodFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("ATIVAS");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<Assessment | null>(null);

  const params = useMemo<AssessmentsParams>(
    () => ({
      page,
      aluno_id: studentFilter || undefined,
      metodo: methodFilter || undefined,
      ativo: activeFilter === "TODAS" ? undefined : activeFilter === "ATIVAS",
      data_inicio: dataInicio || undefined,
      data_fim: dataFim || undefined,
    }),
    [activeFilter, dataFim, dataInicio, methodFilter, page, studentFilter],
  );

  const assessmentsQuery = useAssessments(params);
  const studentsQuery = usePersonalStudents();
  const createMutation = useCreateAssessment();
  const updateMutation = useUpdateAssessment();
  const archiveMutation = useArchiveAssessment();
  const students = studentsQuery.data?.results ?? [];
  const assessments = useMemo(() => assessmentsQuery.data?.results ?? [], [assessmentsQuery.data?.results]);
  const deltasByAssessmentId = useMemo(() => assessmentListDeltas(assessments), [assessments]);

  function handleCreate(form: AssessmentForm) {
    createMutation.mutate(toAssessmentPayload(form, { includeAluno: true }) as AssessmentCreatePayload, {
      onSuccess: () => {
        toast.success("Avaliacao criada.");
        setCreateOpen(false);
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  }

  function handleEdit(form: AssessmentForm) {
    if (!editingAssessment) return;
    updateMutation.mutate(
      { id: editingAssessment.id, payload: toAssessmentPayload(form, { includeAluno: false }) as AssessmentUpdatePayload },
      {
        onSuccess: () => {
          toast.success("Avaliacao atualizada.");
          setEditingAssessment(null);
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    );
  }

  function handleArchive(assessment: Assessment) {
    archiveMutation.mutate(assessment.id, {
      onSuccess: () => {
        toast.success("Avaliacao arquivada.");
        setArchiveTarget(null);
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  }

  function applyLast30Days() {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30);
    setDataInicio(toInputDate(start));
    setDataFim(toInputDate(end));
    setPage(1);
  }

  function applyCurrentQuarter() {
    const now = new Date();
    const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
    setDataInicio(toInputDate(new Date(now.getFullYear(), quarterStartMonth, 1)));
    setDataFim(toInputDate(now));
    setPage(1);
  }

  function clearPeriod() {
    setDataInicio("");
    setDataFim("");
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Avaliacoes"
        description="Registre medidas, acompanhe calculos e mantenha o historico fisico dos alunos."
        action={
          <Button type="button" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" aria-hidden="true" />
            Nova avaliacao
          </Button>
        }
      />

      <SummaryChips
        items={[
          { label: "Resultado", value: assessmentsQuery.data?.count ?? 0 },
          { label: "Alunos", value: studentsQuery.data?.count ?? 0 },
        ]}
      />

      <div className="space-y-3">
        <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px_160px_160px]">
          <div className="space-y-2">
            <Label>Aluno</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <select
                value={studentFilter}
                onChange={(event) => {
                  setStudentFilter(event.target.value);
                  setPage(1);
                }}
                className="h-9 w-full rounded-lg border border-input bg-input/30 px-9 text-sm"
              >
                <option value="">Todos os alunos</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.usuario.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Metodo</Label>
            <select
              value={methodFilter}
              onChange={(event) => {
                setMethodFilter(event.target.value);
                setPage(1);
              }}
              className="h-9 w-full rounded-lg border border-input bg-input/30 px-2.5 text-sm"
            >
              <option value="">Todos os metodos</option>
              {assessmentMethodOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <select
              value={activeFilter}
              onChange={(event) => {
                setActiveFilter(event.target.value as ActiveFilter);
                setPage(1);
              }}
              className="h-9 w-full rounded-lg border border-input bg-input/30 px-2.5 text-sm"
            >
              <option value="ATIVAS">Ativas</option>
              <option value="ARQUIVADAS">Arquivadas</option>
              <option value="TODAS">Todas</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Data inicio</Label>
            <Input
              type="date"
              value={dataInicio}
              onChange={(event) => {
                setDataInicio(event.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="space-y-2">
            <Label>Data fim</Label>
            <Input
              type="date"
              value={dataFim}
              onChange={(event) => {
                setDataFim(event.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={applyLast30Days}>
            Ultimos 30 dias
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={applyCurrentQuarter}>
            Este trimestre
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={clearPeriod}>
            Limpar periodo
          </Button>
        </div>
      </div>

      {assessmentsQuery.isLoading ? <LoadingPanel /> : null}
      {assessmentsQuery.isError ? (
        <ErrorPanel description={getApiErrorMessage(assessmentsQuery.error, "Nao foi possivel carregar avaliacoes.")} />
      ) : null}
      {assessments.length === 0 && !assessmentsQuery.isLoading ? (
        <EmptyPanel icon={Activity} title="Nenhuma avaliacao encontrada" description="Registre a primeira avaliacao ou ajuste os filtros." />
      ) : null}

      {assessments.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aluno</TableHead>
                <TableHead>Metodo</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Peso</TableHead>
                <TableHead>Gordura</TableHead>
                <TableHead>IMC</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assessments.map((assessment) => {
                const deltas = deltasByAssessmentId.get(assessment.id);
                return (
                  <TableRow key={assessment.id}>
                    <TableCell className="font-medium">{assessment.aluno_nome}</TableCell>
                    <TableCell>{methodLabel(assessment.metodo)}</TableCell>
                    <TableCell>{formatDate(assessment.data_avaliacao)}</TableCell>
                    <TableCell>
                      <MetricWithDelta
                        value={formatMetric(assessment.peso_kg, " kg")}
                        delta={deltas?.peso_kg}
                        suffix=" kg"
                      />
                    </TableCell>
                    <TableCell>
                      <MetricWithDelta
                        lowerIsBetter
                        value={formatMetric(assessment.percentual_gordura, "%")}
                        delta={deltas?.percentual_gordura}
                        suffix="%"
                      />
                    </TableCell>
                    <TableCell>{formatMetric(assessment.imc)}</TableCell>
                    <TableCell>
                      <PeriodicityStatusBadge status={assessment.status_periodicidade} />
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button asChild type="button" variant="outline" size="sm">
                          <Link href={`/personal/avaliacoes/${assessment.id}`}>
                            <Eye className="size-3.5" aria-hidden="true" />
                            Ver
                          </Link>
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => setEditingAssessment(assessment)}>
                          <Edit className="size-3.5" aria-hidden="true" />
                          Editar
                        </Button>
                        {assessment.ativo ? (
                          <Button type="button" variant="outline" size="sm" onClick={() => setArchiveTarget(assessment)}>
                            <Archive className="size-3.5" aria-hidden="true" />
                            Arquivar
                          </Button>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
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

      <AssessmentFormDialog
        open={createOpen}
        title="Nova avaliacao"
        students={students.map((student) => ({ value: student.id, label: student.usuario.nome }))}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreate}
        isPending={createMutation.isPending}
      />
      <AssessmentFormDialog
        open={Boolean(editingAssessment)}
        title="Editar avaliacao"
        assessment={editingAssessment}
        students={students.map((student) => ({ value: student.id, label: student.usuario.nome }))}
        onOpenChange={(open) => !open && setEditingAssessment(null)}
        onSubmit={handleEdit}
        isPending={updateMutation.isPending}
      />
      <ArchiveConfirmationDialog
        assessment={archiveTarget}
        isPending={archiveMutation.isPending}
        onCancel={() => setArchiveTarget(null)}
        onConfirm={handleArchive}
      />
    </div>
  );
}

function MetricWithDelta({
  delta,
  lowerIsBetter,
  suffix,
  value,
}: {
  delta?: number | null;
  lowerIsBetter?: boolean;
  suffix: string;
  value: string;
}) {
  return (
    <div className="space-y-1">
      <div>{value}</div>
      {delta !== null && delta !== undefined ? (
        <span className={deltaChipClassName(deltaStatus(delta, lowerIsBetter))}>
          {formatDelta(delta, suffix)}
        </span>
      ) : null}
    </div>
  );
}

function ArchiveConfirmationDialog({
  assessment,
  isPending,
  onCancel,
  onConfirm,
}: {
  assessment: Assessment | null;
  isPending?: boolean;
  onCancel: () => void;
  onConfirm: (assessment: Assessment) => void;
}) {
  return (
    <Dialog open={Boolean(assessment)} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Arquivar avaliacao?</DialogTitle>
          <DialogDescription>
            {assessment
              ? `A avaliacao de ${assessment.aluno_nome} em ${formatDate(assessment.data_avaliacao)} saira da lista de ativas.`
              : "Confirme o arquivamento da avaliacao."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => assessment && onConfirm(assessment)}
            disabled={!assessment || isPending}
          >
            Arquivar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function deltaChipClassName(status: "positive" | "negative" | "neutral") {
  if (status === "positive") return "inline-flex rounded-full bg-[#22C55E]/10 px-2 py-0.5 text-xs font-medium text-[#22C55E]";
  if (status === "negative") return "inline-flex rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive";
  return "inline-flex rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground";
}

function toInputDate(date: Date) {
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 10);
}
