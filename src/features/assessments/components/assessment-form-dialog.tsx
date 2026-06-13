"use client";

import { Check, ChevronLeft, ChevronRight, ClipboardList, FileText, History, MessageSquareText } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import type { ZodIssue } from "zod";
import { Badge } from "@/components/ui/badge";
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
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/features/accounts/mappers/accounts.mappers";
import { useStudentAnamnese, useStudentEvolution } from "@/features/assessments/hooks/use-assessments";
import { formatDelta, formatMetric, methodLabel } from "@/features/assessments/mappers/assessments.mappers";
import { assessmentSchema, type AssessmentForm } from "@/features/assessments/schemas/assessments.schemas";
import type { Anamnese, Assessment, AssessmentMethod, EvolutionPoint } from "@/features/assessments/types/assessments.types";
import { cn } from "@/lib/utils";

export const assessmentMethodOptions: Array<{ value: AssessmentMethod; label: string }> = [
  { value: "DOBRAS", label: "Dobras" },
  { value: "BIOIMPEDANCIA", label: "Bioimpedancia" },
  { value: "CIRCUNFERENCIAS", label: "Circunferencias" },
  { value: "COMBINADO", label: "Combinado" },
];

const steps = [
  { id: "base", label: "Dados" },
  { id: "measures", label: "Medidas" },
  { id: "feedback", label: "Feedback" },
  { id: "review", label: "Revisao" },
] as const;

type StepId = (typeof steps)[number]["id"];
type ErrorMap = Record<string, string>;
type FieldGroup = "dobras" | "bioimpedancia" | "circunferencias";

type FieldDefinition = {
  name: string;
  label: string;
  unit?: string;
  required?: boolean;
  placeholder?: string;
};

type AssessmentFormState = {
  aluno_id: string;
  metodo: AssessmentMethod;
  data_avaliacao: string;
  data_proxima_avaliacao: string;
  peso_kg: string;
  altura_cm: string;
  feedback_personal: string;
  dobras: Record<string, string>;
  bioimpedancia: Record<string, string>;
  circunferencias: Record<string, string>;
};

const dobrasFields: FieldDefinition[] = [
  { name: "peitoral_mm", label: "Peitoral", unit: "mm", required: true },
  { name: "axilar_media_mm", label: "Axilar media", unit: "mm", required: true },
  { name: "triceps_mm", label: "Triceps", unit: "mm", required: true },
  { name: "subescapular_mm", label: "Subescapular", unit: "mm", required: true },
  { name: "abdominal_mm", label: "Abdominal", unit: "mm", required: true },
  { name: "supra_iliaca_mm", label: "Supra iliaca", unit: "mm", required: true },
  { name: "coxa_mm", label: "Coxa", unit: "mm", required: true },
];

const bioFields: FieldDefinition[] = [
  { name: "percentual_gordura", label: "Gordura", unit: "%", required: true },
  { name: "massa_gorda_kg", label: "Massa gorda", unit: "kg" },
  { name: "massa_magra_kg", label: "Massa magra", unit: "kg" },
  { name: "massa_muscular_kg", label: "Massa muscular", unit: "kg" },
  { name: "agua_corporal_percentual", label: "Agua corporal", unit: "%" },
  { name: "gordura_visceral", label: "Gordura visceral" },
  { name: "taxa_metabolica_basal", label: "Taxa metabolica basal" },
];

const circFields: FieldDefinition[] = [
  { name: "pescoco_cm", label: "Pescoco", unit: "cm", required: true },
  { name: "torax_cm", label: "Torax", unit: "cm", required: true },
  { name: "cintura_cm", label: "Cintura", unit: "cm", required: true },
  { name: "abdome_cm", label: "Abdome", unit: "cm", required: true },
  { name: "quadril_cm", label: "Quadril", unit: "cm", required: true },
  { name: "braco_relaxado_esq_cm", label: "Braco relaxado esquerdo", unit: "cm", required: true },
  { name: "braco_relaxado_dir_cm", label: "Braco relaxado direito", unit: "cm", required: true },
  { name: "braco_contraido_esq_cm", label: "Braco contraido esquerdo", unit: "cm", required: true },
  { name: "braco_contraido_dir_cm", label: "Braco contraido direito", unit: "cm", required: true },
  { name: "antebraco_esq_cm", label: "Antebraco esquerdo", unit: "cm", required: true },
  { name: "antebraco_dir_cm", label: "Antebraco direito", unit: "cm", required: true },
  { name: "coxa_esq_cm", label: "Coxa esquerda", unit: "cm", required: true },
  { name: "coxa_dir_cm", label: "Coxa direita", unit: "cm", required: true },
  { name: "panturrilha_esq_cm", label: "Panturrilha esquerda", unit: "cm", required: true },
  { name: "panturrilha_dir_cm", label: "Panturrilha direita", unit: "cm", required: true },
];

