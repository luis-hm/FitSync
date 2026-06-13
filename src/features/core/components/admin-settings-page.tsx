"use client";

import { Save, Settings } from "lucide-react";
import { FormEvent } from "react";
import { toast } from "sonner";
import {
  AdminPageHeader,
  ErrorPanel,
  FormField,
  LoadingPanel,
  SubmitButton,
  SummaryChips,
} from "@/components/shared/admin-screen";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useOptions } from "@/features/core/hooks/use-options";
import {
  usePlatformSettings,
  useUpdatePlatformSettings,
} from "@/features/accounts/hooks/use-platform-settings";
import { platformSettingsSchema } from "@/features/accounts/schemas/accounts.schemas";
import {
  formatDateTime,
  settingsToForm,
  toPlatformSettingsUpdatePayload,
} from "@/features/accounts/mappers/accounts.mappers";
import { getApiErrorMessage } from "@/lib/api/errors";
import { formBoolean, formText } from "@/lib/form-data";

export function AdminSettingsPage() {
  const settingsQuery = usePlatformSettings();
  const optionsQuery = useOptions();
  const updateMutation = useUpdatePlatformSettings();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const parsed = platformSettingsSchema.safeParse({
      nome_plataforma: formText(formData, "nome_plataforma"),
      suporte_email: formText(formData, "suporte_email"),
      cadastro_publico_ativo: formBoolean(formData, "cadastro_publico_ativo"),
    });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Revise os campos.");
      return;
    }

    updateMutation.mutate(toPlatformSettingsUpdatePayload(parsed.data), {
      onSuccess: () => toast.success("Configuracoes atualizadas."),
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  }

  if (settingsQuery.isLoading) {
    return (
      <div className="space-y-6">
        <AdminPageHeader title="Configuracoes" description="Parametros reais da plataforma." />
        <LoadingPanel rows={4} />
      </div>
    );
  }

  if (settingsQuery.isError) {
    return (
      <ErrorPanel
        description={getApiErrorMessage(settingsQuery.error, "Nao foi possivel carregar configuracoes.")}
      />
    );
  }

  const form = settingsToForm(settingsQuery.data);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Configuracoes"
        description="Parametros operacionais consumidos pela API."
      />

      <SummaryChips
        items={[
          {
            label: "Cadastro publico",
            value: form.cadastro_publico_ativo ? "Ativo" : "Bloqueado",
          },
          {
            label: "Ultima atualizacao",
            value: formatDateTime(settingsQuery.data?.data_atualizacao),
          },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="size-4 text-primary" aria-hidden="true" />
              Plataforma
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Nome da plataforma" name="nome_plataforma" defaultValue={form.nome_plataforma} required />
                <FormField label="E-mail de suporte" name="suporte_email" type="email" defaultValue={form.suporte_email} />
                <div className="flex items-end sm:col-span-2">
                  <Label className="flex h-8 items-center gap-2 text-sm text-foreground">
                    <input
                      name="cadastro_publico_ativo"
                      type="checkbox"
                      defaultChecked={form.cadastro_publico_ativo}
                    />
                    Cadastro publico ativo
                  </Label>
                </div>
              </div>
              <div className="flex justify-end">
                <SubmitButton isPending={updateMutation.isPending}>
                  <Save className="size-4" aria-hidden="true" />
                  Salvar
                </SubmitButton>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardHeader>
            <CardTitle>Options da API</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <OptionGroup title="Tipos de cadastro" values={optionsQuery.data?.auth.tipos_cadastro.map((item) => item.label)} />
            <OptionGroup title="Sexos" values={optionsQuery.data?.accounts.sexos.map((item) => item.label)} />
            <OptionGroup title="Dias de treino" values={optionsQuery.data?.workouts.dias_semana.map((item) => item.label)} />
            <OptionGroup title="Metodos de avaliacao" values={optionsQuery.data?.assessments.metodos.map((item) => item.label)} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function OptionGroup({ title, values }: { title: string; values?: string[] }) {
  return (
    <div>
      <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">{title}</div>
      <div className="flex flex-wrap gap-2">
        {(values ?? ["Carregando"]).map((value) => (
          <span key={value} className="rounded-full border border-border bg-muted px-2 py-1 text-xs text-foreground">
            {value}
          </span>
        ))}
      </div>
    </div>
  );
}
