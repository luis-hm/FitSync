"use client";

import type { FormEvent } from "react";
import { toast } from "sonner";
import { ErrorPanel, FormField, LoadingPanel, NativeSelectField, SubmitButton, TextAreaField } from "@/components/shared/admin-screen";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { useStudentProfile, useUpdateStudentProfile } from "@/features/accounts/hooks/use-student-profile";
import { studentProfileSchema } from "@/features/accounts/schemas/accounts.schemas";
import { studentProfileToForm, toStudentProfilePayload } from "@/features/accounts/mappers/accounts.mappers";
import { useMyAnamnese } from "@/features/assessments/hooks/use-assessments";
import { getApiErrorMessage } from "@/lib/api/errors";
import { formText } from "@/lib/form-data";

export function StudentProfilePage() {
  const profileQuery = useStudentProfile();
  const anamneseQuery = useMyAnamnese();
  const updateMutation = useUpdateStudentProfile();
  const form = studentProfileToForm(profileQuery.data);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const parsed = studentProfileSchema.safeParse({
      nome: formText(formData, "nome"),
      data_nascimento: formText(formData, "data_nascimento"),
      sexo: formText(formData, "sexo"),
      objetivo_principal: formText(formData, "objetivo_principal") || undefined,
      observacoes_medicas: formText(formData, "observacoes_medicas") || undefined,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Revise os campos.");
      return;
    }
    updateMutation.mutate(toStudentProfilePayload(parsed.data), {
      onSuccess: () => toast.success("Perfil atualizado."),
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Meu perfil" description="Dados pessoais e informacoes de acompanhamento." />

      {profileQuery.isLoading ? <LoadingPanel /> : null}
      {anamneseQuery.isLoading ? <LoadingPanel rows={2} /> : null}
      {profileQuery.isError ? (
        <ErrorPanel description={getApiErrorMessage(profileQuery.error, "Nao foi possivel carregar seu perfil.")} />
      ) : null}
      {anamneseQuery.isError ? (
        <ErrorPanel description={getApiErrorMessage(anamneseQuery.error, "Nao foi possivel carregar sua anamnese.")} />
      ) : null}

      {profileQuery.data ? (
        <Card className="border border-border">
          <CardContent className="p-5">
            <form key={profileQuery.data.id} className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField label="Nome" name="nome" defaultValue={form.nome} required />
                <FormField label="E-mail" name="email" defaultValue={profileQuery.data.email} />
                <FormField label="Personal" name="personal" defaultValue={profileQuery.data.personal_nome} />
                <FormField label="Data de nascimento" name="data_nascimento" type="date" defaultValue={form.data_nascimento} required />
                <NativeSelectField
                  label="Sexo"
                  name="sexo"
                  defaultValue={form.sexo}
                  options={[
                    { value: "M", label: "Masculino" },
                    { value: "F", label: "Feminino" },
                  ]}
                  required
                />
              </div>
              <FormField label="Objetivo principal" name="objetivo_principal" defaultValue={form.objetivo_principal} />
              <TextAreaField label="Observacoes medicas" name="observacoes_medicas" defaultValue={form.observacoes_medicas} />
              <SubmitButton isPending={updateMutation.isPending}>Salvar perfil</SubmitButton>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <Card className="border border-border">
        <CardContent className="p-5">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-foreground">Anamnese</h2>
            <p className="text-sm text-muted-foreground">Informacoes de saude registradas pelo personal.</p>
          </div>
          {anamneseQuery.data ? (
            <div className="grid gap-3 text-sm md:grid-cols-2">
              <ReadonlyInfo label="Historico familiar" value={anamneseQuery.data.historico_familiar} />
              <ReadonlyInfo label="Doencas preexistentes" value={anamneseQuery.data.doencas_preexistentes} />
              <ReadonlyInfo label="Lesoes" value={anamneseQuery.data.lesoes} />
              <ReadonlyInfo label="Medicamentos" value={anamneseQuery.data.medicamentos} />
              <ReadonlyInfo label="Alergias" value={anamneseQuery.data.alergias} />
              <ReadonlyInfo label="Cirurgias" value={anamneseQuery.data.cirurgias} />
              <ReadonlyInfo label="Restricoes de exercicio" value={anamneseQuery.data.restricoes_exercicio} />
              <ReadonlyInfo label="Observacoes" value={anamneseQuery.data.observacoes} />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhuma anamnese registrada ainda.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ReadonlyInfo({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 whitespace-pre-line font-medium text-foreground">{value || "-"}</div>
    </div>
  );
}