const circumferenceFieldGroups: Array<{ title: string; fields: FieldDefinition[] }> = [
  {
    title: "Membros superiores",
    fields: circFields.filter((field) =>
      field.name.startsWith("braco_") || field.name.startsWith("antebraco_"),
    ),
  },
  {
    title: "Membros inferiores",
    fields: circFields.filter((field) =>
      field.name.startsWith("coxa_") || field.name.startsWith("panturrilha_"),
    ),
  },
  {
    title: "Tronco",
    fields: circFields.filter((field) =>
      ["torax_cm", "cintura_cm", "abdome_cm", "quadril_cm"].includes(field.name),
    ),
  },
  {
    title: "Outros",
    fields: circFields.filter((field) => field.name === "pescoco_cm"),
  },
];

const feedbackTemplates = [
  "Boa evolucao geral. Manter consistencia no ciclo atual e reavaliar os principais indicadores na proxima avaliacao.",
  "Foco do proximo ciclo: preservar massa magra, ajustar intensidade dos treinos e acompanhar medidas de cintura e abdome.",
  "Resultado exige atencao. Revisar aderencia ao treino, recuperacao e estrategia nutricional antes da proxima avaliacao.",
];

export function AssessmentFormDialog({
  open,
  title,
  assessment,
  students,
  onOpenChange,
  onSubmit,
  isPending,
}: {
  open: boolean;
  title: string;
  assessment?: Assessment | null;
  students: { value: string; label: string }[];
  onOpenChange: (open: boolean) => void;
  onSubmit: (form: AssessmentForm) => void;
  isPending?: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <AssessmentFormDialogContent
          title={title}
          assessment={assessment}
          students={students}
          onSubmit={onSubmit}
          isPending={isPending}
        />
      ) : null}
    </Dialog>
  );
}

