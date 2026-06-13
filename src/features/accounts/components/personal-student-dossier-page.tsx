"use client";

import { ArrowLeft, ClipboardList, FileText, User } from "lucide-react";
import Link from "next/link";
import type { FormEvent, ReactNode } from "react";
import { toast } from "sonner";
import { ErrorPanel, FormField, LoadingPanel, SubmitButton, TextAreaField } from "@/components/shared/admin-screen";
import { PeriodicityStatusBadge } from "@/components/shared/list-badges";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePersonalStudent } from "@/features/accounts/hooks/use-personal-students";
import { formatDate } from "@/features/accounts/mappers/accounts.mappers";
import {
  useStudentAnamnese,
  useStudentSummary,
  useUpdateStudentAnamnese,
} from "@/features/assessments/hooks/use-assessments";
import { formatMetric, methodLabel } from "@/features/assessments/mappers/assessments.mappers";
import { getApiErrorMessage } from "@/lib/api/errors";
import { formText } from "@/lib/form-data";

export function PersonalStudentDossierPage({ studentId }: { studentId: string }) {
  const studentQuery = usePersonalStudent(studentId);
  const summaryQuery = useStudentSummary(studentId);
  const anamneseQuery = useStudentAnamnese(studentId);
  const updateAnamneseMutation = useUpdateStudentAnamnese();

  function handleAnamneseSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    updateAnamneseMutation.mutate(
      {
        studentId,
        payload: {
          historico_familiar: formText(formData, "historico_familiar") || undefined,
          doencas_preexistentes: formText(formData, "doencas_preexistentes") || undefined,
          lesoes: formText(formData, "lesoes") || undefined,
          medicamentos: formText(formData, "medicamentos") || undefined,
          alergias: formText(formData, "alergias") || undefined,
          cirurgias: formText(formData, "cirurgias") || undefined,
          restricoes_exercicio: formText(formData, "restricoes_exercicio") || undefined,
          observacoes: formText(formData, "observacoes") || undefined,
          ativo: true,
        },
      },
      {
        onSuccess: () => toast.success("Anamnese atualizada."),
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    );
  }

  const isLoading = studentQuery.isLoading || summaryQuery.isLoading || anamneseQuery.isLoading;
  const error = studentQuery.error || summaryQuery.error || anamneseQuery.error;
  const isError = studentQuery.isError || summaryQuery.isError || anamneseQuery.isError;
  const student = studentQuery.data;
  const summary = summaryQuery.data;
  const anamnese = anamneseQuery.data;
  const latest = summary?.ultima_avaliacao;

  return (
    <div className="space-y-6">
      <PageHeader
        title={student?.usuario.nome ?? "Dossie do aluno"}
        description="Perfil, resumo fisico e anamnese para orientar o acompanhamento."
        action={
          <Button asChild variant="outline">
            <Link href="/personal/alunos">
              <ArrowLeft className="size-4" aria-hidden="true" />
              Voltar
            </Link>
          </Button>
        }
      />

      {isLoading ? <LoadingPanel rows={6} /> : null}
      {isError && error ? (
        <ErrorPanel description={getApiErrorMessage(error, "Nao foi possivel carregar o dossie do aluno.")} />
      ) : null}

      {student ? (
        <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-4">
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="size-4 text-primary" aria-hidden="true" />
                  Perfil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <InfoRow label="Nome" value={student.usuario.nome} />
                <InfoRow label="E-mail" value={student.usuario.email} />
                <InfoRow label="Sexo" value={student.sexo === "M" ? "Masculino" : "Feminino"} />
                <InfoRow label="Nascimento" value={formatDate(student.data_nascimento)} />
                <InfoRow label="Objetivo" value={student.objetivo_principal || "-"} />
                <InfoRow label="Observacoes medicas" value={student.observacoes_medicas || "-"} />
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ClipboardList className="size-4 text-primary" aria-hidden="true" />
                  Resumo fisico
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <InfoRow label="Avaliacoes" value={String(summary?.total_avaliacoes ?? 0)} />
                <InfoRow
                  label="Status periodico"
                  value={<PeriodicityStatusBadge status={summary?.status_periodicidade ?? latest?.status_periodicidade} />}
                />
                <InfoRow label="Proxima avaliacao" value={formatDate(summary?.data_proxima_avaliacao ?? summary?.proxima_avaliacao ?? latest?.data_proxima_avaliacao)} />
                {latest ? (
                  <>
                    <InfoRow label="Ultima avaliacao" value={formatDate(latest.data_avaliacao)} />
                    <InfoRow label="Metodo" value={methodLabel(latest.metodo)} />
                    <InfoRow label="Peso" value={formatMetric(latest.peso_kg, " kg")} />
                    <InfoRow label="IMC" value={formatMetric(latest.imc)} />
                    <InfoRow label="IAC" value={formatMetric(latest.iac, "%")} />
                    <InfoRow label="Gordura" value={formatMetric(latest.percentual_gordura, "%")} />
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Sem avaliacao registrada para este aluno.</p>
                )}
                <Button asChild variant="outline" size="sm">
                  <Link href={`/personal/avaliacoes?aluno_id=${studentId}`}>Ver avaliacoes</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="size-4 text-primary" aria-hidden="true" />
                Anamnese
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form key={anamnese?.id ?? "empty"} className="space-y-4" onSubmit={handleAnamneseSubmit}>
                <TextAreaField label="Historico familiar" name="historico_familiar" defaultValue={anamnese?.historico_familiar} />
                <TextAreaField label="Doencas preexistentes" name="doencas_preexistentes" defaultValue={anamnese?.doencas_preexistentes} />
                <TextAreaField label="Lesoes" name="lesoes" defaultValue={anamnese?.lesoes} />
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField label="Medicamentos" name="medicamentos" defaultValue={anamnese?.medicamentos} />
                  <FormField label="Alergias" name="alergias" defaultValue={anamnese?.alergias} />
                </div>
                <TextAreaField label="Cirurgias" name="cirurgias" defaultValue={anamnese?.cirurgias} />
                <TextAreaField label="Restricoes de exercicio" name="restricoes_exercicio" defaultValue={anamnese?.restricoes_exercicio} />
                <TextAreaField label="Observacoes" name="observacoes" defaultValue={anamnese?.observacoes} />
                <SubmitButton isPending={updateAnamneseMutation.isPending}>Salvar anamnese</SubmitButton>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="max-w-[65%] text-right font-medium text-foreground">{value}</span>
    </div>
  );
}