function AssessmentFormDialogContent({
  title,
  assessment,
  students,
  onSubmit,
  isPending,
}: {
  title: string;
  assessment?: Assessment | null;
  students: { value: string; label: string }[];
  onSubmit: (form: AssessmentForm) => void;
  isPending?: boolean;
}) {
  const [step, setStep] = useState<StepId>("base");
  const [form, setForm] = useState<AssessmentFormState>(() => initialFormState(assessment, students));
  const [errors, setErrors] = useState<ErrorMap>({});
  const [activeCombinedSection, setActiveCombinedSection] = useState<FieldGroup>("dobras");

  const evolutionQuery = useStudentEvolution(form.aluno_id);
  const anamneseQuery = useStudentAnamnese(form.aluno_id);
  const latestPoint = useMemo(
    () => latestEvolutionPoint(evolutionQuery.data?.results, assessment?.id),
    [assessment?.id, evolutionQuery.data?.results],
  );

  const selectedStepIndex = steps.findIndex((item) => item.id === step);
  const schemaInput = useMemo(() => buildSchemaInput(form), [form]);
  const measureGroups = useMemo(() => groupsForMethod(form.metodo), [form.metodo]);

  function updateBase(field: keyof Omit<AssessmentFormState, FieldGroup>, value: string) {
    setForm((current) => {
      const next = { ...current, [field]: value };
      if (field === "data_avaliacao" && value && !current.data_proxima_avaliacao) {
        next.data_proxima_avaliacao = addDaysToInputDate(value, 90);
      }
      return next;
    });
    clearError(field);
  }

  function updateGroup(group: FieldGroup, field: string, value: string) {
    setForm((current) => ({
      ...current,
      [group]: {
        ...current[group],
        [field]: value,
      },
    }));
    clearError(`${group}.${field}`);
  }

  function clearError(key: string) {
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function validate(targetStep: StepId | "all") {
    const parsed = assessmentSchema.safeParse(schemaInput);
    if (parsed.success) {
      setErrors({});
      return { success: true as const, data: parsed.data };
    }

    const issues = targetStep === "all" ? parsed.error.issues : parsed.error.issues.filter((issue) => stepForIssue(issue) === targetStep);
    const nextErrors = issuesToErrors(issues);
    setErrors(nextErrors);
    return { success: issues.length === 0, data: null };
  }

  function goNext() {
    const result = validate(step);
    if (!result.success) return;
    setStep(steps[Math.min(steps.length - 1, selectedStepIndex + 1)].id);
  }

  function goBack() {
    setStep(steps[Math.max(0, selectedStepIndex - 1)].id);
  }

  function submit() {
    const result = validate("all");
    if (!result.success || !result.data) {
      const firstIssueStep = firstStepWithError(errorsFromSchema(schemaInput));
      if (firstIssueStep) setStep(firstIssueStep);
      return;
    }
    onSubmit(result.data);
  }

  function applyTemplate(template: string) {
    setForm((current) => ({
      ...current,
      feedback_personal: current.feedback_personal
        ? `${current.feedback_personal}\n\n${template}`
        : template,
    }));
  }

  return (
    <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-5xl">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>
          Registre a avaliacao em etapas e revise os principais pontos antes de salvar.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-5">
        <StepNav currentStep={step} errors={errors} onSelect={setStep} />

        <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
          <div className="min-w-0">
            {step === "base" ? (
              <BaseStep
                assessment={assessment}
                form={form}
                students={students}
                errors={errors}
                onBaseChange={updateBase}
              />
            ) : null}

            {step === "measures" ? (
              <MeasuresStep
                activeCombinedSection={activeCombinedSection}
                errors={errors}
                form={form}
                groups={measureGroups}
                onActiveCombinedSectionChange={setActiveCombinedSection}
                onGroupChange={updateGroup}
              />
            ) : null}

            {step === "feedback" ? (
              <FeedbackStep
                value={form.feedback_personal}
                onApplyTemplate={applyTemplate}
                onChange={(value) => updateBase("feedback_personal", value)}
              />
            ) : null}

            {step === "review" ? (
              <ReviewStep form={form} groups={measureGroups} latestPoint={latestPoint} />
            ) : null}
          </div>

          <SideContextPanel
            anamnese={anamneseQuery.data}
            anamneseLoading={anamneseQuery.isLoading}
            point={latestPoint}
            pointLoading={evolutionQuery.isLoading}
            studentId={form.aluno_id}
          />
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={goBack} disabled={selectedStepIndex === 0 || isPending}>
          <ChevronLeft className="size-4" aria-hidden="true" />
          Voltar
        </Button>
        {step === "review" ? (
          <Button type="button" onClick={submit} disabled={isPending}>
            {isPending ? null : <Check className="size-4" aria-hidden="true" />}
            Salvar avaliacao
          </Button>
        ) : (
          <Button type="button" onClick={goNext} disabled={isPending}>
            Continuar
            <ChevronRight className="size-4" aria-hidden="true" />
          </Button>
        )}
      </DialogFooter>
    </DialogContent>
  );
}

function StepNav({
  currentStep,
  errors,
  onSelect,
}: {
  currentStep: StepId;
  errors: ErrorMap;
  onSelect: (step: StepId) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-4">
      {steps.map((item, index) => {
        const active = item.id === currentStep;
        const hasError = Object.keys(errors).some((key) => stepForErrorKey(key) === item.id);
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={cn(
              "flex h-12 items-center gap-3 rounded-lg border border-border bg-card px-3 text-left text-sm transition-colors",
              active ? "border-primary bg-primary/10 text-foreground" : "text-muted-foreground hover:bg-muted/50",
              hasError ? "border-destructive/60 bg-destructive/10 text-destructive" : null,
            )}
          >
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-current text-xs">
              {index + 1}
            </span>
            <span className="min-w-0 truncate font-medium">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function BaseStep({
  assessment,
  form,
  students,
  errors,
  onBaseChange,
}: {
  assessment?: Assessment | null;
  form: AssessmentFormState;
  students: { value: string; label: string }[];
  errors: ErrorMap;
  onBaseChange: (field: keyof Omit<AssessmentFormState, FieldGroup>, value: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <SelectField
          disabled={Boolean(assessment && form.aluno_id)}
          error={errors.aluno_id}
          label="Aluno"
          value={form.aluno_id}
          onChange={(value) => onBaseChange("aluno_id", value)}
          options={students}
          required
        />
        <SelectField
          error={errors.metodo}
          label="Metodo"
          value={form.metodo}
          onChange={(value) => onBaseChange("metodo", value)}
          options={assessmentMethodOptions}
          required
        />
        <InputField
          error={errors.data_avaliacao}
          label="Data"
          type="date"
          value={form.data_avaliacao}
          onChange={(value) => onBaseChange("data_avaliacao", value)}
          required
        />
        <div className="space-y-2">
          <InputField
            error={errors.data_proxima_avaliacao}
            label="Proxima avaliacao"
            type="date"
            value={form.data_proxima_avaliacao}
            onChange={(value) => onBaseChange("data_proxima_avaliacao", value)}
          />
          <div className="flex flex-wrap gap-2">
            {[30, 60, 90].map((days) => (
              <Button
                key={days}
                type="button"
                size="xs"
                variant="outline"
                disabled={!form.data_avaliacao}
                onClick={() => onBaseChange("data_proxima_avaliacao", addDaysToInputDate(form.data_avaliacao, days))}
              >
                {days} dias
              </Button>
            ))}
          </div>
        </div>
        <InputField
          error={errors.peso_kg}
          label="Peso"
          type="number"
          unit="kg"
          value={form.peso_kg}
          onChange={(value) => onBaseChange("peso_kg", value)}
          required
        />
        <InputField
          error={errors.altura_cm}
          label="Altura"
          type="number"
          unit="cm"
          value={form.altura_cm}
          onChange={(value) => onBaseChange("altura_cm", value)}
          required
        />
      </div>
    </div>
  );
}

function MeasuresStep({
  activeCombinedSection,
  errors,
  form,
  groups,
  onActiveCombinedSectionChange,
  onGroupChange,
}: {
  activeCombinedSection: FieldGroup;
  errors: ErrorMap;
  form: AssessmentFormState;
  groups: FieldGroup[];
  onActiveCombinedSectionChange: (group: FieldGroup) => void;
  onGroupChange: (group: FieldGroup, field: string, value: string) => void;
}) {
  if (groups.length === 0) return null;

  if (form.metodo === "COMBINADO") {
    const activeGroup = groups.includes(activeCombinedSection) ? activeCombinedSection : groups[0];
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 rounded-lg border border-border bg-muted/30 p-1">
          {groups.map((group) => (
            <Button
              key={group}
              type="button"
              size="sm"
              variant={activeGroup === group ? "default" : "ghost"}
              onClick={() => onActiveCombinedSectionChange(group)}
            >
              {groupLabel(group)}
              <CompletionBadge group={group} form={form} />
            </Button>
          ))}
        </div>
        <MeasureSection
          errors={errors}
          fields={fieldsForGroup(activeGroup)}
          form={form}
          group={activeGroup}
          onGroupChange={onGroupChange}
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <MeasureSection
          key={group}
          errors={errors}
          fields={fieldsForGroup(group)}
          form={form}
          group={group}
          onGroupChange={onGroupChange}
        />
      ))}
    </div>
  );
}

function FeedbackStep({
  value,
  onApplyTemplate,
  onChange,
}: {
  value: string;
  onApplyTemplate: (template: string) => void;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-3 flex items-center gap-2">
          <MessageSquareText className="size-4 text-primary" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-foreground">Feedback do personal</h3>
        </div>
        <Textarea
          className="min-h-40"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Ex: boa evolucao no tronco, manter foco em membros inferiores no proximo ciclo..."
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {feedbackTemplates.map((template, index) => (
          <Button key={template} type="button" variant="outline" size="sm" onClick={() => onApplyTemplate(template)}>
            Modelo {index + 1}
          </Button>
        ))}
      </div>
    </div>
  );
}

function ReviewStep({
  form,
  groups,
  latestPoint,
}: {
  form: AssessmentFormState;
  groups: FieldGroup[];
  latestPoint?: EvolutionPoint | null;
}) {
  return (
    <div className="space-y-4">
      <ReviewCard title="Dados principais">
        <ReviewRow label="Metodo" value={methodLabel(form.metodo)} />
        <ReviewRow label="Data" value={form.data_avaliacao ? formatDate(form.data_avaliacao) : "-"} />
        <ReviewRow label="Proxima avaliacao" value={form.data_proxima_avaliacao ? formatDate(form.data_proxima_avaliacao) : "-"} />
        <ReviewRow label="Peso" value={form.peso_kg ? `${form.peso_kg} kg` : "-"} />
        <ReviewRow label="Altura" value={form.altura_cm ? `${form.altura_cm} cm` : "-"} />
      </ReviewCard>
      <ReviewCard title="Completude">
        <div className="grid gap-2 sm:grid-cols-2">
          {groups.map((group) => (
            <div key={group} className="rounded-lg border border-border bg-muted/30 p-3">
              <div className="text-xs text-muted-foreground">{groupLabel(group)}</div>
              <div className="mt-1 text-sm font-semibold text-foreground">{completionText(group, form)}</div>
            </div>
          ))}
        </div>
      </ReviewCard>
      <ReviewCard title="Comparativo">
        {latestPoint ? (
          <div className="grid gap-2 sm:grid-cols-2">
            <ReviewRow label="Ultima avaliacao" value={formatDate(latestPoint.data_avaliacao)} />
            <ReviewRow label="Peso anterior" value={formatMetric(latestPoint.peso_kg, " kg")} />
            <ReviewRow label="Gordura anterior" value={formatMetric(latestPoint.percentual_gordura, "%")} />
            <ReviewRow label="Delta peso anterior" value={formatDelta(latestPoint.deltas.peso_kg, " kg")} />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Sem avaliacao anterior para este aluno.</p>
        )}
      </ReviewCard>
      <ReviewCard title="Feedback">
        <p className="whitespace-pre-line text-sm leading-6 text-muted-foreground">
          {form.feedback_personal || "Sem feedback informado."}
        </p>
      </ReviewCard>
    </div>
  );
}

function MeasureSection({
  errors,
  fields,
  form,
  group,
  onGroupChange,
}: {
  errors: ErrorMap;
  fields: FieldDefinition[];
  form: AssessmentFormState;
  group: FieldGroup;
  onGroupChange: (group: FieldGroup, field: string, value: string) => void;
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-4">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{groupLabel(group)}</h3>
          <p className="text-xs text-muted-foreground">{completionText(group, form)}</p>
        </div>
        <CompletionBadge group={group} form={form} />
      </div>
      {group === "circunferencias" ? (
        <div className="space-y-5">
          {circumferenceFieldGroups.map((fieldGroup) => (
            <div key={fieldGroup.title} className="rounded-lg border border-border bg-muted/20 p-3">
              <h4 className="mb-3 text-xs font-semibold uppercase text-muted-foreground">{fieldGroup.title}</h4>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {fieldGroup.fields.map((field) => (
                  <InputField
                    key={field.name}
                    error={errors[`${group}.${field.name}`]}
                    label={field.label}
                    type="number"
                    unit={field.unit}
                    value={form[group][field.name] ?? ""}
                    onChange={(value) => onGroupChange(group, field.name, value)}
                    required={field.required}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {fields.map((field) => (
          <InputField
            key={field.name}
            error={errors[`${group}.${field.name}`]}
            label={field.label}
            type="number"
            unit={field.unit}
            value={form[group][field.name] ?? ""}
            onChange={(value) => onGroupChange(group, field.name, value)}
            required={field.required}
          />
        ))}
      </div>
      )}
    </section>
  );
}

function SideContextPanel({
  anamnese,
  anamneseLoading,
  point,
  pointLoading,
  studentId,
}: {
  anamnese?: Anamnese | null;
  anamneseLoading?: boolean;
  point?: EvolutionPoint | null;
  pointLoading?: boolean;
  studentId?: string;
}) {
  const hasAnamnese = Boolean(
    anamnese
      && (
        anamnese.historico_familiar
        || anamnese.doencas_preexistentes
        || anamnese.lesoes
        || anamnese.medicamentos
        || anamnese.alergias
        || anamnese.restricoes_exercicio
        || anamnese.observacoes
      ),
  );

  return (
    <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
      <section className="rounded-lg border border-border bg-card p-4">
        <div className="mb-3 flex items-center gap-2">
          <History className="size-4 text-primary" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-foreground">Ultima avaliacao</h3>
        </div>
        {pointLoading ? <p className="text-sm text-muted-foreground">Carregando historico...</p> : null}
        {!pointLoading && !point ? (
          <p className="text-sm text-muted-foreground">Selecione um aluno para ver o historico recente.</p>
        ) : null}
        {point ? (
          <div className="space-y-3">
            <div>
              <div className="text-xs text-muted-foreground">{formatDate(point.data_avaliacao)}</div>
              <div className="mt-1 text-sm font-medium text-foreground">{methodLabel(point.metodo)}</div>
            </div>
            <div className="grid gap-2">
              <MetricLine label="Peso" value={formatMetric(point.peso_kg, " kg")} delta={formatDelta(point.deltas.peso_kg, " kg")} />
              <MetricLine label="IMC" value={formatMetric(point.imc)} delta={formatDelta(point.deltas.imc)} />
              <MetricLine label="Gordura" value={formatMetric(point.percentual_gordura, "%")} delta={formatDelta(point.deltas.percentual_gordura, "%")} />
              <MetricLine label="Massa magra" value={formatMetric(point.massa_magra_kg, " kg")} delta={formatDelta(point.deltas.massa_magra_kg, " kg")} />
              <MetricLine label="RCQ" value={formatMetric(point.rcq)} delta={formatDelta(point.deltas.rcq)} />
            </div>
          </div>
        ) : null}
      </section>

      <section className="rounded-lg border border-border bg-card p-4">
        <div className="mb-3 flex items-center gap-2">
          <FileText className="size-4 text-primary" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-foreground">Anamnese</h3>
        </div>
        {anamneseLoading ? <p className="text-sm text-muted-foreground">Carregando anamnese...</p> : null}
        {!anamneseLoading ? (
          <div className="space-y-3">
            <Badge variant={hasAnamnese ? "default" : "outline"}>
              {hasAnamnese ? "Anamnese preenchida" : "Anamnese pendente"}
            </Badge>
            {hasAnamnese ? (
              <div className="space-y-2 text-sm text-muted-foreground">
                {anamnese?.restricoes_exercicio ? <ContextLine label="Restricoes" value={anamnese.restricoes_exercicio} /> : null}
                {anamnese?.lesoes ? <ContextLine label="Lesoes" value={anamnese.lesoes} /> : null}
                {anamnese?.observacoes ? <ContextLine label="Observacoes" value={anamnese.observacoes} /> : null}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Preencha o dossie do aluno antes de criar ciclos mais detalhados.</p>
            )}
            {studentId ? (
              <Button asChild type="button" variant="outline" size="sm">
                <Link href={`/personal/alunos/${studentId}`}>Abrir dossie</Link>
              </Button>
            ) : null}
          </div>
        ) : null}
      </section>
    </aside>
  );
}

function ContextLine({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="font-medium text-foreground">{label}: </span>
      <span>{value}</span>
    </div>
  );
}

function InputField({
  error,
  label,
  onChange,
  required,
  type = "text",
  unit,
  value,
}: {
  error?: string;
  label: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  unit?: string;
  value: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label>
          {label}
          {required ? <span className="text-destructive"> *</span> : null}
        </Label>
        {unit ? <span className="text-xs text-muted-foreground">{unit}</span> : null}
      </div>
      <Input
        aria-invalid={Boolean(error)}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

function SelectField({
  disabled,
  error,
  label,
  onChange,
  options,
  required,
  value,
}: {
  disabled?: boolean;
  error?: string;
  label: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
  value: string;
}) {
  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </Label>
      <select
        aria-invalid={Boolean(error)}
        className={cn(
          "h-8 w-full rounded-lg border border-input bg-input/30 px-2.5 text-sm outline-none transition-colors",
          "focus:border-ring focus:ring-3 focus:ring-ring/50 disabled:pointer-events-none disabled:opacity-60",
          error ? "border-destructive ring-3 ring-destructive/20" : null,
        )}
        disabled={disabled}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Selecione</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

function CompletionBadge({ group, form }: { group: FieldGroup; form: AssessmentFormState }) {
  const { filled, total } = completion(group, form);
  return (
    <Badge variant={filled === total ? "default" : "outline"} className="shrink-0">
      {filled}/{total}
    </Badge>
  );
}

function ReviewCard({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-center gap-2">
        <ClipboardList className="size-4 text-primary" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

function MetricLine({ delta, label, value }: { delta: string; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-sm font-semibold text-foreground">{value}</span>
      </div>
      {delta !== "-" ? <div className="mt-1 text-xs text-muted-foreground">Delta anterior: {delta}</div> : null}
    </div>
  );
}

function initialFormState(
  assessment?: Assessment | null,
  students: { value: string; label: string }[] = [],
): AssessmentFormState {
  const inferredStudentId = assessment?.aluno_id
    ?? students.find((student) => student.label === assessment?.aluno_nome)?.value
    ?? "";

  return {
    aluno_id: inferredStudentId,
    metodo: assessment?.metodo ?? "DOBRAS",
    data_avaliacao: assessment?.data_avaliacao ?? "",
    data_proxima_avaliacao: assessment?.data_proxima_avaliacao ?? defaultNextAssessmentDate(assessment?.data_avaliacao),
    peso_kg: valueToString(assessment?.peso_kg),
    altura_cm: valueToString(assessment?.altura_cm),
    feedback_personal: assessment?.feedback_personal ?? "",
    dobras: {
      peitoral_mm: valueToString(assessment?.dobras?.peitoral_mm),
      axilar_media_mm: valueToString(assessment?.dobras?.axilar_media_mm),
      triceps_mm: valueToString(assessment?.dobras?.triceps_mm),
      subescapular_mm: valueToString(assessment?.dobras?.subescapular_mm),
      abdominal_mm: valueToString(assessment?.dobras?.abdominal_mm),
      supra_iliaca_mm: valueToString(assessment?.dobras?.supra_iliaca_mm),
      coxa_mm: valueToString(assessment?.dobras?.coxa_mm),
    },
    bioimpedancia: {
      percentual_gordura: valueToString(assessment?.bioimpedancia?.percentual_gordura),
      massa_gorda_kg: valueToString(assessment?.bioimpedancia?.massa_gorda_kg),
      massa_magra_kg: valueToString(assessment?.bioimpedancia?.massa_magra_kg),
      massa_muscular_kg: valueToString(assessment?.bioimpedancia?.massa_muscular_kg),
      agua_corporal_percentual: valueToString(assessment?.bioimpedancia?.agua_corporal_percentual),
      gordura_visceral: valueToString(assessment?.bioimpedancia?.gordura_visceral),
      taxa_metabolica_basal: valueToString(assessment?.bioimpedancia?.taxa_metabolica_basal),
    },
    circunferencias: {
      pescoco_cm: valueToString(assessment?.circunferencias?.pescoco_cm),
      torax_cm: valueToString(assessment?.circunferencias?.torax_cm),
      cintura_cm: valueToString(assessment?.circunferencias?.cintura_cm),
      abdome_cm: valueToString(assessment?.circunferencias?.abdome_cm),
      quadril_cm: valueToString(assessment?.circunferencias?.quadril_cm),
      braco_relaxado_esq_cm: valueToString(assessment?.circunferencias?.braco_relaxado_esq_cm ?? assessment?.circunferencias?.braco_relaxado_cm),
      braco_relaxado_dir_cm: valueToString(assessment?.circunferencias?.braco_relaxado_dir_cm ?? assessment?.circunferencias?.braco_relaxado_cm),
      braco_contraido_esq_cm: valueToString(assessment?.circunferencias?.braco_contraido_esq_cm ?? assessment?.circunferencias?.braco_contraido_cm),
      braco_contraido_dir_cm: valueToString(assessment?.circunferencias?.braco_contraido_dir_cm ?? assessment?.circunferencias?.braco_contraido_cm),
      antebraco_esq_cm: valueToString(assessment?.circunferencias?.antebraco_esq_cm ?? assessment?.circunferencias?.antebraco_cm),
      antebraco_dir_cm: valueToString(assessment?.circunferencias?.antebraco_dir_cm ?? assessment?.circunferencias?.antebraco_cm),
      coxa_esq_cm: valueToString(assessment?.circunferencias?.coxa_esq_cm ?? assessment?.circunferencias?.coxa_cm),
      coxa_dir_cm: valueToString(assessment?.circunferencias?.coxa_dir_cm ?? assessment?.circunferencias?.coxa_cm),
      panturrilha_esq_cm: valueToString(assessment?.circunferencias?.panturrilha_esq_cm ?? assessment?.circunferencias?.panturrilha_cm),
      panturrilha_dir_cm: valueToString(assessment?.circunferencias?.panturrilha_dir_cm ?? assessment?.circunferencias?.panturrilha_cm),
    },
  };
}

function buildSchemaInput(form: AssessmentFormState) {
  return {
    aluno_id: form.aluno_id,
    metodo: form.metodo,
    data_avaliacao: form.data_avaliacao,
    data_proxima_avaliacao: form.data_proxima_avaliacao,
    peso_kg: form.peso_kg,
    altura_cm: form.altura_cm,
    feedback_personal: form.feedback_personal || undefined,
    ativo: true,
    dobras: form.dobras,
    bioimpedancia: form.bioimpedancia,
    circunferencias: form.circunferencias,
  };
}

function errorsFromSchema(input: ReturnType<typeof buildSchemaInput>) {
  const parsed = assessmentSchema.safeParse(input);
  return parsed.success ? [] : parsed.error.issues;
}

function issuesToErrors(issues: ZodIssue[]) {
  return Object.fromEntries(
    issues.map((issue) => [issue.path.join("."), issue.message]),
  );
}

function firstStepWithError(issues: ZodIssue[]) {
  return issues[0] ? stepForIssue(issues[0]) : null;
}

function stepForIssue(issue: ZodIssue): StepId {
  return stepForErrorKey(issue.path.join("."));
}

function stepForErrorKey(key: string): StepId {
  if (key.startsWith("dobras.") || key.startsWith("bioimpedancia.") || key.startsWith("circunferencias.")) {
    return "measures";
  }
  if (key === "feedback_personal") return "feedback";
  return "base";
}

function latestEvolutionPoint(points?: EvolutionPoint[], assessmentId?: string) {
  return [...(points ?? [])]
    .filter((point) => point.id !== assessmentId)
    .sort((left, right) => new Date(right.data_avaliacao).getTime() - new Date(left.data_avaliacao).getTime())[0] ?? null;
}

function groupsForMethod(method: AssessmentMethod): FieldGroup[] {
  if (method === "DOBRAS") return ["dobras"];
  if (method === "BIOIMPEDANCIA") return ["bioimpedancia"];
  if (method === "CIRCUNFERENCIAS") return ["circunferencias"];
  return ["dobras", "circunferencias"];
}

function fieldsForGroup(group: FieldGroup) {
  if (group === "dobras") return dobrasFields;
  if (group === "bioimpedancia") return bioFields;
  return circFields;
}

function groupLabel(group: FieldGroup) {
  if (group === "dobras") return "Dobras cutaneas";
  if (group === "bioimpedancia") return "Bioimpedancia";
  return "Circunferencias";
}

function completion(group: FieldGroup, form: AssessmentFormState) {
  const fields = fieldsForGroup(group);
  const filled = fields.filter((field) => Boolean(form[group][field.name])).length;
  return { filled, total: fields.length };
}

function completionText(group: FieldGroup, form: AssessmentFormState) {
  const { filled, total } = completion(group, form);
  return `${filled} de ${total} campos preenchidos`;
}

function valueToString(value?: string | number | null) {
  return value === null || value === undefined ? "" : String(value);
}

function defaultNextAssessmentDate(date?: string | null) {
  return date ? addDaysToInputDate(date, 90) : "";
}

function addDaysToInputDate(date: string, days: number) {
  if (!date) return "";
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return "";
  parsed.setDate(parsed.getDate() + days);
  return parsed.toISOString().slice(0, 10);
}
